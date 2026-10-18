/**
 * Fire is a stylized, fictional gameplay metaphor. It is not a simulation
 * of actual firefighting tactics, extinguishment, or emergency response.
 *
 * A discovered station fades out over a brief, deterministic period;
 * visitors who request reduced motion see the effect end immediately.
 */
export const FIRE_FADE_SECONDS = 0.9;
export const WATER_REACHES_FIRE_SECONDS = 0.58;
export const RESCUE_DURATION_SECONDS = 2.35;

export function rescueIsFinished(elapsedSeconds: number, startedAt: number): boolean {
  return elapsedSeconds - startedAt >= RESCUE_DURATION_SECONDS;
}

export function waterStreamStrength(elapsedSeconds: number, startedAt: number): number {
  const age = elapsedSeconds - startedAt;
  if (age < 0 || age > RESCUE_DURATION_SECONDS) return 0;
  const ramp = Math.max(0, Math.min(1, (age - .12) / .34));
  const tail = Math.max(0, Math.min(1, (RESCUE_DURATION_SECONDS - age) / .28));
  return Math.min(ramp, tail);
}

export function stationFireStrength(
  extinguished: boolean,
  elapsedSeconds: number,
  extinguishedAt: number | undefined,
  reducedMotion: boolean,
): number {
  if (!extinguished) return 1;
  if (reducedMotion) return 0;
  if (extinguishedAt === undefined) return 0;
  const fraction = (elapsedSeconds - extinguishedAt) / FIRE_FADE_SECONDS;
  return Math.max(0, Math.min(1, 1 - fraction));
}

export function completedStations(
  stationIds: readonly string[],
  discoveredIds: ReadonlySet<string>,
): number {
  return stationIds.filter((id) => discoveredIds.has(id)).length;
}
