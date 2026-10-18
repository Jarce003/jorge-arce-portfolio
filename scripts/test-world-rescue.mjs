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
  const stations = ["firetrack", "evacuaplan", "acreditaciones", "hidrantes"];
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
