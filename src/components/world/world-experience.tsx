"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  createWorldRenderer,
  worldStations,
  type WorldPosition,
} from "./world-renderer";

type Language = "es" | "en";
type StationId = (typeof worldStations)[number]["id"];
type ControlKey = "forward" | "reverse" | "left" | "right";
type ViewMode = "world" | "directory";
type SceneStatus = "loading" | "ready" | "fallback";

type StationCopy = {
  id: StationId;
  name: string;
  icon: string;
  type: string;
  problem: string;
  answer: string;
  technology: string;
  slug?: string;
};

const stationCopy: Record<Language, StationCopy[]> = {
  es: [
    {
      id: "firetrack",
      name: "FireTrack",
      icon: "🧯",
      type: "Gestión y trazabilidad",
      problem: "Inventarios, inspecciones y registros dispersos entre documentos y procesos manuales.",
      answer: "Una solución multiempresa que concentra controles, estados, registros, alertas y acceso QR.",
      technology: "Next.js · PostgreSQL · Supabase",
      slug: "firetrack",
    },
    {
      id: "evacuaplan",
      name: "EvacuaPlan Studio",
      icon: "🏢",
      type: "Herramientas especializadas",
      problem: "Crear croquis de evacuación con herramientas genéricas puede ser lento y complejo.",
      answer: "Un editor enfocado en símbolos, estructuras, transformaciones y documentos técnicos.",
      technology: "React · TypeScript · Konva",
      slug: "evacuaplan-studio",
    },
    {
      id: "acreditaciones",
      name: "Acreditaciones",
      icon: "🎓",
      type: "Reglas y planificación",
      problem: "Históricos extensos y reglas distintas para calcular ciclos, vigencias y prioridades.",
      answer: "Un sistema privado con controles de acreditación y servicios especializados de análisis y planificación.",
      technology: "Python · FastAPI · DuckDB · OR-Tools",
      slug: "acreditaciones-app",
    },
    {
      id: "hidrantes",
      name: "Hidrantes",
      icon: "📍",
      type: "Geolocalización operativa",
      problem: "Consultar la ubicación y características de hidrantes sobre el terreno.",
      answer: "Una aplicación con mapa público accesible mediante QR y gestión privada de ubicaciones.",
      technology: "Next.js · Supabase · Geolocalización",
    },
  ],
  en: [
    {
      id: "firetrack",
      name: "FireTrack",
      icon: "🧯",
      type: "Operational traceability",
      problem: "Inventory, inspection and maintenance data scattered across documents and manual workflows.",
      answer: "A multi-company product that brings inspections, records, alerts and QR access together.",
      technology: "Next.js · PostgreSQL · Supabase",
      slug: "firetrack",
    },
    {
      id: "evacuaplan",
      name: "EvacuaPlan Studio",
      icon: "🏢",
      type: "Specialized tools",
      problem: "Designing evacuation plans with generic tools is often slow and unnecessarily complex.",
      answer: "A purpose-built editor for symbols, structures, transformations and technical documents.",
      technology: "React · TypeScript · Konva",
      slug: "evacuaplan-studio",
    },
    {
      id: "acreditaciones",
      name: "Accreditations",
      icon: "🎓",
      type: "Rules and planning",
      problem: "Extensive historical records and multiple rules for calculating validity, cycles and priorities.",
      answer: "A private system for accreditation control with dedicated analytics and optimization services.",
      technology: "Python · FastAPI · DuckDB · OR-Tools",
      slug: "acreditaciones-app",
    },
    {
      id: "hidrantes",
      name: "Hydrants",
      icon: "📍",
      type: "Operational mapping",
      problem: "Finding the location and characteristics of hydrants while working in the field.",
      answer: "A public QR-accessible map with a private location management module.",
      technology: "Next.js · Supabase · Geolocation",
    },
  ],
};

