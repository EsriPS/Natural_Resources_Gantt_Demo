/**
 * SceneView controller (Phase 6, design §1, §4). Loads the real IFC building and
 * wires the 3D view bidirectionally to the store:
 *   6.1 load:   Map + SceneView + SceneLayer from config.sceneUrl (token already
 *               registered by Phase 5 auth); goTo(fullExtent) once loaded.
 *   6.2 error:  on load failure, render the classified auth/CORS/network screen
 *               with the failing URL + status + a retry button (no silent fallback).
 *   6.3 pick:   scene click → hitTest → nearest zone anchor → store.select({zone}).
 *   6.4 camera: subscribe to store; task/zone selection → goTo the bound zone.
 *
 * The GraphicsLayer for working bubbles/conflict markers is added here and driven
 * in Phase 7.
 */

import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';
import BuildingSceneLayer from '@arcgis/core/layers/BuildingSceneLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import RouteLayer from '@arcgis/core/layers/RouteLayer';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import Mesh from '@arcgis/core/geometry/Mesh';
import Graphic from '@arcgis/core/Graphic';
import RouteParameters from '@arcgis/core/rest/support/RouteParameters';
import Stop from '@arcgis/core/rest/support/Stop';
import PolygonBarrier from '@arcgis/core/rest/support/PolygonBarrier';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import type { ScheduleStore } from '../store/ScheduleStore';
import type { Zone } from '../store/types';
import { config } from '../config';
import { classifySceneError } from './sceneError';
import { WorkOverlay } from './WorkOverlay';

const CRANE_MODEL_URL =
  'https://esri-ps-demos-public-hosting.s3.us-east-2.amazonaws.com/sector-hack-2026/tower-crane.glb';

export class SceneController {
  private view: SceneView | null = null;
  private map: Map | null = null;
  private sceneLayer: BuildingSceneLayer | null = null;
  private unsub: (() => void) | null = null;
  private lastSelectionKey = '';
  private work: WorkOverlay | null = null;
  private routeLayer: RouteLayer | null = null;
  private routeSolveRevision = 0;
  private lastRouteKey = '';
  private sketchVM: SketchViewModel | null = null;
  private craneMesh: Mesh | null = null;
  private craneGraphic: Graphic | null = null;
  private craneControl: HTMLElement | null = null;
  private placeCraneBtn: HTMLButtonElement | null = null;
  private moveCraneBtn: HTMLButtonElement | null = null;
  private removeCraneBtn: HTMLButtonElement | null = null;
  private placingCrane = false;
  private routeUpdateTimer: number | null = null;
  private loadAttempt = 0;

  /** The GraphicsLayer Phase 7 draws working bubbles / conflict markers onto. */
  readonly overlay = new GraphicsLayer({
    title: 'work-overlay',
    // on-the-ground drapes each work-area footprint onto the surface below it
    // (terrain + the building), so the areas hug the structure like painted
    // zones rather than floating. Labels are lifted via their symbol's
    // verticalOffset so they stay legible above the footprint.
    elevationInfo: { mode: 'on-the-ground' },
  });

  /** The GLTF crane is isolated from work-area graphics and route results. */
  readonly craneLayer = new GraphicsLayer({
    title: 'placed-cranes',
    elevationInfo: { mode: 'absolute-height' },
  });

  constructor(
    private host: HTMLElement,
    private store: ScheduleStore,
  ) { }

  /** Build the view and load the scene. Call after sign-in (token registered). */
  async load(): Promise<void> {
    const attempt = ++this.loadAttempt;
    this.work?.destroy();
    this.work = null;
    this.routeSolveRevision++;
    this.destroyCraneTools();
    this.routeLayer = null;
    this.map = null;
    this.view?.destroy();
    this.view = null;
    this.sceneLayer = null;
    this.host.innerHTML = '';
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    this.host.appendChild(container);

    const sceneLayer = new BuildingSceneLayer({ url: config.sceneUrl });
    this.sceneLayer = sceneLayer;
    const map = new Map({
      basemap: 'satellite',
      ground: 'world-elevation',
      layers: [sceneLayer, this.overlay, this.craneLayer],
    });
    this.map = map;

    const view = new SceneView({
      container,
      map,
      // Initial camera near the plant; refined by goTo(fullExtent) after load.
      center: [config.plant.lon, config.plant.lat],
      zoom: 16,
    });
    this.view = view;

    try {
      await sceneLayer.load();
      if (attempt !== this.loadAttempt) return;
      await view.when();
      if (attempt !== this.loadAttempt) return;
      // Anchor the sample zones onto the building's REAL extent (georeferenced
      // IFC coordinates), so bubbles land on the structure regardless of where
      // the model actually sits — instead of guessed El Segundo coordinates.
      this.fitZonesToExtent();
      // Frame the building (R1.5).
      if (sceneLayer.fullExtent) {
        await view.goTo(sceneLayer.fullExtent).catch(() => undefined);
      }
      if (attempt !== this.loadAttempt) return;
      this.wireInteraction();
      this.setupCraneTools();
      this.subscribeCamera();
      this.work = new WorkOverlay(this.overlay, this.store);
      this.lastRouteKey = this.store.getState().routeTaskIds.join(':');
      void this.updateRouteLayer();
    } catch (err) {
      if (attempt === this.loadAttempt) this.renderError(err);
    }
  }

