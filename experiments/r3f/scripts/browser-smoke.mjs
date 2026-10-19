import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const root=resolve(import.meta.dirname,"..");
const screenshots=resolve(root,"test-artifacts");
await mkdir(screenshots,{recursive:true});
const url="http://127.0.0.1:4174";
const errors=[];
const server=spawn(process.execPath,[
  resolve(root,"node_modules","vite","bin","vite.js"),
  "--host","127.0.0.1","--port","4174","--strictPort",
],{cwd:root,stdio:["ignore","pipe","pipe"]});
let browser;

const delay=ms=>new Promise(resolveDelay=>setTimeout(resolveDelay,ms));
async function waitForServer(){
  for(let attempt=0;attempt<100;attempt++){
    if(server.exitCode!==null)throw Error("Vite stopped early");
    try{const r=await fetch(url);if(r.ok)return;}catch{/*starting*/}
    await delay(160);
  }
  throw Error("Vite did not start");
}
async function loadPage(page){
  await page.goto(url,{waitUntil:"networkidle",timeout:45000});
  await page.getByText("JARCEDEV / LABORATORIO 3D").waitFor();
  await page.locator("canvas").waitFor();
  await page.waitForFunction(()=>{
    const el=document.querySelector("canvas");
    return Boolean(el && el.width>0 && el.height>0);
  });
  // The status badge is intentionally hidden in portrait CSS.
  // Read its DOM text instead of requiring it to be visibly rendered.
  await page.waitForFunction(
    () => document.querySelector(".mini-state")?.textContent?.includes("5 GLB listos"),
    null, {timeout:18000},
  );
  await page.waitForTimeout(700);
}
async function rescueStation(page,name,label){
  // This is not an automatic rescue: select an approach point, then press
  // the same Discover control used with touch/keyboard. The truck moves
  // through the new four-project layout and all rescue states are tested.
  await page.getByRole("button",{name:new RegExp(name),exact:false}).first().click();
  const discover=page.getByRole("button",{name:/Descubrir/});
  await discover.waitFor();
  await page.waitForFunction(()=>{
    const button=[...document.querySelectorAll("button")].find(
      el=>el.textContent?.includes("Descubrir"),
    );
    return Boolean(button&&!button.disabled);
  },{timeout:10000});
  await discover.click();
  await page.waitForTimeout(710);
  await page.screenshot({path:resolve(screenshots,label+"-water.png")});
  await page.getByText("ESTACIÓN RECUPERADA").waitFor({timeout:12000});
  await page.screenshot({path:resolve(screenshots,label+"-recovered.png")});
  await page.getByRole("button",{name:"Cerrar proyecto"}).click();
  console.log(name+": rescue and project panel OK");
}
try{
  await waitForServer();
  browser=await chromium.launch({
    headless:true,
    args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader",
      "--enable-unsafe-swiftshader","--disable-dev-shm-usage"],
  });
  const desktop=await browser.newPage({viewport:{width:1366,height:768}});
  desktop.on("pageerror",error=>errors.push("Desktop: "+error.message));
  await loadPage(desktop);
  await desktop.screenshot({path:resolve(screenshots,"all-four-day.png")});
  const toggle=desktop.getByRole("button",{name:/Modelos GLB|Geometría básica/});
  assert.equal(await toggle.isDisabled(),false);
  assert.equal(await toggle.getAttribute("aria-pressed"),"true");
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-pressed"),"false");
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-pressed"),"true");
  await desktop.getByRole("button",{name:/Vista aérea/}).click();
  await desktop.waitForTimeout(400);
  await desktop.screenshot({path:resolve(screenshots,"all-four-blender-overview.png")});
  await desktop.getByRole("button",{name:/Día|Noche/}).click();
  await desktop.waitForTimeout(330);
  await desktop.screenshot({path:resolve(screenshots,"all-four-night.png")});
  console.log("5 real GLB assets, camera and day/night switch OK");

  for(const [name,label] of [
    ["FireTrack","firetrack"],["EvacuaPlan Studio","evacuaplan"],
    ["Acreditaciones","acreditaciones"],["Hidrantes","hidrantes"],
  ]){
    await rescueStation(desktop,name,label);
  }
  await desktop.getByText("4/4").waitFor({timeout:5000});
  console.log("Four stations discovered and counted correctly.");
  // Release the desktop WebGL context before creating a second software
  // renderer: shared SwiftShader/GPU budgets can stall mobile initialization.
  await desktop.close();

  const mobile=await browser.newPage({
    viewport:{width:390,height:844},isMobile:true,
    deviceScaleFactor:1,hasTouch:true,
  });
  mobile.on("pageerror",error=>errors.push("Mobile: "+error.message));
  await loadPage(mobile);
  await mobile.screenshot({path:resolve(screenshots,"mobile-portrait.png")});
  assert.equal(await mobile.getByRole("button",{name:"Acelerar"}).count(),1);
  assert.equal(await mobile.getByRole("button",{name:"Izquierda"}).count(),1);
  assert.equal(await mobile.locator(".stations-dock button").count(),4);
  const nav=mobile.getByRole("button",{name:/Acreditaciones/}).first();
  await nav.click();
  await mobile.getByRole("button",{name:/Descubrir/}).click();
  await mobile.getByText("ESTACIÓN RECUPERADA").waitFor({timeout:12000});
  console.log("Portrait viewport, touch controls and mobile discovery OK.");

  if(errors.length)throw Error("JavaScript errors:\n"+errors.join("\n"));
  console.log("All four-project R3F browser checks passed; screenshots: "+screenshots);
}catch(error){
  console.error("Browser smoke test failed",error);
  process.exitCode=1;
}finally{
  if(browser)await browser.close().catch(()=>{});
  server.kill("SIGTERM");
}
