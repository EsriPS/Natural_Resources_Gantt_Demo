/**
 * NWS hazards (Phase 8, design §7, R6.1–R6.3, R6.6).
 *
 * Two concerns, deliberately split so the parsing logic is pure + testable and
 * the SAME normalizer runs for live and sample data (no sample-only branch):
 *
 *   • `fetchNwsWeather(lat, lon)` — the network side: NWS `points` lookup →
 *     gridpoint `forecast` + `alerts/active?point=`, with the required
 *     `User-Agent`. Throws on any failure so the caller can fall back to sample.
 *   • `normalizeWeather(forecast, alerts, thresholds)` — PURE: turns the raw NWS
 *     payloads into `Hazard[]`. Forecast periods that exceed a configured
 *     threshold become wind/precip/temp hazards; active alerts become `alert`
 *     hazards. Used identically for live responses and `forecast.sample.ts`.
 *
 * api.weather.gov requires a descriptive User-Agent and returns times as ISO
 * strings with offset (we keep them verbatim — the store/selectors compare
 * instants, not wall-clock).
 */

import type { Hazard, HazardSeverity } from '../store/types';
import type { HazardThresholds } from '../config';
import type {
  NwsForecastResponse,
  NwsForecastPeriod,
  NwsAlertsResponse,
  NwsAlertFeature,
} from '../data/forecast.sample';

const USER_AGENT = '(plant-work-scheduler demo, contact: ops@example.com)';

/** Parse an NWS windSpeed string ("25 to 30 mph", "15 mph") → max mph seen. */
export function parseWindMph(windSpeed: string): number {
  const nums = windSpeed.match(/\d+/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
}

/** Map an NWS alert severity string → our 3-level severity. */
function alertSeverity(event: string, severity: string): HazardSeverity {
  const e = event.toLowerCase();
  if (e.includes('warning')) return 'warning';
  if (e.includes('watch')) return 'watch';
  const s = severity.toLowerCase();
  if (s === 'severe' || s === 'extreme') return 'warning';
  if (s === 'moderate') return 'watch';
  return 'advisory';
}

/** One forecast period → zero or more threshold hazards (wind/precip/temp). */
function periodHazards(period: NwsForecastPeriod, t: HazardThresholds): Hazard[] {
  const out: Hazard[] = [];
  const base = { start: period.startTime, end: period.endTime, source: 'nws' as const };

  const wind = parseWindMph(period.windSpeed);
  if (wind >= t.windMph) {
    out.push({
      ...base,
      id: `wind-${period.number}`,
      kind: 'wind',
      severity: wind >= t.windMph + 15 ? 'warning' : 'watch',
      headline: `High wind: ${period.windSpeed} ${period.windDirection} (${period.name})`,
    });
  }

  const precip = period.probabilityOfPrecipitation.value ?? 0;
  if (precip >= t.precipPct) {
    out.push({
      ...base,
      id: `precip-${period.number}`,
      kind: 'precip',
      severity: 'advisory',
      headline: `Precipitation ${precip}% likely (${period.name})`,
    });
  }

  const tempF =
    period.temperatureUnit === 'C' ? period.temperature * 1.8 + 32 : period.temperature;
  if (tempF >= t.tempHiF) {
    out.push({
      ...base,
      id: `temp-hi-${period.number}`,
      kind: 'temp',
      severity: 'advisory',
      headline: `Heat: ${Math.round(tempF)}°F (${period.name})`,
    });
  } else if (tempF <= t.tempLoF) {
    out.push({
      ...base,
      id: `temp-lo-${period.number}`,
      kind: 'temp',
      severity: 'advisory',
      headline: `Cold: ${Math.round(tempF)}°F (${period.name})`,
    });
  }

  return out;
}

/** One active alert feature → an `alert` hazard. */
function alertHazard(feature: NwsAlertFeature): Hazard {
  const p = feature.properties;
  return {
    id: `alert-${feature.id}`,
    kind: 'alert',
    severity: alertSeverity(p.event, p.severity),
    headline: p.headline || p.event,
    start: p.onset,
    end: p.ends ?? p.expires,
    source: 'nws',
  };
}

/**
 * PURE normalizer (R6.3). Forecast periods above threshold + active alerts →
 * a flat `Hazard[]`. Marks hazards' `source` as 'nws'; callers from the sample
 * path overwrite to 'sample' so the UI can badge it (R6.6).
 */
export function normalizeWeather(
  forecast: NwsForecastResponse,
  alerts: NwsAlertsResponse,
  thresholds: HazardThresholds,
): Hazard[] {
  const fromForecast = forecast.properties.periods.flatMap((p) => periodHazards(p, thresholds));
  const fromAlerts = alerts.features.map(alertHazard);
  return [...fromAlerts, ...fromForecast];
}

interface NwsPointsResponse {
  properties: { forecast: string; gridId: string; gridX: number; gridY: number };
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/geo+json' },
  });
  if (!res.ok) throw new Error(`NWS ${res.status} ${res.statusText} for ${url}`);
  return (await res.json()) as T;
}

/**
 * LIVE fetch (R6.1, R6.2): resolve the plant point → forecast grid, pull the
 * forecast + active alerts. Throws on any failure (caller falls back to sample).
 */
export async function fetchNwsWeather(
  lat: number,
  lon: number,
): Promise<{ forecast: NwsForecastResponse; alerts: NwsAlertsResponse }> {
  const point = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const points = await getJson<NwsPointsResponse>(`https://api.weather.gov/points/${point}`);
  const forecastUrl = points.properties.forecast;
  const [forecast, alerts] = await Promise.all([
    getJson<NwsForecastResponse>(forecastUrl),
    getJson<NwsAlertsResponse>(`https://api.weather.gov/alerts/active?point=${point}`),
  ]);
  return { forecast, alerts };
}
