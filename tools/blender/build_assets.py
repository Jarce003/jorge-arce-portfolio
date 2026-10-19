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
    "mint": ("#56d8b3", 0.08, 0.40),
    "mint_dark": ("#2b817f", 0.16, 0.55),
    "violet": ("#a78bfa", 0.06, 0.49),
    "violet_dark": ("#504179", 0.13, 0.60),
    "sky": ("#d3eef2", 0.03, 0.59),
    "navy": ("#173649", 0.12, 0.62),
    "green": ("#40cf9a", 0.03, 0.44),
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

    # Recognizable North-American aerial apparatus details: radiator slats,
    # recessed light clusters, compartment hinges, step plates and stabilizers.
    for index in range(9):
        b(f"RadiatorSlat_{index}", (-.49 + index*.122, 3.382, 1.37),
          (.045, .038, .54), chrome)
    for side in (-1, 1):
        b(f"CabDoorSeam_{side}", (side*1.212, 1.56, 1.75),
          (.036, .048, 1.34), dark)
        b(f"CabDoorHandle_{side}", (side*1.237, 2.0, 1.71),
          (.055, .26, .065), chrome)
        b(f"CabStep_{side}", (side*1.35, 1.88, .93),
          (.41, 1.09, .115), silver)
        b(f"RearStep_{side}", (side*1.34, -2.98, .93),
          (.38, .69, .12), silver)
        for index in range(4):
            b(f"CompartmentHinge_{side}_{index}", (side*1.251, -.05-index*.87, 1.53),
              (.06, .50, .035), dark)
        b(f"OutriggerHousing_{side}", (side*1.20, -1.32, 1.07),
          (.47, 1.16, .30), dark)
        b(f"OutriggerFoot_{side}", (side*1.43, -1.32, .79),
          (.66, .62, .14), chrome)
        b(f"WarningStripeLower_{side}", (side*1.203, -.85, 1.15),
          (.055, 3.85, .095), mats["amber"])
        b(f"RoofMarker_{side}", (side*.89, 3.04, 2.72),
          (.26, .16, .115), mats["red_bright"])
    b("FrontCabSunVisor", (0, 3.30, 2.48), (2.24, .26, .11), red)
    b("RearChevronBar", (0, -3.36, 1.55), (2.16, .085, .20), mats["amber"])
    b("PumpControlPanel", (0, -.33, 2.48), (1.13, .84, .09), dark)
    for index in range(6):
        cylinder(f"PumpGauge_{index}", (-.45+index*.18, -.31, 2.54),
                 .055, .055, chrome, target, root,
                 rotation=(math.pi/2, 0, 0), vertices=12)

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

    # FireTrack is an extinguisher operations centre, not a generic warehouse.
    # Rows of unmistakable extinguisher silhouettes and a monitored service desk.
    for index in range(5):
        x = -3.40 + index*1.70
        cylinder(f"ExtinguisherBody_{index}", (x, 3.15, .79), .22, 1.08,
                 mats["red_bright"], target, root, vertices=16)
        cylinder(f"ExtinguisherValve_{index}", (x, 3.15, 1.42), .13, .15,
                 chrome, target, root, vertices=12)
        b(f"ExtinguisherHose_{index}", (x+.23, 3.14, 1.27), (.09, .10, .50), dark)
    b("ServiceDeskCounter", (0, 3.22, 1.06), (2.30, .54, .19), silver)
    for index in range(3):
        b(f"ServiceMonitor_{index}", (-.74+index*.74, 3.08, 1.61),
          (.54, .10, .67), dark)
        b(f"ServiceMonitorScreen_{index}", (-.74+index*.74, 3.14, 1.61),
          (.42, .025, .52), mats["cyan"])
    for x in (-4.15, 4.15):
        b(f"FrontFacadePillar_{x}", (x, 2.43, 2.81), (.20, .24, 5.00), white)

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


