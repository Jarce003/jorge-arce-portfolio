import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProjects, type ProjectId } from "@/content/projects";
import { AcreditacionesDemo } from "./acreditaciones-demo";
import { PortfolioBrowser } from "./portfolio-browser";
import {
  initialPose, closestStation, isAtStation, travelToStation,
  stations, type Controls, type Rescue, type StationId, type TruckPose,
} from "./physics";
import { MODEL_FILES } from "./stations";
import { WorldScene } from "./scene";

const projects=getProjects("es");
const assets=Object.values(MODEL_FILES);
type Direction="forward"|"reverse"|"left"|"right";
async function assetExists(path:string){
  try{
    const result=await fetch(path,{method:"HEAD",cache:"no-store"});
    return result.ok&&!(result.headers.get("content-type")??"").includes("text/html");
  }catch{return false;}
}
export function App(){
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
  useEffect(()=>{
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
  const complete=useCallback((id:StationId)=>{
    setBusy(false);
    setRescued(before=>new Set([...before,id]));
    setPanel(id);
    setAiOpen(false);
  },[]);
  const restart=useCallback(()=>{
    controls.current={forward:false,reverse:false,left:false,right:false};
    Object.assign(truck.current,initialPose());
    rescue.current=null;setNearby(null);setRescued(new Set());
    setPanel(null);setAiOpen(false);setBusy(false);setRewardDismissed(false);
    setPortfolioOpen(false);
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
    setPanel(null);setAiOpen(false);setNearby(id);
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
      if(map[key]){controls.current[map[key]]=true;event.preventDefault();}
      if(event.repeat)return;
      if(key==="e")discover();
      if(key==="r")restart();
      if(key==="n")setDay(v=>!v);
      if(key==="c")setOverview(v=>!v);
      if(key==="l")setLights(v=>!v);
      if(key==="escape"){
        setRewardDismissed(true);
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
  },[discover,restart]);
  const driveButton=(action:Direction,label:string,glyph:string)=>(
    <button type="button" className={"drive-button drive-"+action}
      aria-label={label} disabled={busy}
      onPointerDown={e=>{
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
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
  const showReward=allRescued&&!rewardDismissed;
  return (
    <main className="pilot portfolio-world" data-assets={assetStatus}
      data-view={portfolioOpen?"portfolio":"world"}>
      <div className="viewport" aria-label="Mundo interactivo de proyectos JarceDev">
        <Canvas frameloop={portfolioOpen?"never":"always"}
          dpr={mobileGraphics?[.7,1]:[.85,1.15]} shadows={!mobileGraphics}
          camera={{position:[0,8,13],fov:51,near:.1,far:130}}
          gl={{antialias:true,powerPreference:"high-performance"}}>
          <WorldScene day={day} overview={overview} modelMode={modelMode}
            lights={lights} reducedMotion={reducedMotion} rescued={rescued} controls={controls}
            truck={truck} rescue={rescue} onNearby={setNearby}
            onRescueComplete={complete} onMetrics={()=>{}}/>
        </Canvas>
      </div>
      <header className="topbar">
        <button type="button" className="identity" onClick={()=>setPortfolioOpen(false)}
          aria-label="JarceDev, volver al mundo 3D">
          <span className="identity-lines">
            <strong>JARCEDEV</strong>
            <small>Ingeniería de software · Costa Rica</small>
          </span>
        </button>
        <div className="header-actions">
          <button type="button" className="go-back" onClick={()=>{
            setFocusedProject("acreditaciones-app");
            setPortfolioOpen(true);
          }}>
            <span className="full-label">Mi perfil y proyectos</span>
            <span className="mobile-label">Proyectos</span>
          </button>
          <button type="button" className="reset-button" onClick={restart}>Reiniciar</button>
        </div>
      </header>
      <section className="tools" aria-label="Preferencias de exploración">
        <button type="button" onClick={()=>setDay(s=>!s)}
          aria-label={day?"Noche: activar modo nocturno":"Día: activar modo diurno"}
          title={day?"Activar modo noche":"Activar modo día"}>
          <span aria-hidden="true">{day?"☾":"☀"}</span>
          <span className="tool-label">{day?"Noche":"Día"}</span>
        </button>
        <button type="button" onClick={()=>setOverview(s=>!s)}
          aria-label={overview?"Seguir camión":"Vista aérea"}
          title={overview?"Seguir camión":"Vista aérea"}>
          <span aria-hidden="true">◈</span>
          <span className="tool-label">{overview?"Seguir camión":"Vista aérea"}</span>
        </button>
        <button type="button" onClick={()=>setLights(s=>!s)}
          aria-pressed={lights}
          title="Controla los destellos luminosos del camión; no produce sonido."
          aria-label={lights?"Apagar luces de emergencia":"Encender luces de emergencia"}>
          <span aria-hidden="true">✦</span>
          <span className="tool-label">{lights?"Luces de emergencia":"Luces apagadas"}</span>
        </button>
      </section>
      <nav className="stations-dock" aria-label="Proyectos disponibles">
        {projects.map(project=>{
          const id=project.station.id as StationId;
          const done=rescued.has(id);
          return (
            <button key={id} type="button" disabled={busy}
              aria-current={nearby===id?"location":undefined}
              onClick={()=>travel(id)} className={nearby===id?"current":""}>
              <span className="station-icon" aria-hidden="true">{project.icon}</span>
              <span className="station-details">
                <strong>{project.title}</strong>
                <small>{done?"Proyecto descubierto":"Por descubrir"}</small>
              </span>
              <span className={"station-progress "+(done?"completed":"pending")}
                aria-label={done?"Completado":"Pendiente"}>{done?"✓":"○"}</span>
            </button>
          );
        })}
      </nav>
      <section className="overview" aria-label="Introducción y recorrido">
        <span className="eyebrow">PORTAFOLIO INTERACTIVO</span>
        <h1>Conduce y descubre mis proyectos.</h1>
        <p>Selecciona uno de los cuatro edificios a la derecha o conduce hasta él.
          Pulsa «Descubrir» para apagar el incendio y conocer el proyecto.</p>
        <div className="journey-status" role="status">
          <span>Proyectos descubiertos</span>
          <strong>{rescued.size}/4</strong>
        </div>
        <div className="journey-track" aria-label={rescued.size+" de 4 proyectos descubiertos"}>
          <span style={{width:(rescued.size/stations.length*100)+"%"}}/>
        </div>
        <p className="key-hint">WASD: conducir · E: apagar fuego · C: cámara · N: día/noche</p>
      </section>
      <div className="mobile-progress" role="status" aria-label={"Proyectos descubiertos: "+rescued.size+" de 4"}>
        <span>Rescates</span> <strong>{rescued.size}/4</strong>
      </div>
      <section className="interaction" aria-live="polite">
        {selected?(
          <article className="project-info" aria-label={"Proyecto "+selected.title}>
            <div className="project-info-head">
              <span className="eyebrow">ESTACIÓN RECUPERADA</span>
              <button type="button" aria-label="Cerrar proyecto" onClick={()=>setPanel(null)}>×</button>
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
              <p><strong>El desafío</strong>{selected.problem}</p>
              <p><strong>La solución</strong>{selected.solution}</p>
            </div>
            <div className="technology-tags">
              {selected.technologies.map(item=><span key={item}>{item}</span>)}
            </div>
            <div className="actions">
              <button type="button" onClick={()=>{
                setFocusedProject(selected.slug);setPortfolioOpen(true);
              }}>
                Ver caso y capturas
              </button>
              {selected.demo==="acreditaciones-ai" && (
                <button type="button" onClick={()=>setAiOpen(value=>!value)}
                  aria-expanded={aiOpen}>
                  ✳ {aiOpen?"Cerrar demostración":"Probar asistente IA"}
                </button>
              )}
              <button type="button" onClick={()=>{setPanel(null);setAiOpen(false);}}>
                Seguir explorando
              </button>
            </div>
            {selected.demo==="acreditaciones-ai" && aiOpen && (
              <div className="ai-demo-panel">
                <AcreditacionesDemo lang="es" compact/>
              </div>
            )}
          </article>
        ):(
          <div className="rescue-card">
            <span aria-hidden="true">{busy?"💧":nearby?"🔥":"🚒"}</span>
            <div className="rescue-text">
              <strong>{busy?"Extinguiendo el incendio…":nearbyProject?
                nearbyProject.title:"Elige una estación y comienza"}</strong>
              <small>{busy?"La ficha del proyecto se abrirá al completar el rescate.":
                nearby?(rescued.has(nearby)?"Este proyecto ya fue descubierto. Abre su ficha.":
                "Pulsa Descubrir para apagar el fuego y abrir su ficha."):"Selecciona una estación a la derecha o conduce hasta ella."}</small>
            </div>
            <button type="button" className="discover"
              onClick={discover} disabled={!nearby||busy}>
              {nearby&&rescued.has(nearby)?"Ver proyecto":"💧 Descubrir"}
            </button>
          </div>
        )}
      </section>
      {showReward && (
        <section className="rescue-reward" role="dialog" aria-modal="false"
          aria-labelledby="rescue-reward-title" aria-describedby="rescue-reward-detail"
          data-testid="rescue-reward">
          <div className="reward-stars" aria-hidden="true">
            <span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span>
          </div>
          <div className="reward-medal" aria-hidden="true">🏅</div>
          <p className="eyebrow">MISIÓN COMPLETADA</p>
          <h2 id="rescue-reward-title">¡Todos los incendios extinguidos!</h2>
          <p id="rescue-reward-detail">
            Has recuperado las cuatro estaciones y descubierto los cuatro proyectos de JarceDev.
          </p>
          <div className="reward-total" aria-label="Cuatro de cuatro estaciones recuperadas">
            <strong>4/4</strong><span>Estaciones recuperadas</span>
          </div>
          <div className="reward-projects" aria-label="Proyectos descubiertos">
            {projects.map(project=>(
              <span key={project.slug}>
                <span aria-hidden="true">✓</span> {project.title}
              </span>
            ))}
          </div>
          <div className="reward-actions">
            <button type="button" onClick={()=>setRewardDismissed(true)}>
              Ver último proyecto
            </button>
            <button type="button" onClick={()=>{
              setRewardDismissed(true);setPanel(null);setAiOpen(false);
            }}>
              Seguir explorando
            </button>
          </div>
        </section>
      )}
      {portfolioOpen && <PortfolioBrowser key={focusedProject}
        initialProject={focusedProject} onBack={()=>setPortfolioOpen(false)}/>}
      <section className="drive-controls" aria-label="Conducción táctil">
        <div className="steering">
          {driveButton("left","Izquierda","↶")}
          {driveButton("right","Derecha","↷")}
        </div>
        <div className="pedals">
          {driveButton("reverse","Retroceder","↓")}
          {driveButton("forward","Acelerar","↑")}
        </div>
      </section>
    </main>
  );
}
