/**
 * ScheduleStore — the single source of truth (design §1, R7.3).
 *
 * Views subscribe to state changes and dispatch mutations back. Every mutation
 * recomputes derived state (active tasks, conflicts, hazard flags) so all views
 * stay consistent (R7.3). No view talks to another view directly.
 */

import type {
  Person,
  Equipment,
  Zone,
  Task,
  Hazard,
  Selection,
  StoreState,
  ISODate,
} from './types';
import {
  computeActive,
  computeConflicts,
  computePersonConflicts,
  computeEquipmentConflicts,
  computeHazardByTask,
} from './selectors';

type Listener = (state: StoreState) => void;

export interface ScheduleSeed {
  people: Person[];
  equipment?: Equipment[];
  zones: Zone[];
  tasks: Task[];
  hazards?: Hazard[];
  currentTime?: ISODate;
}

const minMs = (xs: number[]): number => xs.reduce((a, b) => Math.min(a, b), Infinity);

export class ScheduleStore {
  private state: StoreState;
  private listeners = new Set<Listener>();

  constructor(seed: ScheduleSeed) {
    const base = {
      people: seed.people,
      equipment: seed.equipment ?? [],
      zones: seed.zones,
      tasks: seed.tasks,
      hazards: seed.hazards ?? [],
      currentTime:
        seed.currentTime ??
        (seed.tasks.length
          ? new Date(minMs(seed.tasks.map((t) => new Date(t.start).getTime()))).toISOString()
          : new Date().toISOString()),
      selection: { kind: 'none' } as Selection,
      routeTaskIds: [] as string[],
      visibleRange: null as StoreState['visibleRange'],
    };
    this.state = { ...base, ...this.derive(base) };
  }

  // --- read ---
  getState(): Readonly<StoreState> {
    return this.state;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // --- mutations ---
  setTime(t: ISODate): void {
    this.commit({ currentTime: t });
  }

  select(selection: Selection): void {
    this.commit({ selection });
  }

  /** Add a task as a route endpoint. Duplicate and third endpoints are ignored. */
  addRouteTask(taskId: string): void {
    if (!this.state.tasks.some((task) => task.id === taskId)) return;
    if (this.state.routeTaskIds.includes(taskId) || this.state.routeTaskIds.length >= 2) return;
    this.commit({ routeTaskIds: [...this.state.routeTaskIds, taskId] });
  }

  /** Clear both route endpoints (also used before starting a new route). */
  clearRoute(): void {
    if (this.state.routeTaskIds.length === 0) return;
    this.commit({ routeTaskIds: [] });
  }

  /** Set (or clear) the Gantt date-range filter from the Calcite calendar. */
  setVisibleRange(range: StoreState['visibleRange']): void {
    this.commit({ visibleRange: range });
  }

  setHazards(hazards: Hazard[]): void {
    this.commit({ hazards });
  }

  /** Replace zone definitions (e.g. re-anchor positions to the loaded scene). */
  setZones(zones: Zone[]): void {
    this.commit({ zones });
  }

  /** Move a task to a new start, preserving its duration (R4.3, R7.1). */
  moveTask(taskId: string, newStart: ISODate): void {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const durationMs = new Date(task.end).getTime() - new Date(task.start).getTime();
    const start = new Date(newStart).getTime();
    const end = start + durationMs;
    this.replaceTask(taskId, {
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    });
  }

  /** Change a task's end (duration) (R7.2). */
  resizeTask(taskId: string, newEnd: ISODate): void {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (new Date(newEnd).getTime() <= new Date(task.start).getTime()) return;
    this.replaceTask(taskId, { end: newEnd });
  }

  private replaceTask(taskId: string, patch: Partial<Task>): void {
    const tasks = this.state.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
    this.commit({ tasks });
  }

  // --- internals ---
  private derive(s: {
    tasks: Task[];
    zones: Zone[];
    hazards: Hazard[];
    currentTime: ISODate;
  }): Pick<
    StoreState,
    'activeTaskIds' | 'conflicts' | 'personConflicts' | 'equipmentConflicts' | 'hazardByTask'
  > {
    return {
      activeTaskIds: computeActive(s.tasks, s.currentTime),
      conflicts: computeConflicts(s.tasks),
      personConflicts: computePersonConflicts(s.tasks),
      equipmentConflicts: computeEquipmentConflicts(s.tasks),
      hazardByTask: computeHazardByTask(s.tasks, s.zones, s.hazards),
    };
  }

  private commit(patch: Partial<StoreState>): void {
    const next = { ...this.state, ...patch };
    const derived = this.derive(next);
    this.state = { ...next, ...derived };
    for (const fn of this.listeners) fn(this.state);
  }
}
