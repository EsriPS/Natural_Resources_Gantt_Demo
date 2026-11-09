/**
 * GanttView (Phase 3, design §1, §5). The first interactive surface — renders the
 * schedule as SVG lanes grouped by crew → person, with:
 *   3.1 render:  task bars on a shared time scale, day gridlines, a "now" line
 *   3.2 select:  click a bar → store.select({task}); re-render highlights it
 *   3.3 edit:    drag a bar → moveTask (duration preserved); drag right edge → resizeTask
 *   3.4 flags:   same-feature conflict badge (store.conflicts), same-person overlap
 *                stripe (computePersonOverlaps), hazard stripe (store.hazardByTask)
 *
 * Pure DOM/SVG, no framework. Reads only from the store and dispatches mutations
 * back to it, so every edit flows through the single source of truth (R7.3).
 */

import type { ScheduleStore } from '../store/ScheduleStore';
import type { StoreState, Task } from '../store/types';
import { config } from '../config';
import { makeTimeScale, snapMs, visibleDomain, type TimeScale } from './timeScale';
import { taskColor, WEATHER_COLOR } from '../ui/taskColor';

const SVG = 'http://www.w3.org/2000/svg';

// Layout constants.
const LANE_H = 30;
const BAR_H = 20;
const BAR_PAD = (LANE_H - BAR_H) / 2;
const LABEL_W = 172; // left gutter for crew/person labels
const HEADER_H = 26; // day-axis strip
const RESIZE_HANDLE = 7; // px grabbable right-edge zone
const SNAP_MIN = 15; // snap drags to 15-minute steps
const GROUP_HEADER_H = 18; // vertical space reserved above each group's first lane
const GROUP_GAP = 10; // extra gap before the Equipment section

// Light Esri theme colors for the SVG surface (DOM chrome uses CSS vars).
const C_GRID = '#e4e8eb'; // day gridlines
const C_MUTED = '#6a6f73'; // axis + group-header text
const C_TEXT = '#151515'; // lane name text
const C_ACCENT = '#0079c1'; // Esri blue (now line, default bar)
const C_EQUIP = '#7d57c1'; // equipment lane purple (readable on white)
const C_BAR_INK = '#ffffff'; // label text on colored bars

/**
 * A Gantt row. People lanes carry a person; equipment lanes carry a machine.
 * `key` identifies the lane target; `kind` selects grouping/styling.
 */
interface Lane {
  kind: 'person' | 'equipment';
  key: string; // personId or equipmentId
  label: string; // row label (person name / equipment name)
  group: string; // crew (people) or 'EQUIPMENT'
  color: string;
  y: number;
}

interface DragState {
  task: Task;
  mode: 'move' | 'resize';
  pointerStartX: number;
  origStartMs: number;
  origEndMs: number;
}

export class GanttView {
  private svg!: SVGSVGElement;
  private width = 0;
  private scale!: TimeScale;
  private lanes: Lane[] = [];
  private drag: DragState | null = null;
  private unsub: () => void;
  private ro: ResizeObserver;

  // Playback (moved out of the top-bar TimeBar into the Gantt itself).
  private playBtn!: HTMLButtonElement;
  private stopBtn!: HTMLButtonElement;
  private playbackBar!: HTMLElement;
  private routeBar!: HTMLElement;
  private routeBtn!: HTMLButtonElement;
  private routeStatus!: HTMLElement;
  private clearRouteBtn!: HTMLButtonElement;
  private pickingRoute = false;
  private rafTimer: number | null = null;
  /** True while the user is dragging the now-line playhead. */
  private scrubbing = false;

