import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const ignoredDirectories = new Set([
  ".git",
  ".next",
  "node_modules",
  "coverage",
  "dist",
]);

const checkedExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
]);

const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (
      entry.isDirectory() &&
      ignoredDirectories.has(entry.name)
    ) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    if (!checkedExtensions.has(path.extname(entry.name))) {
      continue;
    }

    const buffer = await readFile(fullPath);

    if (
      buffer.length >= 3 &&
      buffer[0] === 0xef &&
      buffer[1] === 0xbb &&
      buffer[2] === 0xbf
    ) {
      errors.push(
        `${path.relative(root, fullPath)}: contiene BOM UTF-8`,
      );
    }

    const text = buffer.toString("utf8");

    if (text.includes("\uFFFD")) {
      errors.push(
        `${path.relative(root, fullPath)}: contiene caracteres de reemplazo`,
      );
    }
  }
}

await walk(root);

if (errors.length > 0) {
  console.error("Se detectaron problemas de encoding:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exitCode = 1;
} else {
  console.log("Encoding verificado correctamente.");
}