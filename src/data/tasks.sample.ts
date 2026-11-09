/**
 * Sample tasks (Phase 2.3, design §8). A 3-day schedule scripted to tell the
 * demo story — every feature is demonstrable offline with no network/auth.
 *
 * Three planted scenarios (and NO spurious ones):
 *   A. Same-person double-booking (R3.4): Ana (p-ana) assigned two overlapping
 *      tasks in DIFFERENT zones at the same time → person-level conflict.
 *   B. Same-feature concurrent work (R5.4): Ben + Cho both working the Pump
 *      House (z-pump) during an overlapping window → feature-level conflict.
 *   C. Outdoor task overlapping weather (R6): Dev's Flare Stack inspection
 *      (z-flare, weatherExposed) sits inside the planted wind hazard window
 *      from forecast.sample.ts → hazard flag.
 *
 * All times are local-ISO with explicit -07:00 (PDT, El Segundo) so the demo is
 * timezone-stable regardless of the host clock.
 */

import type { Task } from '../store/types';

/** Day the sample schedule starts (PDT). */
export const SAMPLE_BASE_DAY = '2026-10-14';

/**
 * Suggested initial playhead for the demo — lands inside BOTH the same-feature
 * conflict (B) and the weather hazard (C) so the opening frame shows signal.
 */
export const SAMPLE_ANCHOR_TIME = '2026-10-14T10:30:00-07:00';

export const sampleTasks: Task[] = [
  // ── Day 1 (2026-10-14) ───────────────────────────────────────────────────
  // A. Ana double-booked: these two overlap in time but sit in different zones.
  {
    id: 't-a1',
    title: 'Valve overhaul',
    personId: 'p-ana',
    zoneId: 'z-unit4',
    start: '2026-10-14T09:00:00-07:00',
    end: '2026-10-14T12:00:00-07:00',
    weatherSensitive: false,
  },
  {
    id: 't-a2',
    title: 'Compressor check',
    personId: 'p-ana',
    zoneId: 'z-control', // DIFFERENT zone from t-a1 → pure same-PERSON overlap, not a feature conflict
    start: '2026-10-14T10:00:00-07:00', // overlaps t-a1 in time → same-person double-booking
    end: '2026-10-14T13:00:00-07:00',
    weatherSensitive: false,
  },

  // B. Same-feature conflict in z-pump: Ben and Cho both there, overlapping.
  {
    id: 't-b1',
    title: 'Seal replacement',
    personId: 'p-ben',
    zoneId: 'z-pump',
    start: '2026-10-14T09:30:00-07:00',
    end: '2026-10-14T11:30:00-07:00',
    weatherSensitive: false,
  },
  {
    id: 't-b2',
    title: 'Bearing lube',
    personId: 'p-cho',
    zoneId: 'z-pump',
    start: '2026-10-14T10:30:00-07:00', // overlaps t-b1 in z-pump → feature conflict
    end: '2026-10-14T12:30:00-07:00',
    weatherSensitive: false,
  },

  // C. Outdoor task overlapping the planted wind hazard (see forecast.sample.ts).
  {
    id: 't-c1',
    title: 'Flare stack inspection',
    personId: 'p-dev',
    zoneId: 'z-flare',
    start: '2026-10-14T09:00:00-07:00',
    end: '2026-10-14T12:00:00-07:00',
    weatherSensitive: true,
  },

  // Filler — valid, non-conflicting, keeps lanes populated.
  {
    id: 't-d1',
    title: 'Panel wiring',
    personId: 'p-eli',
    zoneId: 'z-control',
    start: '2026-10-14T13:00:00-07:00',
    end: '2026-10-14T16:00:00-07:00',
    weatherSensitive: false,
  },

  // ── Day 2 (2026-10-15) ───────────────────────────────────────────────────
  {
    id: 't-e1',
    title: 'Pipe rack NDT',
    personId: 'p-ben',
    zoneId: 'z-piperack',
    start: '2026-10-15T08:00:00-07:00',
    end: '2026-10-15T11:00:00-07:00',
    weatherSensitive: true,
  },
  {
    id: 't-e2',
    title: 'Tank gauge calibration',
    personId: 'p-cho',
    zoneId: 'z-tankfarm',
    start: '2026-10-15T09:00:00-07:00',
    end: '2026-10-15T12:00:00-07:00',
    weatherSensitive: true,
  },
  {
    id: 't-e3',
    title: 'Breaker swap',
    personId: 'p-dev',
    zoneId: 'z-control',
    start: '2026-10-15T13:00:00-07:00',
    end: '2026-10-15T15:30:00-07:00',
    weatherSensitive: false,
  },
  {
    id: 't-e4',
    title: 'Unit 4 flush',
    personId: 'p-ana',
    zoneId: 'z-unit4',
    start: '2026-10-15T08:30:00-07:00',
    end: '2026-10-15T10:30:00-07:00',
    weatherSensitive: false,
  },

  // ── Day 3 (2026-10-16) ───────────────────────────────────────────────────
  {
    id: 't-f1',
    title: 'Flare relight check',
    personId: 'p-dev',
    zoneId: 'z-flare',
    start: '2026-10-16T09:00:00-07:00',
    end: '2026-10-16T11:00:00-07:00',
    weatherSensitive: true,
  },
  {
    id: 't-f2',
    title: 'Pump house walkdown',
    personId: 'p-eli',
    zoneId: 'z-pump',
    start: '2026-10-16T10:00:00-07:00',
    end: '2026-10-16T12:00:00-07:00',
    weatherSensitive: false,
  },
];
