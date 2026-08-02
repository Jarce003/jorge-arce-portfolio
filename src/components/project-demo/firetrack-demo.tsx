"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Locale } from "@/lib/i18n";

type FireTrackDemoProps = {
  lang: Locale;
};

type DemoView =
  | "login"
  | "dashboard"
  | "inventory"
  | "asset"
  | "qr"
  | "floorplan"
  | "activity";

type AssetStatus =
  | "operational"
  | "maintenance"
  | "out-of-service";

type InventoryFilter =
  | "all"
  | AssetStatus;

type DemoAsset = {
  id: string;
  code: string;
  location: Record<Locale, string>;
  agent: Record<Locale, string>;
  capacity: string;
  status: AssetStatus;
  lastInspection: string;
  nextMaintenance: string;
  mapPosition: {
    x: number;
    y: number;
  };
};

const DEMO_EMAIL =
  "demo@firetrack.local";

const DEMO_PASSWORD =
  "FireTrack2026";

const demoAssets: DemoAsset[] = [
  {
    id: "ext-001",
    code: "EXT-001",
    location: {
      es: "Recepción principal",
      en: "Main reception",
    },
    agent: {
      es: "Polvo químico ABC",
      en: "ABC dry chemical",
    },
    capacity: "10 lb",
    status: "operational",
    lastInspection: "28 Jul 2026",
    nextMaintenance: "18 Jun 2027",
    mapPosition: {
      x: 18,
      y: 28,
    },
  },
  {
    id: "ext-002",
    code: "EXT-002",
    location: {
      es: "Bodega de suministros",
      en: "Supply warehouse",
    },
    agent: {
      es: "Dióxido de carbono",
      en: "Carbon dioxide",
    },
    capacity: "10 lb",
    status: "maintenance",
    lastInspection: "12 Jul 2026",
    nextMaintenance: "04 Aug 2026",
    mapPosition: {
      x: 76,
      y: 25,
    },
  },
  {
    id: "ext-003",
    code: "EXT-003",
    location: {
      es: "Laboratorio",
      en: "Laboratory",
    },
    agent: {
      es: "Agente limpio",
      en: "Clean agent",
    },
    capacity: "11 lb",
    status: "out-of-service",
    lastInspection: "22 Jul 2026",
    nextMaintenance: "Pendiente",
    mapPosition: {
      x: 73,
      y: 72,
    },
  },
  {
    id: "ext-004",
    code: "EXT-004",
    location: {
      es: "Sala de reuniones",
      en: "Meeting room",
    },
    agent: {
      es: "Polvo químico ABC",
      en: "ABC dry chemical",
    },
    capacity: "10 lb",
    status: "operational",
    lastInspection: "25 Jul 2026",
    nextMaintenance: "07 May 2027",
    mapPosition: {
      x: 38,
      y: 70,
    },
  },
  {
    id: "ext-005",
    code: "EXT-005",
    location: {
      es: "Cuarto eléctrico",
      en: "Electrical room",
    },
    agent: {
      es: "Dióxido de carbono",
      en: "Carbon dioxide",
    },
    capacity: "15 lb",
    status: "maintenance",
    lastInspection: "18 Jul 2026",
    nextMaintenance: "10 Aug 2026",
    mapPosition: {
      x: 91,
      y: 73,
    },
  },
  {
    id: "ext-006",
    code: "EXT-006",
    location: {
      es: "Pasillo administrativo",
      en: "Administrative hallway",
    },
    agent: {
      es: "Polvo químico ABC",
      en: "ABC dry chemical",
    },
    capacity: "10 lb",
    status: "operational",
    lastInspection: "30 Jul 2026",
    nextMaintenance: "21 Apr 2027",
    mapPosition: {
      x: 48,
      y: 42,
    },
  },
];

const QR_SIZE = 21;

