/**
 * Inspector (Phase 9, design §9, R5.5/R6.4). Fills the right-side panel with
 * context detail for the current `store.selection`:
 *   • task     → title, person, crew, zone, time window, duration, + any hazards
 *                affecting it (R6.4) and whether it is in a conflict.
 *   • zone     → the zone's tasks (who/when), exposure, + active-now count.
 *   • conflict → the clashing tasks, their crews, and the overlap window (R5.5).
 *   • none     → a short hint + schedule summary.
 *
 * Pure read of the store; clicking a related item re-selects it (so the panel
 * cross-navigates and the map/Gantt follow via the single source of truth).
 */

import type { ScheduleStore } from '../store/ScheduleStore';
import type { Hazard, Person, Task, Zone } from '../store/types';
import { PRIORITY_COLORS } from '../ui/taskColor';

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function fmtRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const t: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  const sameDay = s.toDateString() === e.toDateString();
  return sameDay
    ? `${fmtTime(start)} – ${e.toLocaleTimeString(undefined, t)}`
    : `${fmtTime(start)} – ${fmtTime(end)}`;
}

function durationLabel(start: string, end: string): string {
  const mins = Math.round((+new Date(end) - +new Date(start)) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}

export class Inspector {
  private unsub: () => void;

  constructor(
    private host: HTMLElement,
    private store: ScheduleStore,
  ) {
    this.unsub = this.store.subscribe(() => this.render());
    this.render();
    // Delegate clicks on [data-select-*] chips to re-select in the store.
    this.host.addEventListener('click', (e) => {
      const el = (e.target as HTMLElement).closest('[data-select-kind]') as HTMLElement | null;
      if (!el) return;
      const kind = el.dataset.selectKind as 'task' | 'zone' | 'conflict' | 'personConflict';
      const id = el.dataset.selectId ?? '';
      if (kind === 'conflict') this.store.select({ kind: 'conflict', zoneId: id });
      else if (kind === 'personConflict') this.store.select({ kind: 'personConflict', personId: id });
      else this.store.select({ kind, id });
    });
  }

  destroy(): void {
    this.unsub();
    this.host.innerHTML = '';
  }

  private person(id: string): Person | undefined {
    return this.store.getState().people.find((p) => p.id === id);
  }
  private zone(id: string): Zone | undefined {
    return this.store.getState().zones.find((z) => z.id === id);
  }
  private task(id: string): Task | undefined {
    return this.store.getState().tasks.find((t) => t.id === id);
  }

  private render(): void {
    const s = this.store.getState();
    switch (s.selection.kind) {
      case 'task':
        this.host.innerHTML = this.renderTask(s.selection.id);
        break;
      case 'zone':
        this.host.innerHTML = this.renderZone(s.selection.id);
        break;
      case 'conflict':
        this.host.innerHTML = this.renderConflict(s.selection.zoneId);
        break;
      case 'personConflict':
        this.host.innerHTML = this.renderPersonConflict(s.selection.personId);
        break;
      default:
        this.host.innerHTML = this.renderNone();
    }
  }

  private chip(kind: 'task' | 'zone' | 'conflict' | 'personConflict', id: string, label: string): string {
    return `<button class="insp-chip" data-select-kind="${kind}" data-select-id="${esc(id)}">${esc(label)}</button>`;
  }

  /** A colored urgency dot + the priority label (matches the Gantt/map palette). */
  private priorityDot(priority?: Task['priority']): string {
    if (!priority) return '—';
    const color = PRIORITY_COLORS[priority];
    return (
      `<span class="insp-priority">` +
      `<span class="insp-priority-dot" style="background:${color}"></span>` +
      `${esc(priority)}</span>`
    );
  }

  private hazardLines(hazards: Hazard[]): string {
    if (!hazards.length) return '';
    const rows = hazards
      .map(
        (h) =>
          `<li class="insp-hazard insp-sev-${h.severity}">` +
          `<span class="insp-hazard-sev">${h.severity}</span> ${esc(h.headline)}` +
          `<div class="insp-when">${esc(fmtRange(h.start, h.end))}</div></li>`,
      )
      .join('');
    return `<div class="insp-section"><h4>⚠ Weather hazards</h4><ul class="insp-hazards">${rows}</ul></div>`;
  }

  private renderTask(taskId: string): string {
    const t = this.task(taskId);
    if (!t) return this.renderNone();
    const s = this.store.getState();
    const person = this.person(t.personId);
    const zone = this.zone(t.zoneId);
    const hazards = s.hazardByTask[t.id] ?? [];
    const inConflict = s.conflicts.find(
      (c) => c.zoneId === t.zoneId && c.taskIds.includes(t.id),
    );
    const personClash = s.personConflicts.find((c) => c.taskIds.includes(t.id));
    const activeNow = s.activeTaskIds.includes(t.id);

    return (
      `<div class="insp">` +
      `<div class="insp-kind">Task${activeNow ? ' · <span class="insp-live">active now</span>' : ''}</div>` +
      `<h3>${esc(t.title)}</h3>` +
      `<dl class="insp-fields">` +
      `<dt>Person</dt><dd>${person ? esc(person.name) : '—'}` +
      `${person ? ` <span class="insp-crew">${esc(person.crew)}</span>` : ''}</dd>` +
      `<dt>Priority</dt><dd>${this.priorityDot(t.priority)}</dd>` +
      `<dt>Zone</dt><dd>${zone ? this.chip('zone', zone.id, zone.name) : esc(t.zoneId)}` +
      `${zone?.weatherExposed ? ' <span class="insp-tag">weather-exposed</span>' : ''}</dd>` +
      `<dt>When</dt><dd>${esc(fmtRange(t.start, t.end))}</dd>` +
      `<dt>Duration</dt><dd>${durationLabel(t.start, t.end)}</dd>` +
      `</dl>` +
      (personClash
        ? `<div class="insp-section insp-person-note">` +
          `<h4>⚠ Double-booked: ${esc(person?.name ?? 'person')}</h4>` +
          `<p>${personClash.taskIds.length} overlapping tasks for this person. ` +
          this.chip('personConflict', personClash.personId, 'View double-booking') +
          `</p></div>`
        : '') +
      (inConflict
        ? `<div class="insp-section insp-conflict-note">` +
          `<h4>Conflict in ${esc(zone?.name ?? t.zoneId)}</h4>` +
          `<p>${inConflict.taskIds.length} tasks share this zone at once. ` +
          this.chip('conflict', inConflict.zoneId, 'View conflict') +
          `</p></div>`
        : '') +
      this.hazardLines(hazards) +
      `</div>`
    );
  }

  private renderZone(zoneId: string): string {
    const zone = this.zone(zoneId);
    if (!zone) return this.renderNone();
    const s = this.store.getState();
    const tasks = s.tasks
      .filter((t) => t.zoneId === zoneId)
      .sort((a, b) => +new Date(a.start) - +new Date(b.start));
    const activeNow = tasks.filter((t) => s.activeTaskIds.includes(t.id));

    const rows = tasks
      .map((t) => {
        const p = this.person(t.personId);
        const live = s.activeTaskIds.includes(t.id);
        return (
          `<li class="insp-tasklist-item${live ? ' insp-live-row' : ''}">` +
          this.chip('task', t.id, t.title) +
          `<div class="insp-when">${p ? esc(p.name) + ' · ' : ''}${esc(fmtRange(t.start, t.end))}</div></li>`
        );
      })
      .join('');

    return (
      `<div class="insp">` +
      `<div class="insp-kind">Zone</div>` +
      `<h3>${esc(zone.name)}</h3>` +
      `<p class="insp-sub">${zone.weatherExposed ? 'Weather-exposed' : 'Indoor / sheltered'} · ` +
      `${activeNow.length} working now · ${tasks.length} task${tasks.length === 1 ? '' : 's'} total</p>` +
      `<div class="insp-section"><h4>Scheduled work</h4>` +
      `<ul class="insp-tasklist">${rows || '<li class="insp-empty">No tasks in this zone.</li>'}</ul></div>` +
      `</div>`
    );
  }

  private renderConflict(zoneId: string): string {
    const s = this.store.getState();
    const conflict = s.conflicts.find((c) => c.zoneId === zoneId);
    const zone = this.zone(zoneId);
    if (!conflict) return this.renderNone();

    const rows = conflict.taskIds
      .map((id) => {
        const t = this.task(id);
        if (!t) return '';
        const p = this.person(t.personId);
        return (
          `<li class="insp-tasklist-item">` +
          this.chip('task', t.id, t.title) +
          `<div class="insp-when">${p ? `${esc(p.name)} <span class="insp-crew">${esc(p.crew)}</span> · ` : ''}` +
          `${esc(fmtRange(t.start, t.end))}</div></li>`
        );
      })
      .join('');

    return (
      `<div class="insp">` +
      `<div class="insp-kind insp-kind-conflict">⚠ Conflict</div>` +
      `<h3>${esc(zone?.name ?? zoneId)}</h3>` +
      `<p class="insp-sub">${conflict.taskIds.length} tasks working the same zone at once.</p>` +
      `<div class="insp-section insp-conflict-note">` +
      `<h4>Overlap window</h4><p>${esc(fmtRange(conflict.overlapStart, conflict.overlapEnd))}</p></div>` +
      `<div class="insp-section"><h4>Clashing tasks</h4>` +
      `<ul class="insp-tasklist">${rows}</ul></div>` +
      `</div>`
    );
  }

  private renderPersonConflict(personId: string): string {
    const s = this.store.getState();
    const clash = s.personConflicts.find((c) => c.personId === personId);
    const person = this.person(personId);
    if (!clash) return this.renderNone();

    const rows = clash.taskIds
      .map((id) => {
        const t = this.task(id);
        if (!t) return '';
        const zone = this.zone(t.zoneId);
        return (
          `<li class="insp-tasklist-item">` +
          this.chip('task', t.id, t.title) +
          `<div class="insp-when">${zone ? `${esc(zone.name)} · ` : ''}${esc(fmtRange(t.start, t.end))}</div></li>`
        );
      })
      .join('');

    return (
      `<div class="insp">` +
      `<div class="insp-kind insp-kind-person">⚠ Double-booking</div>` +
      `<h3>${esc(person?.name ?? personId)}` +
      `${person ? ` <span class="insp-crew">${esc(person.crew)}</span>` : ''}</h3>` +
      `<p class="insp-sub">${clash.taskIds.length} tasks assigned to this person at the same time.</p>` +
      `<div class="insp-section insp-person-note">` +
      `<h4>Overlap window</h4><p>${esc(fmtRange(clash.overlapStart, clash.overlapEnd))}</p></div>` +
      `<div class="insp-section"><h4>Overlapping tasks</h4>` +
      `<ul class="insp-tasklist">${rows}</ul></div>` +
      `</div>`
    );
  }

  private renderNone(): string {
    const s = this.store.getState();
    const flagged = Object.keys(s.hazardByTask).length;
    const zoneCount = s.conflicts.length;
    const personCount = s.personConflicts.length;
    const equipCount = s.equipmentConflicts.length;
    const totalConflicts = zoneCount + personCount + equipCount;
    const breakdown =
      totalConflicts > 0
        ? ` <span class="insp-when">(${zoneCount} zone · ${personCount} double-booking · ${equipCount} equipment)</span>`
        : '';
    return (
      `<div class="insp insp-none">` +
      `<div class="insp-kind">Inspector</div>` +
      `<p class="insp-sub">Select a task, zone, or conflict to see details.</p>` +
      `<dl class="insp-fields">` +
      `<dt>Tasks</dt><dd>${s.tasks.length}</dd>` +
      `<dt>Conflicts</dt><dd>${totalConflicts}${breakdown}</dd>` +
      `<dt>Weather-flagged</dt><dd>${flagged}</dd>` +
      `</dl></div>`
    );
  }
}
