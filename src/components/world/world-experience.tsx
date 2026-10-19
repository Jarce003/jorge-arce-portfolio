"use client";

import Link from "next/link";

import { getProjects } from "@/content/projects";
import { rescueIsFinished } from "@/lib/world-fire";
import { closestDiscoverableStation, isInDiscoveryRange } from "@/lib/world-proximity";
import { ProjectPanel } from "@/components/projects/project-panel";
import { ProjectArtwork } from "@/components/projects/project-artwork";
import { ContactStudio } from "@/components/portfolio/contact-studio";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  createWorldRenderer,
  worldStations,
} from "./world-renderer";
import type { WorldPosition, WorldRescueEffect } from "./world-contract";
import { MobileDriveControls } from "./mobile-drive-controls";

type Language = "es" | "en";
type StationId = string;
type ControlKey = "forward" | "reverse" | "left" | "right";
type ViewMode = "world" | "directory";
type SceneStatus = "loading" | "ready" | "fallback";


const copy = {
  es: {
    eyebrow: "JARCEDEV / MUNDO INTERACTIVO",
    headline: "Explora los problemas que convertí en soluciones.",
    description: "Soy Ingeniero en Sistemas. Identifico mejoras, defino productos y coordino su construcción con ayuda de IA. Conduce un camión escalera americano y descubre cómo nace cada proyecto.",
    explore: "Explorar en 3D",
    directory: "Ver proyectos directamente",
    controls: "WASD o flechas · conducir el camión escalera",
    keyboard: "E · abrir proyecto",
    reset: "R · reiniciar rescate",
    camera: "Cambiar cámara",
    cameraChase: "Vista trasera",
    cameraOverview: "Vista aérea",
    steer: "Girar",
    accelerate: "Avanzar",
    reverse: "Retroceder",
    guide: "Guía",
    guideText: "Acércate a una estación: no necesitas tocar el edificio. Pulsa Descubrir para lanzar agua, apagar las llamas y revelar el proyecto. También puedes elegirlo en la lista.",
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
    brand: "JARCEDEV 3D",
    info: "Conocer JarceDev",
    lights: "Luces",
    lightsOn: "Luces encendidas",
    lightsOff: "Luces apagadas",
    stations: "Estaciones",
    quickAccess: "Elige qué proyecto descubrir",
    profile: "Mi perfil y proyectos",
    shortInstructions: "WASD / Flechas: conducir · E: agua y descubrir · C: cámara · L: luces · N: día/noche · R: reiniciar",
    mobileInstructions: "Usa el volante y los pedales para conducir. Pulsa 🚨 para las luces y ▦ para elegir proyectos.",
    interaction: "Conduce el camión escalera para descubrir cómo convierto problemas reales en soluciones.",
    loading: "Cargando el mundo...",
    noWebgl: "Este dispositivo no pudo cargar el mundo 3D. Puedes descubrir todos los proyectos desde esta vista.",
    lightsAnnouncement: "Iluminación del camión",
    closeProjects: "Cerrar estaciones",
    dayMode: "Día / noche",
    day: "Día",
    night: "Noche",
    dayModeInstructions: "N · cambiar día y noche",
    fireStatus: "Incendio pendiente",
    recovery: "Estación recuperada",
    extinguishing: "El camión está lanzando agua para apagar las llamas…",
    rescued: "Estaciones recuperadas",
    replay: "Reiniciar rescate",
  },
  en: {
    eyebrow: "JARCEDEV / INTERACTIVE WORLD",
    headline: "Explore the problems I turned into solutions.",
    description: "I'm a Systems Engineer. I identify improvements, define products and guide their development with AI. Take the wheel of an American-style aerial ladder truck and explore each project's story.",
    explore: "Explore in 3D",
    directory: "Browse projects directly",
    controls: "WASD or arrow keys · drive the ladder truck",
    keyboard: "E · open project",
    reset: "R · restart rescue",
    camera: "Change camera",
    cameraChase: "Chase view",
    cameraOverview: "Bird's-eye view",
    steer: "Steer",
    accelerate: "Accelerate",
    reverse: "Reverse",
    guide: "Guide",
    guideText: "Drive near a station; you don’t have to touch the building. Press Discover to spray water, extinguish the flames and reveal the project. You can also use the station list.",
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
    brand: "JARCEDEV 3D",
    info: "About JarceDev",
    lights: "Lights",
    lightsOn: "Lights on",
    lightsOff: "Lights off",
    stations: "Stations",
    quickAccess: "Choose a project to discover",
    profile: "Profile and projects",
    shortInstructions: "WASD / Arrows: drive · E: spray and discover · C: camera · L: lights · N: day/night · R: restart",
    mobileInstructions: "Use the steering wheel and pedals to drive. Press 🚨 for the lights and ▦ to browse projects.",
    interaction: "Drive the aerial ladder truck and discover how I turn real operational problems into digital solutions.",
    loading: "Loading the world...",
    noWebgl: "This device could not load the 3D world. You can still browse every project here.",
    lightsAnnouncement: "Truck lighting",
    closeProjects: "Close stations",
    dayMode: "Day / night",
    day: "Day",
    night: "Night",
    dayModeInstructions: "N · toggle day and night",
    fireStatus: "Fire still burning",
    recovery: "Station recovered",
    extinguishing: "The ladder truck is spraying water to extinguish the flames…",
    rescued: "Stations recovered",
    replay: "Restart rescue",
  },
} as const;

