/**
 * Phase 2 verification (tasks.md 2.3, 2.4). Proves the scripted sample data
 * produces EXACTLY the planted signal and nothing spurious:
 *   - exactly one same-feature conflict (z-pump: Ben + Cho)
 *   - the same-person double-booking (Ana) exists in the data but is correctly
 *     NOT a same-feature conflict (different zones) — it's a person-level flag
 *     handled at the Gantt layer, not by computeConflicts
 *   - the planted wind hazard matches the exposed flare task (C) and does NOT
 *     leak onto indoor tasks
 */

import { describe, it, expect } from 'vitest';
import { ScheduleStore } from '../store/ScheduleStore';
import { computeHazardByTask } from '../store/selectors';
import type { Hazard } from '../store/types';
import { samplePeople } from './schedule.sample';
import { sampleZones } from './zones.sample';
import { sampleTasks, SAMPLE_ANCHOR_TIME } from './tasks.sample';
import { sampleActiveAlertsResponse } from './forecast.sample';

describe('sample data integrity', () => {
  it('has consistent references (every task → a real person and zone)', () => {
    const personIds = new Set(samplePeople.map((p) => p.id));
    const zoneIds = new Set(sampleZones.map((z) => z.id));
    for (const t of sampleTasks) {
      expect(personIds.has(t.personId), `task ${t.id} person`).toBe(true);
      expect(zoneIds.has(t.zoneId), `task ${t.id} zone`).toBe(true);
      expect(new Date(t.end).getTime()).toBeGreaterThan(new Date(t.start).getTime());
    }
  });

  it('produces exactly one same-feature conflict (z-pump: t-b1, t-b2)', () => {
    const store = new ScheduleStore({
      people: samplePeople,
      zones: sampleZones,
      tasks: sampleTasks,
      currentTime: SAMPLE_ANCHOR_TIME,
    });
    const { conflicts } = store.getState();

    expect(conflicts).toHaveLength(1);
    const c = conflicts[0];
    expect(c.zoneId).toBe('z-pump');
    expect(new Set(c.taskIds)).toEqual(new Set(['t-b1', 't-b2']));
    // Overlap window is the intersection 10:30–11:30 PDT.
    expect(c.overlapStart).toBe(new Date('2026-10-14T10:30:00-07:00').toISOString());
    expect(c.overlapEnd).toBe(new Date('2026-10-14T11:30:00-07:00').toISOString());
  });

  it('does NOT flag the same-person double-booking as a same-feature conflict', () => {
    const store = new ScheduleStore({
      people: samplePeople,
      zones: sampleZones,
      tasks: sampleTasks,
    });
    const conflicted = new Set(store.getState().conflicts.flatMap((c) => c.taskIds));
    // Ana's overlapping tasks are in DIFFERENT zones → not a feature conflict.
    expect(conflicted.has('t-a1')).toBe(false);
    expect(conflicted.has('t-a2')).toBe(false);
  });

  it('the anchor time has the planted conflict active', () => {
    const store = new ScheduleStore({
      people: samplePeople,
      zones: sampleZones,
      tasks: sampleTasks,
      currentTime: SAMPLE_ANCHOR_TIME,
    });
    const active = new Set(store.getState().activeTaskIds);
    expect(active.has('t-b1')).toBe(true);
    expect(active.has('t-b2')).toBe(true);
  });

  it('forecast fallback alert flags the exposed flare task, not indoor tasks', () => {
    // Normalize the sample alert exactly as the live path will (NWS alert shape).
    const alert = sampleActiveAlertsResponse.features[0];
    const hazards: Hazard[] = [
      {
        id: alert.id,
        kind: 'alert',
        severity: 'watch',
        headline: alert.properties.headline,
        start: new Date(alert.properties.onset).toISOString(),
        end: new Date(alert.properties.ends ?? alert.properties.expires).toISOString(),
        source: 'sample',
      },
    ];

    const byTask = computeHazardByTask(sampleTasks, sampleZones, hazards);
    // C: flare inspection (exposed, weatherSensitive) overlaps the wind window.
    expect(byTask['t-c1']).toBeDefined();
    expect(byTask['t-c1']).toHaveLength(1);
    // Indoor pump-house tasks in the same window are suppressed (R6.5).
    expect(byTask['t-b1']).toBeUndefined();
    expect(byTask['t-b2']).toBeUndefined();
  });
});
