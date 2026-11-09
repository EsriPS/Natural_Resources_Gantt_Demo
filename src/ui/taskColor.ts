/**
 * Shared task coloring (R14). One source of truth for how a work order is
 * colored in BOTH the Gantt and the 3D map, so the two never disagree.
 *
 * FILL precedence (highest wins):
 *   1. CONFLICT (same-zone/time OR same-person OR same-equipment OR spatial
 *      zone overlap) → red
 *   2. otherwise → colored by PRIORITY (Emergency / High / Medium / Low)
 *
 * WEATHER is NOT a fill color — it is shown as a separate yellow MARKING layered
 * on top (a stripe on the Gantt bar, a ring on the map zone) so a weather
 * warning is visible WITHOUT hiding the task's priority. See WEATHER_COLOR.
 */

import type { Priority } from '../store/types';

export const CONFLICT_COLOR = '#d83020'; // Calcite danger red
export const WEATHER_COLOR = '#f2b705'; // bright yellow weather marking

/** Priority palette (Esri-ish ramp, readable on the light theme). */
export const PRIORITY_COLORS: Record<Priority, string> = {
  Emergency: '#a11',   // deep red-maroon (distinct from the conflict red)
  High: '#e8702a',     // orange
  Medium: '#f2c21b',   // gold
  Low: '#4a8c3f',      // green
};

/** Fallback when a task has no priority set. */
const PRIORITY_FALLBACK = '#6a6f73';

export interface TaskColorFlags {
  conflict: boolean;
  priority?: Priority;
}

/**
 * Resolve the FILL color for a task: conflict red, else the priority color.
 * Weather is deliberately NOT handled here — it is a separate marking.
 */
export function taskColor(flags: TaskColorFlags): string {
  if (flags.conflict) return CONFLICT_COLOR;
  return (flags.priority && PRIORITY_COLORS[flags.priority]) || PRIORITY_FALLBACK;
}

/** Human label for a priority swatch (used in a legend). */
export function priorityLabel(p: Priority): string {
  return p;
}
