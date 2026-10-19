import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
if (args.length !== 5) {
  console.error("Usage: node tools/blender/verify_glb.mjs ladder-truck.glb firetrack-station.glb evacuaplan-station.glb acreditaciones-station.glb hidrantes-station.glb");
  process.exit(2);
}

const checks = [
  { label:"American ladder truck", names:["LadderTruck_ROOT", "AerialLadder_Pivot",
      "AerialLadder_Nozzle", "Axle1_L_WheelPivot", "Axle1_R_WheelPivot",
      "Axle2_L_WheelPivot", "Axle2_R_WheelPivot", "Axle3_L_WheelPivot",
      "Axle3_R_WheelPivot"], maxMeshes:35 },
  { label:"FireTrack", names:["FireTrack_ROOT", "RedCanopy", "DigitalSignScreen"], maxMeshes:20 },
  { label:"EvacuaPlan", names:["EvacuaPlan_ROOT", "BlueprintTable",
      "EvacuationRoute_A", "ExitDoorFrame"], maxMeshes:24 },
  { label:"Acreditaciones", names:["Acreditaciones_ROOT", "AIConsoleScreen",
      "AINetworkHub"], maxMeshes:24 },
  { label:"Hidrantes", names:["Hidrantes_ROOT", "HeroHydrantBody",
      "HydrantMapBoardScreen"], maxMeshes:24 },
];

let combinedBytes = 0;
for (const [index, file] of args.entries()) {
  const bytes = readFileSync(resolve(file));
  assert.ok(bytes.length > 1500, "Unexpectedly small model: " + file);
  assert.ok(bytes.length <= 950_000, "Model exceeds mobile budget: " + file);
  assert.equal(bytes.toString("ascii", 0, 4), "glTF", "Invalid GLB signature");
  assert.equal(bytes.readUInt32LE(4), 2, "Expected glTF 2.0");
  assert.equal(bytes.readUInt32LE(8), bytes.length, "Invalid GLB byte length");
  const jsonLength = bytes.readUInt32LE(12);
  assert.equal(bytes.toString("ascii", 16, 20), "JSON", "Missing JSON chunk");
  const gltf = JSON.parse(bytes.toString("utf8", 20, 20 + jsonLength).trimEnd());
  assert.equal(gltf.asset?.version, "2.0");
  assert.ok(gltf.nodes?.length >= 5, "Missing separately addressable GLB hierarchy");
  assert.ok(gltf.meshes?.length >= 4, "Missing 3D geometry");
  assert.ok(gltf.materials?.length >= 4, "Expected original PBR materials");
  assert.ok(gltf.meshes.length <= checks[index].maxMeshes, "Too many draw meshes: " + file);
  const names = new Set(gltf.nodes.map(node=>node.name));
  for (const name of checks[index].names) {
    assert.ok(names.has(name), checks[index].label + ": missing animatable/identity node " + name);
  }
  combinedBytes += bytes.length;
  console.log(checks[index].label + ": " + (bytes.length / 1024).toFixed(1) +
    " KiB / " + gltf.meshes.length + " meshes / " + gltf.nodes.length + " nodes");
}
assert.ok(combinedBytes <= 2_200_000, "Total 3D assets exceed 2.2MB mobile cap");
console.log("Five original GLB assets validated; total " + (combinedBytes / 1024).toFixed(1) + " KiB.");