def evacuaplan(mats):
    """A playful architectural workshop and raised escape-map diorama."""
    target = collection("03_EVACUAPLAN")
    root = empty("EvacuaPlan_ROOT", target)
    white, sky, cyan = mats["white"], mats["sky"], mats["cyan"]
    navy, mint = mats["navy"], mats["mint"]

    def b(name, xyz, dims, mat=sky):
        return cube(name, xyz, dims, mat, target, root)

    b("StudioFoundation", (0, 0, -.07), (10.3, 8.8, .20), navy)
    b("DraftingHall", (0, -1.45, 1.53), (7.75, 5.1, 3.00), sky)
    b("GlassFacade", (0, 1.14, 1.66), (7.15, .11, 2.73), mats["glass"])
    b("RoofRim", (0, -1.45, 3.14), (8.25, 5.52, .29), cyan)

    for x in (-3.60, 3.60):
        b("ArchitecturalVertical_" + str(x), (x, .73, 1.5), (.25, 5.40, .33), white)
        b("VividFaçade_" + str(x), (x, .71, 1.65), (.075, 4.85, .16), cyan)

    # Oversized cutaway floor plan that looks like a floating design canvas.
    b("BlueprintTable", (0, -1.3, 4.20), (7.70, 5.2, .31), white)
    b("BlueprintSurface", (0, -1.3, 4.37), (7.16, 4.7, .055), mats["glass"])
    for x in (-2.5, -.75, 1.12, 2.46):
        b(f"PlanWallVertical_{x}", (x, -1.28, 4.51), (.09, 4.33, .19), sky)
    for y in (-2.5, -.52):
        b(f"PlanWallHorizontal_{y}", (0, y, 4.51), (6.80, .09, .19), sky)

    # Clear lime-green escape route from orange location marker to exit.
    b("EvacuationRoute_A", (-2.1, -2.84, 4.57), (2.16, .22, .08), mint)
    b("EvacuationRoute_B", (-1.02, -1.81, 4.57), (.22, 2.27, .08), mint)
    b("EvacuationRoute_C", (.91, -.77, 4.57), (3.92, .22, .08), mint)
    cylinder("YouAreHereMarker", (-3.17, -2.84, 4.60), .28, .21,
             mats["amber"], target, root, vertices=16)
    b("ExitDoorFrame", (2.90, -.77, 4.77), (.11, 1.04, .41), mint)
    b("ExitDoorPanel", (3.04, -.77, 4.69), (.11, .81, .25), sky)

    # Giant freestanding floor-plan drafting station and physical door
    # frame makes the project readable while driving at road speed.
    b("StudioDraftingDesk", (-1.25, 3.04, .81), (3.1, 1.35, .26), white)
    b("StudioDraftingSheet", (-1.25, 3.04, .965), (2.66, 1.13, .06), mats["glass"])
    b("SampleDoor_Left", (2.2, 3.35, 1.18), (.19, .24, 2.36), white)
    b("SampleDoor_Right", (4.29, 3.35, 1.18), (.19, .24, 2.36), white)
    b("SampleDoor_Lintel", (3.25, 3.35, 2.40), (2.28, .26, .22), white)
    b("SampleExitGlow", (3.25, 3.21, 2.39), (1.68, .13, .09), mint)

    # Oversized evacuation pictogram, illuminated exit and accessible wayfinding.
    b("WayfindingTotem", (-4.60, 2.95, 1.63), (.44, .42, 3.25), navy)
    b("WayfindingSign", (-4.60, 2.75, 2.65), (1.26, .15, .73), mint)
    b("WayfindingArrowShaft", (-4.60, 2.59, 2.62), (.75, .055, .09), white)
    b("ExitSymbolDoor", (3.25, 3.19, 1.85), (.71, .09, 1.01), mint)
    for index in range(5):
        b(f"PlanGrid_{index}", (-3.2+index*1.57, -1.30, 4.41),
          (.025, 4.50, .016), cyan)
    for index in range(4):
        b(f"ForecourtEscapeArrow_{index}", (-2.1 + index * 1.3, 3.84, .02),
          (.73, .29, .05), mint)
    print("Built EvacuaPlan design station:", len(target.objects), "objects")
    return target, root


