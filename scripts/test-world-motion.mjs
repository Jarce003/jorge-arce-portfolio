import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";
import ts from "typescript";

const source = readFileSync(resolve("src/lib/world-motion.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics?.length ?? 0, 0);
const module = { exports: {} };
new Function("exports", "module", compiled.outputText)(module.exports, module);
const { dampingFactor } = module.exports;

test("Camera smoothing matches elapsed time at 30, 60 and 120 frames per second", () => {
  const move = (fps) => {
    let position = 0;
    for (let i = 0; i < fps; i++) {
      position += (10 - position) * dampingFactor(1 / fps, 7);
    }
    return position;
  };
  assert.ok(Math.abs(move(30) - move(60)) < 1e-10);
  assert.ok(Math.abs(move(60) - move(120)) < 1e-10);
});

test("Smoothing handles frame pauses without overshoot", () => {
  assert.equal(dampingFactor(0, 7), 0);
  assert.equal(dampingFactor(-1, 7), 0);
  assert.equal(dampingFactor(Number.NaN, 7), 0);
  assert.equal(dampingFactor(.1, 0), 0);
  assert.ok(dampingFactor(.05, 7) > dampingFactor(.01, 7));
  assert.ok(dampingFactor(.25, 7) < 1);
});

test("Mobile movement is not artificially capped at 30fps", () => {
  const controls = readFileSync(resolve("src/components/world/world-experience.tsx"), "utf8");
  assert.ok(!controls.includes("time - lastPaint < 30"));
  assert.ok(!controls.includes("let lastPaint = 0"));
  assert.ok(controls.includes("window.requestAnimationFrame(frame)"));
});

test("WebGL renderer reuses matrices and updates environment once per frame", () => {
  const renderer = readFileSync(resolve("src/components/world/world-renderer.ts"), "utf8");
  assert.ok(renderer.includes("const modelScratch = new Float32Array(16);"));
  assert.ok(renderer.includes("angle, roll, modelScratch)"));
  assert.ok(renderer.includes("dampingFactor(frameDelta, 7.0)"));
  const uniforms = renderer.match(/gl\.uniform1f\(daylightUniform, daylight\);/g) ?? [];
  assert.equal(uniforms.length, 1);
});
