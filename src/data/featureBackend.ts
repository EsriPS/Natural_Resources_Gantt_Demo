/**
 * Feature-class backend (addendum R10, R11, D-2).
 *
 * The .gdb authored in ArcGIS Pro is the record artifact; at RUNTIME the app
 * reads/writes **client-side ArcGIS FeatureLayers** built from the same data
 * (feature collections — no portal publish, D-2(b)). This gives us the real
 * Esri feature-class model and query API locally:
 *
 *   - People    → non-spatial FeatureLayer (table, no geometry)   (R10.1)
 *   - Equipment → non-spatial FeatureLayer (table, no geometry)   (R11.2)
 *   - WorkOrders→ polygon FeatureLayer (the ONLY spatial layer)   (R9.5, R10.2)
 *
 * People and equipment have NO geometry of their own; a person/machine inherits
 * a location only through the WorkOrder it is linked to (R10.2, D-2(a)).
 *
 * A `save()` path writes the current store state back into all three layers and
 * exports a local JSON snapshot — the feature layers thus reflect the live demo
 * state (D-2(c)); how the save persists is deliberately flexible.
 */

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Point from '@arcgis/core/geometry/Point';
import type { ScheduleStore } from '../store/ScheduleStore';
import type { Person, Equipment, Task, Zone } from '../store/types';

/** Radius (m) of the Asset work-zone footprint polygon in the WorkOrders FC. */
const ASSET_RADIUS_M = 9;

/** Fields for the non-spatial People table. */
const PEOPLE_FIELDS = [
  { name: 'ObjectID', type: 'oid' as const },
  { name: 'resource_id', type: 'string' as const },
  { name: 'crew', type: 'string' as const },
  { name: 'primary_trade', type: 'string' as const },
  { name: 'home_area', type: 'string' as const },
  { name: 'shift_start', type: 'date' as const },
  { name: 'shift_end', type: 'date' as const },
  { name: 'daily_capacity_hrs', type: 'double' as const },
  { name: 'availability', type: 'string' as const },
];

/** Fields for the non-spatial Equipment table (dimensions, D-3(a)). */
const EQUIPMENT_FIELDS = [
  { name: 'ObjectID', type: 'oid' as const },
  { name: 'equipment_id', type: 'string' as const },
  { name: 'name', type: 'string' as const },
  { name: 'type', type: 'string' as const },
  { name: 'height_m', type: 'double' as const },
  { name: 'width_m', type: 'double' as const },
  { name: 'length_m', type: 'double' as const },
  { name: 'weight_kg', type: 'double' as const },
];

/** Fields for the spatial WorkOrders feature class. */
const WORKORDER_FIELDS = [
  { name: 'ObjectID', type: 'oid' as const },
  { name: 'work_order_id', type: 'string' as const },
  { name: 'parent_wo', type: 'string' as const },
  { name: 'sap_notification', type: 'string' as const },
  { name: 'area', type: 'string' as const },
  { name: 'asset_id', type: 'string' as const },
  { name: 'asset_class', type: 'string' as const },
  { name: 'work_type', type: 'string' as const },
  { name: 'description', type: 'string' as const },
  { name: 'priority', type: 'string' as const },
  { name: 'required_trade', type: 'string' as const },
  { name: 'assigned_resource', type: 'string' as const },
  { name: 'status', type: 'string' as const },
  { name: 'planned_start', type: 'date' as const },
  { name: 'planned_finish', type: 'date' as const },
  { name: 'estimated_hours', type: 'double' as const },
  { name: 'percent_complete', type: 'double' as const },
  { name: 'required_equipment', type: 'string' as const }, // comma-joined ids
];

function ms(d?: string | null): number | null {
  return d ? new Date(d).getTime() : null;
}

/**
 * Build the WorkOrders footprint for a zone. Prefers the REAL authored polygon
 * (work_zones rings, WGS84) so the feature-class geometry matches what the map
 * draws; falls back to a geodesic circle around the anchor for zones that carry
 * no ring geometry.
 */
function assetPolygon(zone: Zone): Polygon | null {
  if (zone.rings && zone.rings.length > 0) {
    try {
      return new Polygon({
        rings: zone.rings as unknown as number[][][],
        spatialReference: { wkid: 4326 },
      });
    } catch {
      // fall through to the circle
    }
  }
  if (!zone.position) return null;
  const [lon, lat] = zone.position;
  const pt = new Point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });
  try {
    const buf = geometryEngine.geodesicBuffer(pt, ASSET_RADIUS_M, 'meters') as Polygon | null;
    return buf ?? null;
  } catch {
    return null;
  }
}