  /**
   * Partition the loaded building's REAL footprint into a labelled grid of
   * work-zone sub-regions, one per distinct Asset (R9.5, option-1 binding).
   * Each process Area gets its own block of the footprint, and the Assets
   * within an Area are laid out on a sub-grid inside that block — so every
   * Asset zone lands on a genuinely distinct part of the structure and the
   * camera fly on task-select frames a specific location. The IFC model is
   * georeferenced to its own coordinates, so we derive anchors from the loaded
   * fullExtent rather than guessed lat/lon.
   */
  private fitZonesToExtent(): void {
    const ext = this.sceneLayer?.fullExtent;
    const center = ext?.center;
    if (!ext || !center) return;

    const lon = center.longitude;
    const lat = center.latitude;
    const geo = ext.spatialReference?.isGeographic ?? ext.spatialReference?.wkid === 4326;
    const spanLon = geo
      ? ext.xmax - ext.xmin
      : (ext.width ?? 0) / (111_320 * Math.cos((lat * Math.PI) / 180));
    const spanLat = geo ? ext.ymax - ext.ymin : (ext.height ?? 0) / 111_320;

    const zones = this.store.getState().zones;

    // Zones that already carry a REAL authored footprint (work_zones polygons)
    // keep their geometry and centroid anchor untouched — we only synthesize a
    // grid for zones that have no geometry of their own.
    const realZones = zones.filter((z) => z.rings && z.rings.length > 0);
    const synthZones = zones.filter((z) => !(z.rings && z.rings.length > 0));
    if (synthZones.length === 0) {
      // Everything is real geometry — nothing to anchor. Still ensure each
      // real zone has a `position` (centroid) for the camera fly / nearest-click.
      const withPos = zones.map((z) => {
        if (z.position || !z.rings?.length) return z;
        const ring = z.rings[0];
        const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length;
        const cy = ring.reduce((s, p) => s + p[1], 0) / ring.length;
        return { ...z, position: [cx, cy, 0] as [number, number, number] };
      });
      this.store.setZones(withPos);
      return;
    }

    // Group geometry-less zones by Area so each area occupies a contiguous block.
    // (Use a plain record — `Map` is shadowed by the ArcGIS Map import here.)
    const areas: string[] = [];
    const byArea: Record<string, Zone[]> = {};
    for (const z of synthZones) {
      const a = z.area ?? 'Unassigned';
      if (!byArea[a]) {
        byArea[a] = [];
        areas.push(a);
      }
      byArea[a].push(z);
    }

    // Arrange the Area blocks on a coarse grid (e.g. 4 areas → 2×2 quadrants).
    const areaCols = Math.ceil(Math.sqrt(areas.length));
    const areaRows = Math.ceil(areas.length / areaCols);
    const inset = 0.08; // keep off the very edge of the model
    const usable = 1 - 2 * inset;

    // Map a fractional (fx, fy) in 0..1 of the footprint to a lon/lat anchor.
    const anchor = (fx: number, fy: number): [number, number, number] => {
      const u = inset + fx * usable - 0.5; // -0.42..0.42
      const v = inset + fy * usable - 0.5;
      if (geo) {
        return [lon + u * spanLon, lat + v * spanLat, 0];
      }
      return [lon + u * spanLon, lat + v * spanLat, 0];
    };

    const reanchored: Zone[] = [];
    areas.forEach((area, ai) => {
      const blockCol = ai % areaCols;
      const blockRow = Math.floor(ai / areaCols);
      const blockW = 1 / areaCols;
      const blockH = 1 / areaRows;
      const items = byArea[area];

      // Sub-grid for the Assets within this Area's block.
      const cols = Math.ceil(Math.sqrt(items.length));
      const rows = Math.ceil(items.length / cols);
      items.forEach((z, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        // Fractional position of this asset's cell center within the whole
        // footprint: area block offset + sub-cell center.
        const fx = (blockCol + (c + 0.5) / cols) * blockW;
        const fy = (blockRow + (r + 0.5) / rows) * blockH;
        reanchored.push({ ...z, position: anchor(fx, fy) });
      });
    });
    // Keep the real-geometry zones as-is; replace only the synthesized ones.
    this.store.setZones([...realZones, ...reanchored]);
  }

