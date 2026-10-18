/**
 * Render-engine-neutral contract.
 *
 * Driving, content, UI and panels must not depend on the underlying
 * implementation. The current adapter is dependency-free WebGL2; a future
 * React Three Fiber v9 adapter can reuse the same project manifest and input
 * behavior after measured desktop/mobile performance tests.
 */
export type WorldPosition = { x: number; z: number };
export type WorldCamera = "chase" | "overview";
export type WorldTime = "day" | "night";

export type WorldRenderer = {
  render: (
    position: WorldPosition,
    heading: number,
    elapsed: number,
    reducedMotion: boolean,
    cameraMode?: WorldCamera,
    lightsOn?: boolean,
    timeOfDay?: WorldTime,
  ) => void;
  project: (
    position: WorldPosition,
    elevation?: number,
  ) => { x: number; y: number; visible: boolean };
  dispose: () => void;
};

export type WorldRendererFactory = (canvas: HTMLCanvasElement) => WorldRenderer;
