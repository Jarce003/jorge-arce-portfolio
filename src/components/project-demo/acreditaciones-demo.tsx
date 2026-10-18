"use client";

import { useState } from "react";

type Props = { lang: "es" | "en"; compact?: boolean };
type ScenarioId = "priority" | "capacity" | "performance" | "validity";

type Scenario = {
  prompt: string;
  title: string;
  answer: string;
  measure: string;
  stats: { name: string; value: number; label: string }[];
  footnote: string;
};

const content: Record<"es" | "en", {
  kicker: string;
  title: string;
  badge: string;
  tagline: string;
  ask: string;
  inputPlaceholder: string;
  action: string;
  examples: string;
  response: string;
  trace: string[];
  synthetic: string;
  unsupported: string;
  clear: string;
  cases: Record<ScenarioId, Scenario>;
}> = {
  es: {
    kicker: "ASISTENTE INTELIGENTE",
    title: "Pregúntale a los datos.",
    badge: "DEMO INTERACTIVA",
    tagline: "Así se exploran vigencias, rendimiento y planificación sin consultar tablas manualmente.",
    ask: "Tu consulta",
    inputPlaceholder: "Haz una pregunta sobre acreditaciones...",
    action: "Consultar",
    examples: "PRUEBA UNA CONSULTA",
    response: "Respuesta del asistente",
    trace: ["Pregunta", "Interpretación con IA", "Reglas verificadas", "Resultado"],
    synthetic: "Simulación con cifras inventadas. No conecta con el asistente real ni con datos de participantes.",
    unsupported: "Esta demostración admite las cuatro consultas de ejemplo. El sistema privado utiliza interpretación con IA y un motor de datos validado para otras preguntas.",
    clear: "Otra consulta",
    cases: {
      priority: {
        prompt: "¿Qué bloques son prioritarios para evaluar?",
        title: "Prioridades de evaluación",
        answer: "En este conjunto ficticio, el Bloque III concentra la mayor demanda.",
        measure: "35 evaluaciones simuladas",
        stats: [
          { name: "Bloque III", value: 16, label: "16 personas" },
          { name: "Bloque I", value: 12, label: "12 personas" },
          { name: "Bloque II", value: 7, label: "7 personas" },
        ],
        footnote: "Ejemplo de demanda por bloque, sin predecir resultados futuros.",
      },
      capacity: {
        prompt: "¿Cuántas fechas necesitamos con grupos de 20?",
        title: "Planificación de capacidad",
        answer: "Para 35 evaluaciones ficticias y grupos de 20 plazas, se necesitan al menos 2 fechas.",
        measure: "2 fechas estimadas",
        stats: [
          { name: "Fecha 1", value: 20, label: "20 cupos" },
          { name: "Fecha 2", value: 15, label: "15 cupos" },
        ],
        footnote: "Cálculo demostrativo: redondeo hacia arriba de 35 ÷ 20.",
      },
      performance: {
        prompt: "¿Qué bloque tuvo más reprobaciones en 2025?",
        title: "Comparación de rendimiento",
        answer: "En el histórico de muestra de 2025, Bloque III registra más reprobaciones.",
        measure: "13 reprobaciones ficticias",
        stats: [
          { name: "Bloque III", value: 13, label: "13 registros" },
          { name: "Bloque II", value: 8, label: "8 registros" },
          { name: "Bloque I", value: 5, label: "5 registros" },
        ],
        footnote: "Registros de ejemplo; no son estadísticas de la Academia.",
      },
      validity: {
        prompt: "¿Cuántos Maquinistas tienen su ciclo vigente?",
        title: "Estado de las acreditaciones",
        answer: "De 70 perfiles ficticios de Maquinista, 48 tienen su acreditación vigente.",
        measure: "48 vigentes",
        stats: [
          { name: "Vigentes", value: 48, label: "48 personas" },
          { name: "Por renovar", value: 15, label: "15 personas" },
          { name: "Incompletos", value: 7, label: "7 personas" },
        ],
        footnote: "Estados inventados para mostrar cómo se visualiza una consulta.",
      },
    },
  },
  en: {
    kicker: "INTELLIGENT ASSISTANT",
    title: "Ask your data.",
    badge: "INTERACTIVE PREVIEW",
    tagline: "Explore expiration cycles, performance and planning without manually reading spreadsheets.",
    ask: "Your question",
    inputPlaceholder: "Ask about accreditation data...",
    action: "Ask",
    examples: "TRY A QUESTION",
    response: "Assistant response",
    trace: ["Question", "AI interpretation", "Validated rules", "Result"],
    synthetic: "Illustrative figures only. This preview is not connected to the private assistant or participant data.",
    unsupported: "This public demo supports four suggested questions. The private system uses AI interpretation and validated data calculations for other queries.",
    clear: "Another question",
    cases: {
      priority: {
        prompt: "Which blocks should be evaluated first?",
        title: "Evaluation priorities",
        answer: "In this fictional dataset, Block III has the largest evaluation demand.",
        measure: "35 simulated evaluations",
        stats: [
          { name: "Block III", value: 16, label: "16 people" },
          { name: "Block I", value: 12, label: "12 people" },
          { name: "Block II", value: 7, label: "7 people" },
        ],
        footnote: "Sample demand per block; no predictions about future passes.",
      },
      capacity: {
        prompt: "How many sessions do we need with groups of 20?",
        title: "Capacity planning",
        answer: "For 35 fictional evaluations and 20 seats per group, at least 2 sessions are required.",
        measure: "2 estimated sessions",
        stats: [
          { name: "Session 1", value: 20, label: "20 seats" },
          { name: "Session 2", value: 15, label: "15 seats" },
        ],
        footnote: "Example calculation: rounding 35 ÷ 20 up.",
      },
      performance: {
        prompt: "Which block had the most failures in 2025?",
        title: "Performance comparison",
        answer: "Block III has the highest number of failures in this made-up 2025 history.",
        measure: "13 fictional failures",
        stats: [
          { name: "Block III", value: 13, label: "13 records" },
          { name: "Block II", value: 8, label: "8 records" },
          { name: "Block I", value: 5, label: "5 records" },
        ],
        footnote: "Example records; not official Academy statistics.",
      },
      validity: {
        prompt: "How many machinery operators are currently accredited?",
        title: "Accreditation status",
        answer: "Of 70 fictional machinery-operator profiles, 48 have a current accreditation.",
        measure: "48 active",
        stats: [
          { name: "Active", value: 48, label: "48 people" },
          { name: "Renewal due", value: 15, label: "15 people" },
          { name: "Incomplete", value: 7, label: "7 people" },
        ],
        footnote: "Fabricated statuses used to demonstrate an interactive data query.",
      },
    },
  },
};

