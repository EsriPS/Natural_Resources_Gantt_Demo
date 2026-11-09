/**
 * HazardPopover (R6.2/R6.4). Makes the top-bar weather badge clickable: toggles
 * a panel that lists the current hazards — kind, severity, headline, and the
 * time window each covers — read live from the store. Closes on outside click
 * or Escape. Pure read; never mutates the store.
 */

import type { ScheduleStore } from '../store/ScheduleStore';
import type { Hazard } from '../store/types';

const KIND_ICON: Record<Hazard['kind'], string> = {
  alert: '⚠',
  wind: '🌬',
  precip: '🌧',
  temp: '🌡',
};

/** Format a hazard window as "Wed Oct 14, 6:00 AM – 6:00 PM" in local time. */
function formatWindow(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const day: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  const t: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  const sameDay = s.toDateString() === e.toDateString();
  const sDay = s.toLocaleDateString(undefined, day);
  const sT = s.toLocaleTimeString(undefined, t);
  const eT = e.toLocaleTimeString(undefined, t);
  if (sameDay) return `${sDay}, ${sT} – ${eT}`;
  const eDay = e.toLocaleDateString(undefined, day);
  return `${sDay} ${sT} – ${eDay} ${eT}`;
}

export class HazardPopover {
  private panel: HTMLElement | null = null;
  private onDocClick = (e: MouseEvent): void => {
    if (
      this.panel &&
      !this.panel.contains(e.target as Node) &&
      e.target !== this.badge
    ) {
      this.close();
    }
  };
  private onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.close();
  };

  constructor(
    private badge: HTMLElement,
    private store: ScheduleStore,
  ) {
    this.badge.style.cursor = 'pointer';
    this.badge.setAttribute('role', 'button');
    this.badge.setAttribute('tabindex', '0');
    this.badge.setAttribute('aria-haspopup', 'true');
    this.badge.addEventListener('click', () => this.toggle());
    this.badge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
    // Re-render contents if the panel is open when hazards change.
    this.store.subscribe(() => {
      if (this.panel) this.renderList();
    });
  }

  private toggle(): void {
    if (this.panel) this.close();
    else this.open();
  }

  private open(): void {
    this.panel = document.createElement('div');
    this.panel.className = 'hazard-popover';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-label', 'Weather hazards');
    this.renderList();
    this.badge.parentElement?.appendChild(this.panel);
    this.badge.setAttribute('aria-expanded', 'true');
    // Defer so the opening click doesn't immediately close it.
    setTimeout(() => {
      document.addEventListener('click', this.onDocClick);
      document.addEventListener('keydown', this.onKey);
    }, 0);
  }

  private close(): void {
    this.panel?.remove();
    this.panel = null;
    this.badge.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', this.onDocClick);
    document.removeEventListener('keydown', this.onKey);
  }

  private renderList(): void {
    if (!this.panel) return;
    const hazards = this.store.getState().hazards;
    const source = hazards[0]?.source ?? 'nws';
    const srcLabel = source === 'nws' ? 'NWS live' : 'Sample data';

    if (hazards.length === 0) {
      this.panel.innerHTML =
        `<div class="hazard-popover-head">Weather hazards</div>` +
        `<div class="hazard-popover-empty">No active hazards.</div>`;
      return;
    }

    // Sort by start time so the list reads chronologically.
    const sorted = [...hazards].sort((a, b) => +new Date(a.start) - +new Date(b.start));
    const rows = sorted
      .map((h) => {
        const icon = KIND_ICON[h.kind] ?? '•';
        return (
          `<li class="hazard-row hazard-sev-${h.severity}">` +
          `<span class="hazard-icon">${icon}</span>` +
          `<div class="hazard-body">` +
          `<div class="hazard-headline">${escapeHtml(h.headline)}</div>` +
          `<div class="hazard-meta">` +
          `<span class="hazard-chip hazard-sev-${h.severity}">${h.severity}</span>` +
          `<span class="hazard-when">${formatWindow(h.start, h.end)}</span>` +
          `</div></div></li>`
        );
      })
      .join('');

    this.panel.innerHTML =
      `<div class="hazard-popover-head">Weather hazards <span class="hazard-src">${srcLabel}</span></div>` +
      `<ul class="hazard-list">${rows}</ul>`;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}
