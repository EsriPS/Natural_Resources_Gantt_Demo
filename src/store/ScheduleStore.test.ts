import { describe, it, expect, vi } from 'vitest';
import { ScheduleStore } from './ScheduleStore';
import type { Person, Zone, Task } from './types';

const people: Person[] = [{ id: 'p1', name: 'Alice', crew: 'Mech', color: '#f00' }];
const zones: Zone[] = [{ id: 'z1', name: 'Zone 1', weatherExposed: false }];
const D = (h: number) => `2026-10-13T${String(h).padStart(2, '0')}:00:00.000Z`;
const tasks: Task[] = [
  { id: 'a', title: 'A', personId: 'p1', zoneId: 'z1', start: D(1), end: D(3), weatherSensitive: false },
];

describe('ScheduleStore', () => {
  it('seeds currentTime to the earliest task start', () => {
    const s = new ScheduleStore({ people, zones, tasks });
    expect(s.getState().currentTime).toBe(D(1));
  });

  it('setTime recomputes activeTaskIds and notifies once', () => {
    const s = new ScheduleStore({ people, zones, tasks });
    const listener = vi.fn();
    s.subscribe(listener);

    s.setTime(D(2));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(s.getState().activeTaskIds).toEqual(['a']);

    s.setTime(D(5));
    expect(s.getState().activeTaskIds).toEqual([]); // past the task
  });

  it('moveTask preserves duration and re-derives', () => {
    const s = new ScheduleStore({ people, zones, tasks });
    s.moveTask('a', D(10));
    const t = s.getState().tasks.find((x) => x.id === 'a')!;
    expect(t.start).toBe(D(10));
    expect(t.end).toBe(D(12)); // 2h duration preserved
  });

  it('resizeTask changes end and ignores invalid (end <= start)', () => {
    const s = new ScheduleStore({ people, zones, tasks });
    s.resizeTask('a', D(5));
    expect(s.getState().tasks[0].end).toBe(D(5));
    s.resizeTask('a', D(0)); // before start — ignored
    expect(s.getState().tasks[0].end).toBe(D(5));
  });

  it('keeps exactly two unique route task endpoints and can clear them', () => {
    const moreTasks = [
      tasks[0],
      { ...tasks[0], id: 'b', title: 'B' },
      { ...tasks[0], id: 'c', title: 'C' },
    ];
    const s = new ScheduleStore({ people, zones, tasks: moreTasks });

    s.addRouteTask('a');
    s.addRouteTask('a');
    s.addRouteTask('b');
    s.addRouteTask('c');
    expect(s.getState().routeTaskIds).toEqual(['a', 'b']);

    s.clearRoute();
    expect(s.getState().routeTaskIds).toEqual([]);
  });

  it('moveTask recomputes hazardByTask (weather warning follows the item)', () => {
    // A weather-sensitive task starting clear of the storm, plus a hazard
    // window from 14:00–18:00.
    const wTask: Task = {
      id: 'w',
      title: 'Outdoor work',
      personId: 'p1',
      zoneId: 'z1',
      start: D(8),
      end: D(10),
      weatherSensitive: true,
    };
    const s = new ScheduleStore({ people, zones, tasks: [wTask] });
    s.setHazards([
      {
        id: 'hz1',
        kind: 'wind',
        severity: 'warning',
        headline: 'High wind',
        start: D(14),
        end: D(18),
        source: 'sample',
      },
    ]);

    // Clear of the storm → no warning on the item.
    expect(s.getState().hazardByTask['w']).toBeUndefined();

    // Drag it INTO the storm window → the warning appears on the item.
    s.moveTask('w', D(15));
    expect(s.getState().hazardByTask['w']?.map((h) => h.id)).toEqual(['hz1']);

    // Drag it back OUT → the warning clears again.
    s.moveTask('w', D(8));
    expect(s.getState().hazardByTask['w']).toBeUndefined();
  });
});
