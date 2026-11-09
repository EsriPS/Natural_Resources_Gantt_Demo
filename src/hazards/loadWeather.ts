/**
 * Weather loader (Phase 8.3, R6.3/R6.6). Tries live NWS; on ANY failure
 * (offline, CORS, rate-limit, bad point) falls back to the captured sample
 * payloads — through the SAME normalizer — and marks the hazards `source:
 * 'sample'` so the UI can badge them. Pushes the result into the store, which
 * recomputes `hazardByTask`.
 */

import type { ScheduleStore } from '../store/ScheduleStore';
import type { Hazard } from '../store/types';
import { config } from '../config';
import { fetchNwsWeather, normalizeWeather } from './nws';
import { scheduleDomain } from '../gantt/timeScale';
import { sampleForecastResponse, sampleActiveAlertsResponse } from '../data/forecast.sample';

export type WeatherSource = 'nws' | 'sample';

export interface WeatherLoadResult {
  source: WeatherSource;
  count: number;
  error?: string;
}

/**
 * Shift hazard windows so they overlap the SCHEDULE.
 *
 * The demo's work orders are future-dated (and the sample NWS payloads are
 * fixed to the day they were captured), so without this a hazard's time window
 * never intersects any task — nothing is ever weather-flagged, and moving a
 * task across "a storm" changes nothing. We translate every hazard by whole
 * days so the earliest hazard day lines up with the schedule's first day,
 * preserving each hazard's hour-of-day and duration. The result is realistic
 * weather sitting on the actual scheduled days, so dragging a task into or out
 * of a hazard window flips its warning (R6.3).
 */
export function alignHazardsToSchedule(hazards: Hazard[], scheduleStartMs: number): Hazard[] {
  if (hazards.length === 0) return hazards;
  const DAY = 86_400_000;
  const earliest = Math.min(...hazards.map((h) => new Date(h.start).getTime()));
  // Floor both to their local midnight, then shift by the whole-day difference.
  const hazardDay = new Date(earliest);
  hazardDay.setHours(0, 0, 0, 0);
  const schedDay = new Date(scheduleStartMs);
  schedDay.setHours(0, 0, 0, 0);
  const shiftDays = Math.round((schedDay.getTime() - hazardDay.getTime()) / DAY);
  if (shiftDays === 0) return hazards;
  const shiftMs = shiftDays * DAY;
  return hazards.map((h) => ({
    ...h,
    start: new Date(new Date(h.start).getTime() + shiftMs).toISOString(),
    end: new Date(new Date(h.end).getTime() + shiftMs).toISOString(),
  }));
}

export async function loadWeather(store: ScheduleStore): Promise<WeatherLoadResult> {
  const scheduleStartMs = new Date(
    scheduleDomain(store.getState().tasks).start,
  ).getTime();
  try {
    const { forecast, alerts } = await fetchNwsWeather(config.plant.lat, config.plant.lon);
    const hazards = alignHazardsToSchedule(
      normalizeWeather(forecast, alerts, config.hazards),
      scheduleStartMs,
    );
    store.setHazards(hazards);
    return { source: 'nws', count: hazards.length };
  } catch (err) {
    // Fallback: same normalizer, sample payloads, re-tagged as sample (R6.6).
    const hazards = alignHazardsToSchedule(
      normalizeWeather(sampleForecastResponse, sampleActiveAlertsResponse, config.hazards).map(
        (h) => ({ ...h, source: 'sample' as const }),
      ),
      scheduleStartMs,
    );
    store.setHazards(hazards);
    return {
      source: 'sample',
      count: hazards.length,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
