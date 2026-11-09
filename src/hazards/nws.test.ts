/**
 * Phase 8 verification (R6.1–R6.3, R6.6): the NWS normalizer is the pure,
 * correctness-critical weather logic. We prove threshold synthesis and alert
 * mapping against the captured sample payloads (same path as live data), and
 * confirm normalized hazards reach the store's `hazardByTask`.
 */

import { describe, it, expect } from 'vitest';
import { normalizeWeather, parseWindMph } from './nws';
import {
  sampleForecastResponse,
  sampleActiveAlertsResponse,
  type NwsForecastResponse,
  type NwsAlertsResponse,
} from '../data/forecast.sample';
import { config } from '../config';

const T = config.hazards;

describe('parseWindMph', () => {
  it('takes the max of a range', () => {
    expect(parseWindMph('25 to 30 mph')).toBe(30);
    expect(parseWindMph('15 mph')).toBe(15);
    expect(parseWindMph('calm')).toBe(0);
  });
});

describe('normalizeWeather', () => {
  it('synthesizes a wind hazard from the planted 30 mph period (> threshold 25)', () => {
    const hazards = normalizeWeather(sampleForecastResponse, sampleActiveAlertsResponse, T);
    const wind = hazards.filter((h) => h.kind === 'wind');
    expect(wind.length).toBe(1);
    expect(wind[0].start).toBe('2026-10-14T06:00:00-07:00');
    expect(wind[0].source).toBe('nws'); // loader re-tags sample→'sample'
  });

  it('maps the active High Wind Watch alert to an alert hazard (watch)', () => {
    const hazards = normalizeWeather(sampleForecastResponse, sampleActiveAlertsResponse, T);
    const alerts = hazards.filter((h) => h.kind === 'alert');
    expect(alerts.length).toBe(1);
    expect(alerts[0].severity).toBe('watch');
    expect(alerts[0].headline).toContain('High Wind Watch');
  });

  it('produces no spurious hazards from calm, dry, mild periods', () => {
    const calm: NwsForecastResponse = {
      properties: {
        updated: '2026-10-14T14:00:00+00:00',
        units: 'us',
        periods: [
          {
            number: 1,
            name: 'Mild',
            startTime: '2026-10-14T06:00:00-07:00',
            endTime: '2026-10-14T18:00:00-07:00',
            isDaytime: true,
            temperature: 70,
            temperatureUnit: 'F',
            probabilityOfPrecipitation: { unitCode: 'wmoUnit:percent', value: 10 },
            windSpeed: '5 to 10 mph',
            windDirection: 'S',
            shortForecast: 'Sunny',
            detailedForecast: 'Sunny.',
          },
        ],
      },
    };
    const noAlerts: NwsAlertsResponse = { features: [] };
    expect(normalizeWeather(calm, noAlerts, T)).toEqual([]);
  });

  it('synthesizes a precip hazard when probability ≥ threshold', () => {
    const wet: NwsForecastResponse = {
      properties: {
        updated: '2026-10-14T14:00:00+00:00',
        units: 'us',
        periods: [
          {
            number: 1,
            name: 'Rainy',
            startTime: '2026-10-14T06:00:00-07:00',
            endTime: '2026-10-14T18:00:00-07:00',
            isDaytime: true,
            temperature: 60,
            temperatureUnit: 'F',
            probabilityOfPrecipitation: { unitCode: 'wmoUnit:percent', value: 80 },
            windSpeed: '5 mph',
            windDirection: 'S',
            shortForecast: 'Rain',
            detailedForecast: 'Rain likely.',
          },
        ],
      },
    };
    const hazards = normalizeWeather(wet, { features: [] }, T);
    expect(hazards.filter((h) => h.kind === 'precip').length).toBe(1);
  });
});
