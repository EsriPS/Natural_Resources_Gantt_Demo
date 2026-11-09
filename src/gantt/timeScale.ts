/**
 * Shared time scale (design §1). Maps ISO datetimes to x-pixels and back on a
 * linear [domainStart, domainEnd] → [0, width] scale. Pure and framework-free so
 * the Gantt (Phase 3) and the time bar (Phase 4) share one coordinate system,
 * and so it is unit-testable.
 */

import type { ISODate } from '../store/types';

const ms = (d: ISODate): number => new Date(d).getTime();

export interface TimeScale {
  readonly startMs: number;
  readonly endMs: number;
  readonly width: number;
  /** ISO/epoch-ms → pixel x. */
  x(t: ISODate | number): number;
  /** pixel x → epoch ms (clamped to the domain). */
  invert(px: number): number;
  /** pixel x → ISO datetime (clamped to the domain). */
  invertIso(px: number): ISODate;
}

export function makeTimeScale(
  domainStart: ISODate,
  domainEnd: ISODate,
  width: number,
): TimeScale {
  const startMs = ms(domainStart);
  const endMs = ms(domainEnd);
  const span = Math.max(1, endMs - startMs);
  return {
    startMs,
    endMs,
    width,
    x(t) {
      const tm = typeof t === 'number' ? t : ms(t);
      return ((tm - startMs) / span) * width;
    },
    invert(px) {
      const clamped = Math.max(0, Math.min(width, px));
      return startMs + (clamped / width) * span;
    },
    invertIso(px) {
      return new Date(this.invert(px)).toISOString();
    },
  };
}

/** Snap an epoch-ms value to the nearest `stepMinutes` boundary. */
export function snapMs(epochMs: number, stepMinutes: number): number {
  const step = stepMinutes * 60_000;
  return Math.round(epochMs / step) * step;
}

/** Domain padded to whole days covering all tasks, for a tidy axis. */
export function scheduleDomain(
  tasks: { start: ISODate; end: ISODate }[],
): { start: ISODate; end: ISODate } {
  if (tasks.length === 0) {
    const now = new Date();
    return { start: now.toISOString(), end: new Date(now.getTime() + 86_400_000).toISOString() };
  }
  const min = Math.min(...tasks.map((t) => ms(t.start)));
  const max = Math.max(...tasks.map((t) => ms(t.end)));
  const start = new Date(min);
  start.setHours(0, 0, 0, 0);
  const end = new Date(max);
  end.setHours(24, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * The domain the Gantt should actually render. When a calendar range is set it
 * is used verbatim (start-of-startDate → end-of-endDate), clamped so it never
 * extends past the full schedule's own padded bounds; otherwise the full
 * schedule domain is returned. `range` dates are YYYY-MM-DD local calendar days.
 */
export function visibleDomain(
  tasks: { start: ISODate; end: ISODate }[],
  range: { startDate: string; endDate: string } | null,
): { start: ISODate; end: ISODate } {
  const full = scheduleDomain(tasks);
  if (!range) return full;
  // Parse YYYY-MM-DD as a local day (no timezone shift from `new Date('YYYY-MM-DD')`).
  const [sy, sm, sd] = range.startDate.split('-').map(Number);
  const [ey, em, ed] = range.endDate.split('-').map(Number);
  if (!sy || !ey) return full;
  const rangeStart = new Date(sy, sm - 1, sd, 0, 0, 0, 0).getTime();
  const rangeEnd = new Date(ey, em - 1, ed, 24, 0, 0, 0).getTime(); // end-of-day (inclusive)
  if (rangeEnd <= rangeStart) return full;
  return {
    start: new Date(rangeStart).toISOString(),
    end: new Date(rangeEnd).toISOString(),
  };
}
