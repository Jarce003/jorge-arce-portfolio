import { getWorldStations } from "@/content/projects";

export type Controls = { forward: boolean; reverse: boolean; left: boolean; right: boolean };
export type TruckPose = { x: number; z: number; heading: number; speed: number };
export type StationId = ReturnType<typeof getWorldStations>[number]["id"];
export type Rescue = { stationId: StationId; startedAt: number };

export const stations = getWorldStations();
export const DISCOVERY_DISTANCE = 11.5;
export const RESCUE_DURATION = 2.35;
// Arrive from the west side road, already facing the four buildings.
// Heading -π/2 points east along the road. Same origin for restart on mobile.
export const initialPose = (): TruckPose => ({ x: -22, z: 0, heading: -Math.PI/2, speed: 0 });

export function closestStation(pose: TruckPose): StationId | null {
  let best = DISCOVERY_DISTANCE * DISCOVERY_DISTANCE;
  let result: StationId | null = null;
  for (const station of stations) {
    const dx = pose.x - station.x;
    const dz = pose.z - station.z;
    const square = dx * dx + dz * dz;
    if (square <= best) {
      best = square;
      result = station.id;
    }
  }
  return result;
}
export function isAtStation(pose: TruckPose, id: StationId): boolean {
  return stations.some(s=>s.id===id && Math.hypot(s.x-pose.x,s.z-pose.z)<=DISCOVERY_DISTANCE);
}
export function travelToStation(pose: TruckPose, id: StationId): TruckPose {
  const station=stations.find(s=>s.id===id);
  if(!station) return pose;
  // Position at 9 units before the model along its front access road.
  const front=station.z < 0 ? 1 : -1;
  return {x:station.x,z:station.z+front*9.5,
    heading:station.z<0?0:Math.PI,speed:0};
}
export function advanceTruck(pose: TruckPose, controls: Controls, dt: number): TruckPose {
  const step=Math.max(0,Math.min(dt,.075));
  const throttle=Number(controls.forward)-Number(controls.reverse);
  const speed=Math.max(-3.7,Math.min(7.2,
    (pose.speed+throttle*14*step)*Math.exp(-2.0*step)));
  const steer=Number(controls.left)-Number(controls.right);
  const heading=pose.heading+(Math.abs(speed)>.04?steer*1.9*step*Math.sign(speed):0);
  return {
    x:Math.max(-26,Math.min(26,pose.x-Math.sin(heading)*speed*step)),
    z:Math.max(-26,Math.min(26,pose.z-Math.cos(heading)*speed*step)),
    heading, speed:Math.abs(speed)<.02?0:speed,
  };
}
export function damping(seconds:number, frequency:number){
  return 1-Math.exp(-Math.max(0,Math.min(.1,seconds))*frequency);
}
