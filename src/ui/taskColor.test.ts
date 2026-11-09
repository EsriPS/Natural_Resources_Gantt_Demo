import { describe, it, expect } from 'vitest';
import { taskColor, CONFLICT_COLOR, PRIORITY_COLORS } from './taskColor';

describe('taskColor precedence', () => {
  it('conflict beats priority (red)', () => {
    expect(taskColor({ conflict: true, priority: 'Emergency' })).toBe(CONFLICT_COLOR);
    expect(taskColor({ conflict: true })).toBe(CONFLICT_COLOR);
  });

  it('colors by priority when there is no conflict (weather is a separate marking, not a fill)', () => {
    expect(taskColor({ conflict: false, priority: 'High' })).toBe(PRIORITY_COLORS.High);
    expect(taskColor({ conflict: false, priority: 'Low' })).toBe(PRIORITY_COLORS.Low);
    expect(taskColor({ conflict: false, priority: 'Emergency' })).toBe(PRIORITY_COLORS.Emergency);
  });

  it('has a defined fallback when no priority is set', () => {
    const c = taskColor({ conflict: false });
    expect(typeof c).toBe('string');
    expect(c).toMatch(/^#/);
  });
});