const ids: ScenarioId[] = ["priority", "capacity", "performance", "validity"];

function detectScenario(text: string, lang: Props["lang"]): ScenarioId | null {
  // The public portfolio contains a four-question synthetic showcase, not a
  // generative AI endpoint. Never answer unrelated free-form requests by
  // guessing an intent and substituting a canned number.
  const normalize = (value: string) =>
    value.toLocaleLowerCase(lang).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿?!.]/g, "").replace(/\s+/g, " ").trim();
  const normalized = normalize(text);
  return ids.find((id) => normalized === normalize(content[lang].cases[id].prompt)) ?? null;
}

export function AcreditacionesDemo({ lang, compact = false }: Props) {
  const t = content[lang];
  const [query, setQuery] = useState(t.cases.priority.prompt);
  const [chosen, setChosen] = useState<ScenarioId>("priority");
  const [error, setError] = useState(false);
  const scenario = t.cases[chosen];
  const max = Math.max(...scenario.stats.map((item) => item.value), 1);
  const select = (id: ScenarioId) => {
    setQuery(t.cases[id].prompt);
    setChosen(id);
    setError(false);
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = detectScenario(query, lang);
    if (!next) { setError(true); return; }
    setChosen(next);
    setError(false);
  };

  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-violet-400/30 bg-[#0a1427] text-white shadow-2xl shadow-slate-950/25">
      <header className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/15 text-lg text-violet-200" aria-hidden="true">✳</span>
          <div className="min-w-0">
            <p className="text-[.62rem] font-bold uppercase tracking-[.14em] text-violet-300">{t.kicker}</p>
            <p className="text-sm font-bold">{t.title}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[.58rem] font-bold text-emerald-200">
          {t.badge}
        </span>
      </header>

      <div className={"p-3.5 sm:p-5 " + (compact ? "space-y-3" : "space-y-4")}>
        {!compact && <p className="text-xs leading-6 text-slate-300">{t.tagline}</p>}
        <p className="text-[.61rem] font-bold tracking-[.14em] text-slate-400">{t.examples}</p>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label={t.examples}>
          {ids.map((id) => (
            <button type="button" key={id} aria-pressed={chosen === id && !error} onClick={() => select(id)}
              className={"min-h-9 max-w-48 shrink-0 rounded-lg border px-3 py-2 text-left text-[.67rem] leading-4 transition-colors " + (chosen === id && !error ? "border-violet-300/80 bg-violet-400/20 text-white" : "border-white/15 bg-white/5 text-slate-300 hover:border-violet-300/40")}>
              {t.cases[id].title}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex items-center gap-2">
          <label htmlFor={"ai-query-" + lang + (compact ? "-compact" : "-full")} className="sr-only">{t.ask}</label>
          <input id={"ai-query-" + lang + (compact ? "-compact" : "-full")} value={query} onChange={(event) => setQuery(event.target.value)}
            maxLength={230} placeholder={t.inputPlaceholder}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/20 bg-white/[.055] px-3 text-xs text-white outline-none placeholder:text-slate-500 focus-visible:border-violet-300 sm:text-sm" />
          <button type="submit" className="min-h-11 shrink-0 rounded-xl bg-violet-300 px-3.5 text-xs font-bold text-slate-950 hover:bg-violet-200">
            {t.action} ↗
          </button>
        </form>
        {error && <p role="status" className="rounded-lg bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-200">{t.unsupported}</p>}

        <div className="rounded-xl border border-white/10 bg-white/[.045] p-3.5" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[.64rem] font-bold uppercase tracking-[.12em] text-slate-400">{t.response}</p>
            <span className="text-[.59rem] text-emerald-300">● {t.badge}</span>
          </div>
          <p className="mt-2 text-[1.55rem] font-semibold tracking-[-.04em] text-white">{scenario.measure}</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">{scenario.answer}</p>
          <div className="mt-3 space-y-2">
            {scenario.stats.map((item) => (
              <div key={item.name} className="grid grid-cols-[70px_1fr_auto] items-center gap-2 sm:grid-cols-[90px_1fr_auto]">
                <span className="truncate text-[.64rem] font-medium text-slate-300">{item.name}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300 transition-[width] duration-300" style={{ width: (item.value / max) * 100 + "%" }} />
                </div>
                <span className="text-[.62rem] font-semibold tabular-nums text-violet-200">{item.label}</span>
              </div>
            ))}
          </div>
          {!compact && <p className="mt-3 text-[.67rem] leading-5 text-slate-400">{scenario.footnote}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-1 text-[.55rem] font-medium text-violet-200/90 sm:text-[.61rem]">
          {t.trace.map((step, i) => (
            <span key={step} className="inline-flex items-center gap-1">
              <span className="rounded-md border border-violet-300/20 bg-violet-400/[.075] px-2 py-1">{step}</span>
              {i < t.trace.length - 1 && <span aria-hidden="true" className="text-violet-300">→</span>}
            </span>
          ))}
        </div>
        <p className="text-[.62rem] leading-5 text-slate-400">{t.synthetic}</p>
      </div>
    </div>
  );
}