  destroy(): void {
    this.loadAttempt++;
    this.work?.destroy();
    this.work = null;
    this.routeSolveRevision++;
    this.destroyCraneTools();
    this.routeLayer = null;
    this.map = null;
    this.unsub?.();
    this.unsub = null;
    this.view?.destroy();
    this.view = null;
  }

  // ── 6.2 error screen ───────────────────────────────────────────────────────
  private renderError(err: unknown): void {
    const origin = window.location.origin;
    const info = classifySceneError(err, config.sceneUrl, origin);
    this.host.innerHTML = '';
    const box = document.createElement('div');
    box.className = `scene-error scene-error-${info.kind}`;
    box.innerHTML = `
      <div class="scene-error-badge">${info.kind.toUpperCase()}</div>
      <h3>${info.title}</h3>
      <p>${info.detail}</p>
    `;
    const retry = document.createElement('button');
    retry.textContent = 'Retry';
    retry.addEventListener('click', () => void this.load());
    box.appendChild(retry);
    this.host.appendChild(box);
    // Surface for debugging without logging credentials.
    console.warn('[scene] load error', { kind: info.kind, status: info.status, url: info.url });
  }

  // ── 6.3 scene click → zone selection ───────────────────────────────────────
  private wireInteraction(): void {
    const view = this.view;
    if (!view) return;
    view.on('click', (event) => {
      if (this.placingCrane) return;
      void view.hitTest(event).then((response) => {
        // Prefer a real feature hit; fall back to nearest zone anchor at the point.
        const graphicHit = response.results.find((r) => r.type === 'graphic');
        const mapPoint = (event as { mapPoint?: Point }).mapPoint ?? response.ground?.mapPoint;
        const zone = this.resolveZone(graphicHit, mapPoint ?? null);
        if (zone) this.store.select({ kind: 'zone', id: zone.id });
      });
    });
  }

  /** Map a hit (or ground point) to the nearest zone by anchor distance. */
  private resolveZone(
    graphicHit: { graphic?: { attributes?: Record<string, unknown> } } | undefined,
    mapPoint: Point | null,
  ): Zone | null {
    const zones = this.store.getState().zones;

    // Strategy 1: OBJECTID match if the layer exposes it and a zone is bound to it.
    const oid = graphicHit?.graphic?.attributes?.['OBJECTID'];
    if (typeof oid === 'number') {
      const byOid = zones.find((z) => z.objectIds?.includes(oid));
      if (byOid) return byOid;
    }

    // Strategy 2 (default for the demo): nearest position anchor to the click.
    if (!mapPoint) return null;
    let best: Zone | null = null;
    let bestD = Infinity;
    for (const z of zones) {
      if (!z.position) continue;
      const [lon, lat] = z.position;
      const d = (lon - mapPoint.longitude) ** 2 + (lat - mapPoint.latitude) ** 2;
      if (d < bestD) {
        bestD = d;
        best = z;
      }
    }
    return best;
  }

  // ── 6.4 camera fly on selection ─────────────────────────────────────────────
  private subscribeCamera(): void {
    this.unsub = this.store.subscribe((state) => {
      const routeKey = state.routeTaskIds.join(':');
      if (routeKey !== this.lastRouteKey) {
        this.lastRouteKey = routeKey;
        this.syncCraneControl();
        void this.updateRouteLayer();
      }

      const sel = state.selection;
      const key = `${sel.kind}:${'id' in sel ? sel.id : ''}`;
      if (key === this.lastSelectionKey) return;
      this.lastSelectionKey = key;

      let zoneId: string | null = null;
      if (sel.kind === 'task') {
        const task = state.tasks.find((t) => t.id === sel.id);
        zoneId = task?.zoneId ?? null;
      } else if (sel.kind === 'zone') {
        zoneId = sel.id;
      }
      if (!zoneId) return;
      const zone = state.zones.find((z) => z.id === zoneId);
      if (!zone?.position || !this.view) return;
      const [lon, lat] = zone.position;
      // Fly to a close, building-scale view of this specific zone so the user
      // can see WHICH bubble the task maps to. We frame a Camera positioned a
      // short distance back and above the anchor, looking down at it, rather
      // than a far-out goTo on a target point (which stayed zoomed out).
      void this.view
        .goTo(
          {
            target: new Point({ longitude: lon, latitude: lat, z: 40 }),
            scale: 450,
            tilt: 72,
            heading: 25,
          },
          { duration: 900, easing: 'out-expo' },
        )
        .catch(() => undefined);
    });
  }

