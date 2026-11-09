/**
 * Dynamic, conflict-free schedule.
 *
 * The baked work orders in plant.generated.ts carry fixed dates (Oct 2026) and
 * overlap heavily: the same zone, person or machine is booked twice at once.
 * At load time this module re-lays every work order onto the TWO WEEKS that
 * start today, so the demo always looks current:
 *
 *   1. planSchedule() places each task in "workday space" (workday index 0..9,
 *      minutes after local midnight). Regular work goes inside 08:00-17:00;
 *      Emergency work orders are treated as after-hours call-outs (evening or
 *      early morning).
 *      A greedy pass keeps each task near its original position in the
 *      sequence, keeps its duration, starts follow-up work orders after their
 *      parent finishes, and never double-books a zone, a person or a machine.
 *   2. materializeSchedule() maps workday index k to the k-th weekday on or
 *      after today (local time, DST-safe) and rewrites start/end, the shifted
 *      actuals, a time-consistent status, and each group's 08:00-17:00 shift.
 *
 * The plan depends only on the task list, never on today's date, and a task
 * never crosses into another workday's working window, so the result is
 * conflict-free for any start date. Times are the viewer's local time, which is
 * the same clock the Gantt uses for its day boundaries.
 */

import type { Person, Task, WorkOrderStatus } from '../store/types';

const MIN_MS = 60_000;

/** Weekdays in the two-week window that starts today. */
export const WORKDAYS = 10;
/** Regular working window, minutes after local midnight. */
export const WORK_START_MIN = 8 * 60;
export const WORK_END_MIN = 17 * 60;
/**
 * After-hours call-out windows for Emergency work orders, tried in order:
 * the evening, then the early morning before the shift. Both stay inside one
 * calendar day, so a call-out never spills past the end of the two weeks.
 */
const CALLOUT_WINDOWS: [number, number][] = [
  [17 * 60 + 30, 24 * 60],
  [0, WORK_START_MIN],
];
/** Candidate start times are tried on this grid. */
const STEP_MIN = 30;

export interface Slot {
  /** Workday index, 0 = first weekday on or after today. */
  day: number;
  /** Start, minutes after local midnight of that workday. */
  startMin: number;
  /** Duration in minutes (unchanged from the baked task). */
  durMin: number;
}

export type SchedulePlan = Record<string, Slot>;

const ms = (d: string): number => new Date(d).getTime();

/** Busy intervals per resource, in absolute workday-space minutes. */
class Calendar {
  private busy = new Map<string, [number, number][]>();

  isFree(keys: string[], start: number, end: number): boolean {
    return keys.every((k) =>
      (this.busy.get(k) ?? []).every(([s, e]) => end <= s || start >= e),
    );
  }

  book(keys: string[], start: number, end: number): void {
    for (const k of keys) {
      const list = this.busy.get(k);
      if (list) list.push([start, end]);
      else this.busy.set(k, [[start, end]]);
    }
  }
}

/** Resource keys a task occupies: its zone, its person, and each machine. */
function resourceKeys(t: Task): string[] {
  return [
    `zone:${t.zoneId}`,
    `person:${t.personId}`,
    ...(t.requiredEquipment ?? []).map((e) => `equip:${e}`),
  ];
}

const durationMs = (t: Task): number => ms(t.end) - ms(t.start);

/**
 * Placement order: longest work first (a full-day job needs a clear day, so it
 * goes in before short jobs fragment the calendar), ties by original start.
 * Every parent is pulled ahead of its follow-up work order so the parent's slot
 * is known when the child is placed.
 */
function orderTasks(tasks: Task[]): Task[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const sorted = [...tasks].sort(
    (a, b) => durationMs(b) - durationMs(a) || ms(a.start) - ms(b.start) || a.id.localeCompare(b.id),
  );
  const out: Task[] = [];
  const placed = new Set<string>();
  const visit = (t: Task, stack: Set<string>) => {
    if (placed.has(t.id) || stack.has(t.id)) return;
    stack.add(t.id);
    const parent = t.parentWoId ? byId.get(t.parentWoId) : undefined;
    if (parent) visit(parent, stack);
    placed.add(t.id);
    out.push(t);
  };
  for (const t of sorted) visit(t, new Set());
  return out;
}

/**
 * Place every task in workday space with no zone, person or equipment overlap.
 * Throws if a task cannot be placed, which the unit tests guard against.
 */