function isFinderCell(
  row: number,
  column: number,
) {
  const origins = [
    [0, 0],
    [0, QR_SIZE - 7],
    [QR_SIZE - 7, 0],
  ];

  return origins.some(
    ([originRow, originColumn]) => {
      const localRow =
        row - originRow;

      const localColumn =
        column - originColumn;

      if (
        localRow < 0 ||
        localRow > 6 ||
        localColumn < 0 ||
        localColumn > 6
      ) {
        return false;
      }

      const outer =
        localRow === 0 ||
        localRow === 6 ||
        localColumn === 0 ||
        localColumn === 6;

      const center =
        localRow >= 2 &&
        localRow <= 4 &&
        localColumn >= 2 &&
        localColumn <= 4;

      return outer || center;
    },
  );
}

function QrPreview({
  label,
}: {
  label: string;
}) {
  const cells = Array.from(
    {
      length: QR_SIZE * QR_SIZE,
    },
    (_, index) => {
      const row = Math.floor(
        index / QR_SIZE,
      );

      const column =
        index % QR_SIZE;

      const filled =
        isFinderCell(row, column) ||
        ((row * 3 +
          column * 5 +
          row * column) %
          11 <
          4 &&
          !(row < 8 && column < 8));

      return (
        <span
          key={`${row}-${column}`}
          className={
            filled
              ? "bg-slate-950"
              : "bg-white"
          }
          aria-hidden="true"
        />
      );
    },
  );

  return (
    <div
      className="grid aspect-square w-36 grid-cols-[repeat(21,minmax(0,1fr))] gap-px border-[10px] border-white bg-white shadow-lg shadow-black/30 sm:w-40"
      aria-label={label}
    >
      {cells}
    </div>
  );
}

