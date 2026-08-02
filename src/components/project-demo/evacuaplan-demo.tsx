"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Locale } from "@/lib/i18n";

type EvacuaPlanDemoProps = {
  lang: Locale;
};

type Tool =
  | "select"
  | "extinguisher"
  | "exit"
  | "meeting-point"
  | "route"
  | "wall";

type ObjectKind =
  | "extinguisher"
  | "exit"
  | "meeting-point";

type CanvasPoint = {
  x: number;
  y: number;
};

type CanvasObject = CanvasPoint & {
  id: string;
  kind: ObjectKind;
};

type WallSegment = {
  id: string;
  start: CanvasPoint;
  end: CanvasPoint;
};

type Snapshot = {
  objects: CanvasObject[];
  routePoints: CanvasPoint[];
  walls: WallSegment[];
};

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 560;

const INITIAL_OBJECTS: CanvasObject[] = [
  {
    id: "extinguisher-1",
    kind: "extinguisher",
    x: 245,
    y: 390,
  },
  {
    id: "exit-1",
    kind: "exit",
    x: 900,
    y: 430,
  },
  {
    id: "meeting-point-1",
    kind: "meeting-point",
    x: 915,
    y: 105,
  },
];

const INITIAL_ROUTE: CanvasPoint[] = [
  {
    x: 245,
    y: 390,
  },
  {
    x: 465,
    y: 390,
  },
  {
    x: 690,
    y: 430,
  },
  {
    x: 870,
    y: 430,
  },
];

const INITIAL_WALLS: WallSegment[] = [
  {
    id: "wall-1",
    start: {
      x: 480,
      y: 290,
    },
    end: {
      x: 480,
      y: 390,
    },
  },
];

function cloneObjects(
  objects: CanvasObject[],
) {
  return objects.map((item) => ({
    ...item,
  }));
}

function clonePoints(
  points: CanvasPoint[],
) {
  return points.map((point) => ({
    ...point,
  }));
}

function cloneWalls(
  walls: WallSegment[],
) {
  return walls.map((wall) => ({
    ...wall,
    start: {
      ...wall.start,
    },
    end: {
      ...wall.end,
    },
  }));
}