export function planSchedule(tasks: Task[]): SchedulePlan {
  if (tasks.length === 0) return {};
  const minStart = Math.min(...tasks.map((t) => ms(t.start)));
  const maxStart = Math.max(...tasks.map((t) => ms(t.start)));
  const span = Math.max(1, maxStart - minStart);

  const cal = new Calendar();
  const plan: SchedulePlan = {};

  for (const t of orderTasks(tasks)) {
    const durMin = Math.max(STEP_MIN, Math.round(durationMs(t) / MIN_MS));
    // Keep the task near its original place in the sequence.
    const targetDay = Math.min(
      WORKDAYS - 1,
      Math.floor(((ms(t.start) - minStart) / span) * WORKDAYS),
    );
    const parentSlot = t.parentWoId ? plan[t.parentWoId] : undefined;
    const notBefore = parentSlot
      ? parentSlot.day * 1440 + parentSlot.startMin + parentSlot.durMin
      : -Infinity;

    const workWindow: [number, number] = [WORK_START_MIN, WORK_END_MIN];
    const windows: [number, number][] =
      t.priority === 'Emergency' ? [...CALLOUT_WINDOWS, workWindow] : [workWindow, ...CALLOUT_WINDOWS];

    // Days to try, spreading outward from the target: d, d+1, d-1, d+2, ...
    const days: number[] = [];
    for (let off = 0; days.length < WORKDAYS; off++) {
      if (targetDay + off < WORKDAYS) days.push(targetDay + off);
      if (off > 0 && targetDay - off >= 0) days.push(targetDay - off);
    }

    const keys = resourceKeys(t);
    let slot: Slot | null = null;
    for (const [winStart, winEnd] of windows) {
      for (const day of days) {
        for (let m = winStart; m + durMin <= winEnd; m += STEP_MIN) {
          const start = day * 1440 + m;
          const end = start + durMin;
          if (start < notBefore) continue;
          if (cal.isFree(keys, start, end)) {
            slot = { day, startMin: m, durMin };
            break;
          }
        }
        if (slot) break;
      }
      if (slot) break;
    }
    if (!slot) throw new Error(`dynamicSchedule: no free slot for ${t.id}`);

    const start = slot.day * 1440 + slot.startMin;
    cal.book(keys, start, start + slot.durMin);
    plan[t.id] = slot;
  }
  return plan;
}

/** Local midnight of the k-th weekday on or after `today` (k = 0, 1, ...). */
export function workdayDate(today: Date, k: number): Date {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let seen = -1;
  for (;;) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      seen++;
      if (seen === k) return d;
    }
    d.setDate(d.getDate() + 1);
  }
}

/** Local wall-clock time `minutes` after midnight of `day` (DST-safe). */
function atMinutes(day: Date, minutes: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes);
}

/** Status that agrees with where the task sits relative to `now`. */
function statusAt(original: WorkOrderStatus | undefined, startMs: number, endMs: number, nowMs: number): WorkOrderStatus | undefined {
  if (original === 'Cancelled') return original;
  if (endMs <= nowMs) return 'Completed';
  if (startMs <= nowMs) return 'In Progress';
  // Future work cannot already be done or underway.
  if (original === 'Completed' || original === 'In Progress') return 'Dispatched';
  return original;
}

export interface DynamicSchedule {
  tasks: Task[];
  people: Person[];
  /** Initial playhead: now, clamped into the schedule. */
  anchorTime: string;
}

/** Turn a workday-space plan into concrete local datetimes starting `today`. */
export function materializeSchedule(
  plan: SchedulePlan,
  tasks: Task[],
  people: Person[],
  now: Date,
): DynamicSchedule {
  const nowMs = now.getTime();
  const out = tasks.map((t): Task => {
    const slot = plan[t.id];
    if (!slot) return t;
    const day = workdayDate(now, slot.day);
    const start = atMinutes(day, slot.startMin);
    const end = new Date(start.getTime() + slot.durMin * MIN_MS);
    const status = statusAt(t.status, start.getTime(), end.getTime(), nowMs);

    // Keep the baked actual-vs-planned offsets, but only for work that has begun.
    const begun = status === 'Completed' || status === 'In Progress';
    const shift = start.getTime() - ms(t.start);
    const actualStart = begun ? new Date(ms(t.actualStart ?? t.start) + shift) : null;
    const actualFinish =
      status === 'Completed' ? new Date(ms(t.actualFinish ?? t.end) + shift) : null;
    const elapsed = (nowMs - start.getTime()) / (end.getTime() - start.getTime());

    return {
      ...t,
      start: start.toISOString(),
      end: end.toISOString(),
      status,
      actualStart: actualStart ? actualStart.toISOString() : null,
      actualFinish: actualFinish ? actualFinish.toISOString() : null,
      actualHours: status === 'Completed' ? t.actualHours ?? null : null,
      scheduleVarianceHrs: status === 'Completed' ? t.scheduleVarianceHrs ?? null : null,
      percentComplete:
        status === 'Completed' ? 100 : status === 'In Progress' ? Math.round(elapsed * 100) : 0,
    };
  });

  const day0 = workdayDate(now, 0);
  const shifted = people.map((p): Person => ({
    ...p,
    shiftStart: atMinutes(day0, WORK_START_MIN).toISOString(),
    shiftEnd: atMinutes(day0, WORK_END_MIN).toISOString(),
  }));

  const first = Math.min(...out.map((t) => ms(t.start)));
  const last = Math.max(...out.map((t) => ms(t.end)));
  const anchor = Math.min(Math.max(nowMs, first), last);

  return { tasks: out, people: shifted, anchorTime: new Date(anchor).toISOString() };
}

/** Plan and materialize in one step: the schedule the app loads. */
export function buildDynamicSchedule(
  tasks: Task[],
  people: Person[],
  now: Date = new Date(),
): DynamicSchedule {
  return materializeSchedule(planSchedule(tasks), tasks, people, now);
}
