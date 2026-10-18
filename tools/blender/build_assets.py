"""JarceDev — original low-poly American aerial ladder truck and FireTrack station.

Usage from repository root (Blender 4.x/5.x):
    blender --background --python tools/blender/build_assets.py

No third-party model downloads, images, logos or paid APIs. The generated
meshes are fully editable in the .blend file; their GLB exports are optimized
for a mobile-first WebGL scene. Geometry is illustrative, not a real vehicle
engineering model.

Blender coordinate system: Z up, +Y truck front. The glTF exporter converts
this to Y up and -Z forward, matching Three.js.
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path
import sys

import bpy

REPO = Path(__file__).resolve().parents[2]
DEFAULT_MODELS = REPO / "public" / "models" / "jarcedev" / "v1"
DEFAULT_EDITABLE = REPO / "tools" / "blender" / "output" / "jarcedev-assets.blend"

COLORS = {
    "red": ("#b72737", 0.24, 0.58),
    "red_bright": ("#e43b48", 0.16, 0.51),
    "white": ("#e9f1f5", 0.10, 0.45),
    "silver": ("#a9becb", 0.68, 0.26),
    "chrome": ("#d3e0e7", 0.83, 0.22),
    "dark": ("#1b2a37", 0.18, 0.76),
    "rubber": ("#161b24", 0.04, 0.95),
    "glass": ("#2a6179", 0.25, 0.30),
    "amber": ("#ffd28c", 0.04, 0.34),
    "cyan": ("#58c7de", 0.05, 0.44),
    "concrete": ("#9bafba", 0.03, 0.87),
}


def rgb(color: str):
    values = [int(color[index:index + 2], 16) / 255 for index in (1, 3, 5)]
    # Convert hex sRGB for physically reasonable Blender principled materials.
    return tuple(v / 12.92 if v < .04045 else ((v + .055) / 1.055) ** 2.4 for v in values)


def material(name: str, color: str, metallic: float = 0.0, roughness: float = .6):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*rgb(color), 1)
    mat.use_nodes = True
    bsdf = next(node for node in mat.node_tree.nodes if node.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*rgb(color), 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def collection(name: str):
    result = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(result)
    return result


def in_collection(ob, target):
    for previous in list(ob.users_collection):
        previous.objects.unlink(ob)
    target.objects.link(ob)
    return ob


def empty(name: str, target, parent=None):
    ob = bpy.data.objects.new(name, None)
    target.objects.link(ob)
    if parent is not None:
        ob.parent = parent
    return ob


def mesh_parent(ob, parent):
    # Object transforms are authored in local space: parent is initially at 0.
    ob.parent = parent
    return ob


def cube(name: str, location, dimensions, mat, target, parent=None, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    ob = bpy.context.object
    ob.name = name
    in_collection(ob, target)
    ob.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    ob.data.materials.append(mat)
    if bevel:
        mod = ob.modifiers.new("Single-segment hard edge", "BEVEL")
        mod.width = bevel
        mod.segments = 1
        if hasattr(mod, "affect"):
            mod.affect = "EDGES"
        # Avoid version-specific bevel arguments; keep stylized hard normals.
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if parent is not None:
        mesh_parent(ob, parent)
    return ob


def cylinder(name: str, location, radius, depth, mat, target, parent=None,
             rotation=(0, 0, 0), vertices=12):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation
    )
    ob = bpy.context.object
    ob.name = name
    in_collection(ob, target)
    ob.data.materials.append(mat)
    if parent is not None:
        mesh_parent(ob, parent)
    return ob


def truck(mats):
    target = collection("01_TRUCK")
    root = empty("LadderTruck_ROOT", target)
    red, white, silver, chrome = (mats[k] for k in ("red", "white", "silver", "chrome"))
    dark, rubber, glass = (mats[k] for k in ("dark", "rubber", "glass"))

    def b(name, xyz, dims, m=red):
        return cube(name, xyz, dims, m, target, root)

    # Original American three-axle aerial truck. Front faces +Y.
    b("Chassis", (0, 0, .96), (2.40, 6.65, .35), dark)
    b("MainEngineBody", (0, -.70, 1.65), (2.34, 4.56, 1.46))
    b("CabLower", (0, 2.00, 1.51), (2.35, 2.43, 1.51))
    b("CabUpper", (0, 1.92, 2.36), (2.30, 2.27, .34), white)
    b("FrontCabRoof", (0, 2.20, 2.58), (2.48, 1.96, .13), white)
    b("EngineRoof", (0, -.73, 2.52), (2.44, 4.51, .18), white)
    b("Grille", (0, 3.29, 1.37), (1.20, .15, .68), silver)
    b("FrontBumper", (0, 3.48, .91), (2.70, .40, .29), chrome)
    b("RearBumper", (0, -3.38, .93), (2.59, .31, .29), silver)
    b("FrontWindshield", (0, 3.255, 2.14), (1.99, .072, .53), glass)
    b("FrontWindshieldBar", (0, 3.301, 2.14), (.075, .05, .51), dark)
    b("LeftDoorWindow", (-1.205, 2.26, 2.12), (.046, .84, .49), glass)
    b("RightDoorWindow", (1.205, 2.26, 2.12), (.046, .84, .49), glass)

    # Strong red-and-white identity, narrow reflective strips, no insignia.
    for side in (-1, 1):
        b(("Left" if side < 0 else "Right") + "ReflectiveStripe",
          (side * 1.194, -.77, 1.53), (.045, 4.1, .13), white)
        b(("Left" if side < 0 else "Right") + "CabStripe",
          (side * 1.196, 2.15, 1.31), (.048, 1.65, .09), white)
        for panel in range(4):
            y = -.05 - panel * .87
            b(f"EquipmentDoor_{side}_{panel}",
              (side * 1.195, y, 1.88), (.06, .68, .57), silver)
            b(f"EquipmentHandle_{side}_{panel}",
              (side * 1.245, y, 2.07), (.05, .23, .055), dark)
        b(f"SideMirrorArm_{side}", (side * 1.42, 2.71, 2.15),
          (.38, .12, .10), chrome)
        b(f"SideMirror_{side}", (side * 1.57, 2.72, 2.12),
          (.23, .27, .36), dark)
        b(f"RearMarker_{side}", (side * .98, -3.14, 1.71),
          (.15, .12, .17), mats["red_bright"])
        b(f"FrontHeadlight_{side}", (side * .89, 3.31, 1.26),
          (.37, .10, .21), white)

    # Six independently addressable tire/hub groups for future rotation.
    for axle, y in enumerate((2.20, -.18, -2.35)):
        for side in (-1, 1):
            prefix = f"Axle{axle+1}_{'L' if side < 0 else 'R'}"
            pivot = empty(prefix + "_WheelPivot", target, root)
            pivot.location = (side * 1.25, y, .59)
            cylinder(prefix + "_Tire", (0, 0, 0), .57, .31,
                     rubber, target, pivot,
                     rotation=(0, math.pi / 2, 0), vertices=16)
            cylinder(prefix + "_Hub", (side * .172, 0, 0), .29, .10,
                     chrome, target, pivot,
                     rotation=(0, math.pi / 2, 0), vertices=12)

    # A pivoted telescopic ladder exported as named nested GLB nodes.
    ladder_pivot = empty("AerialLadder_Pivot", target, root)
    ladder_pivot.location = (0, -.63, 2.79)
    for stage in range(2):
        width = 1.10 - stage * .24
        length = 3.75 - stage * .30
        origin_y = -.48 + stage * 1.52
        for side in (-1, 1):
            cube(f"LadderStage{stage+1}_Rail_{side}",
                 (side * width * .5, origin_y, stage * .16),
                 (.095, length, .13), chrome if stage else silver,
                 target, ladder_pivot)
        for rung in range(12):
            y = origin_y - length * .44 + rung * length * .08
            cube(f"LadderStage{stage+1}_Rung_{rung}",
                 (0, y, stage * .16 + .045), (width + .08, .082, .10),
                 silver, target, ladder_pivot)
    cube("AerialLadder_Nozzle", (0, 2.75, .29), (.19, .43, .22),
         dark, target, ladder_pivot)
    cylinder("AerialLadder_Hinge", (0, -.12, -.14), .37, 1.57,
             chrome, target, ladder_pivot, rotation=(0, math.pi/2, 0))

    for side in (-1, 1):
        cylinder(f"RoofBeacon_{side}", (side * .80, 2.20, 2.82),
                 .18, .18, mats["red_bright"], target, root, vertices=10)

    print("Built original American aerial truck:", len(target.objects), "objects")
    return target, root


def firetrack(mats):
    target = collection("02_FIRETRACK_STATION")
    root = empty("FireTrack_ROOT", target)
    wall = mats["concrete"]
    white = mats["white"]
    red = mats["red"]
    dark = mats["dark"]
    silver = mats["silver"]
    glass = mats["glass"]

    def b(name, xyz, dims, mat=wall):
        return cube(name, xyz, dims, mat, target, root)

    # Garage faces positive Y and becomes -Z forward in Three.js.
    b("Foundation", (0, 0, -.06), (10.5, 8.4, .13), dark)
    b("ConcreteHall", (0, -.80, 2.85), (8.80, 6.0, 5.46))
    b("RedCanopy", (0, -.45, 5.72), (9.65, 6.90, .30), red)
    b("RoofTopWhite", (0, -.65, 5.91), (8.8, 5.95, .08), white)
    b("GarageLintel", (0, 2.22, 4.61), (8.47, .31, .47), white)

    # Visually prominent 3 emergency vehicle bays / doors.
    for bay in range(3):
        x = -2.73 + bay * 2.73
        b(f"Door{bay+1}_Frame", (x, 2.25, 2.64), (2.39, .12, 3.80), dark)
        b(f"Door{bay+1}_Glass", (x, 2.34, 2.60), (2.10, .08, 3.47), glass)
        for seam in range(5):
            b(f"Door{bay+1}_HorizontalRail{seam}", (x, 2.40, 1.20+seam*.58),
              (2.22, .06, .07), silver)

    for side in (-1, 1):
        b(f"CanopyStripe_{side}", (side*4.3, -.48, 5.73),
          (.15, 6.3, .18), white)
        b(f"SideLouver_{side}", (side*4.445, -.7, 3.4),
          (.06, 1.4, .80), glass)
        cylinder(f"FireTank_{side}", (side*4.98, 1.20, 1.05),
                 .35, 1.65, mats["red_bright"], target, root, vertices=12)
        cylinder(f"FireTankCap_{side}", (side*4.98, 1.20, 1.97),
                 .40, .18, silver, target, root)

    # Roof details and a high-tech monitoring mast.
    b("DigitalSignFrame", (0, 2.10, 5.14), (3.95, .18, .57), dark)
    b("DigitalSignScreen", (0, 2.201, 5.14), (3.70, .06, .39), mats["cyan"])
    cylinder("TelemetryMast", (3.5, -2.0, 6.68),
             .08, 1.55, silver, target, root, vertices=10)
    cylinder("TelemetryDisc", (3.5, -2.0, 7.45),
             .43, .12, mats["cyan"], target, root, vertices=12)

    # Practical forecourt painted markings around equipment access.
    for index in range(5):
        b(f"ApronLine_{index}", (-3.8+index*1.9, 3.7, .018),
          (.07, .85, .035), white)

    print("Built FireTrack station:", len(target.objects), "objects")
    return target, root


def export_collection(target, filepath):
    bpy.ops.object.select_all(action="DESELECT")
    for ob in target.all_objects:
        ob.select_set(True)
    active = next((obj for obj in target.all_objects if obj.type == "MESH"), None)
    if active is not None:
        bpy.context.view_layer.objects.active = active
    result = bpy.ops.export_scene.gltf(
        filepath=str(filepath),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
        export_apply=False,
    )
    if "FINISHED" not in result:
        raise RuntimeError(f"GLB exporter did not finish: {filepath}")
    if not filepath.is_file() or filepath.stat().st_size < 1000:
        raise RuntimeError(f"GLB output is missing or unexpectedly small: {filepath}")
    print("Exported", filepath.name, f"{filepath.stat().st_size / 1024:.1f} KiB")


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=DEFAULT_MODELS)
    parser.add_argument("--blend", type=Path, default=DEFAULT_EDITABLE)
    args = parser.parse_args(argv)
    args.output.mkdir(parents=True, exist_ok=True)
    args.blend.parent.mkdir(parents=True, exist_ok=True)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for target in list(bpy.data.collections):
        if target.name not in {"Collection"}:
            bpy.data.collections.remove(target)

    mats = {name: material("JD_" + name, *values) for name, values in COLORS.items()}
    truck_collection, truck_root = truck(mats)
    station_collection, station_root = firetrack(mats)

    export_collection(truck_collection, args.output / "ladder-truck.glb")
    export_collection(station_collection, args.output / "firetrack-station.glb")

    # Present the two original models side by side in the editable .blend.
    station_root.location.x = 13.0
    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.wm.save_as_mainfile(filepath=str(args.blend), compress=True)
    print("Saved editable source:", args.blend)


if __name__ == "__main__":
    main()
