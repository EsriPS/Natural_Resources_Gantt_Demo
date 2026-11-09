/**
 * PanelResizer — the draggable splitter between the scene/inspector row and the
 * Gantt (R13). Dragging the handle up grows the Gantt (and shrinks the map +
 * inspector); dragging down does the reverse. It drives the `--gantt-h` CSS
 * variable on the #app grid, so no view needs to know about the others — the
 * ResizeObservers in the Gantt and SceneController re-fit on the size change.
 *
 * Clamped so neither region collapses, and keyboard-accessible (↑/↓ nudge).
 */

export class PanelResizer {
  private dragging = false;
  private readonly MIN_GANTT = 120; // px — keep the chart usable
  private readonly MIN_TOP = 180; // px — keep the scene/inspector usable
  private readonly TOPBAR_H = 56;

  constructor(
    private handle: HTMLElement,
    private app: HTMLElement,
  ) {
    this.handle.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    this.handle.addEventListener('keydown', this.onKey);
  }

  destroy(): void {
    this.handle.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    this.handle.removeEventListener('keydown', this.onKey);
  }

  /** Max Gantt height that still leaves MIN_TOP for the scene/inspector row. */
  private maxGantt(): number {
    return Math.max(this.MIN_GANTT, this.app.clientHeight - this.TOPBAR_H - this.MIN_TOP);
  }

  private setGanttHeight(px: number): void {
    const clamped = Math.max(this.MIN_GANTT, Math.min(this.maxGantt(), px));
    this.app.style.setProperty('--gantt-h', `${Math.round(clamped)}px`);
  }

  private onDown = (e: PointerEvent): void => {
    this.dragging = true;
    this.handle.classList.add('is-dragging');
    document.body.classList.add('gantt-resizing');
    e.preventDefault();
  };

  private onMove = (e: PointerEvent): void => {
    if (!this.dragging) return;
    // The Gantt occupies the space from the pointer to the bottom of #app.
    const rect = this.app.getBoundingClientRect();
    this.setGanttHeight(rect.bottom - e.clientY);
  };

  private onUp = (): void => {
    if (!this.dragging) return;
    this.dragging = false;
    this.handle.classList.remove('is-dragging');
    document.body.classList.remove('gantt-resizing');
  };

  private currentHeight(): number {
    const v = getComputedStyle(this.app).getPropertyValue('--gantt-h').trim();
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 300;
  }

  private onKey = (e: KeyboardEvent): void => {
    const step = e.shiftKey ? 48 : 16;
    if (e.key === 'ArrowUp') {
      this.setGanttHeight(this.currentHeight() + step); // grow Gantt
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      this.setGanttHeight(this.currentHeight() - step); // shrink Gantt
      e.preventDefault();
    }
  };
}
