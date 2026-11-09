/**
 * Bootstrap. Builds the store from sample data (Phase 2) and mounts the Gantt
 * view (Phase 3). Scene, time bar, and inspector are wired in later phases.
 */

import './app.css';
import { registerCalcite } from './ui/calcite';
import { config } from './config';
import { ScheduleStore } from './store/ScheduleStore';
import { GanttView } from './gantt/GanttView';
import { TopBar } from './ui/TopBar';
import { PanelResizer } from './ui/PanelResizer';
import { auth } from './auth/identity';
import { SceneController } from './map/SceneController';
import { loadWeather } from './hazards/loadWeather';
import { HazardPopover } from './panel/HazardPopover';
import { Inspector } from './panel/Inspector';
import {
  generatedPeople,
  generatedEquipment,
  generatedZones,
  generatedTasks,
} from './data/plant.generated';
import { buildDynamicSchedule } from './data/dynamicSchedule';
import { FeatureBackend } from './data/featureBackend';

const AUTO_SIGN_IN_KEY = 'plant-scheduler-oauth-attempted';

function main(): void {
  // Register Calcite web components (Esri design system) before any <calcite-*>
  // element is created by the TopBar.
  registerCalcite();

  // Re-lay the baked work orders onto the two weeks starting today, inside
  // 08:00-17:00 and with no zone, person or equipment double-booking.
  const schedule = buildDynamicSchedule(generatedTasks, generatedPeople);

  const store = new ScheduleStore({
    people: schedule.people,
    equipment: generatedEquipment,
    zones: generatedZones,
    tasks: schedule.tasks,
    currentTime: schedule.anchorTime,
  });

  // Esri feature-class backend (R10/R11): client-side People + Equipment tables
  // and the WorkOrders polygon feature class, built from the store. The Save
  // button pushes live edits back into these layers (D-2(c)).
  const backend = new FeatureBackend(store);
  (window as unknown as { backend: FeatureBackend }).backend = backend;

  const sceneHost = document.getElementById('scene');
  let scene: SceneController | null = null;
  let authMessage = 'Connecting to ArcGIS...';
  let authFailed = false;

  /** Load the 3D scene (after sign-in). Replaces the prompt. */
  function loadScene(): void {
    if (!sceneHost) return;
    scene?.destroy();
    scene = new SceneController(sceneHost, store);
    void scene.load();
  }

  /** Scene region: prompt sign-in when signed out; load scene when signed in. */
  function renderScene(): void {
    if (!sceneHost) return;
    if (auth.getState().signedIn) {
      loadScene();
      return;
    }
    scene?.destroy();
    scene = null;
    sceneHost.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'scene-signin';
    const msg = document.createElement('div');
    msg.textContent = authMessage;
    if (authFailed) {
      msg.setAttribute('role', 'alert');
      const btn = document.createElement('button');
      btn.textContent = 'Retry sign-in';
      btn.addEventListener('click', () => void beginSignIn());
      wrap.append(msg, btn);
    } else {
      msg.setAttribute('role', 'status');
      wrap.append(msg);
    }
    sceneHost.appendChild(wrap);
  }

  async function beginSignIn(): Promise<void> {
    authMessage = 'Redirecting to ArcGIS...';
    authFailed = false;
    renderScene();
    try {
      await auth.signIn();
      sessionStorage.removeItem(AUTO_SIGN_IN_KEY);
    } catch (err) {
      const error = err as { message?: string; details?: { messages?: string[] } };
      authMessage = `ArcGIS sign-in failed: ${error?.details?.messages?.[0] ?? error?.message ?? String(err)}`;
      authFailed = true;
      sessionStorage.removeItem(AUTO_SIGN_IN_KEY);
      renderScene();
    }
  }

  renderScene();
  // Re-render when auth changes (sign-in success, or expiry → signed out).
  auth.subscribe(() => renderScene());
  void auth.restore().then((restored) => {
    if (restored) {
      sessionStorage.removeItem(AUTO_SIGN_IN_KEY);
      return;
    }
    if (sessionStorage.getItem(AUTO_SIGN_IN_KEY)) {
      sessionStorage.removeItem(AUTO_SIGN_IN_KEY);
      authMessage = 'ArcGIS sign-in did not complete. Retry to continue.';
      authFailed = true;
      renderScene();
      return;
    }
    sessionStorage.setItem(AUTO_SIGN_IN_KEY, '1');
    void beginSignIn();
  });

  const inspectorHost = document.getElementById('inspector');
  if (inspectorHost) new Inspector(inspectorHost, store);

  // Esri Calcite top bar: brand, date-range filter (drives the Gantt), and the
  // weather badge slot. Built before the weather wiring below, which looks up
  // #weather-badge inside it.
  const topbarHost = document.getElementById('topbar');
  if (topbarHost) new TopBar(topbarHost, store);

  const ganttHost = document.getElementById('gantt');
  if (ganttHost) new GanttView(ganttHost, store);

  // Draggable splitter: resize the Gantt vs the scene/inspector row (R13).
  const resizer = document.getElementById('gantt-resizer');
  const appEl = document.getElementById('app');
  if (resizer && appEl) new PanelResizer(resizer, appEl);

  // Phase 8: load weather (live NWS, falling back to sample). Independent of
  // auth and the scene, so hazard flags work even signed out / offline.
  const weatherBadge = document.getElementById('weather-badge');
  if (weatherBadge) new HazardPopover(weatherBadge, store);
  void loadWeather(store).then((res) => {
    const bar = document.getElementById('weather-badge');
    if (bar) {
      bar.textContent =
        res.source === 'nws'
          ? `NWS live · ${res.count} hazard${res.count === 1 ? '' : 's'}`
          : `Sample weather · ${res.count} hazard${res.count === 1 ? '' : 's'}`;
      bar.className = `weather-badge weather-${res.source}`;
      bar.title =
        res.source === 'sample' && res.error ? `Live NWS unavailable: ${res.error}` : '';
    }
    console.info('[plant-scheduler] weather', res);
  });

  // Expose for manual inspection in the console during the demo.
  (window as unknown as { store: ScheduleStore }).store = store;

  console.info('[plant-scheduler] gantt mounted', {
    plant: config.plant,
    tasks: store.getState().tasks.length,
    conflicts: store.getState().conflicts.length,
  });
}

main();
