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
// Layout correctness cannot be inferred from a successful build or a
// screenshot alone: assert that the actual 3D shell and essential controls
// fit within the device's available CSS viewport after rotation.
async function checkResponsiveWorld(page,width,height,label){
  // New device contexts must be created at the target orientation. Changing
  // viewport size on an isMobile:true Chromium context leaves its layout
  // viewport locked to the ORIGINAL phone width despite updating height.
  // That is an emulator limitation, not an actual orientation test.
  const size=page.viewportSize();
  assert.deepEqual(size,{width,height},label+": wrong emulated device dimensions");
  await page.waitForTimeout(350);
  // React Three Fiber measures its parent with ResizeObserver. On headless
  // SwiftShader it can take several frames to process an orientation change;
  // verify the FINAL measured viewport rather than a stale intermediate frame.
  const immediate=await page.evaluate(()=>({
    innerHeight:window.innerHeight,
    shellHeight:document.querySelector(".portfolio-world")?.getBoundingClientRect().height,
    canvasHeight:document.querySelector(".viewport canvas")?.getBoundingClientRect().height,
    containerHeight:document.querySelector(".viewport")?.getBoundingClientRect().height,
  }));
  console.log(label+": immediate resize measurements",JSON.stringify(immediate));
  try{
    await page.waitForFunction(expected=>{
      const canvas=document.querySelector(".viewport canvas");
      return canvas && Math.abs(canvas.getBoundingClientRect().height-expected)<2;
    },height,{timeout:12000,polling:200});
  }catch(error){
    console.warn(label+": 3D canvas did not settle after orientation change",
      error instanceof Error?error.message:String(error));
  }
  const frame=await page.evaluate(()=>{
    const shell=document.querySelector(".portfolio-world");
    const canvas=document.querySelector(".viewport canvas");
    const ids=[".topbar",".tools",".rescue-progress",".drive-controls",".steering",".pedals"];
    const bbox=node=>{
      if(!node)return null;
      const b=node.getBoundingClientRect();
      return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};
    };
    return {
      innerWidth:window.innerWidth,innerHeight:window.innerHeight,
      world:bbox(shell),canvas:bbox(canvas),
      controls:Object.fromEntries(ids.map(selector=>[selector,bbox(document.querySelector(selector))])),
      scrollHeight:document.documentElement.scrollHeight,
      wheel:document.querySelector(".steering-wheel-art")?.getBoundingClientRect().width??0,
      wheelDisplay:document.querySelector(".steering-wheel-art")
        ?getComputedStyle(document.querySelector(".steering-wheel-art")).display:null,
    };
  });
  assert.equal(frame.innerWidth,width,label+": viewport width");
  assert.equal(frame.innerHeight,height,label+": viewport height");
  assert(frame.world && Math.abs(frame.world.height-height)<2,
    label+": world must fill the display without forcing a minimum height");
  assert(frame.canvas && Math.abs(frame.canvas.height-height)<2,
    label+": canvas must fill available height; got "+
      JSON.stringify({canvas:frame.canvas,world:frame.world,screen:frame.innerHeight}));
  assert(frame.scrollHeight<=height+2,
    label+": document must not create a white/blank strip below the world");
  for(const [selector,box] of Object.entries(frame.controls)){
    assert(box && box.width>0 && box.height>0,label+": missing "+selector);
    assert(box.y>=-1 && box.bottom<=height+2,
      label+": "+selector+" clipped vertically "+JSON.stringify(box));
    assert(box.x>=-1 && box.right<=width+2,
      label+": "+selector+" outside left/right edges "+JSON.stringify(box));
  }
  assert(frame.wheelDisplay!=="none" && frame.wheel>0,
    label+": touch steering wheel must be visible");
  await capture(page,label+".png");
  console.log(label+": responsive full-height world, canvas and controls OK");
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

  // Independent device contexts emulate the TRUE viewport dimensions of a
  // physical landscape phone and portrait/landscape tablets. Each should be
  // fully visible immediately on page load, without a blank strip or clipping.
  await mobile.close();

  const devices=[
    {width:844,height:390,label:"phone-landscape"},
    {width:820,height:1180,label:"tablet-portrait"},
    {width:1180,height:820,label:"tablet-landscape"},
  ];
  for(const device of devices){
    const page=await browser.newPage({
      viewport:{width:device.width,height:device.height},
      isMobile:true,hasTouch:true,deviceScaleFactor:1,
    });
    page.on("pageerror",error=>errors.push(device.label+": "+error.message));
    await loadPage(page);
    await checkResponsiveWorld(page,device.width,device.height,device.label);
    await page.getByRole("button",{name:"Acelerar"}).tap();
    await page.close();
  }

  // The English route must use the SAME interactive 3D world, localized
  // project details, gallery, and working touch/keyboard controls.
  const english=await browser.newPage({viewport:{width:1200,height:790}});
  english.on("pageerror",error=>errors.push("English: "+error.message));
  await english.goto(url+"?lang=en",{waitUntil:"networkidle",timeout:45000});
  await english.locator("canvas").waitFor();
  assert.equal(await english.locator("html").getAttribute("lang"),"en");
  await english.getByRole("button",{name:"View profile and projects"}).waitFor();
  await english.getByRole("button",{name:/Rescues completed: 0 of 4/}).waitFor();
  await english.getByRole("button",{name:"Switch to aerial view"}).waitFor();
  // The project preview must not silently fall back to Spanish.
  await english.keyboard.press("1");
  await english.getByRole("button",{name:"Discover"}).click();
  await english.getByText("STATION RECOVERED").waitFor({timeout:12000});
  await english.getByText("Accreditations",{exact:true}).first().waitFor();
  await english.getByRole("button",{name:"View project and screenshots"}).click();
  const enGallery=english.locator('[data-testid="inline-portfolio"]');
  await enGallery.waitFor();
  await enGallery.getByText("HOW I WORK").waitFor();
  await enGallery.getByRole("link",{name:/Explore the 3D world/}).click();
  assert.equal(await enGallery.count(),0);
  await english.getByRole("button",{name:"Español"}).click();
  await english.getByRole("button",{name:"Ver perfil y proyectos"}).waitFor();
  assert.match(english.url(),/lang=es/);
  console.log("Bilingual 3D: English station, localized portfolio and ES/EN switch OK.");

  if(errors.length)throw Error("JavaScript errors:\n"+errors.join("\n"));
  console.log("All four-project R3F browser checks passed; screenshots: "+screenshots);
}catch(error){
  console.error("Browser smoke test failed",error);
  process.exitCode=1;
}finally{
  if(browser)await browser.close().catch(()=>{});
  server.kill("SIGTERM");
}
