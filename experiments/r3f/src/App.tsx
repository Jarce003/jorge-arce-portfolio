import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProjects, type ProjectId } from "@/content/projects";
import { AcreditacionesDemo } from "./acreditaciones-demo";
import { PortfolioBrowser } from "./portfolio-browser";
import { WorldIcon } from "./world-icons";
import { WorldLanguageSwitch } from "./world-language-switch";
import { worldCopy } from "./world-copy";
import type { Locale } from "@/lib/i18n";
import {
  initialPose, closestStation, isAtStation, travelToStation,
  stations, type Controls, type Rescue, type StationId, type TruckPose,
} from "./physics";
import { MODEL_FILES } from "./stations";
import { WorldScene } from "./scene";

const lang:Locale=new URLSearchParams(window.location.search).get("lang")==="en"?"en":"es";
const projects=getProjects(lang);
const assets=Object.values(MODEL_FILES);
type Direction="forward"|"reverse"|"left"|"right";
async function assetExists(path:string){
  try{
    const result=await fetch(path,{method:"HEAD",cache:"no-store"});
    return result.ok&&!(result.headers.get("content-type")??"").includes("text/html");
  }catch{return false;}
}
export function App(){
  const t=worldCopy[lang];
  const controls=useRef<Controls>({forward:false,reverse:false,left:false,right:false});
  const truck=useRef<TruckPose>(initialPose());
  const rescue=useRef<Rescue|null>(null);
  const [day,setDay]=useState(true);
  const [portfolioOpen,setPortfolioOpen]=useState(false);
  const [focusedProject,setFocusedProject]=useState<ProjectId>("acreditaciones-app");
  const [overview,setOverview]=useState(false);
  const [lights,setLights]=useState(true);
  const [assetStatus,setAssetStatus]=useState<"loading"|"ready"|"partial">("loading");
  const [nearby,setNearby]=useState<StationId|null>(null);
  const [rescued,setRescued]=useState<ReadonlySet<string>>(()=>new Set());
  const [panel,setPanel]=useState<StationId|null>(null);
  const [aiOpen,setAiOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [rewardDismissed,setRewardDismissed]=useState(false);
  const [reducedMotion,setReducedMotion]=useState(false);
  const [mobileGraphics,setMobileGraphics]=useState(false);
  const [hintVisible,setHintVisible]=useState(true);
  useEffect(()=>{
    document.documentElement.lang=lang;
    document.title=lang==="es"?"JarceDev | Portafolio 3D":"JarceDev | 3D Portfolio";
    let mounted=true;
    Promise.all(assets.map(assetExists)).then(exists=>{
      if(mounted)setAssetStatus(exists.every(Boolean)?"ready":"partial");
    });
    const narrow=window.matchMedia("(max-width: 600px)");
    setMobileGraphics(narrow.matches);
    const syncNarrow=(e:MediaQueryListEvent)=>setMobileGraphics(e.matches);
    narrow.addEventListener("change",syncNarrow);
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const sync=(e:MediaQueryListEvent)=>setReducedMotion(e.matches);
    media.addEventListener("change",sync);
    return ()=>{
      mounted=false;
      media.removeEventListener("change",sync);
      narrow.removeEventListener("change",syncNarrow);
    };
  },[]);
  useEffect(()=>{
    const timeout=window.setTimeout(()=>setHintVisible(false),6500);
    return ()=>window.clearTimeout(timeout);
  },[]);
  const complete=useCallback((id:StationId)=>{
    setBusy(false);
    setRescued(before=>new Set([...before,id]));
    // A previous Escape must never suppress the final 4/4 award.
    setRewardDismissed(false);
    setPanel(id);
    setAiOpen(false);
  },[]);
  const restart=useCallback(()=>{
    controls.current={forward:false,reverse:false,left:false,right:false};
    Object.assign(truck.current,initialPose());
    rescue.current=null;setNearby(null);setRescued(new Set());
    setPanel(null);setAiOpen(false);setBusy(false);setRewardDismissed(false);
    setPortfolioOpen(false);setHintVisible(true);
    window.setTimeout(()=>setHintVisible(false),5500);
  },[]);
  const discover=useCallback(()=>{
    if(rescue.current)return;
    const id=closestStation(truck.current);
    if(!id||!isAtStation(truck.current,id))return;
    if(rescued.has(id)){setPanel(id);return;}
    controls.current={forward:false,reverse:false,left:false,right:false};
    truck.current.speed=0;
    if(reducedMotion){complete(id);return;}
    rescue.current={stationId:id,startedAt:performance.now()/1000};
    setBusy(true);setPanel(null);
  },[rescued,reducedMotion,complete]);
  const travel=useCallback((id:StationId)=>{
    if(rescue.current)return;
    Object.assign(truck.current,travelToStation(truck.current,id));
    controls.current={forward:false,reverse:false,left:false,right:false};
    setPanel(null);setAiOpen(false);setNearby(id);setHintVisible(false);
  },[]);
  useEffect(()=>{
    const map:Record<string,Direction>={
      w:"forward",arrowup:"forward",s:"reverse",arrowdown:"reverse",
      a:"left",arrowleft:"left",d:"right",arrowright:"right",
    };
    const keyDown=(event:KeyboardEvent)=>{
      if(event.altKey||event.ctrlKey||event.metaKey)return;
      const target=event.target;
      if(target instanceof HTMLElement &&
          (target.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)))return;
      const key=event.key.toLowerCase();
      if(portfolioOpen)return;
      if(map[key]){controls.current[map[key]]=true;event.preventDefault();setHintVisible(false);}
      if(/^[1-4]$/.test(key)&&!event.repeat){
        const station=stations[Number(key)-1];
        if(station)travel(station.id);
      }
      if(event.repeat)return;
      if(key==="e")discover();
      if(key==="r")restart();
      if(key==="n")setDay(v=>!v);
      if(key==="c")setOverview(v=>!v);
      if(key==="l")setLights(v=>!v);
      if(key==="escape"){
        setPanel(null);
        setAiOpen(false);
      }
    };
    const keyUp=(event:KeyboardEvent)=>{
      const key=event.key.toLowerCase();
      if(map[key])controls.current[map[key]]=false;
    };
    const release=()=>{controls.current={forward:false,reverse:false,left:false,right:false};};
    window.addEventListener("keydown",keyDown);
    window.addEventListener("keyup",keyUp);
    window.addEventListener("blur",release);
    return ()=>{
      window.removeEventListener("keydown",keyDown);
      window.removeEventListener("keyup",keyUp);
      window.removeEventListener("blur",release);
    };
  },[discover,restart,travel,portfolioOpen]);
  const driveButton=(action:Direction,label:string,glyph:string)=>(
    <button type="button" className={"drive-button drive-"+action}
      aria-label={label} disabled={busy}
      onPointerDown={e=>{
        e.preventDefault();
        setHintVisible(false);
        // Programmatic touch events and some mobile browsers can report a
        // pointer that has already ended. Driving must still work if capture
        // is unavailable.
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // The matching pointer-up/cancel still releases the control.
        }
        controls.current[action]=true;
      }}
      onPointerUp={()=>{controls.current[action]=false;}}
      onPointerCancel={()=>{controls.current[action]=false;}}
      onLostPointerCapture={()=>{controls.current[action]=false;}}>
      <span aria-hidden="true">{glyph}</span><small>{label}</small>
    </button>
  );
  const selected=panel?projects.find(project=>project.station.id===panel):null;
  const nearbyProject=nearby?projects.find(project=>project.station.id===nearby):null;
  const modelMode=assetStatus==="ready";
  const allRescued=rescued.size===stations.length;
  const progressReadable=t.progressLabel+": "+rescued.size+(lang==="es"?" de ":" of ")+stations.length;
  const showReward=allRescued&&!rewardDismissed;
  return (
    <main className="pilot portfolio-world" data-assets={assetStatus}
      data-view={portfolioOpen?"portfolio":"world"}>
      <div className="viewport" aria-label={t.worldLabel}>
        <Canvas frameloop={portfolioOpen?"never":"always"}
          dpr={mobileGraphics?[.7,1]:[.85,1.15]} shadows={!mobileGraphics}
          camera={{position:[0,8,13],fov:51,near:.1,far:130}}
          gl={{antialias:true,powerPreference:"high-performance"}}>
          <WorldScene day={day} overview={overview} modelMode={modelMode}
            lights={lights} reducedMotion={reducedMotion} rescued={rescued} controls={controls}
            truck={truck} rescue={rescue} onNearby={setNearby} onStationSelect={travel}
            onRescueComplete={complete} onMetrics={()=>{}}/>
        </Canvas>
      </div>
      <header className="topbar">
        <button type="button" className="identity" onClick={()=>setPortfolioOpen(false)}
          aria-label={t.homeLabel}>
          <span className="identity-lines">
            <strong>JARCEDEV</strong>
            <small>{t.tagline}</small>
          </span>
        </button>
        <div className="header-actions">
          <WorldLanguageSwitch lang={lang}/>
          <button type="button" className="go-back" onClick={()=>{
            setFocusedProject("acreditaciones-app");
            setPortfolioOpen(true);
          }} aria-label={t.projectsLabel}>
            <WorldIcon name="grid" size={17}/>
            <span>{t.projects}</span>
          </button>
          <button type="button" className="reset-button" onClick={restart}
            title={t.restartLabel} aria-label={t.restartLabel}>
            <WorldIcon name="reset" size={17}/>
            <span>{t.restart}</span>
          </button>
        </div>
      </header>
      <section className="tools" aria-label={t.worldControls}>
        <button type="button" onClick={()=>setDay(value=>!value)}
          aria-label={day?t.activateNight:t.activateDay}
          title={day?t.nightTitle:t.dayTitle}>
          <WorldIcon name={day?"moon":"sun"} size={20}/>
        </button>
        <button type="button" onClick={()=>setOverview(value=>!value)}
          aria-pressed={overview}
          aria-label={overview?t.chase:t.aerial}
          title={overview?t.chaseTitle:t.aerialTitle}>
          <WorldIcon name="camera" size={20}/>
        </button>
        <button type="button" onClick={()=>setLights(value=>!value)}
          aria-pressed={lights}
          title={lights?t.sirenOff:t.sirenOn}
          aria-label={lights?t.sirenOff:t.sirenOn}>
          <WorldIcon name="siren" size={20}/>
        </button>
      </section>
      <button type="button" className={"rescue-progress "+(allRescued?"is-complete":"")}
        onClick={()=>{if(allRescued)setRewardDismissed(false);}}
        disabled={!allRescued} aria-label={allRescued
          ?progressReadable+". "+t.rewardAction
          :progressReadable}
        title={allRescued?t.rewardAction:t.progressLabel}>
        {allRescued && <WorldIcon name="reset" size={15}/>}
        <span>{allRescued?t.reward:t.progress}</span>
        <strong>{rescued.size}/{stations.length}</strong>
      </button>
      {/* Kept in the accessibility tree but offscreen: projects are chosen
          by approaching/clicking a building or shortcuts 1–4, not a sidebar. */}
      <nav className="stations-dock" aria-label={t.stationAccess}>
        {projects.map(project=>(
          <button key={project.station.id} type="button" disabled={busy}
            onClick={()=>travel(project.station.id as StationId)}
            aria-label={t.goTo+" "+project.title}>{project.title}</button>
        ))}
      </nav>
      {hintVisible && !panel && !busy && !nearby && !showReward && (
        <div className="drive-hint" role="status">
          <span>{t.approach}</span>
          <button type="button" onClick={()=>setHintVisible(false)}
            aria-label={t.dismissHelp}>×</button>
        </div>
      )}
      <section className="interaction" aria-live="polite">
        {selected?(
          <article className="project-info" aria-label={t.project+" "+selected.title}>
            <div className="project-info-head">
              <span className="eyebrow">{t.stationRecovered}</span>
              <button type="button" aria-label={t.closeProject} onClick={()=>setPanel(null)}>×</button>
            </div>
            <div className="project-heading">
              <img src={selected.preview} alt={selected.previewAlt} loading="lazy"/>
              <div>
                <span className="project-category">{selected.category}</span>
                <h2>{selected.title}</h2>
                <p>{selected.status}</p>
              </div>
            </div>
            <div className="project-story">
              <p><strong>{t.challenge}</strong>{selected.problem}</p>
              <p><strong>{t.solution}</strong>{selected.solution}</p>
            </div>
            <div className="technology-tags">
              {selected.technologies.map(item=><span key={item}>{item}</span>)}
            </div>
            <div className="actions">
              <button type="button" onClick={()=>{
                setFocusedProject(selected.slug);setPortfolioOpen(true);
              }}>
                {t.viewCase}
              </button>
              {selected.demo==="acreditaciones-ai" && (
                <button type="button" onClick={()=>setAiOpen(value=>!value)}
                  aria-expanded={aiOpen}>
                  ✳ {aiOpen?t.hideDemo:t.tryDemo}
                </button>
              )}
              <button type="button" onClick={()=>{setPanel(null);setAiOpen(false);}}>
                {t.continue}
              </button>
            </div>
            {selected.demo==="acreditaciones-ai" && aiOpen && (
              <div className="ai-demo-panel">
                <AcreditacionesDemo lang={lang} compact/>
              </div>
            )}
          </article>
        ):nearby||busy?(
          <div className="rescue-card">
            <span aria-hidden="true">🔥</span>
            <div className="rescue-text">
              <strong>{busy?t.extinguishing:nearbyProject?
                nearbyProject.title:t.nearbyStation}</strong>
              <small>{busy?t.finishing:
                nearby?(rescued.has(nearby)?t.alreadyFound:
                t.putOutFire):t.approach}</small>
            </div>
            {(nearby||busy) && (
              <button type="button" className="discover"
                onClick={discover} disabled={!nearby||busy}>
                {nearby&&rescued.has(nearby)?t.viewProject:t.discover}
              </button>
            )}
          </div>
        ):null}
      </section>
      {showReward && (
        <div className="reward-backdrop" data-testid="reward-backdrop">
        <section className="rescue-reward" role="dialog" aria-modal="true"
          aria-labelledby="rescue-reward-title" aria-describedby="rescue-reward-detail"
          data-testid="rescue-reward">
          <div className="reward-stars" aria-hidden="true">
            <span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span>
          </div>
          <div className="reward-medal" aria-hidden="true">🏅</div>
          <p className="eyebrow">{t.mission}</p>
          <h2 id="rescue-reward-title">{t.missionTitle}</h2>
          <p id="rescue-reward-detail">
            {t.missionDescription}
          </p>
          <div className="reward-total" aria-label={"4/4 "+t.recoveredStations}>
            <strong>4/4</strong><span>{t.recoveredStations}</span>
          </div>
          <div className="reward-projects" aria-label={t.projectsFound}>
            {projects.map(project=>(
              <span key={project.slug}>
                <span aria-hidden="true">✓</span> {project.title}
              </span>
            ))}
          </div>
          <div className="reward-actions">
            <button type="button" onClick={()=>setRewardDismissed(true)}>
              {t.viewLast}
            </button>
            <button type="button" onClick={()=>{
              setRewardDismissed(true);setPanel(null);setAiOpen(false);
            }}>
              {t.continue}
            </button>
          </div>
        </section>
        </div>
      )}
      {portfolioOpen && <PortfolioBrowser key={focusedProject+"-"+lang}
        lang={lang} initialProject={focusedProject} onBack={()=>setPortfolioOpen(false)}/>}
      <section className="drive-controls" aria-label={t.driving}>
        <div className="steering">
          <div className="steering-wheel-art" aria-hidden="true">
            <svg viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="7"/>
              <circle cx="50" cy="50" r="10" fill="currentColor"/>
              <path d="M10 45h29l11 13 11-13h29M50 58v31" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/>
            </svg>
          </div>
          {driveButton("left",t.left,"←")}
          {driveButton("right",t.right,"→")}
        </div>
        <div className="pedals">
          {driveButton("reverse",t.reverse,"↓")}
          {driveButton("forward",t.forward,"↑")}
        </div>
      </section>
    </main>
  );
}
