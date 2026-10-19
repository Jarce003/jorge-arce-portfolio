/**
 * Frame-rate-independent smoothing for camera and environment lighting.
 * Fixed-per-frame lerps feel sluggish or uneven as render FPS changes.
 */
export function dampingFactor(deltaSeconds: number, perSecond: number): number {
  if (!Number.isFinite(deltaSeconds) || !Number.isFinite(perSecond)) return 0;
  if (deltaSeconds <= 0 || perSecond <= 0) return 0;
  return 1 - Math.exp(-perSecond * Math.min(deltaSeconds, .1));
}
