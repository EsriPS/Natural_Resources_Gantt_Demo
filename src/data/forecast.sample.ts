/**
 * Forecast fallback (Phase 2.4, design §7, R6.6). These payloads mirror the real
 * `api.weather.gov` response SHAPES so Phase 8's normalizer parses them through
 * the exact same path as live data (no sample-only branch in the parser).
 *
 *   - `sampleForecastResponse`   ← GET /gridpoints/LOX/148,40/forecast
 *   - `sampleActiveAlertsResponse` ← GET /alerts/active?point=33.917,-118.416
 *
 * Planted signal (ties to tasks.sample.ts task C, t-c1 Flare stack inspection
 * 2026-10-14 09:00–12:00 PDT): a forecast period with sustained wind 30 mph
 * (> config.hazards.windMph = 25) covering that morning, plus an active High
 * Wind Watch alert over the same window → a wind hazard on the exposed flare.
 *
 * Times are UTC `Z` as NWS returns them; 2026-10-14 09:00–12:00 PDT = 16:00–19:00Z.
 */

/** Minimal structural type for an NWS gridpoint forecast period. */
export interface NwsForecastPeriod {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: 'F' | 'C';
  probabilityOfPrecipitation: { unitCode: string; value: number | null };
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
}

export interface NwsForecastResponse {
  properties: {
    updated: string;
    units: string;
    periods: NwsForecastPeriod[];
  };
}

export interface NwsAlertFeature {
  id: string;
  properties: {
    event: string;
    severity: string;
    headline: string;
    description: string;
    onset: string;
    ends: string | null;
    expires: string;
  };
}

export interface NwsAlertsResponse {
  features: NwsAlertFeature[];
}

export const sampleForecastResponse: NwsForecastResponse = {
  properties: {
    updated: '2026-10-14T14:00:00+00:00',
    units: 'us',
    periods: [
      {
        number: 1,
        name: 'Today',
        startTime: '2026-10-14T06:00:00-07:00',
        endTime: '2026-10-14T18:00:00-07:00',
        isDaytime: true,
        temperature: 72,
        temperatureUnit: 'F',
        probabilityOfPrecipitation: { unitCode: 'wmoUnit:percent', value: 20 },
        // Planted: sustained wind above the 25 mph threshold during task C.
        windSpeed: '25 to 30 mph',
        windDirection: 'NW',
        shortForecast: 'Sunny and Windy',
        detailedForecast:
          'Sunny, with a high near 72. Northwest wind 25 to 30 mph, with gusts as high as 40 mph.',
      },
      {
        number: 2,
        name: 'Tonight',
        startTime: '2026-10-14T18:00:00-07:00',
        endTime: '2026-10-15T06:00:00-07:00',
        isDaytime: false,
        temperature: 58,
        temperatureUnit: 'F',
        probabilityOfPrecipitation: { unitCode: 'wmoUnit:percent', value: 10 },
        windSpeed: '10 to 15 mph',
        windDirection: 'W',
        shortForecast: 'Mostly Clear',
        detailedForecast: 'Mostly clear, with a low around 58. West wind 10 to 15 mph.',
      },
      {
        number: 3,
        name: 'Wednesday',
        startTime: '2026-10-15T06:00:00-07:00',
        endTime: '2026-10-15T18:00:00-07:00',
        isDaytime: true,
        temperature: 70,
        temperatureUnit: 'F',
        probabilityOfPrecipitation: { unitCode: 'wmoUnit:percent', value: 15 },
        windSpeed: '8 to 12 mph',
        windDirection: 'SW',
        shortForecast: 'Sunny',
        detailedForecast: 'Sunny, with a high near 70. Southwest wind 8 to 12 mph.',
      },
      {
        number: 4,
        name: 'Thursday',
        startTime: '2026-10-16T06:00:00-07:00',
        endTime: '2026-10-16T18:00:00-07:00',
        isDaytime: true,
        temperature: 68,
        temperatureUnit: 'F',
        probabilityOfPrecipitation: { unitCode: 'wmoUnit:percent', value: 5 },
        windSpeed: '5 to 10 mph',
        windDirection: 'S',
        shortForecast: 'Sunny',
        detailedForecast: 'Sunny, with a high near 68. South wind 5 to 10 mph.',
      },
    ],
  },
};

export const sampleActiveAlertsResponse: NwsAlertsResponse = {
  features: [
    {
      id: 'urn:oid:2.49.0.1.840.0.sample.highwind.1',
      properties: {
        event: 'High Wind Watch',
        severity: 'Moderate',
        headline: 'High Wind Watch in effect from Tuesday morning to Tuesday afternoon',
        description:
          'Northwest winds 25 to 30 mph with gusts up to 40 mph expected. Elevated and ' +
          'outdoor work, including flare and tank operations, may be affected.',
        onset: '2026-10-14T08:00:00-07:00',
        ends: '2026-10-14T14:00:00-07:00',
        expires: '2026-10-14T14:00:00-07:00',
      },
    },
  ],
};