def acreditaciones(mats):
    """Academy/analytics building with an abstract, strictly fictional AI UI."""
    target = collection("04_ACREDITACIONES")
    root = empty("Acreditaciones_ROOT", target)
    violet, light, navy = mats["violet"], mats["sky"], mats["navy"]
    cyan, chrome = mats["cyan"], mats["chrome"]

    def b(name, xyz, dims, mat=light):
        return cube(name, xyz, dims, mat, target, root)

    b("AcademyFoundation", (0, 0, -.05), (10.4, 8.85, .20), navy)
    b("AcademyMain", (0, -1.48, 1.85), (7.8, 5.8, 3.60), mats["violet_dark"])
    b("AcademyRoof", (0, -1.48, 3.83), (8.4, 6.36, .40), violet)
    for x in (-3.84, 3.84):
        b(f"AcademyWing_{x}", (x, -1.38, 1.91), (.56, 5.4, 3.61), light)
        b(f"AcademyWingAccent_{x}", (x, -1.30, 3.81), (.80, 5.65, .21), violet)

    for x in (-2.6, -1.3, 1.3, 2.6):
        b(f"SchoolColumn_{x}", (x, 1.37, 1.60), (.27, .28, 2.95), light)
    b("EntranceHeader", (0, 1.46, 3.07), (7.1, .34, .36), violet)
    b("EntranceGlass", (0, 1.51, 1.31), (6.68, .10, 1.77), mats["glass"])

    # A single heroic analytics billboard: abstract simulated charts,
    # absolutely no real participant data or API credentials.
    b("AIConsoleFrame", (0, 2.13, 2.47), (5.06, .22, 2.68), navy)
    b("AIConsoleScreen", (0, 2.27, 2.48), (4.76, .08, 2.40), mats["glass"])
    for index, height in enumerate((.54, 1.02, 1.36, .87, 1.22)):
        x = -1.65 + index * .85
        b(f"SyntheticAnalyticsBar_{index}", (x, 2.35, 1.44 + height/2),
          (.39, .075, height), violet if index % 2 else cyan)
    b("AIConsoleStatus", (0, 2.35, 3.26), (3.85, .11, .12), mats["green"])

    # Geometric intelligence emblem, nodes and connectors with no text.
    cylinder("AINetworkPylon", (-3.1, 2.70, 4.68), .16, 1.84,
             chrome, target, root, vertices=12)
    cylinder("AINetworkHub", (-3.1, 2.70, 5.67), .76, .27,
             violet, target, root, vertices=16)
    for index, x in enumerate((-3.72, -2.48)):
        cylinder(f"AINode_{index}", (x, 2.70, 6.27), .25, .39,
                 cyan, target, root, vertices=12)
    b("AIConnection", (-3.1, 2.7, 6.00), (1.40, .15, .12), light)
    for index in range(3):
        height = .67 + .46 * index
        x = -2.7 + 2.7 * index
        b(f"QualificationPodium_{index}", (x, 3.12, height / 2),
          (1.43, 1.16, height), violet)
        cylinder(f"QualificationMedal_{index}", (x, 3.12, height + .11),
                 .37, .18, mats["amber"], target, root, vertices=12)

    # Academy identity: illuminated qualification levels and a practice course.
    for index, height in enumerate((1.11, 1.66, 2.24)):
        x = -3.0 + index*2.9
        b(f"TrainingColumn_{index}", (x, 4.13, height/2),
          (.56, .46, height), violet)
        b(f"TrainingColumnCap_{index}", (x, 4.13, height+.08),
          (.81, .72, .16), mats["amber"])
    b("AcademyEntranceCanopy", (0, 2.61, 3.63),
      (3.74, 1.12, .24), chrome)
    for x in (-1.5, 1.5):
        b(f"AcademyEntrancePost_{x}", (x, 3.08, 1.59),
          (.19, .18, 3.12), light)
    print("Built Acreditaciones AI station:", len(target.objects), "objects")
    return target, root


