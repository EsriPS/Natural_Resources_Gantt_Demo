/**
 * Pure derived-state selectors (design §3, §6, §7). No side effects, no store
 * dependency — these are the correctness-critical core and are unit-tested.
 */

import type { Task, Zone, Hazard, Conflict, PersonConflict, EquipmentConflict, ISODate } from './types';

const ms = (d: ISODate): number => new Date(d).getTime();

/** True when half-open intervals [aStart,aEnd) and [bStart,bEnd) overlap. */
export function intervalsOverlap(
  aStart: ISODate,
  aEnd: ISODate,
  bStart: ISODate,
  bEnd: ISODate,
): boolean {
  return ms(aStart) < ms(bEnd) && ms(bStart) < ms(aEnd);
}

/** The overlapping sub-interval of two intervals, or null if they don't overlap. */
export function intervalIntersection(
  aStart: ISODate,
  aEnd: ISODate,
  bStart: ISODate,
  bEnd: ISODate,
): { start: ISODate; end: ISODate } | null {
  const start = Math.max(ms(aStart), ms(bStart));
  const end = Math.min(ms(aEnd), ms(bEnd));
  if (start >= end) return null;
  return { start: new Date(start).toISOString(), end: new Date(end).toISOString() };
}

/** Tasks in progress at time t: start <= t < end (R5.2). */
export function computeActive(tasks: Task[], t: ISODate): string[] {
  const tt = ms(t);
  return tasks.filter((task) => ms(task.start) <= tt && tt < ms(task.end)).map((task) => task.id);
}

/**
 * Same-feature conflicts (R5.4): per zone, any set of tasks whose time windows
 * mutually overlap at some instant. Implemented as a sweep over start-sorted
 * tasks; a maximal cluster of mutually-overlapping tasks becomes one Conflict
 * covering their common overlap window.
 */
export function computeConflicts(tasks: Task[]): Conflict[] {
  const byZone = new Map<string, Task[]>();
  for (const task of tasks) {
    const list = byZone.get(task.zoneId);
    if (list) list.push(task);
    else byZone.set(task.zoneId, [task]);
  }

  const conflicts: Conflict[] = [];

  for (const [zoneId, zoneTasks] of byZone) {
    if (zoneTasks.length < 2) continue;
    const sorted = [...zoneTasks].sort((a, b) => ms(a.start) - ms(b.start));

    // Active cluster: tasks whose windows are mutually overlapping so far.
    let cluster: Task[] = [];
    let clusterEnd = -Infinity; // min end among cluster members

    const flush = () => {
      if (cluster.length >= 2) {
        const overlapStart = Math.max(...cluster.map((t) => ms(t.start)));
        const overlapEnd = Math.min(...cluster.map((t) => ms(t.end)));
        if (overlapStart < overlapEnd) {
          conflicts.push({
            zoneId,
            taskIds: cluster.map((t) => t.id),
            overlapStart: new Date(overlapStart).toISOString(),
            overlapEnd: new Date(overlapEnd).toISOString(),
          });
        }
      }
    };

    for (const task of sorted) {
      // Drop cluster members that end before this task starts — they can no
      // longer be concurrent with it or anything after it.
      if (cluster.length > 0 && ms(task.start) >= clusterEnd) {
        flush();
        cluster = cluster.filter((t) => ms(t.end) > ms(task.start));
      }
      cluster.push(task);
      clusterEnd = Math.min(...cluster.map((t) => ms(t.end)));
    }
    flush();
  }

  return conflicts;
}

/**
 * Same-person double-bookings (R3.4): per person, any set of tasks whose time
 * windows mutually overlap — regardless of zone. Same cluster-sweep as
 * computeConflicts, grouped by personId. A person assigned two overlapping
 * tasks is a scheduling error surfaced as prominently as a same-feature clash.
 */
