/** Domain types — the single-source-of-truth shapes (design §3, addendum R9–R11). */

/** ISO 8601 datetime string. */
export type ISODate = string;

/** Work-order status vocabulary (client Lookups sheet). */
export type WorkOrderStatus =
  | 'Planned'
  | 'Dispatched'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Cancelled';

/** Work-order priority vocabulary. */
export type Priority = 'Emergency' | 'High' | 'Medium' | 'Low';

export interface Person {
  id: string;
  name: string;
  /** Crew for grouping/coloring in the Gantt (R3.3). */
  crew: string;
  /** Assigned palette color (hex). */
  color: string;

  // --- client Resource fields (R9.3, R10.2) ---
  /** Primary trade, e.g. "I&E Technician". */
  primaryTrade?: string;
  /** Home process area, e.g. "Crude Unit". */
  homeArea?: string;
  /** Daily shift window (ISO). */
  shiftStart?: ISODate;
  shiftEnd?: ISODate;
  /** Daily capacity in hours. */
  dailyCapacityHrs?: number;
  /** Availability status, e.g. "Available" | "Training". */
  availability?: string;
}

/**
 * Equipment / machinery (R11). A NON-SPATIAL table row — no geometry of its own;
 * it inherits a location only through the task(s) that require it. Carries
 * physical dimensions (R11.2 / D-3(a)).
 */
export interface Equipment {
  id: string;
  name: string;
  /** Equipment type/class, e.g. "Crane", "Vac Truck". */
  type: string;
  /** Physical dimensions in metres (required schema per D-3(a)). */
  heightM: number;
  widthM: number;
  lengthM: number;
  /** Optional weight in kg. */
  weightKg?: number;
  /** Palette color for the equipment lane bars. */
  color: string;
}

export interface Zone {
  id: string;
  name: string;
  /** SceneLayer OBJECTID(s) of the bound IFC element(s), when known (binding strategy 1). */
  objectIds?: number[];
  /** Working-bubble anchor [lon, lat, elevation] (binding strategy 2 — default for demo). */
  position?: [number, number, number];
  /**
   * Real work-area footprint geometry: WGS84 polygon rings, one array of
   * [lon, lat] vertices per ring (first ring = outer boundary). Authored in
   * ArcGIS Pro (the work_zones feature class) and baked into plant.generated.ts.
   * When present, the map draws this exact footprint instead of a synthesized
   * circle around `position`.
   */
  rings?: [number, number][][];
  /** Outdoor/elevated zone → weather hazard rules apply (R6.5). */
  weatherExposed: boolean;
  /** Process area this zone/asset belongs to (R9.5). */
  area?: string;
  /** Asset class, e.g. "Crude Distillation Tower" (R9.5). */
  assetClass?: string;
  /**
   * Explicit work-area volume height in metres. When set, the 3D work overlay
   * extrudes this zone's footprint to exactly this height so the column rises
   * to the top of the physical asset it contains (a tall tower vs. a short
   * pump). When omitted, the overlay derives a height from `assetClass`
   * (see ASSET_CLASS_HEIGHT_M in WorkOverlay). Authored once and baked into
   * plant.generated.ts, so it persists across every run.
   */
  heightM?: number;
}

export interface Task {
  id: string;
  title: string;
  personId: string;
  /** The zone/feature (Asset) this work happens in (R3.2, R4, R9.5). */
  zoneId: string;
  start: ISODate;
  end: ISODate;
  /** Task-level weather sensitivity; combined with zone.weatherExposed (R6.5). */
  weatherSensitive: boolean;

  // --- client Work-Order fields (R9.1) ---
  /** Parent WO id (follow-up chain), when present. */
  parentWoId?: string;
  /** SAP notification reference. */
  sapNotification?: string;
  /** Asset id, e.g. "CU-T01" (also encoded via zoneId). */
  assetId?: string;
  assetClass?: string;
  area?: string;
  workType?: string;
  description?: string;
  priority?: Priority;
  requiredTrade?: string;
  status?: WorkOrderStatus;
  estimatedHours?: number;
  actualStart?: ISODate | null;
  actualFinish?: ISODate | null;
  actualHours?: number | null;
  scheduleVarianceHrs?: number | null;
  crewTravelMi?: number;
  safetyPermit?: boolean;
  followUpRequired?: boolean;
  percentComplete?: number;
  plannerNotes?: string;

  /** Equipment ids this work order requires (R11.2 / D-3(b)). */
  requiredEquipment?: string[];
}

export type HazardKind = 'alert' | 'wind' | 'precip' | 'temp';
export type HazardSeverity = 'advisory' | 'watch' | 'warning';

export interface Hazard {
  id: string;
  kind: HazardKind;
  severity: HazardSeverity;
  /** NWS headline or synthesized description. */
  headline: string;
  start: ISODate;
  end: ISODate;
  source: 'nws' | 'sample';
}

/** Same-feature concurrent work: 2+ tasks active in one zone at once (R5.4). */
export interface Conflict {
  zoneId: string;
  taskIds: string[];
  overlapStart: ISODate;
  overlapEnd: ISODate;
}

/** Same-person double-booking: one person with 2+ overlapping tasks (R3.4). */
export interface PersonConflict {
  personId: string;
  taskIds: string[];
  overlapStart: ISODate;
  overlapEnd: ISODate;
}

/**
 * Same-equipment double-booking: one machine required by 2+ overlapping tasks
 * (R11.4). Detectable the same way as person double-booking so the follow-on
 * work can surface it. Rendering beyond the lane is left to that work.
 */
export interface EquipmentConflict {
  equipmentId: string;
  taskIds: string[];
  overlapStart: ISODate;
  overlapEnd: ISODate;
}

export type Selection =
  | { kind: 'none' }
  | { kind: 'task'; id: string }
  | { kind: 'zone'; id: string }
  | { kind: 'conflict'; zoneId: string }
  | { kind: 'personConflict'; personId: string }
  | { kind: 'equipment'; id: string }
  | { kind: 'equipmentConflict'; equipmentId: string };

/**
 * Inclusive date-range filter driven by the Calcite calendar (Esri top bar).
 * When set, the Gantt scopes its visible domain to [startDate 00:00, endDate
 * 24:00]; null means "show the whole schedule". Dates are ISO calendar days
 * (YYYY-MM-DD), independent of the per-instant `currentTime` playhead.
 */
export interface VisibleRange {
  /** First visible calendar day, YYYY-MM-DD. */
  startDate: string;
  /** Last visible calendar day (inclusive), YYYY-MM-DD. */
  endDate: string;
}

export interface StoreState {
  people: Person[];
  equipment: Equipment[];
  zones: Zone[];
  tasks: Task[];
  hazards: Hazard[];
  currentTime: ISODate;
  selection: Selection;
  /** Up to two Gantt task ids selected as the endpoints of a map route. */
  routeTaskIds: string[];
  /** Calendar date-range filter for the Gantt; null = full schedule (R12). */
  visibleRange: VisibleRange | null;

  // --- derived (recomputed on every mutation) ---
  /** Task ids in progress at currentTime (R5.2). */
  activeTaskIds: string[];
  /** All same-feature overlaps across the schedule (R5.4). */
  conflicts: Conflict[];
  /** All same-person double-bookings across the schedule (R3.4). */
  personConflicts: PersonConflict[];
  /** All same-equipment double-bookings across the schedule (R11.4). */
  equipmentConflicts: EquipmentConflict[];
  /** Hazards matched to each flagged task (R6.3). */
  hazardByTask: Record<string, Hazard[]>;
}