const copy = {
  es: {
    eyebrow: "JARCEDEV / MUNDO INTERACTIVO",
    headline: "Explora los problemas que convertí en soluciones.",
    description: "Soy Ingeniero en Sistemas. Identifico mejoras, defino productos y coordino su construcción con ayuda de IA. Conduce un camión escalera americano y descubre cómo nace cada proyecto.",
    explore: "Explorar en 3D",
    directory: "Ver proyectos directamente",
    controls: "WASD o flechas · conducir el camión escalera",
    keyboard: "E · abrir proyecto",
    reset: "R · reiniciar",
    steer: "Girar",
    accelerate: "Avanzar",
    reverse: "Retroceder",
    guide: "Guía",
    guideText: "Conduce hacia las cuatro estaciones. Al acercarte, pulsa E o el botón «Descubrir» para conocer el problema y la solución. También puedes seleccionar una estación de la lista para viajar directamente.",
    close: "Cerrar",
    discover: "Descubrir",
    visit: "Ir a la estación",
    caseStudy: "Conocer el caso de estudio",
    moreProjects: "Ver proyectos completos",
    problem: "El problema",
    answer: "La solución",
    technologies: "Tecnologías utilizadas",
    back: "Volver al mundo",
    waiting: "Preparando el entorno tridimensional…",
    unsupported: "Tu navegador no pudo iniciar WebGL 2. Puedes explorar todos los proyectos desde esta vista accesible.",
    directoryHeadline: "Proyectos que nacieron de necesidades reales.",
    directoryDescription: "Accede directamente a cada historia sin conducir. La exploración en 3D es opcional.",
    near: "Estación cercana",
    intro: "La ciudad de las soluciones · Camión escalera",
    hint: "Selecciona una estación para desplazarte hasta ella",
    orientation: "Orientación",
    experimental: "Prototipo · Camión escalera americano 3D",
    context: "Mi función es identificar los problemas y dirigir la solución; la programación se realiza con asistencia de IA.",
  },
  en: {
    eyebrow: "JARCEDEV / INTERACTIVE WORLD",
    headline: "Explore the problems I turned into solutions.",
    description: "I'm a Systems Engineer. I identify improvements, define products and guide their development with AI. Take the wheel of an American-style aerial ladder truck and explore each project's story.",
    explore: "Explore in 3D",
    directory: "Browse projects directly",
    controls: "WASD or arrow keys · drive the ladder truck",
    keyboard: "E · open project",
    reset: "R · restart",
    steer: "Steer",
    accelerate: "Accelerate",
    reverse: "Reverse",
    guide: "Guide",
    guideText: "Drive towards any of the four stations. When nearby, press E or Discover to see the problem and solution. You can also select a station to travel there directly.",
    close: "Close",
    discover: "Discover",
    visit: "Travel to station",
    caseStudy: "Explore full case study",
    moreProjects: "Browse all projects",
    problem: "The problem",
    answer: "The solution",
    technologies: "Technologies used",
    back: "Return to world",
    waiting: "Preparing the 3D world…",
    unsupported: "Your browser could not start WebGL 2. You can explore all projects in this accessible view.",
    directoryHeadline: "Products inspired by real operational needs.",
    directoryDescription: "Browse every project directly without driving. The 3D mode is optional.",
    near: "Nearby station",
    intro: "The city of solutions · Ladder truck",
    hint: "Select a station to travel there",
    orientation: "Navigation",
    experimental: "Prototype · American aerial ladder truck",
    context: "I identify and define the problems and guide the solution; coding is carried out with AI assistance.",
  },
} as const;

