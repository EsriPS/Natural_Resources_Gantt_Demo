/**
 * WorkOverlay (Phase 7, design §4, R5.3/R5.4). Draws the time-driven work state
 * onto the scene's GraphicsLayer as WORK AREAS — not map pins.
 *
 * The goal is to show WHERE a crew is working and WHAT AREA they need to access,
 * so each active zone renders as a translucent, crew-colored FOOTPRINT draped on
 * the structure (a geodesic-buffered circle around the zone anchor) with a solid
 * outline and a flat label — reading as "work happening in this area" rather than
 * a point dropped on a map.
 *
 *   7.1 work area: one footprint per zone with active work, crew-colored, labeled
 *                  with the crew/task(s) in it. Updates on every store change.
 *   7.2 conflict:  a zone with 2+ active tasks renders a RED footprint + ⚠ count;
 *                  honors prefers-reduced-motion (no pulse).
 *   selection:     the selected task's zone footprint is enlarged, brighter, and
 *                  thickly outlined so it is unmistakable after the camera flies in.
 *
 * Reads only from the store; never mutates it.
 */

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import PolygonSymbol3D from '@arcgis/core/symbols/PolygonSymbol3D';
import FillSymbol3DLayer from '@arcgis/core/symbols/FillSymbol3DLayer';
import ExtrudeSymbol3DLayer from '@arcgis/core/symbols/ExtrudeSymbol3DLayer';
import PointSymbol3D from '@arcgis/core/symbols/PointSymbol3D';
import TextSymbol3DLayer from '@arcgis/core/symbols/TextSymbol3DLayer';
import type { ScheduleStore } from '../store/ScheduleStore';
import type { StoreState, Zone, Priority } from '../store/types';
import { taskColor, CONFLICT_COLOR, WEATHER_COLOR } from '../ui/taskColor';

/** Work-area footprint radius, in metres. Selected areas are drawn larger. */
const AREA_RADIUS_M = 9;
const AREA_RADIUS_SELECTED_M = 14;

/**
 * Fallback cylinder height (metres) for a work-zone volume when neither an
 * explicit zone.heightM nor an asset-class match is available.
 */
const AREA_HEIGHT_M = 12;
/** A selected zone rises this many extra metres above its resolved height. */
const SELECTED_HEIGHT_BONUS_M = 8;

/**
 * Per-asset-class work-volume heights (metres). The work-zone column must rise
 * to the TOP of the physical asset it contains, so tall vertical process
 * equipment (towers, columns, furnaces, reactors, flare drums, stacks) gets a
 * tall column while low equipment (pumps, exchangers, small drums) gets a short
 * one. Authored once here and used for every run; a zone can override it with an
 * explicit `heightM`. Matching is case-insensitive substring against the zone's
 * assetClass, longest keyword first, so "Crude Distillation Tower" → tower.
 */
const ASSET_CLASS_HEIGHT_M: Array<[keyword: string, height: number]> = [
  // Tall vertical process equipment.
  ['distillation tower', 42],
  ['fractionator', 38],
  ['stripper column', 30],
  ['tower', 36],
  ['column', 30],
  ['furnace', 23],
  ['reactor', 26],
  ['regenerator', 29],
  ['flare', 34],
  ['stack', 46],
  // Vessels / drums / tanks (medium).
  ['knockout drum', 17],
  ['accumulator drum', 12],
  ['storage tank', 14],
  ['drum', 11],
  ['tank', 14],
  ['exchanger train', 12],
  ['exchanger', 8],
  ['compressor', 9],
  // Low / ground-level equipment.
  ['pump', 5],
];

/**
 * Resolve the extrusion height (metres) for a zone's work-area volume.
 * Precedence: explicit zone.heightM → asset-class keyword match → default.
 * A selected zone gets a small bonus so it still reads as "lifted".
 */
function zoneHeightM(zone: Zone, selected: boolean): number {
  let base = zone.heightM;
  if (base === undefined && zone.assetClass) {
    const ac = zone.assetClass.toLowerCase();
    for (const [kw, h] of ASSET_CLASS_HEIGHT_M) {
      if (ac.includes(kw)) {
        base = h;
        break;
      }
    }
  }
  if (base === undefined) base = AREA_HEIGHT_M;
  return selected ? base + SELECTED_HEIGHT_BONUS_M : base;
}

/** Turn a '#rrggbb' into an [r,g,b,a] array so we can set fill transparency. */
function rgba(hex: string, alpha: number): [number, number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha];
}

export class WorkOverlay {
  private unsub: () => void;

  constructor(
    private layer: GraphicsLayer,
    private store: ScheduleStore,
  ) {
    this.unsub = this.store.subscribe(() => this.render());
    this.render();
  }

  destroy(): void {
    this.unsub();
    this.layer.removeAll();
  }

  private zoneById(zones: Zone[], id: string): Zone | undefined {
    return zones.find((z) => z.id === id);
  }