  constructor(
    private host: HTMLElement,
    private store: ScheduleStore,
  ) {
    this.host.innerHTML = '';
    this.host.classList.add('gantt-host');

    // Scroll container holds the SVG; the playback control floats over it.
    const scroller = document.createElement('div');
    scroller.className = 'gantt-scroll';
    this.svg = document.createElementNS(SVG, 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.style.display = 'block';
    scroller.appendChild(this.svg);
    this.host.appendChild(scroller);
    this.buildPlaybackControl();
    this.buildRouteControl();

    this.unsub = this.store.subscribe(() => this.render());
    this.ro = new ResizeObserver(() => this.render());
    this.ro.observe(this.host);

    // Pointer handlers for drag/resize (3.3) and playhead scrubbing.
    this.svg.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);

    this.render();
  }

  destroy(): void {
    this.stopPlayback();
    this.unsub();
    this.ro.disconnect();
    this.svg.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
  }

  // ── playback control (corner of the Gantt) ─────────────────────────────────

  private static reducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    );
  }

  /** A small floating play/stop control pinned to the Gantt's top-left corner. */
  private buildPlaybackControl(): void {
    const bar = document.createElement('div');
    bar.className = 'gantt-playback';

    this.playBtn = document.createElement('button');
    this.playBtn.className = 'gantt-pb-btn gantt-pb-play';
    this.playBtn.title = 'Play / pause the timeline';
    this.playBtn.setAttribute('aria-label', 'Play or pause the timeline');
    this.playBtn.textContent = '▶';
    this.playBtn.addEventListener('click', () => this.togglePlayback());

    this.stopBtn = document.createElement('button');
    this.stopBtn.className = 'gantt-pb-btn';
    this.stopBtn.title = 'Reset the playhead to the start';
    this.stopBtn.setAttribute('aria-label', 'Reset the playhead to the start');
    this.stopBtn.textContent = '⏮';
    this.stopBtn.addEventListener('click', () => {
      this.stopPlayback();
      this.store.setTime(this.scale.invertIso(0));
    });

    bar.append(this.stopBtn, this.playBtn);

    if (GanttView.reducedMotion()) {
      this.playBtn.disabled = true;
      this.playBtn.title = 'Autoplay disabled (reduced motion) — drag the playhead to scrub';
    }
    this.playbackBar = bar;
    this.host.appendChild(bar);
  }

  /** Show/hide the floating playback control (hidden in the empty state). */
  private setPlaybackVisible(visible: boolean): void {
    if (!this.playbackBar) return;
    this.playbackBar.style.display = visible ? '' : 'none';
    if (!visible) this.stopPlayback();
  }

  /** Controls for choosing a start and destination directly from task bars. */
  private buildRouteControl(): void {
    const bar = document.createElement('div');
    bar.className = 'gantt-route';

    this.routeBtn = document.createElement('button');
    this.routeBtn.className = 'gantt-route-btn';
    this.routeBtn.textContent = '↝ Route';
    this.routeBtn.title = 'Choose two work orders to show a route between them';
    this.routeBtn.addEventListener('click', () => {
      if (this.pickingRoute) {
        this.pickingRoute = false;
        if (this.store.getState().routeTaskIds.length < 2) this.store.clearRoute();
        this.updateRouteControl();
        return;
      }
      this.store.clearRoute();
      this.pickingRoute = true;
      this.updateRouteControl();
    });

    this.routeStatus = document.createElement('span');
    this.routeStatus.className = 'gantt-route-status';

    this.clearRouteBtn = document.createElement('button');
    this.clearRouteBtn.className = 'gantt-route-clear';
    this.clearRouteBtn.textContent = '×';
    this.clearRouteBtn.title = 'Clear route';
    this.clearRouteBtn.setAttribute('aria-label', 'Clear route');
    this.clearRouteBtn.addEventListener('click', () => {
      this.pickingRoute = false;
      this.store.clearRoute();
      this.updateRouteControl();
    });

    bar.append(this.routeBtn, this.routeStatus, this.clearRouteBtn);
    this.routeBar = bar;
    this.host.appendChild(bar);
    this.updateRouteControl();
  }

  private updateRouteControl(): void {
    if (!this.routeBar) return;
    const count = this.store.getState().routeTaskIds.length;
    this.routeBtn.classList.toggle('is-active', this.pickingRoute);
    this.routeBtn.setAttribute('aria-pressed', String(this.pickingRoute));
    this.routeStatus.textContent = this.pickingRoute
      ? count === 0
        ? 'Pick start'
        : 'Pick destination'
      : count === 2
        ? 'Route selected'
        : '';
    this.clearRouteBtn.style.display = count > 0 ? '' : 'none';
  }

  private togglePlayback(): void {
    if (this.rafTimer !== null) this.stopPlayback();
    else this.startPlayback();
  }

  private startPlayback(): void {
    if (GanttView.reducedMotion()) return;
    const endMs = this.scale.endMs;
    const startMs = this.scale.startMs;
    const cur = new Date(this.store.getState().currentTime).getTime();
    if (cur >= endMs) this.store.setTime(new Date(startMs).toISOString());
    this.playBtn.textContent = '⏸';
    this.playBtn.classList.add('is-playing');
    const stepMs = config.animationStepMinutes * 60_000;
    this.rafTimer = window.setInterval(() => {
      const now = new Date(this.store.getState().currentTime).getTime();
      const next = now + stepMs;
      if (next >= this.scale.endMs) {
        this.store.setTime(new Date(this.scale.endMs).toISOString());
        this.stopPlayback();
      } else {
        this.store.setTime(new Date(next).toISOString());
      }
    }, config.animationStepMs);
  }

  private stopPlayback(): void {
    if (this.rafTimer !== null) {
      window.clearInterval(this.rafTimer);
      this.rafTimer = null;
    }
    if (this.playBtn) {
      this.playBtn.textContent = '▶';
      this.playBtn.classList.remove('is-playing');
    }
  }

  // ── layout helpers ────────────────────────────────────────────────────────

  /** Build lanes: people (by crew → person) first, then equipment below. */
  private buildLanes(state: StoreState): Lane[] {
    const lanes: Lane[] = [];
    let y = HEADER_H;
    let lastGroup = '';

    // People lanes, ordered by crew then name (R3.3).
    const people = [...state.people].sort(
      (a, b) => a.crew.localeCompare(b.crew) || a.name.localeCompare(b.name),
    );
    for (const person of people) {
      if (person.crew !== lastGroup) {
        y += GROUP_HEADER_H; // reserve a band for this group's header
        lastGroup = person.crew;
      }
      lanes.push({
        kind: 'person',
        key: person.id,
        label: person.name,
        group: person.crew,
        color: person.color,
        y,
      });
      y += LANE_H;
    }

    // Equipment lanes BELOW all people, with their own group (R11.1, D-3(c)).
    // Only machines actually required by a task get a lane (keeps it readable).
    const usedEquip = new Set(state.tasks.flatMap((t) => t.requiredEquipment ?? []));
    const equipment = state.equipment
      .filter((e) => usedEquip.has(e.id))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (equipment.length) {
      y += GROUP_GAP; // extra breathing room before the Equipment section
      lastGroup = '';
      for (const eq of equipment) {
        if (lastGroup !== 'EQUIPMENT') {
          y += GROUP_HEADER_H;
          lastGroup = 'EQUIPMENT';
        }
        lanes.push({
          kind: 'equipment',
          key: eq.id,
          label: eq.name,
          group: 'EQUIPMENT',
          color: eq.color,
          y,
        });
        y += LANE_H;
      }
    }
    return lanes;
  }

  private laneY(kind: 'person' | 'equipment', key: string): number {
    const lane = this.lanes.find((l) => l.kind === kind && l.key === key);
    return lane ? lane.y : HEADER_H;
  }

  private totalHeight(): number {
    const last = this.lanes[this.lanes.length - 1];
    return (last ? last.y + LANE_H : HEADER_H) + 8;
  }

  // ── render (3.1, 3.4) ─────────────────────────────────────────────────────

  private render(): void {
    const state = this.store.getState();
    this.updateRouteControl();
    this.width = Math.max(320, this.host.clientWidth);

    // Empty until a date range is chosen: the Calcite calendar in the top bar
    // drives what the Gantt shows. With no range selected we render only the
    // prompt — no lanes, bars, or playhead (R12).
    if (!state.visibleRange) {
      this.lanes = [];
      this.routeBar.style.display = 'none';
      this.drawEmptyState();
      return;
    }

    this.lanes = this.buildLanes(state);
    const plotW = this.width - LABEL_W;
    this.setPlaybackVisible(true);
    this.routeBar.style.display = '';

    const domain = visibleDomain(state.tasks, state.visibleRange);
    this.scale = makeTimeScale(domain.start, domain.end, plotW);

    const height = this.totalHeight();
    this.svg.setAttribute('height', String(height));
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${height}`);

    // Clear.
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

    this.drawDayGrid(domain, height);
    this.drawLaneLabels();

    const personConflictTaskIds = new Set(state.personConflicts.flatMap((c) => c.taskIds));
    const conflictTaskIds = new Set(state.conflicts.flatMap((c) => c.taskIds));
    const equipConflictTaskIds = new Set(state.equipmentConflicts.flatMap((c) => c.taskIds));
    const selectedId = state.selection.kind === 'task' ? state.selection.id : null;

    for (const task of state.tasks) {
      const flags = {
        selected: task.id === selectedId,
        conflict: conflictTaskIds.has(task.id),
        personOverlap: personConflictTaskIds.has(task.id),
        equipmentOverlap: equipConflictTaskIds.has(task.id),
        hazard: Boolean(state.hazardByTask[task.id]?.length),
        routeIndex: state.routeTaskIds.indexOf(task.id),
      };
      // Person lane bar.
      this.drawBar(task, this.laneY('person', task.personId), flags, 'person');
      // One bar per required-equipment lane (R11.3).
      for (const eqId of task.requiredEquipment ?? []) {
        this.drawBar(task, this.laneY('equipment', eqId), flags, 'equipment');
      }
    }

    this.drawNowLine(state.currentTime, height);
  }

  private drawDayGrid(domain: { start: string; end: string }, height: number): void {
    const g = document.createElementNS(SVG, 'g');
    const start = new Date(domain.start);
    const end = new Date(domain.end);
    const day = new Date(start);
    while (day <= end) {
      const x = LABEL_W + this.scale.x(day.toISOString());
      const line = document.createElementNS(SVG, 'line');
      line.setAttribute('x1', String(x));
      line.setAttribute('x2', String(x));
      line.setAttribute('y1', String(HEADER_H));
      line.setAttribute('y2', String(height));
      line.setAttribute('stroke', C_GRID);
      line.setAttribute('stroke-width', '1');
      g.appendChild(line);

      const label = document.createElementNS(SVG, 'text');
      label.setAttribute('x', String(x + 6));
      label.setAttribute('y', String(HEADER_H - 8));
      label.setAttribute('fill', C_MUTED);
      label.setAttribute('font-size', '11');
      label.textContent = day.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      g.appendChild(label);

      day.setDate(day.getDate() + 1);
    }
    this.svg.appendChild(g);
  }

  private drawLaneLabels(): void {
    const g = document.createElementNS(SVG, 'g');
    let lastGroup = '';
    for (const lane of this.lanes) {
      // Group separator header (crew name, or the EQUIPMENT section header).
      if (lane.group !== lastGroup) {
        lastGroup = lane.group;
        const header = document.createElementNS(SVG, 'text');
        header.setAttribute('x', '8');
        header.setAttribute('y', String(lane.y - 6));
        header.setAttribute('fill', lane.kind === 'equipment' ? C_EQUIP : C_MUTED);
        header.setAttribute('font-size', '10');
        header.setAttribute('font-weight', '700');
        // Headers start at x=8 and get the full gutter width.
        header.textContent = this.clipLabel(lane.group.toUpperCase(), LABEL_W - 8 - 4, 5.6);
        const htitle = document.createElementNS(SVG, 'title');
        htitle.textContent = lane.group.toUpperCase();
        header.appendChild(htitle);
        g.appendChild(header);
      }
      const name = document.createElementNS(SVG, 'text');
      name.setAttribute('x', '14');
      name.setAttribute('y', String(lane.y + LANE_H / 2 + 4));
      name.setAttribute('fill', C_TEXT);
      name.setAttribute('font-size', '12');
      // Clip to the left gutter so long names don't spill over the task bars;
      // the full name stays available as a hover tooltip.
      name.textContent = this.clipLabel(lane.label, LABEL_W - 14 - 4, 6.6);
      const ntitle = document.createElementNS(SVG, 'title');
      ntitle.textContent = lane.label;
      name.appendChild(ntitle);
      g.appendChild(name);
    }
    this.svg.appendChild(g);
  }

  private drawBar(
    task: Task,
    laneTop: number,
    flags: {
      selected: boolean;
      conflict: boolean;
      personOverlap: boolean;
      equipmentOverlap: boolean;
      hazard: boolean;
      routeIndex: number;
    },
    kind: 'person' | 'equipment',
  ): void {
    const state = this.store.getState();
    const zone = state.zones.find((z) => z.id === task.zoneId);
    const y = laneTop + BAR_PAD;
    const x = LABEL_W + this.scale.x(task.start);
    const w = Math.max(6, this.scale.x(task.end) - this.scale.x(task.start));

    const g = document.createElementNS(SVG, 'g');
    g.setAttribute('data-task-id', task.id);
    g.setAttribute('data-lane', kind);
    g.style.cursor = kind === 'person' ? 'grab' : 'pointer';

    const rect = document.createElementNS(SVG, 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', String(w));
    rect.setAttribute('height', String(BAR_H));
    rect.setAttribute('rx', '4');

    // Color by state (R14): conflict (red) beats priority. Weather is NOT a
    // fill color here — it is a separate yellow marking (below) so a storm is
    // visible without hiding the task's priority.
    const equipClashHere = kind === 'equipment' && flags.equipmentOverlap;
    const isConflict =
      flags.conflict || (kind === 'person' && flags.personOverlap) || equipClashHere;
    const fill = taskColor({ conflict: isConflict, priority: task.priority });
    rect.setAttribute('fill', fill);
    rect.setAttribute('opacity', flags.selected ? '1' : '0.92');
    if (flags.hazard) {
      // Weather marking: a bold bright-yellow outline around the whole bar so it
      // reads at a glance on any priority color (restores the lost warning cue).
      rect.setAttribute('stroke', WEATHER_COLOR);
      rect.setAttribute('stroke-width', '2.5');
    } else if (flags.selected) {
      rect.setAttribute('stroke', C_TEXT);
      rect.setAttribute('stroke-width', '2');
    } else if (flags.routeIndex >= 0) {
      rect.setAttribute('stroke', flags.routeIndex === 0 ? '#2e8540' : C_ACCENT);
      rect.setAttribute('stroke-width', '3');
    }
    g.appendChild(rect);

    if (flags.routeIndex >= 0) {
      const marker = document.createElementNS(SVG, 'circle');
      marker.setAttribute('cx', String(x + 9));
      marker.setAttribute('cy', String(y + BAR_H / 2));
      marker.setAttribute('r', '7');
      marker.setAttribute('fill', flags.routeIndex === 0 ? '#2e8540' : C_ACCENT);
      marker.setAttribute('stroke', '#ffffff');
      marker.setAttribute('stroke-width', '1.5');
      marker.setAttribute('pointer-events', 'none');
      g.appendChild(marker);
      const number = document.createElementNS(SVG, 'text');
      number.setAttribute('x', String(x + 9));
      number.setAttribute('y', String(y + BAR_H / 2 + 3.5));
      number.setAttribute('text-anchor', 'middle');
      number.setAttribute('font-size', '9');
      number.setAttribute('font-weight', '700');
      number.setAttribute('fill', '#ffffff');
      number.setAttribute('pointer-events', 'none');
      number.textContent = String(flags.routeIndex + 1);
      g.appendChild(number);
    }

    // Weather marking — a thick yellow stripe along the top edge, matching the
    // old warning bar, plus a small ⛈ glyph at the left so it is unmistakable.
    if (flags.hazard) {
      const stripe = document.createElementNS(SVG, 'rect');
      stripe.setAttribute('x', String(x));
      stripe.setAttribute('y', String(y));
      stripe.setAttribute('width', String(w));
      stripe.setAttribute('height', '5');
      stripe.setAttribute('rx', '2');
      stripe.setAttribute('fill', WEATHER_COLOR);
      stripe.setAttribute('pointer-events', 'none');
      g.appendChild(stripe);
    }

    // Label (title · zone) clipped to the bar. White ink reads on every state
    // color (conflict/priority are all saturated), so use it uniformly.
    if (w > 44) {
      const text = document.createElementNS(SVG, 'text');
      text.setAttribute('x', String(x + (flags.routeIndex >= 0 ? 21 : 6)));
      text.setAttribute('y', String(y + BAR_H / 2 + 5));
      text.setAttribute('fill', C_BAR_INK);
      text.setAttribute('font-size', '11');
      text.setAttribute('font-weight', '600');
      text.setAttribute('pointer-events', 'none');
      const zoneLabel = zone ? ` · ${zone.name}` : '';
      const prefix = flags.hazard ? '⛈ ' : '';
      text.textContent = this.clip(
        `${prefix}${task.title}${zoneLabel}`,
        w - (flags.routeIndex >= 0 ? 25 : 10),
      );
      g.appendChild(text);
    }

    // Conflict badge (⚠) at the right end — same-zone, same-person, or
    // (on the equipment lane) same-equipment double-booking.
    const showBadge = flags.conflict || (flags.personOverlap && kind === 'person') || equipClashHere;
    if (showBadge) {
      const badge = document.createElementNS(SVG, 'text');
      badge.setAttribute('x', String(x + w - 14));
      badge.setAttribute('y', String(y + BAR_H / 2 + 4));
      badge.setAttribute('font-size', '12');
      badge.setAttribute('pointer-events', 'none');
      badge.textContent = '⚠';
      g.appendChild(badge);
    }

    // Right-edge resize affordance — person lane only (editing flows through
    // the task's own lane; equipment lanes are a read view of the same bar).
    if (kind === 'person') {
      const handle = document.createElementNS(SVG, 'rect');
      handle.setAttribute('x', String(x + w - RESIZE_HANDLE));
      handle.setAttribute('y', String(y));
      handle.setAttribute('width', String(RESIZE_HANDLE));
      handle.setAttribute('height', String(BAR_H));
      handle.setAttribute('fill', 'transparent');
      handle.setAttribute('data-resize', 'true');
      handle.style.cursor = 'ew-resize';
      g.appendChild(handle);
    }

    this.svg.appendChild(g);
  }

  /** Centered prompt shown when no date range is selected (empty Gantt). */
  private drawEmptyState(): void {
    // Playback makes no sense with nothing on the chart — hide the control.
    this.setPlaybackVisible(false);

    const height = Math.max(140, this.host.clientHeight || 160);
    this.svg.setAttribute('height', String(height));
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${height}`);
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

    const cx = this.width / 2;
    const cy = height / 2;

    const icon = document.createElementNS(SVG, 'text');
    icon.setAttribute('x', String(cx));
    icon.setAttribute('y', String(cy - 10));
    icon.setAttribute('text-anchor', 'middle');
    icon.setAttribute('font-size', '26');
    icon.setAttribute('opacity', '0.5');
    icon.textContent = '📅';
    this.svg.appendChild(icon);

    const line1 = document.createElementNS(SVG, 'text');
    line1.setAttribute('x', String(cx));
    line1.setAttribute('y', String(cy + 18));
    line1.setAttribute('text-anchor', 'middle');
    line1.setAttribute('fill', C_TEXT);
    line1.setAttribute('font-size', '14');
    line1.setAttribute('font-weight', '600');
    line1.textContent = 'No dates selected';
    this.svg.appendChild(line1);

    const line2 = document.createElementNS(SVG, 'text');
    line2.setAttribute('x', String(cx));
    line2.setAttribute('y', String(cy + 38));
    line2.setAttribute('text-anchor', 'middle');
    line2.setAttribute('fill', C_MUTED);
    line2.setAttribute('font-size', '12');
    line2.textContent = 'Pick a date range in the top bar to load the schedule.';
    this.svg.appendChild(line2);
  }

  private drawNowLine(currentTime: string, height: number): void {
    // Clamp the playhead to the visible (possibly date-filtered) domain so the
    // handle never renders off the plot when a narrow calendar range is active.
    const curMs = Math.max(
      this.scale.startMs,
      Math.min(this.scale.endMs, new Date(currentTime).getTime()),
    );
    const x = LABEL_W + this.scale.x(curMs);

    const g = document.createElementNS(SVG, 'g');
    g.setAttribute('data-playhead', 'true');
    g.style.cursor = 'ew-resize';

    // The vertical line.
    const line = document.createElementNS(SVG, 'line');
    line.setAttribute('x1', String(x));
    line.setAttribute('x2', String(x));
    line.setAttribute('y1', String(HEADER_H - 4));
    line.setAttribute('y2', String(height));
    line.setAttribute('stroke', C_ACCENT);
    line.setAttribute('stroke-width', '2');
    g.appendChild(line);

    // A wide, invisible hit-target around the line so it's easy to grab.
    const hit = document.createElementNS(SVG, 'rect');
    hit.setAttribute('x', String(x - 7));
    hit.setAttribute('y', String(HEADER_H - 10));
    hit.setAttribute('width', '14');
    hit.setAttribute('height', String(height - HEADER_H + 10));
    hit.setAttribute('fill', 'transparent');
    g.appendChild(hit);

    // Draggable handle (a pill) sitting in the day-axis strip.
    const handle = document.createElementNS(SVG, 'rect');
    handle.setAttribute('x', String(x - 6));
    handle.setAttribute('y', String(HEADER_H - 18));
    handle.setAttribute('width', '12');
    handle.setAttribute('height', '14');
    handle.setAttribute('rx', '3');
    handle.setAttribute('fill', C_ACCENT);
    g.appendChild(handle);

    // Time readout bubble above the handle.
    const label = new Date(curMs).toLocaleString(undefined, {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    const approxW = label.length * 6.2 + 12;
    const bubbleX = Math.max(LABEL_W, Math.min(this.width - approxW, x - approxW / 2));
    const bubble = document.createElementNS(SVG, 'rect');
    bubble.setAttribute('x', String(bubbleX));
    bubble.setAttribute('y', '2');
    bubble.setAttribute('width', String(approxW));
    bubble.setAttribute('height', '14');
    bubble.setAttribute('rx', '7');
    bubble.setAttribute('fill', C_ACCENT);
    g.appendChild(bubble);
    const text = document.createElementNS(SVG, 'text');
    text.setAttribute('x', String(bubbleX + approxW / 2));
    text.setAttribute('y', '12');
    text.setAttribute('fill', '#ffffff');
    text.setAttribute('font-size', '10');
    text.setAttribute('font-weight', '600');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('pointer-events', 'none');
    text.textContent = label;
    g.appendChild(text);

    this.svg.appendChild(g);
  }

  private clip(s: string, maxPx: number): string {
    const maxChars = Math.max(1, Math.floor(maxPx / 6.2));
    return s.length > maxChars ? `${s.slice(0, maxChars - 1)}…` : s;
  }

  /** Clip a label to a pixel width using an explicit avg char width. */
  private clipLabel(s: string, maxPx: number, pxPerChar: number): string {
    const maxChars = Math.max(1, Math.floor(maxPx / pxPerChar));
    return s.length > maxChars ? `${s.slice(0, maxChars - 1)}…` : s;
  }

  // ── interaction (3.2 select, 3.3 drag/resize) ──────────────────────────────

  private taskFromEvent(e: PointerEvent): { task: Task; resize: boolean } | null {
    const target = e.target as Element | null;
    const group = target?.closest('[data-task-id]') as SVGGElement | null;
    if (!group) return null;
    const id = group.getAttribute('data-task-id');
    const task = this.store.getState().tasks.find((t) => t.id === id);
    if (!task) return null;
    const resize = (target as Element)?.getAttribute('data-resize') === 'true';
    return { task, resize };
  }

  private localX(e: PointerEvent): number {
    const rect = this.svg.getBoundingClientRect();
    const scaleX = this.width / rect.width; // viewBox px per client px
    return (e.clientX - rect.left) * scaleX - LABEL_W;
  }

  private onPointerDown = (e: PointerEvent): void => {
    // Playhead scrub: dragging the now-line sets the time directly on the Gantt
    // (this replaces the old top-bar slider track).
    const ph = (e.target as Element | null)?.closest('[data-playhead]');
    if (ph) {
      this.scrubbing = true;
      this.stopPlayback(); // scrubbing cancels playback
      this.scrubToPointer(e);
      e.preventDefault();
      return;
    }

    const hit = this.taskFromEvent(e);
    if (!hit) return;
    if (this.pickingRoute) {
      this.store.addRouteTask(hit.task.id);
      if (this.store.getState().routeTaskIds.length === 2) this.pickingRoute = false;
      this.updateRouteControl();
      e.preventDefault();
      return;
    }
    // Selection (3.2) — works from either lane.
    this.store.select({ kind: 'task', id: hit.task.id });
    // Editing (3.3) flows through the PERSON lane only; equipment lanes are a
    // read view of the same bar, so a click there selects but does not drag.
    const group = (e.target as Element | null)?.closest('[data-task-id]') as SVGGElement | null;
    if (group?.getAttribute('data-lane') === 'equipment') return;
    this.drag = {
      task: hit.task,
      mode: hit.resize ? 'resize' : 'move',
      pointerStartX: this.localX(e),
      origStartMs: new Date(hit.task.start).getTime(),
      origEndMs: new Date(hit.task.end).getTime(),
    };
    this.svg.style.cursor = hit.resize ? 'ew-resize' : 'grabbing';
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (this.scrubbing) {
      this.scrubToPointer(e);
      return;
    }
    if (!this.drag) return;
    const dxPx = this.localX(e) - this.drag.pointerStartX;
    const dxMs = (dxPx / this.scale.width) * (this.scale.endMs - this.scale.startMs);

    if (this.drag.mode === 'move') {
      const newStart = snapMs(this.drag.origStartMs + dxMs, SNAP_MIN);
      this.store.moveTask(this.drag.task.id, new Date(newStart).toISOString());
    } else {
      const newEnd = snapMs(this.drag.origEndMs + dxMs, SNAP_MIN);
      // Guard: keep at least one snap step of duration.
      if (newEnd > this.drag.origStartMs + SNAP_MIN * 60_000) {
        this.store.resizeTask(this.drag.task.id, new Date(newEnd).toISOString());
      }
    }
  };

  private onPointerUp = (): void => {
    this.scrubbing = false;
    if (!this.drag) return;
    this.drag = null;
    this.svg.style.cursor = '';
  };

  /** Set the store time from a pointer position over the plot (playhead drag). */
  private scrubToPointer(e: PointerEvent): void {
    const px = this.localX(e); // already LABEL_W-relative plot pixels
    this.store.setTime(this.scale.invertIso(px));
  }
}