function closestStation(position: WorldPosition): StationId | null {
  return closestDiscoverableStation(position, worldStations);
}

export function WorldExperience({ lang, siteKey = "" }: { lang: Language; siteKey?: string }) {
  const t = copy[lang];
  // All station panels and navigation labels come from the shared project manifest.
  const stations = getProjects(lang).map((project) => ({
    ...project,
    id: project.station.id,
    name: project.title,
    type: project.category,
    answer: project.solution,
    technology: project.technologies.join(" · "),
  }));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const vehicleRef = useRef({ x: 0, z: 0, heading: 0, speed: 0 });
  const inputRef = useRef(new Set<ControlKey>());
  const touchSteeringRef = useRef(0);
  const nearbyRef = useRef<StationId | null>(null);
  const extinguishedRef = useRef<Set<StationId>>(new Set());
  const rescueRef = useRef<WorldRescueEffect | null>(null);
  const stationMarkerRefs = useRef<Partial<Record<StationId, HTMLButtonElement | null>>>({});
  const cameraModeRef = useRef<"chase" | "overview">("chase");
  const overlayOpenRef = useRef(false);
  const lightsOnRef = useRef(false);
  const daytimeRef = useRef<"day" | "night">("day");

  const [mode, setMode] = useState<ViewMode>("world");
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>("loading");
  const [nearby, setNearby] = useState<StationId | null>(null);
  const [activeStation, setActiveStation] = useState<StationId | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [visited, setVisited] = useState<StationId[]>([]);
  const [rescuing, setRescuing] = useState(false);
  const [cameraMode, setCameraMode] = useState<"chase" | "overview">("chase");
  const [lightsOn, setLightsOn] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("day");
  const [stationMenuOpen, setStationMenuOpen] = useState(false);

  const setMobileSteering = useCallback((value: number) => {
    touchSteeringRef.current = value;
  }, []);

  const setMobilePedal = useCallback((pedal: "forward" | "reverse", pressed: boolean) => {
    if (pressed) inputRef.current.add(pedal);
    else inputRef.current.delete(pedal);
  }, []);

  const toggleDay = useCallback(() => {
    daytimeRef.current = daytimeRef.current === "day" ? "night" : "day";
    setTimeOfDay(daytimeRef.current);
  }, []);

  const toggleLights = useCallback(() => {
    lightsOnRef.current = !lightsOnRef.current;
    setLightsOn(lightsOnRef.current);
  }, []);

  const toggleCamera = useCallback(() => {
    cameraModeRef.current = cameraModeRef.current === "chase" ? "overview" : "chase";
    setCameraMode(cameraModeRef.current);
  }, []);

  useEffect(() => {
    overlayOpenRef.current = rescuing || Boolean(activeStation) || guideOpen || stationMenuOpen || mode === "directory";
    if (overlayOpenRef.current) {
      inputRef.current.clear();
      touchSteeringRef.current = 0;
    }
  }, [activeStation, guideOpen, stationMenuOpen, mode, rescuing]);

  const activeCopy = stations.find((station) => station.id === activeStation);
  const nearestCopy = stations.find((station) => station.id === nearby);

  const openStation = useCallback((id: StationId) => {
    const location = worldStations.find((station) => station.id === id);
    if (!location || rescueRef.current) return;

    setStationMenuOpen(false);
    setGuideOpen(false);
    inputRef.current.clear();
    touchSteeringRef.current = 0;

    // Previously recovered stations may always be reopened immediately.
    if (extinguishedRef.current.has(id) ||
      mode === "directory" || sceneStatus !== "ready" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      extinguishedRef.current.add(id);
      setVisited((previous) => previous.includes(id) ? previous : [...previous, id]);
      setActiveStation(id);
      return;
    }

    // Direct selection also remains possible for keyboard/touch accessibility:
    // position the vehicle near the building before launching its water jet.
    const truck = vehicleRef.current;
    if (!isInDiscoveryRange(truck, location)) {
      truck.x = location.x;
      truck.z = location.z + (location.z < 0 ? 7 : -7);
      truck.heading = location.z < 0 ? 0 : Math.PI;
    }
    truck.speed = 0;
    rescueRef.current = { stationId: id, startedAt: performance.now() / 1000 };
    setActiveStation(null);
    setRescuing(true);
  }, [mode, sceneStatus]);

  const resetJourney = useCallback(() => {
    rescueRef.current = null;
    extinguishedRef.current.clear();
    Object.assign(vehicleRef.current, { x: 0, z: 0, heading: 0, speed: 0 });
    nearbyRef.current = null;
    inputRef.current.clear();
    touchSteeringRef.current = 0;
    setNearby(null);
    setVisited([]);
    setActiveStation(null);
    setStationMenuOpen(false);
    setGuideOpen(false);
    setRescuing(false);
  }, []);

  const travelTo = useCallback((id: StationId) => {
    const location = worldStations.find((station) => station.id === id);
    if (!location || rescueRef.current) return;
    const vehicle = vehicleRef.current;
    vehicle.x = location.x;
    vehicle.z = location.z + (location.z < 0 ? 7 : -7);
    vehicle.heading = location.z < 0 ? 0 : Math.PI;
    vehicle.speed = 0;
    touchSteeringRef.current = 0;
    inputRef.current.clear();
    nearbyRef.current = id;
    setNearby(id);
    setActiveStation(null);
    setStationMenuOpen(false);
    setMode("world");
  }, []);

  useEffect(() => {
    if (mode !== "world") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasElement: HTMLCanvasElement = canvas;

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
    let sceneIsVisible = true;
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => {
      sceneIsVisible = entry.isIntersecting;
      if (!sceneIsVisible) {
        inputRef.current.clear();
        touchSteeringRef.current = 0;
        vehicleRef.current.speed = 0;
      }
    }, { rootMargin: "50px" });
    observer.observe(canvasElement);

    function frame(time: number) {
      if (!running) return;
      // Draw on every available display refresh, including portrait mobile.
      // The previous 30ms mobile throttle dropped alternating frames on
      // 60Hz displays, visibly stepping the truck and its chase camera.
      // Cap only unusually long background/frame stalls to avoid jumps.
      const dt = previousTime ? Math.max(0, Math.min((time - previousTime) / 1000, .10)) : 1 / 60;
      previousTime = time;

      if (document.visibilityState === "visible" && sceneIsVisible) {
        const v = vehicleRef.current;
        const input = inputRef.current;
        const acceptingControls = !overlayOpenRef.current && !rescueRef.current;
        const accelerating = acceptingControls && input.has("forward") ? 1 : 0;
        const reversing = acceptingControls && input.has("reverse") ? 1 : 0;
        const direction = accelerating - reversing;
        const steer = acceptingControls
          ? Math.max(-1, Math.min(1,
              (input.has("left") ? 1 : 0) - (input.has("right") ? 1 : 0) + touchSteeringRef.current))
          : 0;

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
        const rescue = rescueRef.current;
        const seconds = time / 1000;
        if (rescue && rescueIsFinished(seconds, rescue.startedAt)) {
          extinguishedRef.current.add(rescue.stationId);
          rescueRef.current = null;
          setVisited((previous) => previous.includes(rescue.stationId)
            ? previous : [...previous, rescue.stationId]);
          setRescuing(false);
          setActiveStation(rescue.stationId);
        }
        renderer.render(
          v, v.heading, seconds, motionMedia.matches, cameraModeRef.current,
          lightsOnRef.current, daytimeRef.current, extinguishedRef.current,
          rescueRef.current,
        );
        for (const station of worldStations) {
          const element = stationMarkerRefs.current[station.id];
          if (!element) continue;
          const point = renderer.project(station, 5.9);
          const visible = point.visible && canvasElement.clientWidth >= 640;
          element.style.display = visible ? "flex" : "none";
          element.style.transform = "translate3d(" + point.x + "px," + point.y + "px,0) translate(-50%,-100%)";
          element.tabIndex = visible ? 0 : -1;
        }
      }
      raf = window.requestAnimationFrame(frame);
    }

    function keydown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (key === "escape") {
        setActiveStation(null);
        setGuideOpen(false);
        setStationMenuOpen(false);
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|A)$/.test(target.tagName))) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (overlayOpenRef.current) return;
      // Do not capture WASD or scroll keys after the visitor leaves this section.
      const rect = canvasElement.getBoundingClientRect();
      if (rect.bottom < window.innerHeight * .25 || rect.top > window.innerHeight * .75) return;
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
        resetJourney();
      }
      if (key === "c" && !event.repeat) {
        toggleCamera();
      }
      if (key === "l" && !event.repeat) {
        toggleLights();
      }
      if (key === "n" && !event.repeat) {
        toggleDay();
      }
      if (key === "m" && !event.repeat) {
        setStationMenuOpen(true);
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
    function blur() {
      inputRef.current.clear();
      touchSteeringRef.current = 0;
    }

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
      observer.disconnect();
      touchSteeringRef.current = 0;
      renderer.dispose();
    };
  }, [mode, openStation, toggleCamera, toggleLights, toggleDay, resetJourney]);


  return (
    <section
      id="mundo"
      aria-label={lang === "es" ? "Mundo explorable de JarceDev" : "JarceDev explorable world"}
      className="relative isolate h-[calc(100svh-4.5rem)] min-h-[390px] w-full overflow-hidden bg-[#071221] text-white sm:h-[calc(100dvh-5rem)]"
      style={{ touchAction: "pan-y" }}
    >
      {mode === "world" ? (
        <>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ touchAction: "none" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,24,.53)_0%,transparent_24%,transparent_65%,rgba(3,9,23,.64)_100%)]"
          />
          <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
            {stations.map((station) => (
              <button
                key={station.id}
                ref={(element) => { stationMarkerRefs.current[station.id] = element; }}
                type="button"
                onClick={() => openStation(station.id)}
                style={{ display: "none" }}
                aria-label={(lang === "es" ? "Descubrir " : "Discover ") + station.name}
                className="pointer-events-auto absolute left-0 top-0 z-10 min-w-28 flex-col items-center gap-1 rounded-xl border border-violet-200/40 bg-[#111b33]/95 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md hover:border-violet-300"
              >
                <span className="flex items-center gap-2"><span aria-hidden="true">{station.icon}</span>{station.name}</span>
                <span className="text-[.64rem] font-normal text-violet-200">{t.discover} ↗</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_25%,#383360_0%,#14233c_45%,#071221_100%)]" />
      )}

      <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2 sm:inset-x-8 sm:top-7 lg:inset-x-12">
        <div className="min-w-0 max-w-lg">
          <h1 className="inline-flex rounded-full border border-violet-300/30 bg-[#0a152b]/80 px-2.5 py-2 text-[10px] font-bold tracking-[.13em] text-violet-100 shadow-lg backdrop-blur-md sm:px-3 sm:text-xs">
            <span className="sm:hidden">JD · 3D</span><span className="hidden sm:inline">{t.brand}</span>
          </h1>
          <span aria-live="polite" className="ml-2 inline-flex rounded-full border border-emerald-300/25 bg-slate-950/60 px-2.5 py-2 text-[10px] font-semibold text-emerald-200 backdrop-blur">
            {visited.length}/{stations.length} ✓
          </span>
          <p className="mt-2 hidden max-w-xs rounded-xl bg-slate-950/50 px-3 py-2 text-xs text-slate-200 backdrop-blur lg:block">
            {lang === "es" ? "Explora problemas convertidos en soluciones." : "Explore problems turned into solutions."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" role="group" aria-label={t.orientation}>
          {mode === "world" && (
            <>
              <button
                type="button"
                onClick={toggleDay}
                aria-label={t.dayMode + ": " + (timeOfDay === "day" ? t.day : t.night)}
                aria-pressed={timeOfDay === "day"}
                title={t.dayMode + " (N)"}
                className="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl border border-white/20 bg-[#0a152b]/80 px-2 text-white shadow-lg backdrop-blur-md hover:bg-white/15 sm:min-w-16 sm:px-3"
              >
                <span aria-hidden="true" className="text-lg leading-5">{timeOfDay === "day" ? "☀" : "☾"}</span>
                <span className="text-[9px] font-semibold sm:text-[11px]">{timeOfDay === "day" ? t.day : t.night}</span>
              </button>
              <button
                type="button"
                onClick={toggleLights}
                aria-pressed={lightsOn}
                aria-label={lightsOn ? t.lightsOn : t.lightsOff}
                title={t.lights + " (L)"}
                className={"flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl border px-2 text-white shadow-lg backdrop-blur-md transition sm:min-w-16 sm:px-3 " + (lightsOn ? "border-amber-300/70 bg-amber-400/30" : "border-white/20 bg-[#0a152b]/80 hover:bg-white/15")}
              >
                <span aria-hidden="true" className="text-lg leading-5">🚨</span>
                <span className="text-[9px] font-semibold sm:text-[11px]">{t.lights}</span>
              </button>
              <button
                type="button"
                onClick={toggleCamera}
                title={t.camera + " (C)"}
                aria-label={t.camera + ": " + (cameraMode === "chase" ? t.cameraChase : t.cameraOverview)}
                className="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl border border-white/20 bg-[#0a152b]/80 px-2 text-white shadow-lg backdrop-blur-md hover:bg-white/15 sm:min-w-16 sm:px-3"
              >
                <span aria-hidden="true" className="text-lg leading-5">◈</span>
                <span className="text-[9px] font-semibold sm:text-[11px]">{lang === "es" ? "Vista" : "View"}</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => { setStationMenuOpen(true); setGuideOpen(false); }}
            aria-label={t.stations}
            aria-expanded={stationMenuOpen}
            title={t.stations + " (M)"}
            className="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl border border-white/20 bg-[#0a152b]/80 px-2 text-white shadow-lg backdrop-blur-md hover:bg-white/15 sm:min-w-16 sm:px-3"
          >
            <span aria-hidden="true" className="text-lg leading-5">▦</span>
            <span className="text-[9px] font-semibold sm:text-[11px]">{t.stations}</span>
          </button>
          <button
            type="button"
            onClick={() => { setGuideOpen(true); setStationMenuOpen(false); }}
            aria-label={t.info}
            title={t.info}
            className="hidden sm:flex min-h-11 min-w-11 flex-col items-center justify-center rounded-xl border border-white/20 bg-[#0a152b]/80 px-2 text-white shadow-lg backdrop-blur-md hover:bg-white/15 sm:min-w-16 sm:px-3"
          >
            <span aria-hidden="true" className="text-lg leading-5">ⓘ</span>
            <span className="text-[9px] font-semibold sm:text-[11px]">{lang === "es" ? "Info" : "Info"}</span>
          </button>
        </div>
      </div>

      {mode === "world" && sceneStatus === "ready" && nearby && !activeCopy && !stationMenuOpen && !guideOpen && !rescuing && (
        <div role="status" className="absolute inset-x-4 bottom-[155px] z-20 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-xl border border-violet-200/35 bg-[#0a152b]/90 px-3 py-2 text-xs shadow-xl backdrop-blur sm:bottom-24">
          <span className="font-semibold">{nearestCopy?.icon} {nearestCopy?.name}</span>
          <button type="button" onClick={() => openStation(nearby)} className="min-h-10 rounded-lg bg-violet-300 px-4 text-xs font-bold text-slate-950 hover:bg-violet-200">
            💧 {t.discover} ↗
          </button>
        </div>
      )}

      {mode === "world" && rescuing && (
        <div role="status" aria-live="polite"
          className="pointer-events-none absolute inset-x-4 bottom-[170px] z-30 mx-auto max-w-sm rounded-xl border border-cyan-200/45 bg-[#071b31]/90 px-4 py-3 text-center text-xs font-semibold text-cyan-100 shadow-2xl backdrop-blur-sm sm:bottom-28">
          <span aria-hidden="true">💧 </span>{t.extinguishing}
        </div>
      )}

      {mode === "world" && sceneStatus !== "ready" && (
        <div role="status" className="absolute left-4 right-4 top-1/2 z-20 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-violet-300/25 bg-slate-950/85 p-5 text-sm leading-6 text-slate-200">
          {sceneStatus === "fallback" ? t.noWebgl : t.loading}
          {sceneStatus === "fallback" && (
            <button type="button" onClick={() => setMode("directory")} className="mt-4 block min-h-11 rounded-full bg-violet-300 px-5 font-bold text-slate-950">
              {t.directory}
            </button>
          )}
        </div>
      )}

      {mode === "world" && (
        <div className="pointer-events-none absolute inset-x-3 bottom-[max(8px,env(safe-area-inset-bottom))] z-20 sm:inset-x-8 lg:inset-x-12">
          <div className="pointer-events-auto">
            <MobileDriveControls
              lang={lang}
              onSteer={setMobileSteering}
              onPedal={setMobilePedal}
              disabled={sceneStatus !== "ready" || Boolean(activeStation) || guideOpen || stationMenuOpen || rescuing}
            />
          </div>
          <div className="hidden items-center justify-between gap-4 rounded-xl border border-white/15 bg-slate-950/65 px-5 py-3 text-xs text-slate-200 shadow-lg backdrop-blur-lg lg:flex">
            <span>{t.shortInstructions}</span>
            <Link href={"/" + lang + "/portfolio"} className="font-bold text-violet-200 hover:text-white">{t.profile} ↗</Link>
          </div>
        </div>
      )}

      {mode === "directory" && (
        <div className="absolute inset-x-3 top-20 bottom-3 z-20 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/65 p-4 backdrop-blur-md sm:inset-x-8 sm:top-24 sm:p-6 lg:inset-x-12">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{t.directoryHeadline}</h2>
              <p className="mt-1 text-xs text-slate-300">{t.directoryDescription}</p>
            </div>
            <button type="button" onClick={() => { setMode("world"); setStationMenuOpen(false); }} className="min-h-11 rounded-full border border-white/25 px-4 text-xs font-semibold hover:bg-white/10">
              {t.explore}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stations.map((station) => (
              <article key={station.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl" aria-hidden="true">{station.icon}</p>
                <h3 className="mt-2 text-lg font-bold">{station.name}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-300">{station.problem}</p>
                <button type="button" onClick={() => openStation(station.id)} className="mt-4 min-h-11 w-full rounded-full bg-violet-300 px-3 text-xs font-bold text-slate-950">
                  {t.discover}
                </button>
              </article>
            ))}
          </div>
          <Link href={"/" + lang + "/portfolio"} className="mt-5 inline-flex min-h-11 items-center rounded-full border border-violet-200/30 px-5 text-sm font-bold text-white hover:bg-white/10">{t.profile} ↗</Link>
        </div>
      )}

      {stationMenuOpen && (
        <div className="absolute inset-0 z-40 flex items-end justify-center bg-[#06101f]/65 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-[3px] sm:items-center" role="dialog" aria-modal="true" aria-labelledby="world-stations-title">
          <div className="max-h-[85svh] w-full max-w-xl overflow-y-auto rounded-2xl border border-violet-200/25 bg-[#111d34] p-4 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="world-stations-title" className="text-lg font-bold">{t.quickAccess}</h2>
                <p className="mt-1 text-xs text-slate-300">{t.stations}</p>
              </div>
              <button type="button" onClick={() => setStationMenuOpen(false)} aria-label={t.closeProjects} className="min-h-11 min-w-11 rounded-xl border border-white/15 text-xl hover:bg-white/10">×</button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {stations.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => { travelTo(station.id); openStation(station.id); }}
                  className="flex min-h-16 items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:border-violet-300/50 hover:bg-violet-400/10"
                >
                  <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-[#091525]">
                    <ProjectArtwork key={station.slug} project={station} decorative sizes="80px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{station.name}</span>
                    <span className="block text-[11px] text-slate-400">{station.type}</span>
                  </span>
                  {visited.includes(station.id) ? <span className="text-xs font-bold text-emerald-300" aria-label={lang === "es" ? "Visitado" : "Visited"}>✓</span> : <span aria-hidden="true" className="text-violet-300">↗</span>}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={"/" + lang + "/portfolio"} className="inline-flex min-h-11 items-center rounded-full border border-violet-200/30 px-5 text-sm font-semibold text-white hover:bg-violet-400/10">{t.profile} ↗</Link>
              <button type="button" onClick={() => { setStationMenuOpen(false); setGuideOpen(true); }} className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-slate-200 hover:bg-white/10">ⓘ {t.guide}</button>
              <button type="button" onClick={resetJourney} className="inline-flex min-h-11 items-center rounded-full border border-rose-300/25 px-4 text-sm font-semibold text-rose-200 hover:bg-rose-400/10">↻ {t.replay}</button>
            </div>
          </div>
        </div>
      )}

      {activeCopy && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-[#071221]/85 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center"
          role="dialog" aria-modal="true" aria-label={activeCopy.title}>
          <div className="max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-[1.3rem]">
            <ProjectPanel lang={lang} project={activeCopy} onClose={() => setActiveStation(null)}
              directLink={false} />
          </div>
        </div>
      )}

      <ContactStudio lang={lang} siteKey={siteKey} worldLauncher />

      {guideOpen && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="world-guide-title">
          <div className="max-h-[85svh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/20 bg-[#14233b] p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 id="world-guide-title" className="text-xl font-bold">{t.intro}</h2>
              <button type="button" onClick={() => setGuideOpen(false)} aria-label={t.close} className="min-h-11 min-w-11 rounded-xl border border-white/20 text-xl">×</button>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-200">{t.description}</p>
            <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm leading-6 text-violet-200">
              <span className="lg:hidden">{t.mobileInstructions}</span>
              <span className="hidden lg:inline">{t.shortInstructions}</span>
            </p>
            <p className="mt-3 text-xs leading-6 text-slate-400">{t.context}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={"/" + lang + "/portfolio"} className="inline-flex min-h-11 items-center rounded-full bg-violet-300 px-5 text-sm font-bold text-slate-950 hover:bg-violet-200">{t.profile} ↗</Link>
              <button type="button" onClick={() => setGuideOpen(false)} className="min-h-11 rounded-full border border-white/20 px-5 text-sm font-semibold">{t.explore}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
