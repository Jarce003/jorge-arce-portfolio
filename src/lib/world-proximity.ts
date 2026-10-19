import type { WorldPosition } from "@/components/world/world-contract";

/**
 * A broad, forgiving interaction zone keeps discovery comfortable when
 * driving the ladder truck, particularly with touch controls.
 *
 * Adjacent initial stations are 24 world units apart, so 11.5 avoids
 * overlapping their activation zones.
 */
export const DISCOVERY_RADIUS = 11.5;

type PositionedStation = WorldPosition & { id: string };

export function isInDiscoveryRange(
  position: WorldPosition,
  station: WorldPosition,
  radius = DISCOVERY_RADIUS,
): boolean {
  return Math.hypot(position.x - station.x, position.z - station.z) <= radius;
}

export function closestDiscoverableStation(
  position: WorldPosition,
  stations: readonly PositionedStation[],
  radius = DISCOVERY_RADIUS,
): string | null {
  let chosen: string | null = null;
  let bestSquared = radius * radius;
  for (const station of stations) {
    const dx = station.x - position.x;
    const dz = station.z - position.z;
    const distanceSquared = dx * dx + dz * dz;
    if (distanceSquared > bestSquared) continue;
    bestSquared = distanceSquared;
    chosen = station.id;
  }
  return chosen;
}
