import { describe, it, expect } from 'vitest';
import {
  computeActive,
  computeConflicts,
  computePersonConflicts,
  computeEquipmentConflicts,
  computeHazardByTask,
  intervalsOverlap,
  intervalIntersection,
} from './selectors';
import type { Task, Zone, Hazard } from './types';

const task = (
  id: string,
  zoneId: string,
  start: string,
  end: string,
  extra: Partial<Task> = {},
): Task => ({
  id,
  title: id,
  personId: 'p1',
  zoneId,
  start,
  end,
  weatherSensitive: false,
  ...extra,
});

const D = (h: number) => `2026-10-13T${String(h).padStart(2, '0')}:00:00.000Z`;

describe('interval helpers', () => {
  it('detects overlap on half-open intervals', () => {
    expect(intervalsOverlap(D(1), D(3), D(2), D(4))).toBe(true);
    // touching endpoints do NOT overlap (half-open)
    expect(intervalsOverlap(D(1), D(2), D(2), D(3))).toBe(false);
  });

  it('computes intersection', () => {
    expect(intervalIntersection(D(1), D(3), D(2), D(4))).toEqual({ start: D(2), end: D(3) });
    expect(intervalIntersection(D(1), D(2), D(2), D(3))).toBeNull();
  });
});

describe('computeActive (R5.2)', () => {
  const tasks = [task('a', 'z1', D(1), D(3)), task('b', 'z1', D(4), D(6))];
  it('includes a task at its start, excludes at its end', () => {
    expect(computeActive(tasks, D(1))).toEqual(['a']);
    expect(computeActive(tasks, D(3))).toEqual([]); // end is exclusive
    expect(computeActive(tasks, D(5))).toEqual(['b']);
  });
});

describe('computeConflicts (R5.4 same-feature)', () => {
  it('flags two tasks overlapping in the same zone', () => {
    const tasks = [task('a', 'z1', D(1), D(4)), task('b', 'z1', D(2), D(5))];
    const c = computeConflicts(tasks);
    expect(c).toHaveLength(1);
    expect(c[0].zoneId).toBe('z1');
    expect(c[0].taskIds.sort()).toEqual(['a', 'b']);
    expect(c[0].overlapStart).toBe(D(2));
    expect(c[0].overlapEnd).toBe(D(4));
  });

  it('does NOT flag overlapping tasks in DIFFERENT zones', () => {
    const tasks = [task('a', 'z1', D(1), D(4)), task('b', 'z2', D(2), D(5))];
    expect(computeConflicts(tasks)).toHaveLength(0);
  });

  it('does NOT flag non-overlapping tasks in the same zone', () => {
    const tasks = [task('a', 'z1', D(1), D(2)), task('b', 'z1', D(3), D(5))];
    expect(computeConflicts(tasks)).toHaveLength(0);
  });

  it('captures three mutually-overlapping tasks as one conflict', () => {
    const tasks = [
      task('a', 'z1', D(1), D(6)),
      task('b', 'z1', D(2), D(6)),
      task('c', 'z1', D(3), D(6)),
    ];
    const c = computeConflicts(tasks);
    expect(c).toHaveLength(1);
    expect(c[0].taskIds.sort()).toEqual(['a', 'b', 'c']);
    expect(c[0].overlapStart).toBe(D(3));
    expect(c[0].overlapEnd).toBe(D(6));
  });
});

describe('computeHazardByTask (R6.3–R6.5)', () => {
  const zones: Zone[] = [
    { id: 'roof', name: 'Rooftop', weatherExposed: true },
    { id: 'pump', name: 'Pump room', weatherExposed: false },
  ];
  const hazards: Hazard[] = [
    {
      id: 'h1',
      kind: 'wind',
      severity: 'warning',
      headline: 'High wind',
      start: D(2),
      end: D(5),
      source: 'sample',
    },
  ];

  it('flags a weather-exposed task overlapping a hazard', () => {
    const tasks = [task('a', 'roof', D(1), D(3))];
    expect(computeHazardByTask(tasks, zones, hazards)['a']).toHaveLength(1);
  });

  it('suppresses an indoor, weather-insensitive task (R6.5)', () => {
    const tasks = [task('a', 'pump', D(1), D(3))];
    expect(computeHazardByTask(tasks, zones, hazards)['a']).toBeUndefined();
  });

  it('flags an indoor task that is explicitly weatherSensitive', () => {
    const tasks = [task('a', 'pump', D(1), D(3), { weatherSensitive: true })];
    expect(computeHazardByTask(tasks, zones, hazards)['a']).toHaveLength(1);
  });

  it('does not flag when windows do not overlap', () => {
    const tasks = [task('a', 'roof', D(6), D(8))];
    expect(computeHazardByTask(tasks, zones, hazards)['a']).toBeUndefined();
  });
});