export function FireTrackDemo({
  lang,
}: FireTrackDemoProps) {
  const copy =
    lang === "es"
      ? {
          demoLabel:
            "Demo interactiva",
          loginTitle:
            "Ingrese a FireTrack",
          loginDescription:
            "Utilice las credenciales precargadas para explorar un flujo simplificado.",
          email: "Correo electrónico",
          password: "Contraseña",
          login:
            "Ingresar a la demostración",
          validating:
            "Validando acceso...",
          required:
            "Complete el correo y la contraseña.",

          reset: "Reiniciar",
          nav: {
            dashboard: "Panel",
            inventory: "Inventario",
            floorplan: "Croquis",
            activity: "Actividad",
          },
          dashboard:
            "Panel operativo",
          dashboardDescription:
            "Resumen de la operación y equipos que requieren atención.",
          totalAssets: "Equipos",
          operational: "Operativos",
          attention: "Atención",
          outOfService:
            "Fuera de servicio",
          sampleInventory:
            "Inventario de muestra",
          openInventory:
            "Ver inventario",
          recentActivity:
            "Actividad reciente",
          inventory: "Inventario",
          inventoryDescription:
            "Busque, filtre y seleccione un equipo.",
          searchPlaceholder:
            "Buscar código, ubicación o agente",
          all: "Todos",
          maintenance:
            "Próximo a mantenimiento",
          noResults:
            "No se encontraron equipos con estos filtros.",
          assetTitle:
            "Ficha del equipo",
          backToInventory:
            "Volver al inventario",
          location: "Ubicación",
          agent: "Agente",
          capacity: "Capacidad",
          lastInspection:
            "Última inspección",
          nextMaintenance:
            "Próximo mantenimiento",
          openQr:
            "Ver etiqueta QR",
          locate:
            "Ubicar en croquis",
          qrTitle:
            "Acceso rápido mediante QR",
          qrDescription:
            "Cada etiqueta puede dirigir a una ficha pública controlada del equipo.",
          qrLabel:
            "Código QR ficticio de demostración",
          backToAsset:
            "Volver a la ficha",
          floorplan:
            "Croquis operativo",
          floorplanDescription:
            "Seleccione un marcador para identificar el equipo y abrir su ficha.",
          openAsset:
            "Abrir ficha",
          activity:
            "Actividad reciente",
          activityDescription:
            "Ejemplo de trazabilidad y cambios registrados en la plataforma.",
          localNotice:
            "Todos los registros mostrados son ficticios.",
          activities: [
            {
              time: "08:42",
              title:
                "Inspección registrada",
              detail:
                "EXT-001 · Recepción principal",
            },
            {
              time: "Ayer",
              title:
                "Estado actualizado",
              detail:
                "EXT-003 · Fuera de servicio",
            },
            {
              time: "28 Jul",
              title:
                "Mantenimiento programado",
              detail:
                "EXT-002 · Bodega de suministros",
            },
            {
              time: "25 Jul",
              title:
                "Etiqueta QR consultada",
              detail:
                "EXT-004 · Sala de reuniones",
            },
          ],
        }
      : {
          demoLabel:
            "Interactive demo",
          loginTitle:
            "Sign in to FireTrack",
          loginDescription:
            "Use the prefilled credentials to explore a simplified workflow.",
          email: "Email address",
          password: "Password",
          login:
            "Enter the demonstration",
          validating:
            "Validating access...",
          required:
            "Enter both the email and password.",

          reset: "Reset",
          nav: {
            dashboard: "Dashboard",
            inventory: "Inventory",
            floorplan: "Floor plan",
            activity: "Activity",
          },
          dashboard:
            "Operations dashboard",
          dashboardDescription:
            "Overview of the operation and assets requiring attention.",
          totalAssets: "Assets",
          operational: "Operational",
          attention: "Attention",
          outOfService:
            "Out of service",
          sampleInventory:
            "Sample inventory",
          openInventory:
            "View inventory",
          recentActivity:
            "Recent activity",
          inventory: "Inventory",
          inventoryDescription:
            "Search, filter and select an asset.",
          searchPlaceholder:
            "Search code, location or agent",
          all: "All",
          maintenance:
            "Maintenance approaching",
          noResults:
            "No assets were found with these filters.",
          assetTitle:
            "Asset record",
          backToInventory:
            "Back to inventory",
          location: "Location",
          agent: "Agent",
          capacity: "Capacity",
          lastInspection:
            "Last inspection",
          nextMaintenance:
            "Next maintenance",
          openQr:
            "View QR label",
          locate:
            "Locate on floor plan",
          qrTitle:
            "Quick access through QR",
          qrDescription:
            "Each label can open a controlled public asset record.",
          qrLabel:
            "Fictional demonstration QR code",
          backToAsset:
            "Back to asset",
          floorplan:
            "Operational floor plan",
          floorplanDescription:
            "Select a marker to identify an asset and open its record.",
          openAsset:
            "Open record",
          activity:
            "Recent activity",
          activityDescription:
            "Example of traceability and changes recorded in the platform.",
          localNotice:
            "Every record shown here is fictional.",
          activities: [
            {
              time: "08:42",
              title:
                "Inspection registered",
              detail:
                "EXT-001 · Main reception",
            },
            {
              time: "Yesterday",
              title:
                "Status updated",
              detail:
                "EXT-003 · Out of service",
            },
            {
              time: "28 Jul",
              title:
                "Maintenance scheduled",
              detail:
                "EXT-002 · Supply warehouse",
            },
            {
              time: "25 Jul",
              title:
                "QR label opened",
              detail:
                "EXT-004 · Meeting room",
            },
          ],
        };

  const [view, setView] =
    useState<DemoView>("login");

  const [email, setEmail] =
    useState(DEMO_EMAIL);

  const [password, setPassword] =
    useState(DEMO_PASSWORD);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    inventoryFilter,
    setInventoryFilter,
  ] = useState<InventoryFilter>("all");

  const [
    selectedAssetId,
    setSelectedAssetId,
  ] = useState(demoAssets[1].id);

  const timerRef =
    useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(
          timerRef.current,
        );
      }
    };
  }, []);

  const selectedAsset =
    demoAssets.find(
      (asset) =>
        asset.id === selectedAssetId,
    ) ?? demoAssets[0];

  const filteredAssets = useMemo(
    () => {
      const normalizedSearch =
        search
          .trim()
          .toLocaleLowerCase();

      return demoAssets.filter(
        (asset) => {
          const matchesFilter =
            inventoryFilter === "all" ||
            asset.status ===
              inventoryFilter;

          const searchableText = [
            asset.code,
            asset.location[lang],
            asset.agent[lang],
          ]
            .join(" ")
            .toLocaleLowerCase();

          const matchesSearch =
            normalizedSearch.length === 0 ||
            searchableText.includes(
              normalizedSearch,
            );

          return (
            matchesFilter &&
            matchesSearch
          );
        },
      );
    },
    [
      inventoryFilter,
      lang,
      search,
    ],
  );

  const getStatusLabel = (
    status: AssetStatus,
  ) => {
    if (status === "operational") {
      return copy.operational;
    }

    if (status === "maintenance") {
      return copy.maintenance;
    }

    return copy.outOfService;
  };

  const getStatusClass = (
    status: AssetStatus,
  ) => {
    if (status === "operational") {
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
    }

    if (status === "maintenance") {
      return "border-amber-400/30 bg-amber-400/10 text-amber-200";
    }

    return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  };

  const openInventory = (
    filter: InventoryFilter,
  ) => {
    setInventoryFilter(filter);
    setSearch("");
    setView("inventory");
  };

  const openAsset = (
    assetId: string,
  ) => {
    setSelectedAssetId(assetId);
    setView("asset");
  };

  const resetDemo = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(
        timerRef.current,
      );

      timerRef.current = null;
    }

    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setIsLoading(false);
    setError("");
    setSearch("");
    setInventoryFilter("all");
    setSelectedAssetId(
      demoAssets[1].id,
    );
    setView("login");
  };

  const handleLogin = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !email.trim() ||
      !password.trim()
    ) {
      setError(copy.required);
      return;
    }

    setError("");
    setIsLoading(true);

    timerRef.current =
      window.setTimeout(() => {
        setIsLoading(false);
        setView("dashboard");
        timerRef.current = null;
      }, 650);
  };

  const navigationItems: {
    view: DemoView;
    label: string;
  }[] = [
    {
      view: "dashboard",
      label: copy.nav.dashboard,
    },
    {
      view: "inventory",
      label: copy.nav.inventory,
    },
    {
      view: "floorplan",
      label: copy.nav.floorplan,
    },
    {
      view: "activity",
      label: copy.nav.activity,
    },
  ];

  const renderStatusBadge = (
    status: AssetStatus,
  ) => (
    <span
      className={`rounded-full border px-2 py-1 text-[0.56rem] font-bold leading-3 ${getStatusClass(
        status,
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );

  return (
    <div className="flex min-h-[34rem] flex-col bg-slate-950 text-white sm:min-h-[30rem]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-[0.65rem] font-black text-slate-950">
            FT
          </span>

          <div className="min-w-0">
            <p className="truncate text-xs font-bold">
              FireTrack
            </p>

            <p className="truncate text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-cyan-300">
              {copy.demoLabel}
            </p>
          </div>
        </div>

        {view !== "login" ? (
          <button
            type="button"
            className="shrink-0 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[0.65rem] font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
            onClick={resetDemo}
          >
            {copy.reset}
          </button>
        ) : null}
      </div>

      {view !== "login" ? (
        <nav
          className="flex gap-1 overflow-x-auto border-b border-slate-800 bg-slate-900/70 px-2 py-2"
          aria-label={
            lang === "es"
              ? "Módulos de la demostración"
              : "Demonstration modules"
          }
        >
          {navigationItems.map(
            (item) => {
              const isActive =
                view === item.view ||
                ((view === "asset" ||
                  view === "qr") &&
                  item.view ===
                    "inventory");

              return (
                <button
                  key={item.view}
                  type="button"
                  className={`min-h-9 shrink-0 rounded-lg px-3 text-[0.68rem] font-bold transition ${
                    isActive
                      ? "bg-white text-slate-950"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                  onClick={() => {
                    setView(item.view);
                  }}
                >
                  {item.label}
                </button>
              );
            },
          )}
        </nav>
      ) : null}

      {view === "login" ? (
        <div className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.13),_transparent_52%)] p-4 sm:p-6">
          <form
            className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900/90 p-4 shadow-xl shadow-black/25 sm:p-5"
            onSubmit={handleLogin}
          >
            <p className="text-lg font-bold">
              {copy.loginTitle}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {copy.loginDescription}
            </p>

            <label className="mt-4 block">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400">
                {copy.email}
              </span>

              <input
                type="email"
                value={email}
                autoComplete="off"
                className="mt-1.5 h-10 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15"
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  );
                }}
              />
            </label>

            <label className="mt-3 block">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400">
                {copy.password}
              </span>

              <input
                type="password"
                value={password}
                autoComplete="off"
                className="mt-1.5 h-10 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15"
                onChange={(event) => {
                  setPassword(
                    event.target.value,
                  );
                }}
              />
            </label>

            {error ? (
              <p
                className="mt-3 rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-200"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-cyan-400 px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-70"
            >
              {isLoading
                ? copy.validating
                : copy.login}
            </button>


          </form>
        </div>
      ) : null}

      {view === "dashboard" ? (
        <div className="flex-1 p-4 sm:p-5">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-cyan-300">
              FireTrack Demo
            </p>

            <h4 className="mt-1 text-lg font-bold">
              {copy.dashboard}
            </h4>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {copy.dashboardDescription}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              {
                value: "24",
                label: copy.totalAssets,
                filter: "all" as const,
              },
              {
                value: "20",
                label: copy.operational,
                filter:
                  "operational" as const,
              },
              {
                value: "3",
                label: copy.attention,
                filter:
                  "maintenance" as const,
              },
              {
                value: "1",
                label:
                  copy.outOfService,
                filter:
                  "out-of-service" as const,
              },
            ].map((metric) => (
              <button
                key={metric.label}
                type="button"
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-left transition hover:border-cyan-400/50 hover:bg-slate-800"
                onClick={() => {
                  openInventory(
                    metric.filter,
                  );
                }}
              >
                <p className="text-xl font-black">
                  {metric.value}
                </p>

                <p className="mt-0.5 text-[0.64rem] leading-4 text-slate-400">
                  {metric.label}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
              <div className="flex items-center justify-between border-b border-slate-800 px-3.5 py-3">
                <p className="text-sm font-bold">
                  {copy.sampleInventory}
                </p>

                <button
                  type="button"
                  className="text-[0.62rem] font-bold text-cyan-300"
                  onClick={() => {
                    openInventory("all");
                  }}
                >
                  {copy.openInventory}
                </button>
              </div>

              <div className="divide-y divide-slate-800">
                {demoAssets
                  .slice(0, 3)
                  .map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left transition hover:bg-slate-800"
                      onClick={() => {
                        openAsset(
                          asset.id,
                        );
                      }}
                    >
                      <div className="min-w-0">
                        <p className="text-[0.7rem] font-black">
                          {asset.code}
                        </p>

                        <p className="truncate text-[0.6rem] text-slate-500">
                          {
                            asset.location[
                              lang
                            ]
                          }
                        </p>
                      </div>

                      {renderStatusBadge(
                        asset.status,
                      )}
                    </button>
                  ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">
                  {copy.recentActivity}
                </p>

                <button
                  type="button"
                  className="text-[0.62rem] font-bold text-cyan-300"
                  onClick={() => {
                    setView("activity");
                  }}
                >
                  →
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {copy.activities
                  .slice(0, 3)
                  .map((item) => (
                    <div
                      key={`${item.time}-${item.title}`}
                      className="flex gap-2.5"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />

                      <div>
                        <p className="text-[0.65rem] font-bold leading-4">
                          {item.title}
                        </p>

                        <p className="text-[0.58rem] leading-4 text-slate-500">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[0.62rem] text-slate-600">
            {copy.localNotice}
          </p>
        </div>
      ) : null}

      {view === "inventory" ? (
        <div className="flex-1 p-4 sm:p-5">
          <h4 className="text-lg font-bold">
            {copy.inventory}
          </h4>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {copy.inventoryDescription}
          </p>

          <input
            type="search"
            value={search}
            placeholder={
              copy.searchPlaceholder
            }
            className="mt-4 h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15"
            onChange={(event) => {
              setSearch(
                event.target.value,
              );
            }}
          />

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {[
              {
                value: "all" as const,
                label: copy.all,
              },
              {
                value:
                  "operational" as const,
                label:
                  copy.operational,
              },
              {
                value:
                  "maintenance" as const,
                label:
                  copy.attention,
              },
              {
                value:
                  "out-of-service" as const,
                label:
                  copy.outOfService,
              },
            ].map((filter) => {
              const isActive =
                inventoryFilter ===
                filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  className={`min-h-8 shrink-0 rounded-full border px-3 text-[0.62rem] font-bold transition ${
                    isActive
                      ? "border-cyan-300 bg-cyan-300 text-slate-950"
                      : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                  }`}
                  onClick={() => {
                    setInventoryFilter(
                      filter.value,
                    );
                  }}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            {filteredAssets.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {filteredAssets.map(
                  (asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition hover:bg-slate-800"
                      onClick={() => {
                        openAsset(
                          asset.id,
                        );
                      }}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-black">
                          {asset.code}
                        </p>

                        <p className="mt-0.5 truncate text-[0.68rem] text-slate-400">
                          {
                            asset.location[
                              lang
                            ]
                          }
                        </p>

                        <p className="truncate text-[0.58rem] text-slate-600">
                          {
                            asset.agent[
                              lang
                            ]
                          }{" "}
                          · {asset.capacity}
                        </p>
                      </div>

                      {renderStatusBadge(
                        asset.status,
                      )}
                    </button>
                  ),
                )}
              </div>
            ) : (
              <p className="px-4 py-10 text-center text-xs text-slate-500">
                {copy.noResults}
              </p>
            )}
          </div>

          <p className="mt-3 text-center text-[0.62rem] text-slate-600">
            {copy.localNotice}
          </p>
        </div>
      ) : null}

      {view === "asset" ? (
        <div className="flex-1 p-4 sm:p-5">
          <button
            type="button"
            className="text-xs font-bold text-cyan-300 transition hover:text-cyan-200"
            onClick={() => {
              setView("inventory");
            }}
          >
            ← {copy.backToInventory}
          </button>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-slate-500">
                {copy.assetTitle}
              </p>

              <h4 className="mt-1 text-2xl font-black">
                {selectedAsset.code}
              </h4>
            </div>

            {renderStatusBadge(
              selectedAsset.status,
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {[
              {
                label: copy.location,
                value:
                  selectedAsset.location[
                    lang
                  ],
              },
              {
                label: copy.agent,
                value:
                  selectedAsset.agent[
                    lang
                  ],
              },
              {
                label: copy.capacity,
                value:
                  selectedAsset.capacity,
              },
              {
                label:
                  copy.lastInspection,
                value:
                  selectedAsset.lastInspection,
              },
              {
                label:
                  copy.nextMaintenance,
                value:
                  selectedAsset.nextMaintenance,
              },
            ].map((field) => (
              <div
                key={field.label}
                className="rounded-xl border border-slate-800 bg-slate-900 p-3"
              >
                <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-slate-500">
                  {field.label}
                </p>

                <p className="mt-1.5 text-xs font-bold leading-5">
                  {field.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-400 px-3 text-xs font-black text-slate-950 transition hover:bg-cyan-300"
              onClick={() => {
                setView("qr");
              }}
            >
              {copy.openQr}
            </button>

            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 px-3 text-xs font-bold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              onClick={() => {
                setView("floorplan");
              }}
            >
              {copy.locate}
            </button>
          </div>

          <p className="mt-3 text-center text-[0.62rem] text-slate-600">
            {copy.localNotice}
          </p>
        </div>
      ) : null}

      {view === "qr" ? (
        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center sm:p-5">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-cyan-300">
            {selectedAsset.code}
          </p>

          <h4 className="mt-1 text-lg font-black">
            {copy.qrTitle}
          </h4>

          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
            {copy.qrDescription}
          </p>

          <div className="mt-4">
            <QrPreview
              label={copy.qrLabel}
            />
          </div>

          <button
            type="button"
            className="mt-4 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold transition hover:border-cyan-400 hover:text-cyan-200"
            onClick={() => {
              setView("asset");
            }}
          >
            ← {copy.backToAsset}
          </button>

          <p className="mt-3 text-[0.62rem] text-slate-600">
            {copy.localNotice}
          </p>
        </div>
      ) : null}

      {view === "floorplan" ? (
        <div className="flex-1 p-4 sm:p-5">
          <h4 className="text-lg font-bold">
            {copy.floorplan}
          </h4>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {copy.floorplanDescription}
          </p>

          <div className="relative mt-4 h-64 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.25) 1px, transparent 1px)",
                backgroundSize:
                  "18px 18px",
              }}
            />

            <div className="absolute left-[7%] top-[10%] h-[35%] w-[34%] border-2 border-slate-600 bg-slate-800/60">
              <span className="p-2 text-[0.55rem] font-bold text-slate-500">
                Reception
              </span>
            </div>

            <div className="absolute right-[7%] top-[10%] h-[35%] w-[35%] border-2 border-slate-600 bg-slate-800/60">
              <span className="p-2 text-[0.55rem] font-bold text-slate-500">
                Warehouse
              </span>
            </div>

            <div className="absolute bottom-[8%] left-[7%] h-[38%] w-[43%] border-2 border-slate-600 bg-slate-800/60">
              <span className="p-2 text-[0.55rem] font-bold text-slate-500">
                Offices
              </span>
            </div>

            <div className="absolute bottom-[8%] right-[7%] h-[38%] w-[38%] border-2 border-slate-600 bg-slate-800/60">
              <span className="p-2 text-[0.55rem] font-bold text-slate-500">
                Laboratory
              </span>
            </div>

            {demoAssets.map(
              (asset) => {
                const selected =
                  asset.id ===
                  selectedAsset.id;

                return (
                  <button
                    key={asset.id}
                    type="button"
                    title={`${asset.code} · ${asset.location[lang]}`}
                    className={`absolute z-10 inline-flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[0.52rem] font-black shadow-lg transition ${
                      selected
                        ? "scale-125 border-white bg-cyan-400 text-slate-950"
                        : asset.status ===
                            "out-of-service"
                          ? "border-rose-200 bg-rose-500 text-white"
                          : asset.status ===
                              "maintenance"
                            ? "border-amber-200 bg-amber-400 text-slate-950"
                            : "border-emerald-200 bg-emerald-500 text-white"
                    }`}
                    style={{
                      left: `${asset.mapPosition.x}%`,
                      top: `${asset.mapPosition.y}%`,
                    }}
                    onClick={() => {
                      setSelectedAssetId(
                        asset.id,
                      );
                    }}
                  >
                    {asset.code.slice(-1)}
                  </button>
                );
              },
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-xs font-black">
                {selectedAsset.code}
              </p>

              <p className="truncate text-[0.65rem] text-slate-400">
                {
                  selectedAsset.location[
                    lang
                  ]
                }
              </p>
            </div>

            <button
              type="button"
              className="shrink-0 rounded-lg bg-cyan-400 px-3 py-2 text-[0.62rem] font-black text-slate-950"
              onClick={() => {
                setView("asset");
              }}
            >
              {copy.openAsset}
            </button>
          </div>

          <p className="mt-3 text-center text-[0.62rem] text-slate-600">
            {copy.localNotice}
          </p>
        </div>
      ) : null}

      {view === "activity" ? (
        <div className="flex-1 p-4 sm:p-5">
          <h4 className="text-lg font-bold">
            {copy.activity}
          </h4>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {copy.activityDescription}
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            {copy.activities.map(
              (item, index) => (
                <div
                  key={`${item.time}-${item.title}`}
                  className={`flex gap-3 px-4 py-4 ${
                    index > 0
                      ? "border-t border-slate-800"
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />

                    {index <
                    copy.activities.length -
                      1 ? (
                      <span className="mt-1 h-full w-px bg-slate-700" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold">
                        {item.title}
                      </p>

                      <span className="shrink-0 text-[0.58rem] font-bold text-slate-600">
                        {item.time}
                      </span>
                    </div>

                    <p className="mt-1 text-[0.68rem] leading-5 text-slate-400">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          <p className="mt-3 text-center text-[0.62rem] text-slate-600">
            {copy.localNotice}
          </p>
        </div>
      ) : null}
    </div>
  );
}