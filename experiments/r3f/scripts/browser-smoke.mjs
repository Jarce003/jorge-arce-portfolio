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
async function capture(page,filename){
  // In headless SwiftShader a GPU readback occasionally never completes.
  // A screenshot is diagnostic, not a reason to fail functional navigation.
  try{
    await page.screenshot({path:resolve(screenshots,filename),
      animations:"disabled",timeout:2000});
  }catch(error){
    console.warn("Visual snapshot unavailable on software renderer:",filename,
      error instanceof Error?error.message:String(error));
  }
}
async function loadPage(page){
  await page.goto(url,{waitUntil:"networkidle",timeout:45000});
  await page.getByText("JARCEDEV",{exact:true}).waitFor();
  await page.locator("canvas").waitFor();
  await page.waitForFunction(()=>{
    const el=document.querySelector("canvas");
    return Boolean(el && el.width>0 && el.height>0);
  });
  // Production UI no longer exposes asset counts or debug badges.
  await page.waitForFunction(
    () => document.querySelector("main.portfolio-world")?.getAttribute("data-assets")==="ready",
    null, {timeout:20000},
  );
  await page.waitForTimeout(700);
}
async function rescueStation(page,name,label){
  // This is not an automatic rescue: select an approach point, then press
  // the same Discover control used with touch/keyboard. The truck moves
  // through the new four-project layout and all rescue states are tested.
  const shortcuts={"FireTrack":"2","EvacuaPlan Studio":"3","Acreditaciones":"1","Hidrantes":"4"};
  await page.keyboard.press(shortcuts[name]);
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
  await capture(page,label+"-water.png");
  await page.getByText("ESTACIÓN RECUPERADA").waitFor({timeout:12000});
  if(label==="firetrack"){
    const beforeOrigin=new URL(page.url()).origin;
    await page.getByRole("button",{name:"Ver caso y capturas"}).click();
    const localCase=page.locator('[data-testid="inline-portfolio"]');
    await localCase.waitFor({timeout:10000});
    await localCase.getByRole("heading",{name:"FireTrack"}).waitFor();
    assert.equal(new URL(page.url()).origin,beforeOrigin);
    await localCase.getByRole("link",{name:/Explorar mundo 3D/}).click();
    assert.equal(await localCase.count(),0);
    console.log("FireTrack case study and return open inline without redirects or new tabs.");
  }
  if(label==="hidrantes"){
    // Fourth distinct rescue unlocks a reward once, without opening a tab.
    const reward=page.locator('[data-testid="rescue-reward"]');
    await reward.waitFor({timeout:12000});
    await reward.getByText("¡Todos los incendios extinguidos!").waitFor();
    await capture(page,"mission-complete-reward.png");
    await reward.getByRole("button",{name:"Ver último proyecto"}).click();
    assert.equal(await reward.count(),0);
  }else{
    assert.equal(await page.locator('[data-testid="rescue-reward"]').count(),0);
  }
  // The case study is the approved compact inline card. No external tab,
  // lengthy landing page or duplicate case-study content is permitted.
  assert.equal(await page.getByRole("link",{name:/Ver caso completo/}).count(),0);
  if(label==="acreditaciones"){
    await page.getByRole("button",{name:/Probar asistente IA/}).click();
    await page.locator('[data-testid="acreditaciones-demo"]').waitFor();
    await page.locator('[data-testid="demo-submit"]').click();
    await page.locator('[data-testid="demo-metric"]').waitFor({timeout:15000});
    console.log("Approved Acreditaciones AI demo consulted successfully in 3D case card.");
  }
  await capture(page,label+"-recovered.png");
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
  await capture(desktop,"all-four-day.png");
  assert.equal(await desktop.getByText(/FPS aproximados|draw calls|Laboratorio 3D/).count(),0);
  assert.equal(await desktop.locator(".stations-dock button").count(),4);
  assert.equal(await desktop.locator(".overview").isVisible(),false);
  const dockSize=await desktop.locator(".stations-dock").boundingBox();
  assert(dockSize && dockSize.width<=2 && dockSize.height<=2,
    "The station navigation must be visually hidden without losing keyboard access");
  // The small help toast is allowed to expire while SwiftShader captures.
  assert.equal(await desktop.locator(".drive-hint").count()<=1,true);
  assert.equal(await desktop.getByRole("button",{name:/Rescates completados: 0 de 4/}).count(),1);
  // Navigate to the restored compact project gallery without losing the
  // localhost origin or opening the old production website.
  const previewOrigin=new URL(desktop.url()).origin;
  await desktop.getByRole("button",{name:/Ver perfil y proyectos/}).click();
  const gallery=desktop.locator('[data-testid="inline-portfolio"]');
  await gallery.waitFor();
  const approvedCards=gallery.getByRole("group",{name:"MIS PROYECTOS"}).getByRole("button");
  assert.equal(await approvedCards.count(),4);
  const galleryImages=gallery.locator('img[data-testid^="preview-"]');
  assert.equal(await galleryImages.count(),5);
  const approvedPaths=await galleryImages.evaluateAll(images=>images.map(node=>
    new URL(node.src).pathname
  ));
  assert.equal(approvedPaths.every(path=>path.startsWith("/projects/previews/")&&path.endsWith(".svg")),true);
  await galleryImages.evaluateAll(async images=>{
    await Promise.all(images.map(async node=>{
      if(!(node instanceof HTMLImageElement))throw Error("Portfolio art is missing");
      await node.decode();
      if(node.naturalWidth===0)throw Error("Project art failed to load");
    }));
  });
  await gallery.getByText("CÓMO TRABAJO").waitFor();
  await gallery.locator("p").filter({hasText:"Conozco el trabajo diario"}).waitFor();
  await gallery.getByRole("button",{name:/Consultar/}).click();
  await gallery.locator('[data-testid="demo-metric"]').waitFor({timeout:15000});
  await gallery.getByRole("link",{name:/Explorar mundo 3D/}).click();
  assert.equal(await gallery.count(),0);
  assert.equal(new URL(desktop.url()).origin,previewOrigin);
  await desktop.locator(".viewport canvas").waitFor();
  console.log("Four approved normalized artworks, original AI and in-app return to 3D OK.");
  await desktop.getByRole("button",{name:/Activar vista aérea/}).click();
  await desktop.waitForTimeout(400);
  await capture(desktop,"all-four-blender-overview.png");
  await desktop.getByRole("button",{name:/Activar modo noche/}).click();
  await desktop.waitForTimeout(330);
  await capture(desktop,"all-four-night.png");
  console.log("Four Blender buildings, web-style truck, camera and day/night switch OK");

  for(const [name,label] of [
    ["FireTrack","firetrack"],["EvacuaPlan Studio","evacuaplan"],
    ["Acreditaciones","acreditaciones"],["Hidrantes","hidrantes"],
  ]){
    await rescueStation(desktop,name,label);
  }
  await desktop.getByRole("button",{name:/Rescates completados: 4 de 4/}).waitFor();
  const desktopAward=desktop.locator('[data-testid="rescue-reward"]');
  // The fourth-station helper already verified the reward and closed it
  // with "Ver último proyecto". Reopen from 4/4 before asserting visibility.
  await desktop.getByRole("button",{name:/Ver recompensa/}).click();
  await desktopAward.waitFor({state:"visible",timeout:10000});
  assert.equal(await desktop.locator('[data-testid="reward-backdrop"]').isVisible(),true);
  await desktopAward.getByText("¡Todos los incendios extinguidos!").waitFor();
  await capture(desktop,"desktop-completion-award.png");
  await desktopAward.getByRole("button",{name:/Ver último proyecto/}).click();
  assert.equal(await desktopAward.count(),0);
  await desktop.getByRole("button",{name:/Ver recompensa/}).click();
  await desktopAward.waitFor({state:"visible"});
  await desktopAward.getByRole("button",{name:/Seguir explorando/}).click();
  console.log("Desktop: award appears at 4/4 and can be reopened after dismissal.");
  await desktop.getByRole("button",{name:/Reiniciar recorrido/}).click();
  await desktop.getByText("0/4").waitFor({timeout:5000});
  assert.equal(await desktop.locator('[data-testid="rescue-reward"]').count(),0);
  console.log("Reset clears completion reward, ready for another rescue run.");
  // Release the desktop WebGL context before creating a second software
  // renderer: shared SwiftShader/GPU budgets can stall mobile initialization.
  await desktop.close();

  const mobile=await browser.newPage({
    viewport:{width:390,height:844},isMobile:true,
    deviceScaleFactor:1,hasTouch:true,
  });
  mobile.on("pageerror",error=>errors.push("Mobile: "+error.message));
  await loadPage(mobile);
  await capture(mobile,"mobile-portrait.png");
  assert.equal(await mobile.getByRole("button",{name:"Acelerar"}).count(),1);
  assert.equal(await mobile.getByRole("button",{name:"Izquierda"}).count(),1);
  // Phone: same clean HUD, no sidebar and no blocking welcome card.
  const mobileDock=await mobile.locator(".stations-dock").boundingBox();
  assert(mobileDock===null || (mobileDock.width<=2 && mobileDock.height<=2),
    "Mobile project dock must not cover the 3D world");
  assert.equal(await mobile.locator(".overview").isVisible(),false);
  assert.equal(await mobile.locator(".steering-wheel-art").isVisible(),true);
  await mobile.getByRole("button",{name:/Rescates completados: 0 de 4/}).waitFor();
  for(const label of ["Activar modo noche","Activar vista aérea","Apagar luces de emergencia"]){
    assert.equal(await mobile.getByRole("button",{name:label}).isVisible(),true);
  }
  const mobileOrigin=new URL(mobile.url()).origin;
  await mobile.getByRole("button",{name:/Ver perfil y proyectos/}).click();
  const mobileGallery=mobile.locator('[data-testid="inline-portfolio"]');
  await mobileGallery.waitFor();
  await mobileGallery.getByText("CÓMO TRABAJO").waitFor();
  await mobileGallery.getByRole("link",{name:/Explorar mundo 3D/}).click();
  assert.equal(new URL(mobile.url()).origin,mobileOrigin);
  // A real touchscreen tap exercises browser-managed pointer capture;
  // synthetic pointerdown has no active pointer ID in headless Chromium.
  await mobile.getByRole("button",{name:"Acelerar"}).tap();
  // Completing ALL FOUR in portrait used to fail silently. Verify actual
  // visibility and ability to revisit the reward after closing it.
  for(const number of ["2","3","1","4"]){
    await mobile.keyboard.press(number);
    const discover=mobile.getByRole("button",{name:"Descubrir"});
    await discover.waitFor({state:"visible",timeout:10000});
    await discover.click();
    if(number!=="4"){
      await mobile.getByText("ESTACIÓN RECUPERADA").waitFor({timeout:12000});
      await mobile.getByRole("button",{name:"Cerrar proyecto"}).click();
      // Previously this made the 4/4 reward disappear completely.
      await mobile.keyboard.press("Escape");
    }
  }
  const phoneAward=mobile.locator('[data-testid="rescue-reward"]');
  await phoneAward.waitFor({state:"visible",timeout:12000});
  const rewardBox=await phoneAward.boundingBox();
  assert(rewardBox && rewardBox.width>100 && rewardBox.height>120,
    "Mobile reward must be fully sized and visible");
  await capture(mobile,"mobile-completion-award.png");
  await phoneAward.getByRole("button",{name:"Ver último proyecto"}).click();
  assert.equal(await phoneAward.count(),0);
  await mobile.getByRole("button",{name:/Ver recompensa/}).click();
  await phoneAward.waitFor({state:"visible"});
  await phoneAward.getByRole("button",{name:"Seguir explorando"}).click();
  console.log("Mobile: four rescues, visible 4/4 award, dismiss and reopen OK.");

  if(errors.length)throw Error("JavaScript errors:\n"+errors.join("\n"));
  console.log("All four-project R3F browser checks passed; screenshots: "+screenshots);
}catch(error){
  console.error("Browser smoke test failed",error);
  process.exitCode=1;
}finally{
  if(browser)await browser.close().catch(()=>{});
  server.kill("SIGTERM");
}
