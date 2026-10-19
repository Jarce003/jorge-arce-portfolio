/**
 * Deterministic public demonstration matcher.
 *
 * Intentionally NOT an LLM or a real-data query engine. A query only matches
 * one of the disclosed sample prompts. For any other question, return null
 * instead of silently substituting fictional data.
 */
export type SampleQuestionId = "priority" | "capacity" | "performance" | "validity";
export const sampleQuestionIds: readonly SampleQuestionId[] = [
  "priority", "capacity", "performance", "validity",
] as const;

export function matchSampleQuestion(
  text: string,
  lang: "es" | "en",
  cases: Readonly<Record<SampleQuestionId, { prompt: string }>>,
): SampleQuestionId | null {
  const normalize = (value: string) =>
    value.toLocaleLowerCase(lang)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[¿?!.]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const input = normalize(text);
  if (!input) return null;
  return sampleQuestionIds.find((id) => input === normalize(cases[id].prompt)) ?? null;
}