export interface FeatureBackendLayers {
  people: FeatureLayer;
  equipment: FeatureLayer;
  workOrders: FeatureLayer;
}

/**
 * The client-side feature-class backend. Construct once from the store; call
 * `save()` to push current store state back into the layers + export a snapshot.
 */
export class FeatureBackend {
  readonly people: FeatureLayer;
  readonly equipment: FeatureLayer;
  readonly workOrders: FeatureLayer;

  constructor(private store: ScheduleStore) {
    const s = store.getState();
    this.people = new FeatureLayer({
      id: 'people-table',
      title: 'People (Resources)',
      objectIdField: 'ObjectID',
      geometryType: undefined, // non-spatial table (R10.1)
      fields: PEOPLE_FIELDS as never,
      source: s.people.map((p, i) => this.personGraphic(p, i + 1)) as never,
    });
    this.equipment = new FeatureLayer({
      id: 'equipment-table',
      title: 'Equipment',
      objectIdField: 'ObjectID',
      geometryType: undefined, // non-spatial table (R11.2)
      fields: EQUIPMENT_FIELDS as never,
      source: s.equipment.map((e, i) => this.equipmentGraphic(e, i + 1)) as never,
    });
    this.workOrders = new FeatureLayer({
      id: 'workorders-fc',
      title: 'Work Orders',
      objectIdField: 'ObjectID',
      geometryType: 'polygon',
      spatialReference: { wkid: 4326 } as never,
      fields: WORKORDER_FIELDS as never,
      source: this.workOrderGraphics(s.tasks, s.zones) as never,
    });
  }

  private personGraphic(p: Person, oid: number): Graphic {
    return new Graphic({
      attributes: {
        ObjectID: oid,
        resource_id: p.id,
        crew: p.name,
        primary_trade: p.primaryTrade ?? p.crew,
        home_area: p.homeArea ?? null,
        shift_start: ms(p.shiftStart),
        shift_end: ms(p.shiftEnd),
        daily_capacity_hrs: p.dailyCapacityHrs ?? null,
        availability: p.availability ?? null,
      },
    });
  }

  private equipmentGraphic(e: Equipment, oid: number): Graphic {
    return new Graphic({
      attributes: {
        ObjectID: oid,
        equipment_id: e.id,
        name: e.name,
        type: e.type,
        height_m: e.heightM,
        width_m: e.widthM,
        length_m: e.lengthM,
        weight_kg: e.weightKg ?? null,
      },
    });
  }

  private workOrderGraphics(tasks: Task[], zones: Zone[]): Graphic[] {
    const zoneById = new Map(zones.map((z) => [z.id, z]));
    const out: Graphic[] = [];
    tasks.forEach((t, i) => {
      const zone = zoneById.get(t.zoneId);
      const geometry = zone ? assetPolygon(zone) : null;
      out.push(
        new Graphic({
          geometry: geometry ?? undefined,
          attributes: {
            ObjectID: i + 1,
            work_order_id: t.id,
            parent_wo: t.parentWoId ?? null,
            sap_notification: t.sapNotification ?? null,
            area: t.area ?? null,
            asset_id: t.assetId ?? t.zoneId,
            asset_class: t.assetClass ?? null,
            work_type: t.workType ?? null,
            description: t.description ?? t.title,
            priority: t.priority ?? null,
            required_trade: t.requiredTrade ?? null,
            assigned_resource: t.personId,
            status: t.status ?? null,
            planned_start: ms(t.start),
            planned_finish: ms(t.end),
            estimated_hours: t.estimatedHours ?? null,
            percent_complete: t.percentComplete ?? null,
            required_equipment: (t.requiredEquipment ?? []).join(',') || null,
          },
        }),
      );
    });
    return out;
  }

  layers(): FeatureBackendLayers {
    return { people: this.people, equipment: this.equipment, workOrders: this.workOrders };
  }

  /** Query helper (R10.4): resolve a person's current location via its tasks. */
  locationForPerson(personId: string): { zoneId: string; taskId: string }[] {
    return this.store
      .getState()
      .tasks.filter((t) => t.personId === personId)
      .map((t) => ({ zoneId: t.zoneId, taskId: t.id }));
  }
}
