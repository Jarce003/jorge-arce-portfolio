export type Controls = {
  forward: boolean;
  reverse: boolean;
  left: boolean;
  right: boolean;
};
export type TruckPose = { x: number; z: number; heading: number; speed: number };
export const STATION_Z = -14;
export const DISCOVERY_DISTANCE = 11.5;
export const RESCUE_DURATION = 2.35;

export const initialPose = (): TruckPose => ({
  x: 0, z: 3, heading: 0, speed: 0,
});

export function advanceTruck(pose: TruckPose, controls: Controls, dt: number): TruckPose {
  const step = Math.max(0, Math.min(dt, .075));
  const throttle = Number(controls.forward) - Number(controls.reverse);
  const speed = Math.max(-3.7, Math.min(7.2,
    (pose.speed + throttle * 13 * step) * Math.exp(-2.8 * step)));
  const steer = Number(controls.left) - Number(controls.right);
  const heading = pose.heading +
    (Math.abs(speed) > .04 ? steer * 1.7 * step * Math.sign(speed) : 0);
  return {
    x: Math.max(-17, Math.min(17, pose.x - Math.sin(heading) * speed * step)),
    z: Math.max(-20, Math.min(16, pose.z - Math.cos(heading) * speed * step)),
    heading,
    speed: Math.abs(speed) < .02 ? 0 : speed,
  };
}

export function nearFireTrack(pose: TruckPose) {
  return Math.hypot(pose.x, pose.z - STATION_Z) <= DISCOVERY_DISTANCE;
}

export function rescueProgress(nowSeconds: number, startedSeconds: number) {
  return Math.max(0, Math.min(1, (nowSeconds - startedSeconds) / RESCUE_DURATION));
}

export function damping(seconds: number, frequency: number) {
  return 1 - Math.exp(-Math.max(0, Math.min(.1, seconds)) * frequency);
}
