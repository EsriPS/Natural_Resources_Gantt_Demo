/**
 * Sample zones (Phase 2.2, design §8). Six plant zones with lon/lat/elev anchors
 * clustered around the El Segundo plant point so working bubbles render over the
 * real scene once it loads (binding strategy 2 — position anchors first).
 *
 * `weatherExposed` drives hazard suppression (R6.5): indoor zones (control room,
 * pump house interior) are shielded; outdoor/elevated zones (flare, tank farm,
 * pipe rack) are subject to wind/precip/temp hazards.
 */

import type { Zone } from '../store/types';

// Anchors spread ~50–150 m around the plant centroid (El Segundo 33.917, -118.416).
export const sampleZones: Zone[] = [
  {
    id: 'z-control',
    name: 'Control Room',
    position: [-118.4162, 33.9168, 6],
    weatherExposed: false,
  },
  {
    id: 'z-pump',
    name: 'Pump House',
    position: [-118.4166, 33.9172, 4],
    weatherExposed: false,
  },
  {
    id: 'z-flare',
    name: 'Flare Stack',
    position: [-118.4154, 33.9165, 40],
    weatherExposed: true,
  },
  {
    id: 'z-tankfarm',
    name: 'Tank Farm',
    position: [-118.4150, 33.9175, 12],
    weatherExposed: true,
  },
  {
    id: 'z-piperack',
    name: 'Pipe Rack',
    position: [-118.4159, 33.9170, 18],
    weatherExposed: true,
  },
  {
    id: 'z-unit4',
    name: 'Process Unit 4',
    position: [-118.4157, 33.9163, 10],
    weatherExposed: true,
  },
];
