/** Phase 3 pure-helper tests: time scale mapping + same-person overlap. */

import { describe, it, expect } from 'vitest';
import { makeTimeScale, snapMs, scheduleDomain, visibleDomain } from './timeScale';
import { computePersonOverlaps } from './personOverlaps';
import type { Task } from '../store/types';

const task = (id: string, personId: string, zoneId: string, start: string, end: string): Task => ({
  id,
  title: id,
  personId,
  zoneId,
  start,
  end,
  weatherSensitive: false,
});

describe('timeScale', () => {
  const s = makeTimeScale('2026-10-14T00:00:00Z', '2026-10-15T00:00:00Z', 1000);

  it('maps domain endpoints to 0 and width', () => {
    expect(s.x('2026-10-14T00:00:00Z')).toBe(0);
    expect(s.x('2026-10-15T00:00:00Z')).toBe(1000);
  });

  it('maps the midpoint to half width', () => {
    expect(s.x('2026-10-14T12:00:00Z')).toBeCloseTo(500, 5);
  });

  it('invert is the inverse of x within the domain', () => {
    const t = new Date('2026-10-14T09:30:00Z').getTime();
    expect(s.invert(s.x(t))).toBeCloseTo(t, -1);
  });

  it('invert clamps outside the domain', () => {
    expect(s.invert(-50)).toBe(s.startMs);
    expect(s.invert(5000)).toBe(s.endMs);
  });
});

describe('snapMs', () => {
  it('snaps to the nearest 15-minute step', () => {
    const base = new Date('2026-10-14T10:07:00Z').getTime();
    expect(new Date(snapMs(base, 15)).toISOString()).toBe('2026-10-14T10:00:00.000Z');
    const base2 = new Date('2026-10-14T10:08:00Z').getTime();
    expect(new Date(snapMs(base2, 15)).toISOString()).toBe('2026-10-14T10:15:00.000Z');
  });
});

describe('scheduleDomain', () => {
  it('pads to whole days covering all tasks', () => {
    const d = scheduleDomain([task('a', 'p', 'z', '2026-10-14T09:00:00Z', '2026-10-14T11:00:00Z')]);
    // start floors to midnight, end ceils to next midnight (local tz of the runner)
    expect(new Date(d.start).getTime()).toBeLessThanOrEqual(new Date('2026-10-14T09:00:00Z').getTime());
    expect(new Date(d.end).getTime()).toBeGreaterThanOrEqual(new Date('2026-10-14T11:00:00Z').getTime());
  });
});

describe('visibleDomain', () => {
  const tasks = [
    task('a', 'p', 'z', '2026-10-19T09:00:00Z', '2026-10-19T11:00:00Z'),
    task('b', 'p', 'z', '2026-10-28T09:00:00Z', '2026-10-28T11:00:00Z'),
  ];

  it('returns the full schedule domain when no range is set', () => {
    expect(visibleDomain(tasks, null)).toEqual(scheduleDomain(tasks));
  });

  it('narrows the domain to the selected calendar range', () => {
    const vis = visibleDomain(tasks, { startDate: '2026-10-20', endDate: '2026-10-22' });
    const start = new Date(vis.start);
    const end = new Date(vis.end);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(9); // October (0-based)
    expect(start.getDate()).toBe(20);
    expect(start.getHours()).toBe(0);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
    expect(end.getDate()).toBe(23); // 24:00 of the 22nd == start-of-23rd
  });

  it('falls back to the full domain for an inverted range', () => {
    const vis = visibleDomain(tasks, { startDate: '2026-10-22', endDate: '2026-10-20' });
    expect(vis).toEqual(scheduleDomain(tasks));
  });

  it('treats a single-day range as that whole day', () => {
    const vis = visibleDomain(tasks, { startDate: '2026-10-21', endDate: '2026-10-21' });
    const start = new Date(vis.start);
    const end = new Date(vis.end);
    expect(start.getDate()).toBe(21);
    expect(end.getDate()).toBe(22);
    expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);
  });
});

describe('computePersonOverlaps', () => {
  it('flags two overlapping tasks for the same person (any zone)', () => {
    const tasks = [
      task('a1', 'p-ana', 'z1', '2026-10-14T09:00:00Z', '2026-10-14T12:00:00Z'),
      task('a2', 'p-ana', 'z2', '2026-10-14T10:00:00Z', '2026-10-14T13:00:00Z'),
    ];
    const flagged = computePersonOverlaps(tasks);
    expect(flagged).toEqual(new Set(['a1', 'a2']));
  });

  it('does not flag non-overlapping tasks for the same person', () => {
    const tasks = [
      task('a1', 'p-ana', 'z1', '2026-10-14T09:00:00Z', '2026-10-14T11:00:00Z'),
      task('a2', 'p-ana', 'z2', '2026-10-14T11:00:00Z', '2026-10-14T13:00:00Z'), // half-open: touches, no overlap
    ];
    expect(computePersonOverlaps(tasks).size).toBe(0);
  });

  it('does not flag overlapping tasks for DIFFERENT people', () => {
    const tasks = [
      task('a1', 'p-ana', 'z1', '2026-10-14T09:00:00Z', '2026-10-14T12:00:00Z'),
      task('b1', 'p-ben', 'z1', '2026-10-14T10:00:00Z', '2026-10-14T13:00:00Z'),
    ];
    expect(computePersonOverlaps(tasks).size).toBe(0);
  });
});
