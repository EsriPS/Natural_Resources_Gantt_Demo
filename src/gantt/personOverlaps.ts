/**
 * Same-person double-booking (R3.4) — distinct from the store's same-FEATURE
 * conflicts (R5.4). One person assigned two tasks whose time windows overlap,
 * regardless of zone. Pure and unit-tested; the Gantt uses it to flag a person's
 * clashing bars.
 */

import type { Task } from '../store/types';
import { intervalsOverlap } from '../store/selectors';

/** Set of task ids that overlap in time with another task for the SAME person. */
export function computePersonOverlaps(tasks: Task[]): Set<string> {
  const flagged = new Set<string>();
  const byPerson = new Map<string, Task[]>();
  for (const t of tasks) {
    const list = byPerson.get(t.personId);
    if (list) list.push(t);
    else byPerson.set(t.personId, [t]);
  }
  for (const list of byPerson.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (intervalsOverlap(list[i].start, list[i].end, list[j].start, list[j].end)) {
          flagged.add(list[i].id);
          flagged.add(list[j].id);
        }
      }
    }
  }
  return flagged;
}