function closestStation(position: WorldPosition): StationId | null {
  const close = worldStations
    .map((station) => ({
      id: station.id,
      distance: Math.hypot(station.x - position.x, station.z - position.z),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
  return close?.distance < 7.3 ? close.id : null;
}

export function WorldExperience({ lang }: { lang: Language }) {
  const t = copy[lang];
  const stations = stationCopy[lang];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const vehicleRef = useRef({ x: 0, z: 0, heading: 0, speed: 0 });
  const inputRef = useRef(new Set<ControlKey>());
  const nearbyRef = useRef<StationId | null>(null);

  const [mode, setMode] = useState<ViewMode>("world");
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>("loading");
  const [nearby, setNearby] = useState<StationId | null>(null);
  const [activeStation, setActiveStation] = useState<StationId | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [visited, setVisited] = useState<StationId[]>([]);

  const activeCopy = stations.find((station) => station.id === activeStation);
  const nearestCopy = stations.find((station) => station.id === nearby);

  const openStation = useCallback((id: StationId) => {
    setActiveStation(id);
    setVisited((previous) => previous.includes(id) ? previous : [...previous, id]);
    inputRef.current.clear();
  }, []);

  const travelTo = useCallback((id: StationId) => {
    const location = worldStations.find((station) => station.id === id);
    if (!location) return;
    const vehicle = vehicleRef.current;
    vehicle.x = location.x;
    vehicle.z = location.z + (location.z < 0 ? 7 : -7);
    vehicle.heading = location.z < 0 ? 0 : Math.PI;
    vehicle.speed = 0;
    nearbyRef.current = id;
    setNearby(id);
    setActiveStation(null);
    setMode("world");
  }, []);

  useEffect(() => {
    if (mode !== "world") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: ReturnType<typeof createWorldRenderer>;
    try {
      renderer = createWorldRenderer(canvas);
      setSceneStatus("ready");
    } catch (error) {
      console.warn("JarceDev 3D world unavailable:", error);
      setSceneStatus("fallback");
      return;
    }

    let running = true;
    let raf = 0;
    let previousTime = 0;
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    function frame(time: number) {
      if (!running) return;
      const dt = previousTime ? Math.min((time - previousTime) / 1000, .055) : .016;
      previousTime = time;

      if (document.visibilityState === "visible") {
        const v = vehicleRef.current;
        const input = inputRef.current;
        const accelerating = input.has("forward") ? 1 : 0;
        const reversing = input.has("reverse") ? 1 : 0;
        const direction = accelerating - reversing;
        const steer = (input.has("left") ? 1 : 0) - (input.has("right") ? 1 : 0);

        if (direction) v.speed += direction * 13 * dt;
        v.speed *= Math.exp(-2.8 * dt);
        v.speed = Math.max(-3.7, Math.min(7.2, v.speed));
        if (Math.abs(v.speed) < .02) v.speed = 0;

        if (steer && Math.abs(v.speed) > .04) {
          v.heading += steer * 1.7 * dt * (v.speed > 0 ? 1 : -1);
        }
        v.x = Math.max(-23.2, Math.min(23.2, v.x - Math.sin(v.heading) * v.speed * dt));
        v.z = Math.max(-23.2, Math.min(23.2, v.z - Math.cos(v.heading) * v.speed * dt));

        const station = closestStation(v);
        if (station !== nearbyRef.current) {
          nearbyRef.current = station;
          setNearby(station);
        }
        renderer.render(v, v.heading, time / 1000, motionMedia.matches);
      }
      raf = window.requestAnimationFrame(frame);
    }

    function keydown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(target.tagName))) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const key = event.key.toLowerCase();
      const mapping: Record<string, ControlKey> = {
        w: "forward", arrowup: "forward",
        s: "reverse", arrowdown: "reverse",
        a: "left", arrowleft: "left",
        d: "right", arrowright: "right",
      };
      if (key in mapping) {
        inputRef.current.add(mapping[key]);
        event.preventDefault();
      }
      if (key === "e" && nearbyRef.current && !event.repeat) {
        openStation(nearbyRef.current);
      }
      if (key === "r" && !event.repeat) {
        Object.assign(vehicleRef.current, { x: 0, z: 0, heading: 0, speed: 0 });
        setActiveStation(null);
      }
      if (key === "escape") {
        setActiveStation(null);
        setGuideOpen(false);
      }
    }
    function keyup(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const mapping: Record<string, ControlKey> = {
        w: "forward", arrowup: "forward",
        s: "reverse", arrowdown: "reverse",
        a: "left", arrowleft: "left",
        d: "right", arrowright: "right",
      };
      if (key in mapping) inputRef.current.delete(mapping[key]);
    }
    function blur() { inputRef.current.clear(); }

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", blur);
    raf = window.requestAnimationFrame(frame);
    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      inputRef.current.clear();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", blur);
      renderer.dispose();
    };
  }, [mode, openStation]);

  function touchButton(key: ControlKey, symbol: string, label: string) {
    return (
      <button
        type="button"
        aria-label={label}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          inputRef.current.add(key);
        }}
        onPointerUp={() => inputRef.current.delete(key)}
        onPointerCancel={() => inputRef.current.delete(key)}
        onLostPointerCapture={() => inputRef.current.delete(key)}
        onContextMenu={(event) => event.preventDefault()}
        className="flex size-12 touch-none select-none items-center justify-center rounded-2xl border border-white/25 bg-slate-950/70 text-lg text-white shadow-lg backdrop-blur transition active:bg-violet-500/60"
      >
        {symbol}
      </button>
    );
  }

  return (
    <section
      id="mundo"
      aria-label={lang === "es" ? "Mundo interactivo de JarceDev" : "JarceDev interactive world"}
      className="relative isolate flex min-h-[min(860px,calc(100svh-4.5rem))] flex-col overflow-hidden bg-[#071221] text-white sm:min-h-[min(950px,calc(100svh-5rem))]"
    >
      {mode === "world" ? (
        <>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ touchAction: "none" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,25,.86)_0%,rgba(5,11,25,.18)_42%,rgba(5,11,25,.05)_67%,rgba(5,11,25,.92)_100%)]" />
          <div className="pointer-events-none absolute -top-32 right-1/3 size-96 rounded-full bg-violet-500/10 blur-[120px]" />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_45%_25%,#302c58_0%,#101d35_42%,#071221_85%)]" />
      )}

      <div className="relative z-10 flex grow flex-col px-4 pb-6 pt-7 sm:px-8 sm:pt-11 lg:px-12">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-[.64rem] font-bold tracking-[.16em] text-violet-200">{t.eyebrow}</span>
              <span className="text-[.66rem] text-slate-400">{t.experimental}</span>
            </div>
            <h1 className="max-w-xl text-balance text-[2rem] font-semibold leading-[1.05] tracking-[-.052em] sm:text-[3.15rem] lg:text-[3.8rem]">
              {mode === "world" ? t.headline : t.directoryHeadline}
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-6 text-slate-300 sm:mt-5 sm:text-base sm:leading-7">
              {mode === "world" ? t.description : t.directoryDescription}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => { setMode(mode === "world" ? "directory" : "world"); setActiveStation(null); }}
              className="inline-flex min-h-11 items-center rounded-full border border-white/25 bg-white/10 px-3.5 text-xs font-semibold text-white shadow-lg backdrop-blur hover:bg-white/20 sm:px-5 sm:text-sm"
            >
              {mode === "world" ? t.directory : t.explore}
            </button>
            {mode === "world" && (
              <button type="button" onClick={() => setGuideOpen(true)} className="min-h-10 rounded-full px-3.5 text-xs font-semibold text-violet-200 hover:text-white">
                ? {t.guide}
              </button>
            )}
          </div>
        </div>

        {mode === "world" ? (
          <>
            <div className="flex grow flex-col justify-end">
              {sceneStatus !== "ready" && (
                <div className="mb-7 max-w-lg rounded-2xl border border-violet-400/25 bg-slate-950/80 p-5 text-sm text-slate-200 shadow-xl" role="status">
                  {sceneStatus === "fallback" ? t.unsupported : t.waiting}
                  {sceneStatus === "fallback" && (
                    <button type="button" onClick={() => setMode("directory")} className="mt-3 block rounded-full bg-violet-300 px-5 py-2.5 font-semibold text-slate-950">
                      {t.directory}
                    </button>
                  )}
                </div>
              )}

              {nearby && sceneStatus === "ready" && !activeStation && (
                <div className="mb-4 max-w-sm rounded-2xl border border-violet-300/30 bg-slate-950/80 p-4 shadow-xl backdrop-blur-md" role="status">
                  <p className="text-[.67rem] font-bold uppercase tracking-[.15em] text-violet-300">{t.near}</p>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-base font-semibold">{nearestCopy?.icon} {nearestCopy?.name}</span>
                    <button onClick={() => openStation(nearby)} type="button" className="min-h-10 rounded-full bg-violet-300 px-4 text-xs font-bold text-slate-950 hover:bg-violet-200">
                      {t.discover} <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-xl">
                  <div className="hidden gap-3 text-xs font-medium text-slate-300 md:flex">
                    <span className="rounded-full border border-white/15 bg-slate-950/65 px-3 py-2">{t.controls}</span>
                    <span className="rounded-full border border-white/15 bg-slate-950/65 px-3 py-2">{t.keyboard}</span>
                    <span className="rounded-full border border-white/15 bg-slate-950/65 px-3 py-2">{t.reset}</span>
                  </div>
                  <p className="mt-3 max-w-lg text-xs leading-5 text-slate-400">{t.context}</p>
                </div>
                <div className="flex items-center justify-between gap-3 lg:justify-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-center text-[.58rem] font-semibold uppercase tracking-wide text-slate-400">{t.steer}</span>
                    <div className="flex gap-1.5">
                      {touchButton("left", "←", t.steer + " izquierda")}
                      {touchButton("right", "→", t.steer + " derecha")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-center text-[.58rem] font-semibold uppercase tracking-wide text-slate-400">{t.accelerate}</span>
                    <div className="flex gap-1.5">
                      {touchButton("forward", "↑", t.accelerate)}
                      {touchButton("reverse", "↓", t.reverse)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-white/15 pt-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[.65rem] font-semibold uppercase tracking-[.16em] text-slate-400">{t.orientation}</p>
                  <p className="text-[.68rem] text-slate-500">{t.hint}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={t.orientation}>
                  {stations.map((station) => (
                    <button
                      key={station.id}
                      type="button"
                      onClick={() => travelTo(station.id)}
                      className="group flex min-h-12 items-center justify-start gap-2 rounded-xl border border-white/15 bg-slate-950/65 px-3 py-2.5 text-left shadow-md backdrop-blur transition hover:border-violet-300/60 hover:bg-slate-900/90 focus-visible:outline-violet-300"
                    >
                      <span className="text-lg" aria-hidden="true">{station.icon}</span>
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold sm:text-sm">{station.name}</span>
                      {visited.includes(station.id) && <span className="shrink-0 text-emerald-300" aria-label={lang === "es" ? "Visitado" : "Visited"}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="my-10 grid grow gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stations.map((station) => (
              <article key={station.id} className="flex flex-col rounded-3xl border border-white/15 bg-white/[.06] p-5 backdrop-blur">
                <span className="text-3xl" aria-hidden="true">{station.icon}</span>
                <h2 className="mt-5 text-xl font-bold">{station.name}</h2>
                <p className="mt-2 text-sm text-violet-200">{station.type}</p>
                <p className="mt-4 grow text-sm leading-6 text-slate-300">{station.problem}</p>
                <button type="button" onClick={() => { travelTo(station.id); openStation(station.id); }} className="mt-5 rounded-full bg-violet-300 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-violet-200">
                  {t.discover} <span aria-hidden="true">↗</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {activeCopy && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#071221]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="world-station-title">
          <article className="w-full max-w-lg max-h-[90svh] overflow-y-auto rounded-3xl border border-violet-200/25 bg-[#101d34] p-5 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">{activeCopy.icon}</span>
              <button type="button" onClick={() => setActiveStation(null)} aria-label={t.close} className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl hover:bg-white/15">×</button>
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[.18em] text-violet-300">{activeCopy.type}</p>
            <h2 id="world-station-title" className="mt-2 text-3xl font-semibold tracking-tight">{activeCopy.name}</h2>
            <div className="mt-6 space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[.16em] text-amber-300">{t.problem}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-200">{activeCopy.problem}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[.16em] text-emerald-300">{t.answer}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-200">{activeCopy.answer}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">{t.technologies}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{activeCopy.technology}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              {activeCopy.slug ? (
                <Link href={"/" + lang + "/projects/" + activeCopy.slug} className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-violet-300 px-5 py-3 text-center text-sm font-bold text-slate-950 hover:bg-violet-200">
                  {t.caseStudy} →
                </Link>
              ) : (
                <Link href={"/" + lang + "#"+(lang==="es"?"proyectos":"projects")} className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-violet-300 px-5 py-3 text-center text-sm font-bold text-slate-950 hover:bg-violet-200">{t.moreProjects} →</Link>
              )}
              <button type="button" onClick={() => setActiveStation(null)} className="min-h-11 rounded-full border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10">{t.back}</button>
            </div>
          </article>
        </div>
      )}

      {guideOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-labelledby="world-guide-title">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-[#14233b] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 id="world-guide-title" className="text-xl font-bold">{t.intro}</h2>
              <button type="button" onClick={() => setGuideOpen(false)} className="min-h-10 rounded-full border border-white/20 px-4 text-sm">{t.close}</button>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-200">{t.guideText}</p>
            <p className="mt-4 text-sm font-semibold text-violet-200">{t.controls} · {t.keyboard} · {t.reset}</p>
          </div>
        </div>
      )}
    </section>
  );
}
