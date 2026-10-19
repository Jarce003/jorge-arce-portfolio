import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";

import { getProjects } from "@/content/projects";

import {
  initialPose, closestStation, isAtStation, travelToStation,
  stations, type Controls, type Rescue, type StationId, type TruckPose,
} from "./physics";
import { MODEL_FILES } from "./stations";
import { WorldScene } from "./scene";

const projects=getProjects("es");
const urls=[
  "/models/jarcedev/v1/ladder-truck.glb",
  ...Object.values(MODEL_FILES),
];

async function glbExists(url:string) {
  try {
    const result=await fetch(url,{method:"HEAD",cache:"no-store"});
    return result.ok && !(result.headers.get("content-type")??"").includes("text/html");
  } catch {return false;}
}
type Direction="forward"|"reverse"|"left"|"right";

export function App(){
  const controls=useRef<Controls>({forward:false,reverse:false,left:false,right:false});
  const truck=useRef<TruckPose>(initialPose());
  const rescue=useRef<Rescue|null>(null);
  const [day,setDay]=useState(true);
  const [overview,setOverview]=useState(false);
  const [lights,setLights]=useState(true);
  const [assetStatus,setAssetStatus]=useState<"loading"|"ready"|"partial">("loading");
  const [useModels,setUseModels]=useState(false);
  const [nearby,setNearby]=useState<StationId|null>(null);
  const [rescued,setRescued]=useState<ReadonlySet<string>>(()=>new Set());
  const [panel,setPanel]=useState<StationId|null>(null);
  const [busy,setBusy]=useState(false);
  const [reducedMotion,setReducedMotion]=useState(false);
  const [metrics,setMetrics]=useState({fps:0,calls:0});

  useEffect(()=>{
    let active=true;
    Promise.all(urls.map(glbExists)).then(values=>{
      if(!active)return;
      const ready=values.every(Boolean);
      setAssetStatus(ready?"ready":"partial");
      setUseModels(ready);
    });
    const q=window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(q.matches);
    const update=(e:MediaQueryListEvent)=>setReducedMotion(e.matches);
    q.addEventListener("change",update);
    return ()=>{active=false;q.removeEventListener("change",update);};
  },[]);

  const finish=useCallback((stationId:StationId)=>{
    setBusy(false);
    setRescued(before=>new Set([...before,stationId]));
    setPanel(stationId);
  },[]);

  const restart=useCallback(()=>{
    controls.current={forward:false,reverse:false,left:false,right:false};
    Object.assign(truck.current,initialPose());
    rescue.current=null;
    setNearby(null);
    setRescued(new Set());
    setPanel(null);
    setBusy(false);
  },[]);

  const discover=useCallback(()=>{
    if(rescue.current)return;
    const id=closestStation(truck.current);
    if(!id||!isAtStation(truck.current,id))return;
    if(rescued.has(id)){setPanel(id);return;}
    controls.current={forward:false,reverse:false,left:false,right:false};
    truck.current.speed=0;
    if(reducedMotion){finish(id);return;}
    rescue.current={stationId:id,startedAt:performance.now()/1000};
    setBusy(true);
    setPanel(null);
  },[rescued,reducedMotion,finish]);

  const travel=useCallback((id:StationId)=>{
    if(rescue.current)return;
    Object.assign(truck.current,travelToStation(truck.current,id));
    controls.current={forward:false,reverse:false,left:false,right:false};
    setPanel(null);
    setNearby(id);
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
      if(key==="n")setDay(s=>!s);
      if(key==="c")setOverview(s=>!s);
      if(key==="l")setLights(s=>!s);
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
  const selected=panel?projects.find(item=>item.station.id===panel):null;
  const nearbyProject=nearby?projects.find(item=>item.station.id===nearby):null;
  const canDiscover=!busy && Boolean(nearby);
  const mode=useModels && assetStatus==="ready";

  return (
    <main className="pilot">
      <div className="viewport" aria-label="Laboratorio 3D con las cuatro estaciones JarceDev">
        <Canvas dpr={[1,1.35]} shadows
          camera={{position:[0,8,13],fov:51,near:.1,far:130}}
          gl={{antialias:true,powerPreference:"high-performance"}}>
          <WorldScene
            day={day} overview={overview} modelMode={mode}
            lights={lights} rescued={rescued} controls={controls}
            truck={truck} rescue={rescue} onNearby={setNearby}
            onRescueComplete={finish} onMetrics={(fps,calls)=>setMetrics({fps,calls})}/>
        </Canvas>
      </div>

      <header className="topbar">
        <div className="identity">
          <span className="experiment-mark">JD</span>
          <div>
            <strong>JARCEDEV / LABORATORIO 3D</strong>
            <small>4 estaciones · Blender + React Three Fiber · Solo local</small>
          </div>
        </div>
        <a href="http://localhost:3000/es" className="go-back">← Mundo actual</a>
      </header>

      <section className="tools" aria-label="Controles del mundo 3D">
        <button type="button" onClick={()=>setDay(s=>!s)}>
          {day?"☀ Día":"☾ Noche"}
        </button>
        <button type="button" onClick={()=>setOverview(s=>!s)}>
          ◈ {overview?"Vista trasera":"Vista aérea"}
        </button>
        <button type="button" onClick={()=>setLights(s=>!s)} aria-pressed={lights}>
          🚨 {lights?"Luces encendidas":"Luces apagadas"}
        </button>
        <button type="button" disabled={assetStatus!=="ready"}
          onClick={()=>setUseModels(s=>!s)} aria-pressed={mode}>
          ▦ {mode?"Modelos GLB":"Geometría básica"}
        </button>
        <span className="mini-state">
          {assetStatus==="ready"?"5 GLB listos":assetStatus==="loading"?"Cargando modelos":"Faltan modelos GLB"}
        </span>
      </section>

      <nav className="stations-dock" aria-label="Visitar estaciones por proyecto">
        {projects.map(project=>{
          const id=project.station.id;
          return (
            <button key={id} type="button" disabled={busy}
              aria-current={nearby===id?"location":undefined}
              onClick={()=>travel(id as StationId)}
              className={nearby===id?"current":""}>
              <span aria-hidden="true">{project.icon}</span>
              <span>{project.title}</span>
              {rescued.has(id)&&<span aria-label="Recuperada">✓</span>}
            </button>
          );
        })}
      </nav>

      <section className="overview" aria-label="Estado del laboratorio">
        <span className="eyebrow">CANDIDATO VISUAL / 4 PROYECTOS</span>
        <h1>Conduce. Apaga. Descubre.</h1>
        <p>Un solo recorrido. Cuatro edificios temáticos, con modelos originales de Blender.</p>
        <div className="indicators">
          <span><b>{metrics.fps||"—"}</b> FPS aproximados</span>
          <span><b>{metrics.calls||"—"}</b> draw calls</span>
          <span><b>{rescued.size}/4</b> rescates</span>
        </div>
        <p className="key-hint">WASD · E Descubrir · C Cámara · L Luces · N Día/Noche · R Reiniciar</p>
      </section>

      <section className="interaction" aria-live="polite">
        {selected?(
          <div className="project-info">
            <div className="project-info-head">
              <span className="eyebrow">ESTACIÓN RECUPERADA</span>
              <button type="button" aria-label="Cerrar proyecto" onClick={()=>setPanel(null)}>×</button>
            </div>
            <h2>{selected.icon} {selected.title}</h2>
            <p><strong>Problema:</strong> {selected.problem}</p>
            <p><strong>Solución:</strong> {selected.solution}</p>
            <div className="actions">
              <a href={"http://localhost:3000/es/projects/"+selected.slug}
                target="_blank" rel="noreferrer">
                {selected.demo?"Probar asistente IA ↗":"Ver proyecto ↗"}
              </a>
              <button type="button" onClick={()=>setPanel(null)}>Volver al mundo</button>
              {rescued.size===stations.length&&<button type="button" onClick={restart}>↻ Reiniciar</button>}
            </div>
          </div>
        ):(
          <div className="rescue-card">
            <span aria-hidden="true">{busy?"💧":nearby?"🔥":"🚒"}</span>
            <div className="rescue-text">
              <strong>{busy?"Rociando agua…":nearbyProject?
                nearbyProject.title+" a tu alcance":"Conduce o elige una estación"}</strong>
              <small>{busy?"Las llamas se apagarán al finalizar.":
                nearby?"Descubrir lanza agua y abre el proyecto.":
                "Selecciona un edificio arriba para viajar."}</small>
            </div>
            <button type="button" className="discover"
              onClick={discover} disabled={!canDiscover}>💧 Descubrir</button>
          </div>
        )}
      </section>

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

      <footer className="footnote">
        <span>Comparación aislada: no cambia la página principal.</span>
        <span>{reducedMotion?"Movimiento reducido":"Animación activa"}</span>
      </footer>
    </main>
  );
}
