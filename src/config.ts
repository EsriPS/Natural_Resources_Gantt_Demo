/**
 * App configuration. Reads public (non-secret) values from Vite env with
 * sensible defaults. NO credentials here — see auth/identity.ts (R2.3).
 */

export interface PlantLocation {
  lat: number;
  lon: number;
}

export interface HazardThresholds {
  /** Sustained/gust wind at or above this (mph) is a wind hazard. */
  windMph: number;
  /** Precipitation probability at or above this (%) is a precip hazard. */
  precipPct: number;
  /** Temperature at or above this (°F) is a heat hazard. */
  tempHiF: number;
  /** Temperature at or below this (°F) is a cold hazard. */
  tempLoF: number;
}

interface AppConfig {
  portalUrl: string;
  /** Registered ArcGIS OAuth application client ID. */
  oauthAppId: string;
  /** Base server used for token registration (tiles.arcgis.com org host). */
  tileServer: string;
  sceneUrl: string;
  plant: PlantLocation;
  hazards: HazardThresholds;
  /** Timeline animation: ms of wall-clock per step. */
  animationStepMs: number;
  /** Timeline animation: simulated time advanced per step (minutes). */
  animationStepMinutes: number;
}

function num(value: string | undefined, fallback: number): number {
  const n = value === undefined ? NaN : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const env = import.meta.env;

export const config: AppConfig = {
  portalUrl: env.VITE_PORTAL_URL ?? 'https://esripetroleum.maps.arcgis.com',
  oauthAppId: env.VITE_ARCGIS_OAUTH_APP_ID ?? '',
  tileServer: 'https://tiles.arcgis.com/tiles/2BOLYujtFjlNg1bd',
  sceneUrl:
    env.VITE_SCENE_URL ??
    'https://tiles.arcgis.com/tiles/2BOLYujtFjlNg1bd/arcgis/rest/services/El_Segundo_Georeferenced_IFC/SceneServer',
  plant: {
    lat: num(env.VITE_PLANT_LAT, 33.917),
    lon: num(env.VITE_PLANT_LON, -118.416),
  },
  hazards: {
    windMph: 25,
    precipPct: 60,
    tempHiF: 95,
    tempLoF: 35,
  },
  animationStepMs: 400,
  animationStepMinutes: 60,
};
