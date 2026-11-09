/**
 * Calcite Design System bootstrap (Esri-ification, R12).
 *
 * Registers Calcite's web components once and points their asset loader at the
 * CDN bundle for the installed version, so component translations/icons resolve
 * without a build-time copy step. Import this ONCE at app start (main.ts) before
 * any <calcite-*> element is used.
 *
 * Calcite's CSS is imported here too so the design tokens (fonts, the Esri
 * palette, focus rings) apply app-wide.
 */

import '@esri/calcite-components/dist/calcite/calcite.css';
import { setAssetPath } from '@esri/calcite-components';
import { defineCustomElements } from '@esri/calcite-components/dist/loader';

// Pin the asset path to the matching CDN version. Kept in sync with the
// @esri/calcite-components dependency in package.json.
const CALCITE_VERSION = '3.3.3';
setAssetPath(`https://js.arcgis.com/calcite-components/${CALCITE_VERSION}/assets`);

let registered = false;

/** Register all Calcite custom elements exactly once (idempotent). */
export function registerCalcite(): void {
  if (registered) return;
  registered = true;
  void defineCustomElements(window);
}