export function computePersonConflicts(tasks: Task[]): PersonConflict[] {
  const byPerson = new Map<string, Task[]>();
  for (const task of tasks) {
    const list = byPerson.get(task.personId);
    if (list) list.push(task);
    else byPerson.set(task.personId, [task]);
  }

  const conflicts: PersonConflict[] = [];

  for (const [personId, personTasks] of byPerson) {
    if (personTasks.length < 2) continue;
    const sorted = [...personTasks].sort((a, b) => ms(a.start) - ms(b.start));

    let cluster: Task[] = [];
    let clusterEnd = -Infinity;

    const flush = () => {
      if (cluster.length >= 2) {
        const overlapStart = Math.max(...cluster.map((t) => ms(t.start)));
        const overlapEnd = Math.min(...cluster.map((t) => ms(t.end)));
        if (overlapStart < overlapEnd) {
          conflicts.push({
            personId,
            taskIds: cluster.map((t) => t.id),
            overlapStart: new Date(overlapStart).toISOString(),
            overlapEnd: new Date(overlapEnd).toISOString(),
          });
        }
      }
    };

    for (const task of sorted) {
      if (cluster.length > 0 && ms(task.start) >= clusterEnd) {
        flush();
        cluster = cluster.filter((t) => ms(t.end) > ms(task.start));
      }
      cluster.push(task);
      clusterEnd = Math.min(...cluster.map((t) => ms(t.end)));
    }
    flush();
  }

  return conflicts;
}

/**
 * Same-equipment double-bookings (R11.4): per piece of equipment, any set of
 * tasks that REQUIRE it and whose time windows mutually overlap. Same
 * cluster-sweep as computePersonConflicts, keyed by equipment id (a task can
 * require several machines, so one task may appear under multiple equipment).
 * Detectable here so the follow-on work can surface it; rendering beyond the
 * Gantt lane is intentionally left to that work (scope guard).
 */
export function computeEquipmentConflicts(tasks: Task[]): EquipmentConflict[] {
  const byEquip = new Map<string, Task[]>();
  for (const task of tasks) {
    for (const eqId of task.requiredEquipment ?? []) {
      const list = byEquip.get(eqId);
      if (list) list.push(task);
      else byEquip.set(eqId, [task]);
    }
  }

  const conflicts: EquipmentConflict[] = [];

  for (const [equipmentId, equipTasks] of byEquip) {
    if (equipTasks.length < 2) continue;
    const sorted = [...equipTasks].sort((a, b) => ms(a.start) - ms(b.start));

    let cluster: Task[] = [];
    let clusterEnd = -Infinity;

    const flush = () => {
      if (cluster.length >= 2) {
        const overlapStart = Math.max(...cluster.map((t) => ms(t.start)));
        const overlapEnd = Math.min(...cluster.map((t) => ms(t.end)));
        if (overlapStart < overlapEnd) {
          conflicts.push({
            equipmentId,
            taskIds: cluster.map((t) => t.id),
            overlapStart: new Date(overlapStart).toISOString(),
            overlapEnd: new Date(overlapEnd).toISOString(),
          });
        }
      }
    };

    for (const task of sorted) {
      if (cluster.length > 0 && ms(task.start) >= clusterEnd) {
        flush();
        cluster = cluster.filter((t) => ms(t.end) > ms(task.start));
      }
      cluster.push(task);
      clusterEnd = Math.min(...cluster.map((t) => ms(t.end)));
    }
    flush();
  }

  return conflicts;
}

/** True if a task is subject to weather hazard rules (R6.5). */
export function isWeatherRelevant(task: Task, zones: Zone[]): boolean {
  if (task.weatherSensitive) return true;
  const zone = zones.find((z) => z.id === task.zoneId);
  return zone?.weatherExposed ?? false;
}

/**
 * Match hazards to tasks by time-window overlap, skipping weather-insensitive
 * indoor tasks (R6.3–R6.5). Returns a map taskId -> hazards.
 */
export function computeHazardByTask(
  tasks: Task[],
  zones: Zone[],
  hazards: Hazard[],
): Record<string, Hazard[]> {
  const result: Record<string, Hazard[]> = {};
  for (const task of tasks) {
    if (!isWeatherRelevant(task, zones)) continue;
    const matched = hazards.filter((h) =>
      intervalsOverlap(task.start, task.end, h.start, h.end),
    );
    if (matched.length > 0) result[task.id] = matched;
  }
  return result;
}
