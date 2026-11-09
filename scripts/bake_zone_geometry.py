"""
bake_zone_geometry.py — extract the real work-zone footprints from a file
geodatabase into src/data/gdb_source/work_zones.json.

This is the one documented step that turns Pro-authored polygons into the app's
zone geometry. The `work_zones` feature class (polygon, keyed by `Asset_ID`,
authored in ArcGIS Pro) is the geometry authority; this script reads it with
arcpy, densifies any curves (circles → vertex rings), reprojects to WGS84, and
writes a lean JSON the TS data generator consumes.

Run it whenever the polygons change in Pro, then regenerate plant.generated.ts.

Usage (ArcGIS Pro python env):
    "<arcgispro-py3>\\python.exe" scripts\\bake_zone_geometry.py <path-to.gdb> [fc_name]

    <path-to.gdb>  file geodatabase containing the work_zones feature class.
                   NOTE: arcpy chokes on a path with a ".zip" segment — copy the
                   extracted .gdb to a plain local path first if needed.
    [fc_name]      feature-class name (default: work_zones).

Output: src/data/gdb_source/work_zones.json
    [ { "assetId": "CU-T01", "centroid": [lon,lat], "rings": [[[lon,lat],...]] }, ... ]

The Asset_ID is the zone id; multiple work orders on the same asset/area share a
footprint (see remap in the data generator).
"""
import json
import os
import sys

import arcpy  # type: ignore

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "src", "data", "gdb_source", "work_zones.json")

# Densify curved segments to this spacing (metres) so circles become real
# vertex rings the web app can draw without curve support.
DENSIFY_M = 0.5


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: bake_zone_geometry.py <path-to.gdb> [fc_name]")
        return 2
    gdb = sys.argv[1]
    fc_name = sys.argv[2] if len(sys.argv) > 2 else "work_zones"
    fc = os.path.join(gdb, fc_name)

    if ".zip" in gdb.lower():
        print(
            "WARNING: the path contains '.zip' — arcpy may reject it. "
            "Copy the extracted .gdb to a plain local path and retry."
        )

    if not arcpy.Exists(fc):
        print(f"ERROR: feature class not found: {fc}")
        print("       feature classes present:", arcpy.ListFeatureClasses() if arcpy.env.workspace == gdb else "(set workspace to list)")
        return 1

    desc = arcpy.Describe(fc)
    if desc.shapeType != "Polygon":
        print(f"ERROR: {fc_name} is {desc.shapeType}, expected Polygon.")
        return 1

    field_names = {f.name for f in arcpy.ListFields(fc)}
    id_field = next((c for c in ("Asset_ID", "Asset ID", "AssetID", "asset_id") if c in field_names), None)
    if not id_field:
        print(f"ERROR: no Asset_ID field found. Fields: {sorted(field_names)}")
        return 1

    wgs84 = arcpy.SpatialReference(4326)
    out = []
    seen = set()
    with arcpy.da.SearchCursor(fc, [id_field, "SHAPE@"], spatial_reference=wgs84) as cur:
        for asset, geom in cur:
            if geom is None:
                continue
            if asset in seen:
                print(f"WARNING: duplicate Asset_ID {asset!r} — keeping first, skipping dupe.")
                continue
            seen.add(asset)
            dense = geom.densify("DISTANCE", DENSIFY_M, DENSIFY_M)
            rings = []
            for part in dense:
                ring = [[round(pt.X, 8), round(pt.Y, 8)] for pt in part if pt is not None]
                if ring:
                    rings.append(ring)
            out.append({
                "assetId": asset,
                "centroid": [round(geom.trueCentroid.X, 8), round(geom.trueCentroid.Y, 8)],
                "rings": rings,
            })

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print(f"Wrote {OUT}")
    print(f"  {len(out)} zones: {[z['assetId'] for z in out]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