  private render(): void {
    const state = this.store.getState();
    this.layer.removeAll();

    // Follow the Gantt: with no date range selected the schedule is "unloaded",
    // so draw no work zones on the map either (R12).
    if (!state.visibleRange) return;

    const activeIds = new Set(state.activeTaskIds);
    const activeTasks = state.tasks.filter((t) => activeIds.has(t.id));

    // Group active tasks by zone — one work AREA per zone, not per task.
    const byZone = new Map<string, typeof activeTasks>();
    for (const t of activeTasks) {
      const list = byZone.get(t.zoneId);
      if (list) list.push(t);
      else byZone.set(t.zoneId, [t]);
    }

    const selId = state.selection.kind === 'task' ? state.selection.id : null;

    // --- Pass 1: build each active zone's footprint geometry + metadata. ---
    const PRIORITY_RANK: Record<Priority, number> = { Emergency: 0, High: 1, Medium: 2, Low: 3 };
    const areas: Array<{
      zoneId: string;
      tasks: typeof activeTasks;
      center: Point;
      area: __esriPolygon;
      /** 2+ tasks active in THIS zone at once (temporal, R5.4). */
      timeConflicted: boolean;
      selected: boolean;
      /** This zone's footprint physically intersects another active zone (spatial). */
      spatialOverlap: boolean;
      /** Any active task here is weather-flagged (R6). */
      weather: boolean;
      /** Highest (most urgent) priority among the zone's active tasks. */
      priority?: Priority;
      /** Extrusion height (m) so the column reaches the top of the asset. */
      height: number;
    }> = [];

    for (const [zoneId, tasks] of byZone) {
      const zone = this.zoneById(state.zones, zoneId);
      if (!zone) continue;
      const selected = tasks.some((t) => t.id === selId);

      // Prefer the REAL authored footprint (work_zones polygon, WGS84 rings).
      // Fall back to a geodesic circle around the anchor for zones that carry
      // no geometry (keeps older data working).
      let area: __esriPolygon | null = null;
      let center: Point;
      if (zone.rings && zone.rings.length > 0) {
        area = new Polygon({
          rings: zone.rings as unknown as number[][][],
          spatialReference: { wkid: 4326 },
        }) as unknown as __esriPolygon;
        center = area.centroid ?? new Point({ longitude: zone.position?.[0], latitude: zone.position?.[1] });
      } else if (zone.position) {
        const [lon, lat] = zone.position;
        const radius = selected ? AREA_RADIUS_SELECTED_M : AREA_RADIUS_M;
        center = new Point({ longitude: lon, latitude: lat });
        area = geometryEngine.geodesicBuffer(center, radius, 'meters') as __esriPolygon;
      } else {
        continue;
      }
      if (!area) continue;

      const weather = tasks.some((t) => Boolean(state.hazardByTask[t.id]?.length));
      // Most urgent priority wins the color for the zone.
      let priority: Priority | undefined;
      for (const t of tasks) {
        if (!t.priority) continue;
        if (priority === undefined || PRIORITY_RANK[t.priority] < PRIORITY_RANK[priority]) {
          priority = t.priority;
        }
      }

      areas.push({
        zoneId,
        tasks,
        center,
        area,
        timeConflicted: tasks.length >= 2,
        selected,
        spatialOverlap: false,
        weather,
        priority,
        height: zoneHeightM(zone, selected),
      });
    }

    // --- Pass 2: find pairs of zones whose work AREAS physically intersect, ---
    // flag both red, and collect the intersection regions to draw in red.
    const intersections: __esriPolygon[] = [];
    for (let i = 0; i < areas.length; i++) {
      for (let j = i + 1; j < areas.length; j++) {
        const a = areas[i];
        const b = areas[j];
        if (!geometryEngine.intersects(a.area, b.area)) continue;
        a.spatialOverlap = true;
        b.spatialOverlap = true;
        const lens = geometryEngine.intersect(a.area, b.area) as __esriPolygon | null;
        if (lens) intersections.push(lens);
      }
    }

    // --- Pass 3: draw each zone footprint, then the red intersection lenses. ---
    for (const a of areas) {
      // One shared precedence (R14): a conflict (temporal in-zone OR spatial
      // zone overlap) is red; else the zone is colored by its most-urgent task
      // priority. Weather is a separate yellow OUTLINE marking (not a fill), so
      // a storm shows without hiding the priority.
      const isConflict = a.timeConflicted || a.spatialOverlap;
      const color = taskColor({ conflict: isConflict, priority: a.priority });
      const emphasized = isConflict;

      this.layer.add(
        new Graphic({
          geometry: a.area,
          symbol: this.areaSymbol(color, emphasized, a.selected, a.weather, a.height),
          attributes: { kind: 'work-area', zoneId: a.zoneId, conflicted: isConflict },
        }),
      );

      const label = this.areaLabel(a.tasks, a.timeConflicted, a.spatialOverlap, a.weather);
      this.layer.add(
        new Graphic({
          geometry: a.center,
          symbol: this.labelSymbol(
            label,
            color,
            isConflict,
            a.selected,
            a.height,
          ),
          attributes: { kind: 'work-label', zoneId: a.zoneId },
        }),
      );
    }

    // The overlapping region itself — a bright red extruded sliver standing
    // taller than either zone so the intersection reads unmistakably.
    for (const lens of intersections) {
      this.layer.add(
        new Graphic({
          geometry: lens,
          symbol: this.intersectionSymbol(),
          attributes: { kind: 'zone-intersection' },
        }),
      );
    }
  }

