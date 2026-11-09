/**
 * Sample people/crews (Phase 2.1, design §8). Two crews, five people, each with
 * a stable palette color used to tint Gantt lanes and map working bubbles.
 */

import type { Person } from '../store/types';

/** Crew palette — colors chosen for contrast in both light and dark themes. */
export const CREW_COLORS: Record<string, string> = {
  Mechanical: '#2b8a9e',
  Electrical: '#c2691d',
};

export const samplePeople: Person[] = [
  { id: 'p-ana', name: 'Ana Reyes', crew: 'Mechanical', color: '#2b8a9e' },
  { id: 'p-ben', name: 'Ben Okafor', crew: 'Mechanical', color: '#3aa8bf' },
  { id: 'p-cho', name: 'Cho Lin', crew: 'Mechanical', color: '#1f6b7a' },
  { id: 'p-dev', name: 'Dev Patel', crew: 'Electrical', color: '#c2691d' },
  { id: 'p-eli', name: 'Eli Novak', crew: 'Electrical', color: '#e08a3c' },
];
