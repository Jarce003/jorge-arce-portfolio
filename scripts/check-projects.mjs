import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const file = path.join(root, "src/content/projects.ts");
const sourceText = await readFile(file, "utf8");
const parsed = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const decl = parsed.statements
  .filter(ts.isVariableStatement)
  .flatMap((stmt) => [...stmt.declarationList.declarations])
  .find((item) => item.name.getText(parsed) === "projectDefinitions");

assert(decl?.initializer, "Missing projectDefinitions");
function unwrap(expr) {
  if (ts.isSatisfiesExpression(expr) || ts.isAsExpression(expr) || ts.isParenthesizedExpression(expr)) {
    return unwrap(expr.expression);
  }
  return expr;
}
function property(obj, name) {
  assert(ts.isObjectLiteralExpression(obj), "Expected object in project catalog");
  const node = obj.properties.find((prop) =>
    ts.isPropertyAssignment(prop) && prop.name.getText(parsed).replaceAll('"', "") === name);
  assert(node && ts.isPropertyAssignment(node), "Missing required field: " + name);
  return unwrap(node.initializer);
}
function value(obj, name) {
  const node = property(obj, name);
  assert(ts.isStringLiteral(node), "Expected string for " + name);
  return node.text;
}
function number(obj, name) {
  const node = property(obj, name);
  assert(ts.isNumericLiteral(node) || ts.isPrefixUnaryExpression(node), "Expected number for " + name);
  const v = Number(node.getText(parsed));
  assert(Number.isFinite(v), "Invalid numeric value: " + name);
  return v;
}
const arr = unwrap(decl.initializer);
assert(ts.isArrayLiteralExpression(arr), "projectDefinitions must be an array");
const entries = arr.elements;
assert(entries.length >= 4, "Expected existing four projects");
const ids = new Set(), stations = new Set(), positions = new Set();
const templates = new Set(["academy", "operations", "design-studio", "mapping-hub", "generic"]);
const previews = new Set();
for (const item of entries) {
  const slug = value(item, "slug");
  const preview = value(item, "preview");
  const world = property(item, "station");
  const id = value(world, "id");
  const x = number(world, "x"), z = number(world, "z");
  const structure = value(world, "structure");
  assert(!ids.has(slug), "Duplicate project slug " + slug);
  assert(!stations.has(id), "Duplicate station id " + id);
  assert(!positions.has(x + "," + z), "Overlapping station: " + slug);
  assert(Math.abs(x) <= 23 && Math.abs(z) <= 23, "Station outside drive bounds: " + slug);
  assert(templates.has(structure), "Unsupported structure: " + structure);
  assert(preview.startsWith("/projects/previews/") && preview.endsWith(".svg"), "Preview must use normalized SVG: " + slug);
  assert(!previews.has(preview), "Duplicated illustration: " + slug);
  ids.add(slug); stations.add(id); positions.add(x + "," + z); previews.add(preview);
  for (const lang of ["es", "en"]) {
    const copy = property(property(item, "locale"), lang);
    for (const key of ["title", "category", "problem", "solution", "status", "previewAlt"]) {
      assert(value(copy, key).trim(), "Empty " + lang + "." + key + " for " + slug);
    }
  }
  await access(path.join(root, "public", preview.slice(1)));
  const svg = await readFile(path.join(root, "public", preview.slice(1)), "utf8");
  assert(svg.includes('viewBox="0 0 1200 720"'), "Illustration dimensions differ: " + slug);
}
console.log("Validated", entries.length, "unique project records, stations, locales and visual assets.");
