import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

const project = resolve(import.meta.dirname, "..");
const screenshots = resolve(project, "test-artifacts");
await mkdir(screenshots, { recursive: true });

const address = "http://127.0.0.1:4174";
const errors = [];
const server = spawn(
  process.execPath,
  [resolve(project, "node_modules", "vite", "bin", "vite.js"),
   "--host", "127.0.0.1", "--port", "4174", "--strictPort"],
  { cwd: project, stdio: ["ignore", "pipe", "pipe"] },
);
let browser;

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function untilServer() {
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error("Vite exited before readiness");
    try {
      const response = await fetch(address);
      if (response.ok) return;
    } catch { /* Wait for Vite startup. */ }
    await delay(170);
  }
  throw new Error("Local Vite server never became ready");
}

async function pageReady(page) {
  await page.goto(address, { waitUntil: "networkidle", timeout: 35_000 });
  await page.getByText("JARCEDEV / LABORATORIO 3D").waitFor();
  await page.locator("canvas").waitFor();
  await page.waitForFunction(() => {
    const canvas = document.querySelector("canvas");
    return !!canvas && canvas.width > 0 && canvas.height > 0;
  });
  await page.waitForTimeout(1100);
}

try {
  await untilServer();
  browser = await chromium.launch({
    headless: true,
    args: [
      "--enable-webgl",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--disable-dev-shm-usage",
    ],
  });

  const desktop = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  desktop.on("pageerror", (error) => errors.push("Desktop: " + error.message));
  await pageReady(desktop);
  await desktop.screenshot({ path: resolve(screenshots, "desktop-day.png") });
  console.log("Desktop startup and WebGL canvas: OK");

  const modelButton = desktop.getByRole("button", { name: /Geometría básica|Modelos GLB/ });
  await desktop.getByText("GLB disponibles").waitFor({ timeout: 12_000 });
  assert.equal(await modelButton.isDisabled(), false, "Models should load from the generated GLBs");
  await modelButton.click();
  await desktop.waitForTimeout(1000);
  await desktop.screenshot({ path: resolve(screenshots, "desktop-blender-models.png") });
  console.log("Exported Blender GLB loading and scene switch: OK");

  await desktop.getByRole("button", { name: /Día|Noche/ }).click();
  await desktop.waitForTimeout(450);
  await desktop.screenshot({ path: resolve(screenshots, "desktop-night.png") });
  console.log("Day/night switch: OK");

  // The truck starts 17 world units from the FireTrack building.
  // Driving in a straight line for a few seconds should enter the
  // 11.5-unit discovery range, without unrealistic teleportation.
  await desktop.keyboard.down("w");
  await desktop.waitForTimeout(2800);
  await desktop.keyboard.up("w");
  await desktop.getByRole("button", { name: /💧 Descubrir/ })
    .waitFor({ state: "visible" });
  await desktop.waitForFunction(() =>
    [...document.querySelectorAll("button")].some((element) =>
      element.textContent?.includes("Descubrir") && !element.disabled,
    ), { timeout: 14_000 });
  await desktop.getByRole("button", { name: /💧 Descubrir/ }).click();
  await desktop.waitForTimeout(750);
  await desktop.screenshot({ path: resolve(screenshots, "desktop-water-rescue.png") });
  await desktop.getByText("ESTACIÓN RECUPERADA").waitFor({ timeout: 12_000 });
  await desktop.screenshot({ path: resolve(screenshots, "desktop-recovered.png") });
  console.log("Movement, water rescue, fire extinguish and project panel: OK");

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true, deviceScaleFactor: 1, hasTouch: true,
  });
  mobile.on("pageerror", (error) => errors.push("Mobile: " + error.message));
  await pageReady(mobile);
  await mobile.screenshot({ path: resolve(screenshots, "mobile-portrait.png") });
  assert.equal(await mobile.getByRole("button", { name: "Acelerar" }).count(), 1);
  assert.equal(await mobile.getByRole("button", { name: "Izquierda" }).count(), 1);
  console.log("Mobile portrait UI and touch steering controls: OK");

  if (errors.length) throw new Error("Unexpected JavaScript errors:\n" + errors.join("\n"));
  console.log("All R3F browser smoke checks passed.");
  console.log("Screenshots: " + screenshots);
} catch (error) {
  console.error("R3F browser smoke test failed:", error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill("SIGTERM");
}
