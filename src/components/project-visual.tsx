import type { ProjectVisualVariant } from "@/content/site-content";

type ProjectVisualProps = {
  variant: ProjectVisualVariant;
  labels: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
};

export function ProjectVisual({
  variant,
  labels,
}: ProjectVisualProps) {
  if (variant === "evacuaplan") {
    return (
      <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-700 bg-slate-950 p-4 shadow-2xl shadow-slate-950/20">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
          </div>
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {labels.primary}
          </span>
        </div>

        <div className="grid min-h-72 grid-cols-[3.5rem_1fr_4.5rem] gap-3">
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="flex h-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800"
              >
                <span
                  className={`block ${
                    index % 2 === 0
                      ? "h-3 w-3 rounded-sm border border-cyan-400"
                      : "h-0.5 w-4 bg-slate-400"
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-xl bg-slate-100 p-5">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:20px_20px] opacity-35" />

            <div className="relative h-full min-h-64 rounded-lg border-2 border-slate-700 bg-white/90">
              <div className="absolute left-[12%] top-[16%] h-[52%] w-[32%] border-2 border-slate-600" />
              <div className="absolute right-[12%] top-[16%] h-[33%] w-[32%] border-2 border-slate-600" />
              <div className="absolute bottom-[12%] right-[12%] h-[27%] w-[52%] border-2 border-slate-600" />

              <div className="absolute left-[39%] top-[39%] h-4 w-4 rounded-full border-2 border-white bg-cyan-600 shadow" />
              <div className="absolute right-[20%] top-[26%] flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[0.5rem] font-bold text-white">
                E
              </div>

              <div className="absolute bottom-[24%] left-[27%] h-1 w-[36%] rotate-12 bg-emerald-600">
                <span className="absolute -right-1 -top-1.5 h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-emerald-600" />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-2">
            <div className="h-3 rounded bg-slate-700" />
            <div className="h-8 rounded-lg border border-slate-700 bg-slate-800" />
            <div className="h-8 rounded-lg border border-slate-700 bg-slate-800" />
            <div className="h-16 rounded-lg border border-slate-700 bg-slate-800" />

            <p className="pt-2 text-center text-[0.55rem] leading-3 text-slate-500">
              {labels.secondary}
              <br />
              {labels.tertiary}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-700 bg-slate-950 p-4 shadow-2xl shadow-slate-950/20">
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
        </div>

        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {labels.primary}
        </span>
      </div>

      <div className="grid min-h-72 grid-cols-[4.5rem_1fr] gap-3">
        <aside className="rounded-xl border border-slate-800 bg-slate-900 p-2">
          <div className="mb-4 flex h-8 items-center justify-center rounded-lg bg-cyan-500/15 text-[0.55rem] font-bold text-cyan-300">
            FT
          </div>

          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full ${
                  index === 1
                    ? "bg-cyan-400"
                    : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </aside>

        <div className="rounded-xl bg-slate-100 p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="h-2.5 w-24 rounded-full bg-slate-800" />
              <div className="mt-2 h-2 w-36 rounded-full bg-slate-300" />
            </div>
            <div className="h-7 w-20 rounded-lg bg-slate-900" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="h-2 w-12 rounded bg-slate-300" />
              <div className="mt-3 h-6 w-8 rounded bg-cyan-500/25" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="h-2 w-12 rounded bg-slate-300" />
              <div className="mt-3 h-6 w-8 rounded bg-emerald-500/25" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="h-2 w-12 rounded bg-slate-300" />
              <div className="mt-3 h-6 w-8 rounded bg-amber-500/25" />
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-2 w-28 rounded bg-slate-300" />
              <div className="h-5 w-14 rounded-md bg-slate-100" />
            </div>

            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_0.65fr_0.5fr] gap-2"
                >
                  <div className="h-6 rounded bg-slate-100" />
                  <div className="h-6 rounded bg-slate-100" />
                  <div
                    className={`h-6 rounded ${
                      index === 1
                        ? "bg-amber-100"
                        : "bg-emerald-100"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex justify-between text-[0.55rem] font-medium text-slate-500">
            <span>{labels.secondary}</span>
            <span>{labels.tertiary}</span>
          </div>
        </div>
      </div>
    </div>
  );
}