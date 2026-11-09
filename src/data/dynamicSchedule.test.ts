/**
 * The dynamic schedule must be conflict-free, mostly inside 08:00-17:00 on
 * weekdays, and inside the two weeks starting "today", for ANY today. Checked
 * against the real baked work orders with the app's own conflict selectors.
 */

import { describe, it, expect } from 'vitest';
import { generatedTasks, generatedPeople } from './plant.generated';
import {
  buildDynamicSchedule,
  planSchedule,
  workdayDate,
  WORKDAYS,
} from './dynamicSchedule';
import {
  computeConflicts,
  computePersonConflicts,
  computeEquipmentConflicts,
} from '../store/selectors';
import type { Task } from '../store/types';

const ms = (d: string): number => new Date(d).getTime();

/** Inside a weekday's 08:00-17:00 window, local time. */
function inWorkHours(t: Task): boolean {
  const s = new Date(t.start);
  const e = new Date(t.end);
  const dow = s.getDay();
  const sameDay = s.toDateString() === e.toDateString();
  const startMin = s.getHours() * 60 + s.getMinutes();
  const endMin = e.getHours() * 60 + e.getMinutes();
  return dow !== 0 && dow !== 6 && sameDay && startMin >= 8 * 60 && endMin <= 17 * 60;
}

// Weekday morning, weekday afternoon, a Saturday, and both US DST changeovers.
const NOWS = [
  new Date(2026, 10, 9, 8, 0), // Mon
  new Date(2026, 10, 12, 15, 30), // Thu afternoon
  new Date(2026, 10, 14, 10, 0), // Sat
  new Date(2026, 9, 30, 9, 0), // window spans the November DST change
  new Date(2027, 2, 5, 9, 0), // window spans the March DST change
];

describe('dynamic schedule', () => {
  for (const now of NOWS) {
    describe(`starting ${now.toDateString()}`, () => {
      const { tasks, people, anchorTime } = buildDynamicSchedule(generatedTasks, generatedPeople, now);

      it('keeps every task and its duration', () => {
        expect(tasks).toHaveLength(generatedTasks.length);
        for (const t of tasks) {
          const orig = generatedTasks.find((o) => o.id === t.id)!;
          expect(ms(t.end) - ms(t.start)).toBe(ms(orig.end) - ms(orig.start));
        }
      });

      it('has no zone, person or equipment conflicts', () => {
        expect(computeConflicts(tasks)).toEqual([]);
        expect(computePersonConflicts(tasks)).toEqual([]);
        expect(computeEquipmentConflicts(tasks)).toEqual([]);
      });

      it('puts all non-emergency work inside weekday 08:00-17:00', () => {
        const regular = tasks.filter((t) => t.priority !== 'Emergency');
        expect(regular.filter((t) => !inWorkHours(t)).map((t) => t.id)).toEqual([]);
        // "Most" of the work: everything except the emergency call-outs.
        expect(tasks.filter(inWorkHours).length / tasks.length).toBeGreaterThan(0.9);
      });

      it('fits inside the two weeks starting today', () => {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const twoWeeks = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14).getTime();
        for (const t of tasks) {
          expect(ms(t.start)).toBeGreaterThanOrEqual(today);
          expect(ms(t.end)).toBeLessThanOrEqual(twoWeeks);
        }
      });

      it('starts follow-up work orders after their parent finishes', () => {
        for (const t of tasks.filter((x) => x.parentWoId)) {
          const parent = tasks.find((p) => p.id === t.parentWoId)!;
          expect(ms(t.start)).toBeGreaterThanOrEqual(ms(parent.end));
        }
      });

      it('gives statuses that agree with the clock', () => {
        for (const t of tasks) {
          if (ms(t.end) <= now.getTime()) expect(t.status).toBe('Completed');
          else if (ms(t.start) > now.getTime()) {
            expect(t.status).not.toBe('Completed');
            expect(t.actualStart).toBeNull();
          }
        }
      });

      it('sets 08:00-17:00 shifts and an anchor inside the schedule', () => {
        for (const p of people) {
          expect(new Date(p.shiftStart!).getHours()).toBe(8);
          expect(new Date(p.shiftEnd!).getHours()).toBe(17);
        }
        const first = Math.min(...tasks.map((t) => ms(t.start)));
        const last = Math.max(...tasks.map((t) => ms(t.end)));
        expect(ms(anchorTime)).toBeGreaterThanOrEqual(first);
        expect(ms(anchorTime)).toBeLessThanOrEqual(last);
      });
    });
  }

  it('plans the same slots regardless of the date', () => {
    expect(planSchedule(generatedTasks)).toEqual(planSchedule([...generatedTasks].reverse()));
  });

  it('maps workday indexes onto weekdays only', () => {
    const sat = new Date(2026, 10, 14);
    const days = Array.from({ length: WORKDAYS }, (_, k) => workdayDate(sat, k));
    expect(days.every((d) => d.getDay() !== 0 && d.getDay() !== 6)).toBe(true);
    expect(days[0].getDate()).toBe(16); // Saturday rolls to Monday
  });
});
