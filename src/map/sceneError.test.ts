/** Phase 6.2 — scene error classification. */

import { describe, it, expect } from 'vitest';
import { classifySceneError } from './sceneError';

const SCENE = 'https://tiles.arcgis.com/tiles/ORG/arcgis/rest/services/El_Segundo/SceneServer/layers/0';
const ORIGIN = 'http://127.0.0.1:5173';

describe('classifySceneError', () => {
  it('classifies 499 token-required as auth with service URL', () => {
    const r = classifySceneError(
      { message: 'Token Required', details: { httpStatus: 499, url: SCENE } },
      SCENE,
      ORIGIN,
    );
    expect(r.kind).toBe('auth');
    expect(r.status).toBe(499);
    expect(r.detail).toContain(SCENE);
  });

  it('classifies 403 as auth', () => {
    const r = classifySceneError({ details: { httpStatus: 403 } }, SCENE, ORIGIN);
    expect(r.kind).toBe('auth');
  });

  it('classifies a CORS failure and names the origin + the fix', () => {
    const r = classifySceneError(
      { message: 'Failed to fetch', details: { httpStatus: 0, url: SCENE } },
      SCENE,
      ORIGIN,
    );
    expect(r.kind).toBe('cors');
    expect(r.detail).toContain(ORIGIN);
    expect(r.detail.toLowerCase()).toContain('allowed origins');
  });

  it('classifies a 5xx as network', () => {
    const r = classifySceneError({ details: { httpStatus: 503 } }, SCENE, ORIGIN);
    expect(r.kind).toBe('network');
    expect(r.status).toBe(503);
  });

  it('classifies a timeout as network', () => {
    const r = classifySceneError({ message: 'request timeout' }, SCENE, ORIGIN);
    expect(r.kind).toBe('network');
  });

  it('falls back to unknown with the raw message', () => {
    const r = classifySceneError({ message: 'something odd' }, SCENE, ORIGIN);
    expect(r.kind).toBe('unknown');
    expect(r.detail).toContain('something odd');
  });
});