  // ── crane placement / route barrier ───────────────────────────────────────

  private setupCraneTools(): void {
    const view = this.view;
    if (!view) return;

    this.sketchVM = new SketchViewModel({
      view,
      layer: this.craneLayer,
      updateOnGraphicClick: false,
      defaultUpdateOptions: {
        toggleToolOnClick: false,
        enableZ: false,
      },
    });

    this.sketchVM.on('create', (event) => {
      if (event.state === 'complete') {
        this.craneGraphic = event.graphic;
        this.placingCrane = false;
        this.syncCraneControl();
        void this.updateRouteLayer(false);
      } else if (event.state === 'cancel') {
        this.placingCrane = false;
        this.syncCraneControl();
      }
    });

    this.sketchVM.on('update', (event) => {
      if (event.state === 'active' && event.toolEventInfo?.type === 'move-stop') {
        // Keep the route responsive while avoiding a solve request for every
        // raw pointer event emitted by the transform tool.
        this.scheduleRouteUpdate();
      } else if (event.state === 'complete') {
        this.placingCrane = false;
        this.syncCraneControl();
        this.cancelScheduledRouteUpdate();
        void this.updateRouteLayer(false);
      }
    });

    const control = document.createElement('div');
    control.className = 'scene-crane-control';
    control.setAttribute('aria-label', 'Route crane tools');

    this.placeCraneBtn = document.createElement('button');
    this.placeCraneBtn.textContent = 'Place Crane';
    this.placeCraneBtn.addEventListener('click', () => void this.placeCrane());

    this.moveCraneBtn = document.createElement('button');
    this.moveCraneBtn.textContent = 'Move Crane';
    this.moveCraneBtn.addEventListener('click', () => this.moveCrane());

    this.removeCraneBtn = document.createElement('button');
    this.removeCraneBtn.className = 'scene-crane-remove';
    this.removeCraneBtn.textContent = 'Remove';
    this.removeCraneBtn.addEventListener('click', () => this.removeCrane());

    control.append(this.placeCraneBtn, this.moveCraneBtn, this.removeCraneBtn);
    this.host.appendChild(control);
    this.craneControl = control;
    this.syncCraneControl();
  }

  private async placeCrane(): Promise<void> {
    const sketch = this.sketchVM;
    if (!sketch || this.placingCrane) {
      sketch?.cancel();
      this.placingCrane = false;
      this.syncCraneControl();
      return;
    }

    this.craneLayer.removeAll();
    this.craneGraphic = null;
    // Removing/replacing a crane immediately removes its old route barrier.
    void this.updateRouteLayer(false);
    this.placingCrane = true;
    this.syncCraneControl();

    try {
      if (!this.craneMesh) {
        this.craneMesh = await Mesh.createFromGLTF(new Point(), CRANE_MODEL_URL, {
          vertexSpace: 'local',
        });
        // this.craneMesh.scale(100);
        await this.craneMesh.load();
      }
      if (!this.placingCrane || sketch !== this.sketchVM) return;
      sketch.place(this.craneMesh);
    } catch (error) {
      this.placingCrane = false;
      this.syncCraneControl();
      console.warn('[crane] Unable to load or place crane model', error);
    }
  }

  private moveCrane(): void {
    if (!this.sketchVM || !this.craneGraphic) return;
    if (this.placingCrane) {
      this.sketchVM.cancel();
      this.placingCrane = false;
      this.syncCraneControl();
      return;
    }
    this.placingCrane = true;
    this.syncCraneControl();
    void this.sketchVM.update([this.craneGraphic], {
      tool: 'transform',
      enableRotation: true,
      enableScaling: false,
      toggleToolOnClick: false,
    });
  }

  private removeCrane(): void {
    this.sketchVM?.cancel();
    this.placingCrane = false;
    this.craneGraphic = null;
    this.craneLayer.removeAll();
    this.syncCraneControl();
    this.cancelScheduledRouteUpdate();
    void this.updateRouteLayer(false);
  }

