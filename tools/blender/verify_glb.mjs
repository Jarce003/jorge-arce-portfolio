import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error("Usage: node tools/blender/verify_glb.mjs <ladder-truck.glb> <firetrack-station.glb>");
  process.exit(2);
}

function parseGLB(file) {
  const bytes = readFileSync(resolve(file));
  assert.ok(bytes.length > 1500, "File is too small: " + file);
  assert.ok(bytes.length < 1_500_000, "Mobile budget exceeded (1.5MB): " + file);
  assert.equal(bytes.toString("ascii", 0, 4), "glTF", "Bad GLB signature: " + file);
  assert.equal(bytes.readUInt32LE(4), 2, "Expected glTF 2.0: " + file);
  assert.equal(bytes.readUInt32LE(8), bytes.length, "Incorrect GLB byte length");
  const jsonLength = bytes.readUInt32LE(12);
  assert.equal(bytes.toString("ascii", 16, 20), "JSON", "Missing JSON chunk");
  assert.ok(jsonLength > 0 && jsonLength < bytes.length - 20);
  const gltf = JSON.parse(bytes.toString("utf8", 20, 20 + jsonLength).trimEnd());
  assert.equal(gltf.asset?.version, "2.0", "Invalid glTF asset version");
  assert.ok(gltf.meshes?.length > 5, "No meaningful mesh content");
  assert.ok(gltf.materials?.length >= 4, "Expected PBR material colors");
  assert.ok(gltf.nodes?.length >= 12, "Expected separately editable objects");
  return { file, bytes: bytes.length, nodeNames: new Set(gltf.nodes.map((node) => node.name)) };
}

const [truck, station] = args.map(parseGLB);
for (const name of [
  "LadderTruck_ROOT",
  "AerialLadder_Pivot",
  "AerialLadder_Nozzle",
  "Axle1_L_WheelPivot",
  "Axle1_R_WheelPivot",
  "Axle2_L_WheelPivot",
  "Axle2_R_WheelPivot",
  "Axle3_L_WheelPivot",
  "Axle3_R_WheelPivot",
]) {
  assert.ok(truck.nodeNames.has(name), "Truck is missing named component: " + name);
}
for (const name of ["FireTrack_ROOT", "RedCanopy", "DigitalSignScreen"]) {
  assert.ok(station.nodeNames.has(name), "Station is missing component: " + name);
}
console.log("GLB assets verified.");
console.log("Ladder truck: " + (truck.bytes / 1024).toFixed(1) + " KiB");
console.log("FireTrack station: " + (station.bytes / 1024).toFixed(1) + " KiB");
console.log("Wheel pivots, ladder pivot and important building objects preserved.");
