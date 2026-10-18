import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  initialPose,
  nearFireTrack,
  type Controls,
  type TruckPose,
} from "./physics";
import { WorldScene } from "./scene";

const TRUCK_URL = "/models/jarcedev/v1/ladder-truck.glb";
const STATION_URL = "/models/jarcedev/v1/firetrack-station.glb";

async function isGlbAvailable(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" });
    const type = response.headers.get("content-type") ?? "";
    // Vite SPA fallback can return index.html with 200 for a missing model.
    return response.ok && !type.includes("text/html");
  } catch {
    return false;
  }
}

type Phase = "exploring" | "spraying" | "discovered";
type Action = "forward" | "reverse" | "left" | "right";

export function App() {
  const controls = useRef<Controls>({
    forward: false, reverse: false, left: false, right: false,
  });
  const pose = useRef<TruckPose>(initialPose());
  const rescueStarted = useRef<number | null>(null);
  const [day, setDay] = useState(true);
  const [overview, setOverview] = useState(false);
  const [lights, setLights] = useState(true);
  const [phase, setPhase] = useState<Phase>("exploring");
  const [near, setNear] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [useAssets, setUseAssets] = useState(false);
  const [metrics, setMetrics] = useState({ fps: 0, calls: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let running = true;
    Promise.all([isGlbAvailable(TRUCK_URL), isGlbAvailable(STATION_URL)])
      .then(([truck, station]) => {
        if (running) setAssetsReady(truck && station);
      });
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => {
      running = false;
      query.removeEventListener("change", onChange);
    };
  }, []);

  const onComplete = useCallback(() => {
    setPhase("discovered");
    rescueStarted.current = null;
  }, []);

  const restart = useCallback(() => {
    controls.current = { forward: false, reverse: false, left: false, right: false };
    Object.assign(pose.current, initialPose());
    rescueStarted.current = null;
    setNear(false);
    setPhase("exploring");
  }, []);

  const discover = useCallback(() => {
    if (phase === "discovered") return;
    if (phase === "spraying" || !nearFireTrack(pose.current)) return;
    controls.current = { forward: false, reverse: false, left: false, right: false };
    pose.current.speed = 0;
    if (reducedMotion) {
      setPhase("discovered");
      return;
    }
    rescueStarted.current = performance.now() / 1000;
    setPhase("spraying");
  }, [phase, reducedMotion]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement &&
          (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const key = event.key.toLowerCase();
      const map: Record<string, Action> = {
        w: "forward", arrowup: "forward",
        s: "reverse", arrowdown: "reverse",
        a: "left", arrowleft: "left",
        d: "right", arrowright: "right",
      };
      if (map[key]) {
        controls.current[map[key]] = true;
        event.preventDefault();
      }
      if (event.repeat) return;
      if (key === "e") discover();
      if (key === "r") restart();
      if (key === "c") setOverview((value) => !value);
      if (key === "n") setDay((value) => !value);
      if (key === "l") setLights((value) => !value);
    }
    function onKeyUp(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const map: Record<string, Action> = {
        w: "forward", arrowup: "forward",
        s: "reverse", arrowdown: "reverse",
        a: "left", arrowleft: "left",
        d: "right", arrowright: "right",
      };
      if (map[key]) controls.current[map[key]] = false;
    }
    function release() {
      controls.current = { forward: false, reverse: false, left: false, right: false };
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", release);
    };
  }, [discover, restart]);

  const setControl = (action: Action, held: boolean) => {
    controls.current[action] = held;
  };
  const driveButton = (action: Action, label: string, glyph: string) => (
    <button type="button" className={"drive-button drive-" + action}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setControl(action, true);
      }}
      onPointerUp={() => setControl(action, false)}
      onPointerCancel={() => setControl(action, false)}
      onLostPointerCapture={() => setControl(action, false)}
      aria-label={label}>
      <span aria-hidden="true">{glyph}</span>
      <small>{label}</small>
    </button>
  );

  const discovered = phase === "discovered";
  const busy = phase === "spraying";

  return (
    <main className="pilot">
      <div className="viewport" aria-label="Laboratorio tridimensional de JarceDev">
        <Canvas
          dpr={[1, 1.4]}
          shadows
          camera={{ position: [0, 8, 13], fov: 51, near: .1, far: 120 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}>
          <WorldScene
            day={day} overview={overview} modelMode={useAssets && assetsReady}
            lights={lights} discovered={discovered}
            controls={controls} truck={pose} rescueStarted={rescueStarted}
            onNearby={setNear} onRescueComplete={onComplete}
            onMetrics={(fps, calls) => setMetrics({ fps, calls })}
          />
        </Canvas>
      </div>

      <header className="topbar">
        <div className="identity">
          <span className="experiment-mark">JD</span>
          <div>
            <strong>JARCEDEV / LABORATORIO 3D</strong>
            <small>React Three Fiber · Comparación local, no publicada</small>
          </div>
        </div>
        <a href="http://localhost:3000/es" className="go-back"
          title="Volver a la versión WebGL2 estable en el puerto 3000">
          ← Mundo actual
        </a>
      </header>

      <section className="tools" aria-label="Opciones del prototipo">
        <button type="button" onClick={() => setDay((prev) => !prev)}>
          <span aria-hidden="true">{day ? "☀" : "☾"}</span> {day ? "Día" : "Noche"}
        </button>
        <button type="button" onClick={() => setOverview((prev) => !prev)}>
          ◈ {overview ? "Vista trasera" : "Vista aérea"}
        </button>
        <button type="button" onClick={() => setLights((prev) => !prev)}
          aria-pressed={lights}>🚨 {lights ? "Luces encendidas" : "Luces apagadas"}</button>
        <button type="button" disabled={!assetsReady} onClick={() => setUseAssets((prev) => !prev)}
          aria-pressed={useAssets}>
          ▦ {useAssets && assetsReady ? "Modelos GLB" : "Geometría básica"}
        </button>
        <span className="mini-state">{assetsReady ? "GLB disponibles" : "GLB pendientes de generar"}</span>
      </section>

      <section className="overview" aria-label="Información de la prueba">
        <span className="eyebrow">ENSAYO 01 / FIRETRACK</span>
        <h1>Conduce. Apaga. Descubre.</h1>
        <p>Una estación y un camión, sin sustituir todavía el mundo original.</p>
        <div className="indicators">
          <span><b>{metrics.fps || "—"}</b> FPS aproximados</span>
          <span><b>{metrics.calls || "—"}</b> draw calls</span>
          <span><b>{pose.current.z.toFixed(1)}</b> posición Z</span>
          <span><b>{discovered ? "1/1" : "0/1"}</b> rescates</span>
        </div>
        <p className="key-hint">WASD / Flechas · E Descubrir · C Cámara · N Día/Noche · R Reiniciar</p>
      </section>

      <section className="interaction" aria-live="polite">
        {discovered ? (
          <div className="project-info">
            <span className="eyebrow">ESTACIÓN RECUPERADA</span>
            <h2>🧯 FireTrack</h2>
            <p><strong>Problema:</strong> inspecciones e inventarios dispersos.</p>
            <p><strong>Solución:</strong> control de extintores, QR y mantenimiento.</p>
            <div className="actions">
              <button type="button" onClick={restart}>↻ Repetir rescate</button>
              <a href="http://localhost:3000/es/projects/firetrack" target="_blank" rel="noreferrer">
                Ver ficha original ↗
              </a>
            </div>
          </div>
        ) : (
          <div className="rescue-card">
            <span aria-hidden="true">{busy ? "💧" : near ? "🔥" : "🚒"}</span>
            <div className="rescue-text">
              <strong>{busy ? "Extinguiendo el incendio…" : near
                ? "FireTrack está a tu alcance" : "Conduce hacia FireTrack"}</strong>
              <small>{busy ? "El agua está apagando las llamas."
                : near ? "Descubrir inicia el chorro de agua." : "Acércate para activar Descubrir."}</small>
            </div>
            <button type="button" className="discover" onClick={discover}
              disabled={!near || busy}>
              💧 Descubrir
            </button>
          </div>
        )}
      </section>

      <section className="drive-controls" aria-label="Controles táctiles de conducción">
        <div className="steering">
          {driveButton("left", "Izquierda", "↶")}
          {driveButton("right", "Derecha", "↷")}
        </div>
        <div className="pedals">
          {driveButton("reverse", "Retroceder", "↓")}
          {driveButton("forward", "Acelerar", "↑")}
        </div>
      </section>

      <footer className="footnote">
        <span>Prototipo local separado · Sin datos privados · Escena estilizada</span>
        <span>{reducedMotion ? "Movimiento reducido activo" : "Animaciones habilitadas"}</span>
      </footer>
    </main>
  );
}