def hidrantes(mats):
    """Urban waterworks plaza, obvious red hydrant, pipes and a map terminal."""
    target = collection("05_HIDRANTES")
    root = empty("Hidrantes_ROOT", target)
    navy, mint, white = mats["navy"], mats["mint"], mats["white"]
    red, chrome = mats["red_bright"], mats["chrome"]

    def b(name, xyz, dims, mat=navy):
        return cube(name, xyz, dims, mat, target, root)

    b("MappingSquare", (0, 0, -.06), (10.5, 8.8, .18), navy)
    b("WaterworksMain", (0, -2.14, .86), (8.6, 3.65, 1.72), mats["glass"])
    b("WaterworksRoof", (0, -2.14, 1.85), (9.3, 4.32, .32), mint)

    # Water tank and elevated map-transmitter structure.
    cylinder("WaterTowerColumn", (3.22, -2.42, 2.66), .24, 2.46,
             chrome, target, root, vertices=12)
    cylinder("WaterTowerReservoir", (3.22, -2.42, 4.20), 1.18, .98,
             mint, target, root, vertices=16)
    cylinder("WaterTowerCap", (3.22, -2.42, 4.77), 1.42, .20,
             white, target, root, vertices=16)
    cylinder("WaterTowerMappingBeacon", (3.22, -2.42, 5.01), .35, .29,
             mats["amber"], target, root, vertices=12)

    # Oversized iconic hydrant visible from far away, 3 outlets and cap.
    cylinder("HeroHydrantFoot", (-1.9, 2.33, .32), 1.10, .33,
             mats["mint_dark"], target, root, vertices=14)
    cylinder("HeroHydrantBody", (-1.9, 2.33, 1.17), .72, 1.42,
             red, target, root, vertices=16)
    cylinder("HeroHydrantCrown", (-1.9, 2.33, 1.93), .91, .30,
             mats["amber"], target, root, vertices=16)
    cylinder("HeroHydrantBonnet", (-1.9, 2.33, 2.28), .43, .52,
             red, target, root, vertices=12)
    for side in (-1, 1):
        cube(f"HydrantSideBranch_{side}",
             (-1.9 + side*.76, 2.33, 1.33), (1.02, .34, .38),
             red, target, root)
        cylinder(f"HydrantCoupling_{side}", (-1.9 + side*1.25, 2.33, 1.33),
                 .40, .20, chrome, target, root,
                 rotation=(0, math.pi/2, 0), vertices=12)

    # Oversized overhead map board visible from the street. QR-inspired
    # square pattern, entirely decorative; no real GPS or private locations.
    b("HydrantMapBoardFrame", (1.23, .15, 3.35), (3.48, .28, 2.75), navy)
    b("HydrantMapBoardScreen", (1.23, .31, 3.34), (3.18, .05, 2.47),
      mats["glass"])
    for index, x in enumerate((.05, 1.12, 2.19)):
        b(f"MapStreetN_{index}", (x, .35, 3.35), (.075, .08, 2.05), white)
    for index, z in enumerate((2.73, 3.70)):
        b(f"MapStreetE_{index}", (1.23, .36, z), (2.95, .09, .08), white)
    for index, x in enumerate((.72, 1.87)):
        cylinder(f"FictionalMapPin_{index}", (x, .45, 3.22), .20, .14,
                 mats["amber"] if index == 0 else mint, target, root, vertices=12)

    # Large blue water mains and visible valve discs.
    for index, x in enumerate((-3.1, -.1, 2.8)):
        b(f"WaterPipe_{index}", (x, 2.85, .38), (2.70, .34, .35), mats["cyan"])
    for index, x in enumerate((-2.95, 2.90)):
        cylinder(f"GateValve_{index}", (x, 2.82, .69), .43, .18,
                 chrome, target, root, vertices=12)

    # A recognizable valve wheel, flow indicators and water-network junctions.
    for index, x in enumerate((-2.95, 2.90)):
        cylinder(f"ValveRiser_{index}", (x, 2.82, 1.03), .10, .58,
                 chrome, target, root, vertices=12)
        cylinder(f"ValveHandwheel_{index}", (x, 2.82, 1.34), .47, .095,
                 red, target, root, vertices=16)
        for spoke in range(4):
            angle = spoke * math.pi/2
            b(f"ValveSpoke_{index}_{spoke}",
              (x+math.cos(angle)*.22, 2.82+math.sin(angle)*.22, 1.40),
              (.20, .09, .065), chrome)
    for index in range(4):
        b(f"NetworkFlowIndicator_{index}", (-3.0+index*1.65, 1.31, .06),
          (.91, .14, .085), mats["cyan"])
    print("Built Hidrantes map station:", len(target.objects), "objects")
    return target, root