describe('computePersonConflicts (R3.4 same-person double-booking)', () => {
  it('flags one person with two overlapping tasks in DIFFERENT zones', () => {
    const tasks = [
      task('a1', 'z-unit4', '2026-10-14T09:00:00-07:00', '2026-10-14T12:00:00-07:00', {
        personId: 'p-ana',
      }),
      task('a2', 'z-control', '2026-10-14T10:00:00-07:00', '2026-10-14T13:00:00-07:00', {
        personId: 'p-ana',
      }),
    ];
    const out = computePersonConflicts(tasks);
    expect(out.length).toBe(1);
    expect(out[0].personId).toBe('p-ana');
    expect(new Set(out[0].taskIds)).toEqual(new Set(['a1', 'a2']));
    // Overlap window is the intersection 10:00–12:00.
    expect(out[0].overlapStart).toBe(new Date('2026-10-14T10:00:00-07:00').toISOString());
    expect(out[0].overlapEnd).toBe(new Date('2026-10-14T12:00:00-07:00').toISOString());
  });

  it('does NOT flag the same person with back-to-back (non-overlapping) tasks', () => {
    const tasks = [
      task('a1', 'z1', '2026-10-14T09:00:00-07:00', '2026-10-14T10:00:00-07:00', {
        personId: 'p-ana',
      }),
      task('a2', 'z2', '2026-10-14T10:00:00-07:00', '2026-10-14T11:00:00-07:00', {
        personId: 'p-ana',
      }),
    ];
    expect(computePersonConflicts(tasks)).toEqual([]);
  });

  it('does NOT flag DIFFERENT people overlapping in the same zone (that is a feature conflict, not a double-booking)', () => {
    const tasks = [
      task('b1', 'z-pump', '2026-10-14T09:30:00-07:00', '2026-10-14T11:30:00-07:00', {
        personId: 'p-ben',
      }),
      task('b2', 'z-pump', '2026-10-14T10:30:00-07:00', '2026-10-14T12:30:00-07:00', {
        personId: 'p-cho',
      }),
    ];
    expect(computePersonConflicts(tasks)).toEqual([]);
  });
});

describe('computeEquipmentConflicts (R11.4)', () => {
  it('flags the same machine required by two overlapping tasks', () => {
    const tasks: Task[] = [
      task('t1', 'z1', D(9), D(12), { requiredEquipment: ['EQ-001'] }),
      task('t2', 'z2', D(10), D(13), { requiredEquipment: ['EQ-001'] }), // overlaps t1, same machine
    ];
    const out = computeEquipmentConflicts(tasks);
    expect(out).toHaveLength(1);
    expect(out[0].equipmentId).toBe('EQ-001');
    expect(new Set(out[0].taskIds)).toEqual(new Set(['t1', 't2']));
    expect(out[0].overlapStart).toBe(D(10));
    expect(out[0].overlapEnd).toBe(D(12));
  });

  it('does not flag non-overlapping reuse of the same machine', () => {
    const tasks: Task[] = [
      task('t1', 'z1', D(9), D(11), { requiredEquipment: ['EQ-002'] }),
      task('t2', 'z2', D(11), D(13), { requiredEquipment: ['EQ-002'] }), // back-to-back, no overlap
    ];
    expect(computeEquipmentConflicts(tasks)).toHaveLength(0);
  });

  it('does not flag two different machines on overlapping tasks', () => {
    const tasks: Task[] = [
      task('t1', 'z1', D(9), D(12), { requiredEquipment: ['EQ-001'] }),
      task('t2', 'z2', D(10), D(13), { requiredEquipment: ['EQ-002'] }),
    ];
    expect(computeEquipmentConflicts(tasks)).toHaveLength(0);
  });

  it('ignores tasks with no required equipment', () => {
    const tasks: Task[] = [task('t1', 'z1', D(9), D(12)), task('t2', 'z2', D(10), D(13))];
    expect(computeEquipmentConflicts(tasks)).toHaveLength(0);
  });
});
