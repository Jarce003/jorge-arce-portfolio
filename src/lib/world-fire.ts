/**
 * Fire is a stylized, fictional gameplay metaphor. It is not a simulation
 * of actual firefighting tactics, extinguishment, or emergency response.
 *
 * A discovered station fades out over a brief, deterministic period;
 * visitors who request reduced motion see the effect end immediately.
 */
export const FIRE_FADE_SECONDS = 0.9;

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