def merge_export_meshes(target, keep_names=()):
    """Join same-material static meshes under a shared parent.

    This only runs AFTER saving the fully editable .blend source. Exported
    mesh count is dramatically smaller without touching independent wheel
    pivots, ladder pivot, nozzle or named station elements. Merge only
    objects already using the same parent and single material.
    """
    protected = set(keep_names)
    groups = {}
    for ob in list(target.objects):
        if ob.type != "MESH" or ob.name in protected:
            continue
        if len(ob.data.materials) != 1 or ob.parent is None:
            continue
        material_id = ob.data.materials[0].name
        key = (ob.parent.name, material_id)
        groups.setdefault(key, []).append(ob)

    joined_count = 0
    for (parent_name, mat_name), items in groups.items():
        if len(items) < 2:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for ob in items:
            ob.select_set(True)
        active = items[0]
        bpy.context.view_layer.objects.active = active
        bpy.ops.object.join()
        active.name = f"Batch_{parent_name}_{mat_name}"[:62]
        joined_count += len(items) - 1
    print(f"Optimized {target.name}: removed {joined_count} redundant draw objects")


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
    evac_collection, evac_root = evacuaplan(mats)
    acreditaciones_collection, acreditaciones_root = acreditaciones(mats)
    hidrantes_collection, hidrantes_root = hidrantes(mats)

    # Save *all individually editable pieces* in Blender before batching.
    for root, x, y in (
        (station_root, 13, 0),
        (evac_root, 0, 15),
        (acreditaciones_root, 13, 15),
        (hidrantes_root, -13, 15),
    ):
        root.location.x = x
        root.location.y = y
    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.wm.save_as_mainfile(filepath=str(args.blend), compress=True)
    print("Saved editable source with unmerged parts:", args.blend)
    for root in (station_root, evac_root, acreditaciones_root, hidrantes_root):
        root.location.x = 0
        root.location.y = 0

    for target, keep in (
        (truck_collection, {"AerialLadder_Nozzle"}),
        (station_collection, {"RedCanopy", "DigitalSignScreen"}),
        (evac_collection, {"BlueprintTable", "EvacuationRoute_A", "ExitDoorFrame"}),
        (acreditaciones_collection, {"AIConsoleScreen", "AINetworkHub"}),
        (hidrantes_collection, {"HeroHydrantBody", "HydrantMapBoardScreen"}),
    ):
        merge_export_meshes(target, keep_names=keep)
    export_collection(truck_collection, args.output / "ladder-truck.glb")
    export_collection(station_collection, args.output / "firetrack-station.glb")
    export_collection(evac_collection, args.output / "evacuaplan-station.glb")
    export_collection(acreditaciones_collection, args.output / "acreditaciones-station.glb")
    export_collection(hidrantes_collection, args.output / "hidrantes-station.glb")


if __name__ == "__main__":
    main()