export function EvacuaPlanDemo({
  lang,
}: EvacuaPlanDemoProps) {
  const copy =
    lang === "es"
      ? {
          demoLabel: "Demo interactiva",
          title: "Mini editor de evacuación",
          description:
            "Seleccione una herramienta y modifique el plano.",
          tools: {
            select: "Seleccionar",
            extinguisher: "Extintor",
            exit: "Salida",
            meetingPoint: "Punto de reunión",
            route: "Ruta",
            wall: "Pared",
          },
          undo: "Deshacer",
          reset: "Restablecer",
          delete: "Eliminar",
          clearRoute: "Limpiar ruta",
          instructions: {
            select:
              "Seleccione y arrastre los símbolos dentro del plano.",
            extinguisher:
              "Toque el plano para colocar un extintor.",
            exit:
              "Toque el plano para colocar una salida de emergencia.",
            meetingPoint:
              "Toque el plano para colocar un punto de reunión.",
            route:
              "Toque varios puntos para extender la ruta de evacuación.",
            wallStart:
              "Seleccione el punto inicial de la nueva pared.",
            wallEnd:
              "Seleccione el punto final de la nueva pared.",
          },
          selected: "Elemento seleccionado",
          noneSelected:
            "Seleccione un símbolo para editarlo.",
          objects: "Símbolos",
          routePoints: "Puntos de ruta",
          customWalls: "Paredes agregadas",
          rooms: {
            reception: "Recepción",
            offices: "Oficinas",
            meeting: "Sala de reuniones",
            storage: "Bodega",
            laboratory: "Laboratorio",
            corridor: "Pasillo",
          },
          objectNames: {
            extinguisher: "Extintor",
            exit: "Salida de emergencia",
            meetingPoint: "Punto de reunión",
          },
        }
      : {
          demoLabel: "Interactive demo",
          title: "Evacuation mini editor",
          description:
            "Select a tool and modify the plan.",
          tools: {
            select: "Select",
            extinguisher: "Extinguisher",
            exit: "Exit",
            meetingPoint: "Meeting point",
            route: "Route",
            wall: "Wall",
          },
          undo: "Undo",
          reset: "Reset",
          delete: "Delete",
          clearRoute: "Clear route",
          instructions: {
            select:
              "Select and drag symbols around the plan.",
            extinguisher:
              "Click the plan to place an extinguisher.",
            exit:
              "Click the plan to place an emergency exit.",
            meetingPoint:
              "Click the plan to place a meeting point.",
            route:
              "Click multiple points to extend the evacuation route.",
            wallStart:
              "Select the starting point of the new wall.",
            wallEnd:
              "Select the ending point of the new wall.",
          },
          selected: "Selected element",
          noneSelected:
            "Select a symbol to edit it.",
          objects: "Symbols",
          routePoints: "Route points",
          customWalls: "Added walls",
          rooms: {
            reception: "Reception",
            offices: "Offices",
            meeting: "Meeting room",
            storage: "Storage",
            laboratory: "Laboratory",
            corridor: "Hallway",
          },
          objectNames: {
            extinguisher: "Extinguisher",
            exit: "Emergency exit",
            meetingPoint: "Meeting point",
          },
        };

  const svgRef =
    useRef<SVGSVGElement | null>(null);

  const nextIdRef = useRef(10);

  const [activeTool, setActiveTool] =
    useState<Tool>("select");

  const [objects, setObjects] =
    useState<CanvasObject[]>(
      cloneObjects(INITIAL_OBJECTS),
    );

  const [routePoints, setRoutePoints] =
    useState<CanvasPoint[]>(
      clonePoints(INITIAL_ROUTE),
    );

  const [walls, setWalls] =
    useState<WallSegment[]>(
      cloneWalls(INITIAL_WALLS),
    );

  const [selectedId, setSelectedId] =
    useState<string | null>(
      INITIAL_OBJECTS[0].id,
    );

  const [draggingId, setDraggingId] =
    useState<string | null>(null);

  const [
    pendingWallStart,
    setPendingWallStart,
  ] = useState<CanvasPoint | null>(null);

  const [history, setHistory] =
    useState<Snapshot[]>([]);

  const selectedObject = useMemo(
    () =>
      objects.find(
        (item) =>
          item.id === selectedId,
      ) ?? null,
    [objects, selectedId],
  );

  const captureSnapshot = (): Snapshot => ({
    objects: cloneObjects(objects),
    routePoints:
      clonePoints(routePoints),
    walls: cloneWalls(walls),
  });

  const pushHistory = () => {
    const snapshot = captureSnapshot();

    setHistory((current) => [
      ...current.slice(-11),
      snapshot,
    ]);
  };

  const getCanvasPoint = (
    event: ReactPointerEvent<SVGSVGElement>,
  ): CanvasPoint => {
    const svg = svgRef.current;

    if (!svg) {
      return {
        x: 0,
        y: 0,
      };
    }

    const bounds =
      svg.getBoundingClientRect();

    const x =
      ((event.clientX - bounds.left) /
        bounds.width) *
      CANVAS_WIDTH;

    const y =
      ((event.clientY - bounds.top) /
        bounds.height) *
      CANVAS_HEIGHT;

    return {
      x: Math.min(
        CANVAS_WIDTH - 30,
        Math.max(30, x),
      ),
      y: Math.min(
        CANVAS_HEIGHT - 30,
        Math.max(30, y),
      ),
    };
  };

  const addObject = (
    kind: ObjectKind,
    point: CanvasPoint,
  ) => {
    pushHistory();

    const id =
      `${kind}-${nextIdRef.current}`;

    nextIdRef.current += 1;

    setObjects((current) => [
      ...current,
      {
        id,
        kind,
        ...point,
      },
    ]);

    setSelectedId(id);
    setActiveTool("select");
  };

  const handleCanvasPointerDown = (
    event: ReactPointerEvent<SVGSVGElement>,
  ) => {
    const point =
      getCanvasPoint(event);

    if (activeTool === "select") {
      setSelectedId(null);
      return;
    }

    if (
      activeTool === "extinguisher" ||
      activeTool === "exit" ||
      activeTool === "meeting-point"
    ) {
      addObject(activeTool, point);
      return;
    }

    if (activeTool === "route") {
      pushHistory();

      setRoutePoints((current) => [
        ...current,
        point,
      ]);

      return;
    }

    if (activeTool === "wall") {
      if (!pendingWallStart) {
        setPendingWallStart(point);
        return;
      }

      pushHistory();

      setWalls((current) => [
        ...current,
        {
          id: `wall-${nextIdRef.current}`,
          start: pendingWallStart,
          end: point,
        },
      ]);

      nextIdRef.current += 1;

      setPendingWallStart(null);
      setActiveTool("select");
    }
  };

  const handleObjectPointerDown = (
    event: ReactPointerEvent<SVGGElement>,
    objectId: string,
  ) => {
    if (activeTool !== "select") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    pushHistory();

    setSelectedId(objectId);
    setDraggingId(objectId);

    svgRef.current?.setPointerCapture(
      event.pointerId,
    );
  };

  const handlePointerMove = (
    event: ReactPointerEvent<SVGSVGElement>,
  ) => {
    if (!draggingId) {
      return;
    }

    const point =
      getCanvasPoint(event);

    setObjects((current) =>
      current.map((item) =>
        item.id === draggingId
          ? {
              ...item,
              ...point,
            }
          : item,
      ),
    );
  };

  const finishDragging = (
    event: ReactPointerEvent<SVGSVGElement>,
  ) => {
    if (!draggingId) {
      return;
    }

    setDraggingId(null);

    if (
      svgRef.current?.hasPointerCapture(
        event.pointerId,
      )
    ) {
      svgRef.current.releasePointerCapture(
        event.pointerId,
      );
    }
  };

  const undo = () => {
    if (history.length === 0) {
      return;
    }

    const previous =
      history[history.length - 1];

    setObjects(
      cloneObjects(previous.objects),
    );

    setRoutePoints(
      clonePoints(previous.routePoints),
    );

    setWalls(
      cloneWalls(previous.walls),
    );

    setHistory((current) =>
      current.slice(0, -1),
    );

    setSelectedId(null);
    setDraggingId(null);
    setPendingWallStart(null);
    setActiveTool("select");
  };

  const reset = () => {
    pushHistory();

    setObjects(
      cloneObjects(INITIAL_OBJECTS),
    );

    setRoutePoints(
      clonePoints(INITIAL_ROUTE),
    );

    setWalls(
      cloneWalls(INITIAL_WALLS),
    );

    setSelectedId(
      INITIAL_OBJECTS[0].id,
    );

    setDraggingId(null);
    setPendingWallStart(null);
    setActiveTool("select");
  };

  const deleteSelected = () => {
    if (!selectedId) {
      return;
    }

    pushHistory();

    setObjects((current) =>
      current.filter(
        (item) =>
          item.id !== selectedId,
      ),
    );

    setSelectedId(null);
  };

  const clearRoute = () => {
    if (routePoints.length === 0) {
      return;
    }

    pushHistory();
    setRoutePoints([]);
  };

  const instruction = (() => {
    if (activeTool === "select") {
      return copy.instructions.select;
    }

    if (activeTool === "extinguisher") {
      return copy.instructions.extinguisher;
    }

    if (activeTool === "exit") {
      return copy.instructions.exit;
    }

    if (
      activeTool === "meeting-point"
    ) {
      return copy.instructions.meetingPoint;
    }

    if (activeTool === "route") {
      return copy.instructions.route;
    }

    return pendingWallStart
      ? copy.instructions.wallEnd
      : copy.instructions.wallStart;
  })();

  const toolItems: {
    id: Tool;
    label: string;
    icon: string;
  }[] = [
    {
      id: "select",
      label: copy.tools.select,
      icon: "↖",
    },
    {
      id: "extinguisher",
      label: copy.tools.extinguisher,
      icon: "E",
    },
    {
      id: "exit",
      label: copy.tools.exit,
      icon: "→",
    },
    {
      id: "meeting-point",
      label: copy.tools.meetingPoint,
      icon: "P",
    },
    {
      id: "route",
      label: copy.tools.route,
      icon: "↝",
    },
    {
      id: "wall",
      label: copy.tools.wall,
      icon: "╱",
    },
  ];

  const routePolyline =
    routePoints
      .map(
        (point) =>
          `${point.x},${point.y}`,
      )
      .join(" ");

  const selectedName =
    selectedObject?.kind ===
    "extinguisher"
      ? copy.objectNames.extinguisher
      : selectedObject?.kind === "exit"
        ? copy.objectNames.exit
        : selectedObject?.kind ===
            "meeting-point"
          ? copy.objectNames.meetingPoint
          : null;

  return (
    <div className="flex min-h-[36rem] w-full min-w-0 max-w-full flex-col overflow-hidden bg-slate-950 text-white sm:min-h-[33rem]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-[0.65rem] font-black text-slate-950">
            EP
          </span>

          <div className="min-w-0">
            <p className="truncate text-xs font-bold">
              EvacuaPlan Studio
            </p>

            <p className="truncate text-[0.56rem] font-semibold uppercase tracking-[0.13em] text-emerald-300">
              {copy.demoLabel}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            disabled={history.length === 0}
            className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-[0.62rem] font-bold text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            onClick={undo}
          >
            {copy.undo}
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-[0.62rem] font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
            onClick={reset}
          >
            {copy.reset}
          </button>
        </div>
      </div>

      <div className="w-full min-w-0 max-w-full overflow-hidden border-b border-slate-800 bg-slate-900/70 p-2">
        <div className="flex w-full min-w-0 max-w-full gap-1.5 overflow-x-auto overscroll-x-contain pb-1">
          {toolItems.map((tool) => {
            const selected =
              activeTool === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-[0.65rem] font-bold transition ${
                  selected
                    ? "border-emerald-300 bg-emerald-300 text-slate-950"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white"
                }`}
                aria-pressed={selected}
                onClick={() => {
                  setActiveTool(tool.id);
                  setPendingWallStart(null);
                }}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded text-[0.68rem] font-black ${
                    selected
                      ? "bg-slate-950/10"
                      : "bg-slate-800"
                  }`}
                  aria-hidden="true"
                >
                  {tool.icon}
                </span>

                {tool.label}
              </button>
            );
          })}
        </div>

        <p className="mt-1 px-1 text-[0.62rem] leading-4 text-slate-500">
          {instruction}
        </p>
      </div>

      <div className="min-w-0 max-w-full flex-1 overflow-hidden p-3 sm:p-4">
        <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl shadow-black/20">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="block aspect-[16/9] w-full select-none bg-slate-100"
            style={{
              touchAction: "none",
            }}
            onPointerDown={
              handleCanvasPointerDown
            }
            onPointerMove={
              handlePointerMove
            }
            onPointerUp={
              finishDragging
            }
            onPointerCancel={
              finishDragging
            }
          >
            <defs>
              <pattern
                id="evacuaplan-grid"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 28 0 L 0 0 0 28"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              </pattern>

              <marker
                id="evacuaplan-arrow"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M0,0 L0,6 L9,3 z"
                  fill="#16a34a"
                />
              </marker>
            </defs>

            <rect
              x="0"
              y="0"
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              fill="url(#evacuaplan-grid)"
            />

            <rect
              x="45"
              y="45"
              width="910"
              height="470"
              rx="8"
              fill="#f8fafc"
              stroke="#334155"
              strokeWidth="8"
            />

            <line
              x1="330"
              y1="45"
              x2="330"
              y2="215"
              stroke="#475569"
              strokeWidth="8"
            />

            <line
              x1="330"
              y1="315"
              x2="330"
              y2="515"
              stroke="#475569"
              strokeWidth="8"
            />

            <line
              x1="650"
              y1="45"
              x2="650"
              y2="210"
              stroke="#475569"
              strokeWidth="8"
            />

            <line
              x1="650"
              y1="315"
              x2="650"
              y2="515"
              stroke="#475569"
              strokeWidth="8"
            />

            <line
              x1="45"
              y1="275"
              x2="255"
              y2="275"
              stroke="#475569"
              strokeWidth="8"
            />

            <line
              x1="405"
              y1="275"
              x2="575"
              y2="275"
              stroke="#475569"
              strokeWidth="8"
            />

            <line
              x1="725"
              y1="275"
              x2="955"
              y2="275"
              stroke="#475569"
              strokeWidth="8"
            />

            <g
              pointerEvents="none"
              fill="#64748b"
              fontFamily="sans-serif"
              fontSize="22"
              fontWeight="700"
              textAnchor="middle"
            >
              <text x="185" y="150">
                {copy.rooms.reception}
              </text>

              <text x="490" y="150">
                {copy.rooms.offices}
              </text>

              <text x="805" y="150">
                {copy.rooms.meeting}
              </text>

              <text x="180" y="415">
                {copy.rooms.storage}
              </text>

              <text x="500" y="445">
                {copy.rooms.corridor}
              </text>

              <text x="805" y="415">
                {copy.rooms.laboratory}
              </text>
            </g>

            {walls.map((wall) => (
              <line
                key={wall.id}
                x1={wall.start.x}
                y1={wall.start.y}
                x2={wall.end.x}
                y2={wall.end.y}
                stroke="#0f172a"
                strokeWidth="10"
                strokeLinecap="round"
                pointerEvents="none"
              />
            ))}

            {routePoints.length >= 2 ? (
              <polyline
                points={routePolyline}
                fill="none"
                stroke="#16a34a"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd="url(#evacuaplan-arrow)"
                pointerEvents="none"
              />
            ) : null}

            {routePoints.map(
              (point, index) => (
                <circle
                  key={`${point.x}-${point.y}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="7"
                  fill="#f8fafc"
                  stroke="#16a34a"
                  strokeWidth="5"
                  pointerEvents="none"
                />
              ),
            )}

            {pendingWallStart ? (
              <circle
                cx={pendingWallStart.x}
                cy={pendingWallStart.y}
                r="12"
                fill="#22d3ee"
                stroke="#0f172a"
                strokeWidth="5"
                pointerEvents="none"
              />
            ) : null}

            {objects.map((item) => {
              const selected =
                item.id === selectedId;

              return (
                <g
                  key={item.id}
                  transform={`translate(${item.x} ${item.y})`}
                  className={
                    activeTool === "select"
                      ? "cursor-grab active:cursor-grabbing"
                      : "cursor-crosshair"
                  }
                  onPointerDown={(event) => {
                    handleObjectPointerDown(
                      event,
                      item.id,
                    );
                  }}
                >
                  {selected ? (
                    <circle
                      r="31"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="5"
                      strokeDasharray="8 5"
                    />
                  ) : null}

                  {item.kind ===
                  "extinguisher" ? (
                    <>
                      <circle
                        r="19"
                        fill="#dc2626"
                        stroke="#ffffff"
                        strokeWidth="4"
                      />

                      <text
                        x="0"
                        y="7"
                        fill="#ffffff"
                        fontFamily="sans-serif"
                        fontSize="20"
                        fontWeight="900"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        E
                      </text>
                    </>
                  ) : null}

                  {item.kind === "exit" ? (
                    <>
                      <rect
                        x="-25"
                        y="-18"
                        width="50"
                        height="36"
                        rx="7"
                        fill="#16a34a"
                        stroke="#ffffff"
                        strokeWidth="4"
                      />

                      <text
                        x="0"
                        y="8"
                        fill="#ffffff"
                        fontFamily="sans-serif"
                        fontSize="25"
                        fontWeight="900"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        →
                      </text>
                    </>
                  ) : null}

                  {item.kind ===
                  "meeting-point" ? (
                    <>
                      <circle
                        r="21"
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="4"
                      />

                      <text
                        x="0"
                        y="7"
                        fill="#ffffff"
                        fontFamily="sans-serif"
                        fontSize="20"
                        fontWeight="900"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        P
                      </text>
                    </>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3 grid min-w-0 max-w-full gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-3">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.13em] text-slate-500">
              {copy.selected}
            </p>

            <p className="mt-1 text-xs font-bold text-white">
              {selectedName ??
                copy.noneSelected}
            </p>

            {selectedObject ? (
              <p className="mt-1 text-[0.62rem] text-slate-500">
                X:{" "}
                {Math.round(
                  selectedObject.x,
                )}{" "}
                · Y:{" "}
                {Math.round(
                  selectedObject.y,
                )}
              </p>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-wrap gap-2">
            <button
              type="button"
              disabled={!selectedId}
              className="min-h-11 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 text-[0.65rem] font-bold text-rose-200 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-35"
              onClick={deleteSelected}
            >
              {copy.delete}
            </button>

            <button
              type="button"
              disabled={
                routePoints.length === 0
              }
              className="min-h-11 rounded-xl border border-slate-700 px-3 text-[0.65rem] font-bold text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              onClick={clearRoute}
            >
              {copy.clearRoute}
            </button>
          </div>
        </div>

        <div className="mt-2 grid min-w-0 max-w-full grid-cols-3 gap-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-center">
            <p className="text-base font-black">
              {objects.length}
            </p>

            <p className="text-[0.56rem] text-slate-500">
              {copy.objects}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-center">
            <p className="text-base font-black">
              {routePoints.length}
            </p>

            <p className="text-[0.56rem] text-slate-500">
              {copy.routePoints}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-center">
            <p className="text-base font-black">
              {walls.length}
            </p>

            <p className="text-[0.56rem] text-slate-500">
              {copy.customWalls}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}