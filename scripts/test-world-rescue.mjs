import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";
import ts from "typescript";

const source = readFileSync(resolve("src/lib/world-fire.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics?.length ?? 0, 0, "World rescue utility must transpile");
const mod = { exports: {} };
new Function("exports", "module", compiled.outputText)(mod.exports, mod);
const {
  FIRE_FADE_SECONDS,
  RESCUE_DURATION_SECONDS,
  WATER_REACHES_FIRE_SECONDS,
  stationFireStrength,
  rescueIsFinished,
  waterStreamStrength,
  completedStations,
} = mod.exports;

test("Each undiscovered station keeps burning before water arrives", () => {
  assert.equal(stationFireStrength(false, 100, undefined, false), 1);
  assert.equal(stationFireStrength(false, 110, undefined, true), 1);
});

test("The fire fades only after the water reaches the roof", () => {
  const startedAt = 42;
  assert.ok(WATER_REACHES_FIRE_SECONDS > 0);
  assert.ok(WATER_REACHES_FIRE_SECONDS < RESCUE_DURATION_SECONDS);
  assert.equal(stationFireStrength(true, 43, 43, false), 1);
  assert.ok(stationFireStrength(true, 43 + FIRE_FADE_SECONDS / 2, 43, false) > 0);
  assert.equal(stationFireStrength(true, 43 + FIRE_FADE_SECONDS, 43, false), 0);
  assert.equal(stationFireStrength(true, startedAt, undefined, true), 0);
});

test("The water jet visibly accelerates, sprays, and stops", () => {
  const startedAt = 20;
  assert.equal(waterStreamStrength(19.9, startedAt), 0);
  assert.equal(waterStreamStrength(20, startedAt), 0);
  assert.ok(waterStreamStrength(20.34, startedAt) > 0);
  assert.equal(waterStreamStrength(21, startedAt), 1);
  assert.ok(waterStreamStrength(22.2, startedAt) > 0);
  assert.equal(waterStreamStrength(startedAt + RESCUE_DURATION_SECONDS, startedAt), 0);
  assert.equal(waterStreamStrength(startedAt + RESCUE_DURATION_SECONDS + .1, startedAt), 0);
  for (let time = startedAt; time < startedAt + RESCUE_DURATION_SECONDS; time += .012) {
    assert.ok(waterStreamStrength(time, startedAt) >= 0);
    assert.ok(waterStreamStrength(time, startedAt) <= 1);
  }
});

test("The project panel only opens after the rescue sequence finishes", () => {
  const startedAt = 9.3;
  assert.equal(rescueIsFinished(startedAt, startedAt), false);
  assert.equal(rescueIsFinished(startedAt + RESCUE_DURATION_SECONDS - .001, startedAt), false);
  assert.equal(rescueIsFinished(startedAt + RESCUE_DURATION_SECONDS, startedAt), true);
});

test("Discovering does not double-count a station; replay resets progress", () => {
  const stations = ["firetrack", "hidraulica", "evacuaplan", "acreditaciones", "hidrantes"];
  const rescued = new Set();
  assert.equal(completedStations(stations, rescued), 0);
  rescued.add("firetrack");
  rescued.add("firetrack");
  rescued.add("hidrantes");
  assert.equal(completedStations(stations, rescued), 2);
  rescued.clear();
  assert.equal(completedStations(stations, rescued), 0);
  assert.equal(stationFireStrength(false, 0, undefined, false), 1);
});


// Forgiving approach ranges and a flat starting crossroads are part of the
// rescue gameplay, and must not regress during future world refactors.
const proximitySource = readFileSync(resolve("src/lib/world-proximity.ts"), "utf8");
const proximityCompiled = ts.transpileModule(proximitySource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
assert.equal(proximityCompiled.diagnostics?.length ?? 0, 0, "Proximity utilities must transpile");
const proximityModule = { exports: {} };
new Function("exports", "module", proximityCompiled.outputText)(
  proximityModule.exports,
  proximityModule,
);
const {
  DISCOVERY_RADIUS,
  closestDiscoverableStation,
  isInDiscoveryRange,
} = proximityModule.exports;

test("Discovery activates before the truck reaches the building", () => {
  const station = { x: 14, z: 12 };
  assert.equal(DISCOVERY_RADIUS, 11.5);
  assert.ok(DISCOVERY_RADIUS > 7.3);
  assert.equal(isInDiscoveryRange({ x: 14, z: 23.4 }, station), true);
  assert.equal(isInDiscoveryRange({ x: 14, z: 23.6 }, station), false);
});

test("Closest station is selected without ambiguity in initial city layout", () => {
  const stations = [
    { id: "firetrack", x: -14, z: -12 },
    { id: "hidraulica", x: 14, z: -12 },
    { id: "evacuaplan", x: 14, z: -36 },
    { id: "acreditaciones", x: -14, z: 12 },
    { id: "hidrantes", x: 14, z: 12 },
  ];
  assert.equal(closestDiscoverableStation({ x: 0, z: 0 }, stations), null);
  assert.equal(closestDiscoverableStation({ x: 13.8, z: 22.9 }, stations), "hidrantes");
  assert.equal(closestDiscoverableStation({ x: -14, z: -1 }, stations), "firetrack");
  assert.equal(closestDiscoverableStation({ x: 14, z: 0 }, stations), null);
  assert.equal(closestDiscoverableStation({ x: 14, z: -26 }, stations), "evacuaplan");
  // No two activation zones overlap, including the new southern block.
  for (let i = 0; i < stations.length; i++) {
    for (let j = i + 1; j < stations.length; j++) {
      const dx = stations[i].x - stations[j].x;
      const dz = stations[i].z - stations[j].z;
      assert.ok(Math.hypot(dx, dz) > 2 * DISCOVERY_RADIUS);
    }
  }
});

test("Circular starting pad is removed; station plot bases stay intact", () => {
  const rendererSource = readFileSync(resolve("src/components/world/world-renderer.ts"), "utf8");
  assert.ok(!rendererSource.includes("cylinder(0, .12, 0, 8.6"));
  assert.ok(!rendererSource.includes("cylinder(0, .29, 0, 5.4"));
  assert.ok(rendererSource.includes("cylinder(st.x, .015, st.z"));
  const controlsSource = readFileSync(resolve("src/components/world/world-experience.tsx"), "utf8");
  assert.ok(controlsSource.includes("closestDiscoverableStation(position, worldStations)"));
  assert.ok(controlsSource.includes("if (!isInDiscoveryRange(truck, location))"));
});
