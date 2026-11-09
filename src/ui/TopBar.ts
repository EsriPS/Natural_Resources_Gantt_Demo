/**
 * TopBar (Esri-ification, R12). The Calcite-styled application header.
 *
 * Replaces the old slider-driven time bar. The playhead/play controls now live
 * ON the Gantt (GanttView); the top bar instead carries Esri product chrome:
 *   • an app title + Calcite logo-ish lockup
 *   • a Calcite date-range picker that filters the Gantt to the chosen days
 *     (store.setVisibleRange) with a "show all" reset
 *   • the weather source badge (hazard popover mounts onto it, unchanged)
 *
 * Uses Calcite web components (<calcite-*>), already registered by registerCalcite().
 */

import type { ScheduleStore } from '../store/ScheduleStore';
import { scheduleDomain } from '../gantt/timeScale';

/** Format an epoch-ms into a YYYY-MM-DD local calendar day for Calcite. */
function toCalendarDay(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export class TopBar {
  private picker!: HTMLCalciteInputDatePickerElement;
  private clearBtn!: HTMLCalciteButtonElement;

  constructor(
    private host: HTMLElement,
    private store: ScheduleStore,
  ) {
    this.build();
  }

  private build(): void {
    this.host.innerHTML = '';
    this.host.classList.add('topbar-esri');

    // ── Left: brand lockup ───────────────────────────────────────────────
    const brand = document.createElement('div');
    brand.className = 'tb-brand';
    const mark = document.createElement('span');
    mark.className = 'tb-mark';
    mark.textContent = '◆';
    const title = document.createElement('span');
    title.className = 'tb-title';
    title.textContent = 'Refinery Schedule';
    brand.append(mark, title);

    // ── Center: date-range filter ────────────────────────────────────────
    const filterWrap = document.createElement('div');
    filterWrap.className = 'tb-filter';

    const label = document.createElement('calcite-label');
    label.setAttribute('layout', 'inline');
    label.className = 'tb-filter-label';
    label.textContent = 'Dates';

    this.picker = document.createElement('calcite-input-date-picker');
    this.picker.setAttribute('range', '');
    this.picker.setAttribute('scale', 's');
    this.picker.setAttribute('overlay-positioning', 'fixed');
    this.picker.setAttribute('placement', 'bottom');

    // Default the picker's min/max to the schedule's span so the calendar opens
    // on the relevant month(s), not today.
    const domain = scheduleDomain(this.store.getState().tasks);
    const minDay = toCalendarDay(new Date(domain.start).getTime());
    const maxDay = toCalendarDay(new Date(domain.end).getTime() - 1);
    this.picker.setAttribute('min', minDay);
    this.picker.setAttribute('max', maxDay);

    // When the user picks a range, filter the Gantt (R12). Calcite emits the
    // value as a [start, end] array for range pickers.
    this.picker.addEventListener('calciteInputDatePickerChange', () => {
      const value = this.picker.value;
      if (Array.isArray(value) && value[0] && value[1]) {
        this.store.setVisibleRange({ startDate: value[0], endDate: value[1] });
        this.clearBtn.hidden = false;
      } else if (Array.isArray(value) && !value[0] && !value[1]) {
        this.store.setVisibleRange(null);
        this.clearBtn.hidden = true;
      }
    });

    this.clearBtn = document.createElement('calcite-button');
    this.clearBtn.setAttribute('kind', 'neutral');
    this.clearBtn.setAttribute('scale', 's');
    this.clearBtn.setAttribute('appearance', 'outline');
    this.clearBtn.setAttribute('icon-start', 'x-circle');
    this.clearBtn.textContent = 'Clear selected dates';
    this.clearBtn.hidden = true;
    this.clearBtn.addEventListener('click', () => {
      this.picker.value = ['', ''];
      this.store.setVisibleRange(null);
      this.clearBtn.hidden = true;
    });

    filterWrap.append(label, this.picker, this.clearBtn);

    // ── Right: weather badge slot + Save ─────────────────────────────────
    const right = document.createElement('div');
    right.className = 'tb-right';

    const hazardSlot = document.createElement('div');
    hazardSlot.id = 'hazard-badge-slot';
    hazardSlot.className = 'hazard-badge-slot';
    const weatherBadge = document.createElement('span');
    weatherBadge.id = 'weather-badge';
    weatherBadge.className = 'weather-badge';
    weatherBadge.textContent = 'Loading weather…';
    hazardSlot.appendChild(weatherBadge);

    right.append(hazardSlot);

    this.host.append(brand, filterWrap, right);
  }
}
