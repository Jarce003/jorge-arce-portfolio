import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { resolve } from "node:path";
import ts from "typescript";

// Evaluate the real TypeScript matcher rather than a copied implementation.
// No browser, backend service, personal records or API keys are required.
const source = readFileSync(resolve("src/lib/sample-demo-queries.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics?.length ?? 0, 0, "Matcher must transpile");
const module = { exports: {} };
new Function("exports", "module", compiled.outputText)(module.exports, module);
const { matchSampleQuestion } = module.exports;
assert.equal(typeof matchSampleQuestion, "function");

const examples = {
  es: {
    priority: { prompt: "¿Qué bloques son prioritarios para evaluar?" },
    capacity: { prompt: "¿Cuántas fechas necesitamos con grupos de 20?" },
    performance: { prompt: "¿Qué bloque tuvo más reprobaciones en 2025?" },
    validity: { prompt: "¿Cuántos Maquinistas tienen su ciclo vigente?" },
  },
  en: {
    priority: { prompt: "Which blocks should be evaluated first?" },
    capacity: { prompt: "How many sessions do we need with groups of 20?" },
    performance: { prompt: "Which block had the most failures in 2025?" },
    validity: { prompt: "How many machinery operators are currently accredited?" },
  },
};

for (const lang of ["es", "en"]) {
  test("All four public sample questions match in " + lang, () => {
    for (const [id, entry] of Object.entries(examples[lang])) {
      assert.equal(matchSampleQuestion(entry.prompt, lang, examples[lang]), id);
    }
  });

  test("Punctuation and case do not interfere in " + lang, () => {
    const q = examples[lang].priority.prompt.toUpperCase().replaceAll("?", "");
    assert.equal(matchSampleQuestion(q, lang, examples[lang]), "priority");
  });

  test("Unsupported questions do not receive fabricated answers in " + lang, () => {
    for (const prompt of ["", " ", "Who won the World Cup?", "Cuánto gana un bombero"]) {
      assert.equal(matchSampleQuestion(prompt, lang, examples[lang]), null);
    }
  });
}
