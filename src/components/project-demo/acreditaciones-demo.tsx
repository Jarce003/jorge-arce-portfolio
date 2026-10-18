"use client";

import { useMemo, useState } from "react";

type Props = { lang: "es" | "en" };
type Modality = "liviano" | "intermedia" | "maquinista";

const samples: Record<Modality, { label: string; approved: number; pending: number; color: string }> = {
  liviano: { label: "Liviano", approved: 86, pending: 14, color: "bg-emerald-400" },
  intermedia: { label: "Intermedia", approved: 64, pending: 36, color: "bg-sky-400" },
  maquinista: { label: "Maquinista", approved: 72, pending: 28, color: "bg-violet-400" },
};

export function AcreditacionesDemo({ lang }: Props) {
  const [modality, setModality] = useState<Modality>("maquinista");
  const [query, setQuery] = useState("");
  const copy = lang === "es"
    ? { label: "DEMO INTERACTIVA · DATOS FICTICIOS", title: "Centro de acreditaciones", subtitle: "Explora una vista ilustrativa del sistema sin utilizar información real de participantes.", search: "Buscar participante simulado", status: "Estado del ciclo", valid: "Vigentes", pending: "Pendientes", block: "Bloques del ciclo", analytics: "Motor analítico", note: "Representación demostrativa: porcentajes y nombres simulados, no corresponden a registros oficiales.", empty: "No se encontraron participantes ficticios." }
    : { label: "INTERACTIVE DEMO · SYNTHETIC DATA", title: "Accreditation control", subtitle: "Explore an illustrative interface without using real participant data.", search: "Search fictional participant", status: "Cycle status", valid: "Valid", pending: "Pending", block: "Cycle blocks", analytics: "Analytics engine", note: "Illustrative demo: all names and percentages are synthetic, not official records.", empty: "No fictional participants found." };
  const people = useMemo(() => [
    { name: "Alex Rivera", code: "DEMO-001", blocks: ["I", "II", "III"], state: "ok" },
    { name: "Sam Vega", code: "DEMO-002", blocks: ["I", "II"], state: "pending" },
    { name: "Taylor Mora", code: "DEMO-003", blocks: ["I", "III"], state: "pending" },
  ].filter(person => (person.name + person.code).toLowerCase().includes(query.toLowerCase())), [query]);
  const current = samples[modality];

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-700/80 bg-[#0b1426] text-slate-100 shadow-2xl shadow-slate-950/20">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-violet-400/15 text-sm font-bold text-violet-300">A</div>
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-violet-300">{copy.label}</p>
            <h4 className="text-sm font-semibold">{copy.title}</h4>
          </div>
        </div>
        <span className="flex items-center gap-2 text-[0.65rem] text-slate-400"><span className="size-2 rounded-full bg-emerald-400" /> LOCAL PREVIEW</span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label={lang === "es" ? "Modalidad" : "Modality"}>
          {(Object.keys(samples) as Modality[]).map(item => (
            <button key={item} type="button" onClick={() => setModality(item)} aria-pressed={modality === item}
              className={`min-h-10 rounded-xl px-3.5 text-xs font-semibold transition-colors ${modality === item ? "bg-violet-400 text-slate-950" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>
              {samples[item].label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs text-slate-400">{copy.valid}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-emerald-300">{current.approved}%</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full transition-[width] duration-300 ${current.color}`} style={{ width: `${current.approved}%` }} />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs text-slate-400">{copy.pending}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-amber-300">{current.pending}%</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-amber-400 transition-[width] duration-300" style={{ width: `${current.pending}%` }} />
            </div>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-slate-300">{copy.search}</span>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Alex, DEMO-001..."
            className="w-full min-h-11 rounded-xl border border-white/15 bg-white/[0.06] px-3.5 text-sm text-white placeholder:text-slate-500 outline-none focus-visible:border-violet-300" />
        </label>

        <div className="space-y-2" aria-live="polite">
          {people.length === 0 ? <p className="rounded-lg bg-white/5 p-3 text-sm text-slate-400">{copy.empty}</p> : people.map(person => (
            <div key={person.code} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-100">{person.name}</p>
                <p className="text-[0.68rem] text-slate-500">{person.code}</p>
              </div>
              <div className="flex shrink-0 gap-1.5" aria-label={copy.block}>
                {["I", "II", "III"].map(block => (
                  <span key={block} className={`flex size-7 items-center justify-center rounded-lg text-[0.7rem] font-bold ${person.blocks.includes(block) ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"}`}>{block}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[0.69rem] text-slate-400">
          <span>{copy.analytics}</span><span className="font-mono text-violet-300">Python · DuckDB · OR-Tools</span>
        </div>
        <p className="text-[0.66rem] leading-5 text-slate-500">{copy.note}</p>
      </div>
    </div>
  );
}