  /** Human label for the area. Spatial zone overlap and in-zone concurrency both read as ⚠. */
  private areaLabel(
    tasks: Array<{ title: string }>,
    timeConflicted: boolean,
    spatialOverlap: boolean,
    weather: boolean,
  ): string {
    // Keep labels short: a status icon + the task TYPE only (the text before
    // the em-dash in each title, e.g. "Inspection — Routine…" → "Inspection").
    const taskType = (title: string): string => title.split('—')[0].trim() || title;
    const types = Array.from(new Set(tasks.map((t) => taskType(t.title))));
    const label = types.length === 1 ? types[0] : `${types.length} tasks`;
    // ⚠ caution for a problem (zone overlap or concurrent work), 🌧 for weather.
    const problem = spatialOverlap || timeConflicted;
    const icon = problem ? '⚠ ' : weather ? '🌧 ' : '';
    return `${icon}${label}`;
  }

  /**
   * Transparent 3D cylinder marking the work zone (the access VOLUME a crew
   * needs). The fill carries conflict/priority color; when `weather` is set the
   * cylinder gets a bright-yellow OUTLINE + edges so a storm is unmistakable
   * without hiding the priority color (R14). `height` is the resolved extrusion
   * so the column rises to the top of the physical asset it contains.
   */
  private areaSymbol(
    color: string,
    conflicted: boolean,
    selected: boolean,
    weather: boolean,
    height: number,
  ): PolygonSymbol3D {
    const wallAlpha = conflicted ? 0.3 : selected ? 0.3 : 0.22;
    const floorAlpha = conflicted ? 0.55 : selected ? 0.5 : 0.38;
    const edgeColor = weather ? WEATHER_COLOR : color;
    const outlineColor = weather ? WEATHER_COLOR : color;
    const outlineSize = weather ? 4 : selected ? 3 : conflicted ? 2.5 : 1.5;
    return new PolygonSymbol3D({
      symbolLayers: [
        // The transparent cylinder volume.
        new ExtrudeSymbol3DLayer({
          size: height,
          material: { color: rgba(color, wallAlpha) },
          edges: {
            color: edgeColor,
            size: weather ? 3 : selected ? 2 : 1,
          },
        }),
        // A brighter floor disc + outline so the base is well defined.
        new FillSymbol3DLayer({
          material: { color: rgba(color, floorAlpha) },
          outline: { color: outlineColor, size: outlineSize },
        }),
      ],
    });
  }

  /**
   * The overlapping region where two work zones physically intersect. Drawn as a
   * FLAT, bright red lens hugging the surface (no tall column) with a strong red
   * outline — so BOTH translucent zone cylinders stay fully visible and the red
   * marks exactly where they cross, rather than a column that hides them.
   */
  private intersectionSymbol(): PolygonSymbol3D {
    const red = CONFLICT_COLOR;
    return new PolygonSymbol3D({
      symbolLayers: [
        new FillSymbol3DLayer({
          material: { color: rgba(red, 0.45) },
          outline: { color: red, size: 4 },
        }),
      ],
    });
  }

  /** Flat text label floating just above the top of the zone's column. */
  private labelSymbol(
    text: string,
    color: string,
    conflicted: boolean,
    selected: boolean,
    height: number,
  ): PointSymbol3D {
    return new PointSymbol3D({
      symbolLayers: [
        new TextSymbol3DLayer({
          text,
          material: { color: '#ffffff' },
          halo: { color: conflicted ? '#5a0f0f' : '#0f1419', size: 1.4 },
          size: selected ? 13 : conflicted ? 12 : 10,
        }),
      ],
      // Float the label just above the cylinder TOP so it reads as the zone's
      // banner rather than text buried inside the transparent volume. The label
      // sits on a ground-anchored point, so lift it by the column height plus a
      // small screen gap; minWorldLength tracks the column so a tall tower's
      // banner clears its own top.
      verticalOffset: {
        screenLength: selected ? 30 : 24,
        maxWorldLength: height + 120,
        minWorldLength: height + 4,
      },
      callout: { type: 'line', size: 1, color },
    });
  }
}

/** Minimal local alias for the engine's Polygon return (avoids a wide import). */
type __esriPolygon = import('@arcgis/core/geometry/Polygon').default;

/** Expose the state type for callers that want to pre-check (kept minimal). */
export type { StoreState };