  private syncCraneControl(): void {
    if (!this.craneControl || !this.placeCraneBtn || !this.moveCraneBtn || !this.removeCraneBtn) return;
    const hasRoute = this.store.getState().routeTaskIds.length === 2;
    if (!hasRoute && (this.placingCrane || this.craneGraphic)) {
      this.placingCrane = false;
      this.craneGraphic = null;
      this.craneLayer.removeAll();
      this.cancelScheduledRouteUpdate();
      this.sketchVM?.cancel();
    }
    this.craneControl.style.display = hasRoute ? '' : 'none';
    this.placeCraneBtn.style.display = this.craneGraphic ? 'none' : '';
    this.placeCraneBtn.classList.toggle('is-active', this.placingCrane && !this.craneGraphic);
    this.placeCraneBtn.textContent = this.placingCrane ? 'Cancel Placement' : 'Place Crane';
    this.moveCraneBtn.style.display = this.craneGraphic ? '' : 'none';
    this.moveCraneBtn.classList.toggle('is-active', this.placingCrane && Boolean(this.craneGraphic));
    this.moveCraneBtn.textContent = this.placingCrane ? 'Finish Moving' : 'Move Crane';
    this.removeCraneBtn.style.display = this.craneGraphic ? '' : 'none';
  }

  private scheduleRouteUpdate(): void {
    this.cancelScheduledRouteUpdate();
    this.routeUpdateTimer = window.setTimeout(() => {
      this.routeUpdateTimer = null;
      void this.updateRouteLayer(false);
    }, 180);
  }

  private cancelScheduledRouteUpdate(): void {
    if (this.routeUpdateTimer === null) return;
    window.clearTimeout(this.routeUpdateTimer);
    this.routeUpdateTimer = null;
  }

  private destroyCraneTools(): void {
    this.cancelScheduledRouteUpdate();
    this.sketchVM?.destroy();
    this.sketchVM = null;
    this.craneLayer.removeAll();
    this.craneGraphic = null;
    this.craneMesh = null;
    this.placingCrane = false;
    this.craneControl?.remove();
    this.craneControl = null;
    this.placeCraneBtn = null;
    this.moveCraneBtn = null;
    this.removeCraneBtn = null;
  }

  /**
   * Replace and solve the ArcGIS RouteLayer for the two Gantt-selected tasks.
   * Replacing the layer also guarantees that clearing/changing the pair cannot
   * leave an older solved route visible while the next network request runs.
   */
  private async updateRouteLayer(frameRoute = true): Promise<void> {
    const map = this.map;
    if (!map) return;
    const revision = ++this.routeSolveRevision;

    if (this.routeLayer) map.remove(this.routeLayer);
    this.routeLayer = null;

    const state = this.store.getState();
    const stops = state.routeTaskIds
      .map((taskId, index) => {
        const task = state.tasks.find((candidate) => candidate.id === taskId);
        const zone = state.zones.find((candidate) => candidate.id === task?.zoneId);
        if (!task || !zone?.position) return null;
        return new Stop({
          geometry: new Point({
            longitude: zone.position[0],
            latitude: zone.position[1],
            z: zone.position[2],
          }),
          name: `${index === 0 ? 'Start' : 'Destination'}: ${task.title}`,
          sequence: index + 1,
        });
      })
      .filter((stop): stop is Stop => stop !== null);

    if (stops.length === 0) return;

    const layer = new RouteLayer({
      title: 'Selected work-order route',
      stops,
      polygonBarriers: this.craneGraphic?.geometry?.extent
        ? [
          new PolygonBarrier({
            geometry: Polygon.fromExtent(this.craneGraphic.geometry.extent),
            name: 'Placed crane',
          }),
        ]
        : [],
      // url: 'https://natres-server.bd.esri.com/server/rest/services/El_Segundo_Refinery_Facility_Routing/NAServer/Route'
    });
    this.routeLayer = layer;
    map.add(layer);

    // RouteLayer requires at least two stops. The first remains in the layer
    // while the user chooses the destination from the Gantt.
    if (stops.length < 2) return;

    try {
      await layer.load();
      const parameters = new RouteParameters({
        findBestSequence: false,
        preserveFirstStop: true,
        preserveLastStop: true,
        returnDirections: true,
        outSpatialReference: { wkid: 4326 },
      });
      const result = await layer.solve(parameters);
      if (revision !== this.routeSolveRevision || layer !== this.routeLayer) return;
      // RouteLayer.solve() is the documented input to update(); 4.31's type
      // declarations disagree on one barrier property even though runtime and
      // the SDK samples use the result directly.
      layer.update(result as Parameters<RouteLayer['update']>[0]);
      const geometry = result.routeInfo?.geometry;
      if (frameRoute && geometry && this.view) {
        await this.view.goTo(geometry, { duration: 900, easing: 'out-expo' }).catch(() => undefined);
      }
    } catch (error) {
      if (revision === this.routeSolveRevision) {
        console.warn('[route] ArcGIS RouteLayer solve failed', error);
      }
    }
  }
}
