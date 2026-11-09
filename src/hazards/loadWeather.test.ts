import { describe, it, expect } from 'vitest';
import { alignHazardsToSchedule } from './loadWeather';
import type { Hazard } from '../store/types';

describe('alignHazardsToSchedule', () => {
  const hz: Hazard[] = [
    {
      id: 'h1',
      kind: 'wind',
      severity: 'warning',
      headline: 'Wind',
      start: '2026-10-14T16:00:00.000Z',
      end: '2026-10-14T19:00:00.000Z',
      source: 'sample',
    },
  ];

  it('shifts hazards by whole days so they land on the schedule, keeping duration', () => {
    const scheduleStart = new Date('2026-10-19T07:00:00.000Z').getTime();
    const out = alignHazardsToSchedule(hz, scheduleStart);
    const s = new Date(out[0].start);
    const e = new Date(out[0].end);
    // Duration preserved (3h).
    expect(e.getTime() - s.getTime()).toBe(3 * 60 * 60 * 1000);
    // Shifted onto the schedule's first local day.
    expect(s.getFullYear()).toBe(2026);
    expect(s.getMonth()).toBe(9);
    expect(s.getDate()).toBe(19);
  });

  it('is a no-op when hazards already fall on the schedule day', () => {
    // Same LOCAL calendar day as the hazard's start (the function floors to
    // local midnight), so the whole-day shift is zero.
    const scheduleStart = new Date(hz[0].start).getTime();
    const out = alignHazardsToSchedule(hz, scheduleStart);
    expect(out[0].start).toBe(hz[0].start);
  });

  it('returns an empty list unchanged', () => {
    expect(alignHazardsToSchedule([], Date.now())).toEqual([]);
  });
});
