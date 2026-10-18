import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

import {
  DISCOVERY_DISTANCE,
  RESCUE_DURATION,
  STATION_Z,
  advanceTruck,
  damping,
  initialPose,
  nearFireTrack,
  type Controls,
  type TruckPose,
} from "./physics";

const TRUCK_GLB = "/models/jarcedev/v1/ladder-truck.glb";
const STATION_GLB = "/models/jarcedev/v1/firetrack-station.glb";
const Y_AXIS = new THREE.Vector3(0, 1, 0);

export type SceneProps = {
  day: boolean;
  overview: boolean;
  modelMode: boolean;
  lights: boolean;
  discovered: boolean;
  controls: MutableRefObject<Controls>;
  truck: MutableRefObject<TruckPose>;
  rescueStarted: MutableRefObject<number | null>;
  onNearby: (value: boolean) => void;
  onRescueComplete: () => void;
  onMetrics: (fps: number, calls: number) => void;
};

function LowPolyWheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, .62, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[.53, .53, .31, 12]} />
        <meshStandardMaterial color="#141923" roughness={.94} />
      </mesh>
      <mesh position={[0, x < 0 ? .18 : -.18, 0]}>
        <cylinderGeometry args={[.27, .27, .04, 12]} />
        <meshStandardMaterial color="#b7cbd5" metalness={.68} roughness={.33} />
      </mesh>
    </group>
  );
}

function LowPolyTruck({ lights }: { lights: boolean }) {
  return (
    <group>
      <mesh castShadow position={[0, 1.02, 0]}>
        <boxGeometry args={[2.38, .36, 6.6]} />
        <meshStandardMaterial color="#182839" />
      </mesh>
      <mesh castShadow position={[0, 1.74, .52]}>
        <boxGeometry args={[2.40, 1.39, 4.42]} />
        <meshStandardMaterial color="#b72737" metalness={.22} roughness={.45} />
      </mesh>
      <mesh castShadow position={[0, 1.73, -2.31]}>
        <boxGeometry args={[2.48, 1.87, 2.12]} />
        <meshStandardMaterial color="#cb2d40" metalness={.17} roughness={.51} />
      </mesh>
      <mesh castShadow position={[0, 2.77, -2.23]}>
        <boxGeometry args={[2.46, .21, 2.20]} />
        <meshStandardMaterial color="#f0f3f7" metalness={.14} roughness={.43} />
      </mesh>
      <mesh position={[0, 2.25, -3.405]}>
        <boxGeometry args={[2.08, .70, .08]} />
        <meshStandardMaterial color="#2f607a" metalness={.38} roughness={.33} />
      </mesh>
      <mesh position={[0, 1.53, -3.43]}>
        <boxGeometry args={[1.16, .52, .09]} />
        <meshStandardMaterial color="#bfd1da" metalness={.75} roughness={.28} />
      </mesh>
      <mesh castShadow position={[0, .89, -3.56]}>
        <boxGeometry args={[2.68, .3, .42]} />
        <meshStandardMaterial color="#d7e5ea" metalness={.68} roughness={.34} />
      </mesh>
      <mesh position={[0, 2.52, .49]} castShadow>
        <boxGeometry args={[2.41, .16, 4.43]} />
        <meshStandardMaterial color="#f0f4f7" roughness={.46} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 1.25, 1.75, -2.23]}>
            <boxGeometry args={[.08, .54, .94]} />
            <meshStandardMaterial color="#3b6a83" metalness={.25} roughness={.39} />
          </mesh>
          <mesh position={[side * 1.23, 1.51, .44]}>
            <boxGeometry args={[.045, .13, 4.12]} />
            <meshStandardMaterial color="#f0f4f7" />
          </mesh>
          {[-.2, .67, 1.54].map((z) => (
            <mesh key={z} position={[side * 1.25, 1.91, z]}>
              <boxGeometry args={[.05, .58, .68]} />
              <meshStandardMaterial color="#b4c9d3" metalness={.7} roughness={.33} />
            </mesh>
          ))}
          <mesh position={[side * .88, 1.39, -3.49]}>
            <boxGeometry args={[.37, .23, .08]} />
            <meshStandardMaterial color="#f8f3e8" emissive="#fff3cc" emissiveIntensity={.24} />
          </mesh>
          <mesh position={[side * .80, 2.97, -2.44]}>
            <cylinderGeometry args={[.17, .17, .14, 10]} />
            <meshStandardMaterial color="#f23c4d" emissive={lights ? "#ff2537" : "#9c1b31"}
              emissiveIntensity={lights ? 1.65 : .08} />
          </mesh>
        </group>
      ))}
      {[-2.2, .15, 2.30].flatMap((z) => [-1, 1].map((side) => (
        <LowPolyWheel key={z + ":" + side} x={side * 1.25} z={z} />
      )))}
      <group position={[0, 2.85, .45]}>
        {[-.54, .54].map((side) => (
          <mesh key={side} position={[side, .12, -.22]} castShadow>
            <boxGeometry args={[.10, .15, 4.48]} />
            <meshStandardMaterial color="#cbdde4" metalness={.77} roughness={.29} />
          </mesh>
        ))}
        {Array.from({ length: 12 }, (_, index) => (
          <mesh key={index} position={[0, .17, -2.09 + index * .34]}>
            <boxGeometry args={[1.15, .075, .10]} />
            <meshStandardMaterial color="#e3edf1" metalness={.68} roughness={.32} />
          </mesh>
        ))}
        <mesh position={[0, .17, -2.52]}>
          <boxGeometry args={[.25, .26, .36]} />
          <meshStandardMaterial color="#2d4759" metalness={.34} />
        </mesh>
      </group>
    </group>
  );
}

function LoadedTruck() {
  const { scene } = useGLTF(TRUCK_GLB);
  const instance = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);
  return <primitive object={instance} />;
}

function LowPolyStation() {
  return (
    <group position={[0, 0, STATION_Z]}>
      <mesh receiveShadow position={[0, -.05, 0]}>
        <boxGeometry args={[11.0, .13, 9.0]} />
        <meshStandardMaterial color="#203548" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 2.75, 0]}>
        <boxGeometry args={[9.1, 5.40, 6.20]} />
        <meshStandardMaterial color="#9db8c6" roughness={.83} />
      </mesh>
      <mesh castShadow position={[0, 5.57, -.12]}>
        <boxGeometry args={[9.60, .35, 6.95]} />
        <meshStandardMaterial color="#b52e41" metalness={.23} roughness={.52} />
      </mesh>
      {[-2.83, 0, 2.83].map((x) => (
        <group key={x}>
          <mesh position={[x, 2.43, 3.115]}>
            <boxGeometry args={[2.4, 3.50, .12]} />
            <meshStandardMaterial color="#243c4d" metalness={.21} roughness={.44} />
          </mesh>
          <mesh position={[x, 2.45, 3.20]}>
            <boxGeometry args={[2.12, 3.19, .07]} />
            <meshStandardMaterial color="#478499" metalness={.22} roughness={.33} />
          </mesh>
          {[1.3, 1.85, 2.4, 2.95, 3.5].map((y) => (
            <mesh key={y} position={[x, y, 3.26]}>
              <boxGeometry args={[2.24, .055, .07]} />
              <meshStandardMaterial color="#b9cbd2" metalness={.55} roughness={.37} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 4.86, 3.25]}>
        <boxGeometry args={[4.12, .62, .15]} />
        <meshStandardMaterial color="#1d3445" />
      </mesh>
      <mesh position={[0, 4.87, 3.35]}>
        <boxGeometry args={[3.8, .35, .075]} />
        <meshStandardMaterial color="#4dbed1" emissive="#1f99ba" emissiveIntensity={.34} />
      </mesh>
      {[-4.7, 4.7].map((x) => (
        <mesh key={x} position={[x, .93, 3.25]} castShadow>
          <cylinderGeometry args={[.36, .38, 1.65, 12]} />
          <meshStandardMaterial color="#d0394b" roughness={.45} />
        </mesh>
      ))}
    </group>
  );
}

function LoadedStation() {
  const { scene } = useGLTF(STATION_GLB);
  const clone = useMemo(() => {
    const instance = scene.clone(true);
    instance.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return instance;
  }, [scene]);
  return <primitive object={clone} position={[0, 0, STATION_Z]} />;
}

function Fires({
  discovered, rescueStarted,
}: {
  discovered: boolean;
  rescueStarted: MutableRefObject<number | null>;
}) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    const elapsed = rescueStarted.current === null
      ? -1 : performance.now() / 1000 - rescueStarted.current;
    const strength = discovered
      ? 0 : elapsed < .58 ? 1 : Math.max(0, 1 - (elapsed - .58) / .90);
    for (let index = 0; index < refs.current.length; index++) {
      const flame = refs.current[index];
      if (!flame) continue;
      const wobble = .88 + Math.sin(performance.now() * .0042 + index * 1.3) * .12;
      flame.scale.set(strength * wobble, strength * wobble, strength * wobble);
      flame.visible = strength > .02;
    }
  });

  return (
    <group position={[0, 0, STATION_Z]}>
      {[-3.15, -1.0, 1.4, 3.25].map((x, index) => (
        <group key={x} ref={(node) => { refs.current[index] = node; }}
          position={[x, 6.17, index % 2 ? -.85 : .95]}>
          <mesh>
            <coneGeometry args={[.68, 1.8 + (index % 2) * .43, 6]} />
            <meshStandardMaterial color="#ff692c" emissive="#fa3414" emissiveIntensity={1.0}
              transparent opacity={.84} depthWrite={false} />
          </mesh>
          <mesh position={[.13, -.24, .08]}>
            <coneGeometry args={[.39, 1.15, 5]} />
            <meshStandardMaterial color="#ffe09a" emissive="#ffb749" emissiveIntensity={1.25}
              transparent opacity={.88} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WaterSpray({
  truck, rescueStarted,
}: {
  truck: MutableRefObject<TruckPose>;
  rescueStarted: MutableRefObject<number | null>;
}) {
  const stream = useRef<THREE.InstancedMesh>(null);
  const splash = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const origin = useMemo(() => new THREE.Vector3(), []);
  const destination = useMemo(() => new THREE.Vector3(0, 5.6, STATION_Z), []);
  const point = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const startedAt = rescueStarted.current;
    const now = performance.now() / 1000;
    const age = startedAt === null ? -1 : now - startedAt;
    const ramp = Math.max(0, Math.min(1, (age - .12) / .3));
    const fade = Math.max(0, Math.min(1, (RESCUE_DURATION - age) / .25));
    const strength = age < 0 ? 0 : Math.min(ramp, fade);
    const pose = truck.current;
    origin.set(0, 2.94, -2.57).applyAxisAngle(Y_AXIS, pose.heading)
      .add(new THREE.Vector3(pose.x, 0, pose.z));

    if (stream.current) {
      for (let index = 0; index < 42; index++) {
        const t = ((index + .2) / 42 + Math.max(0, age) * 1.48) % 1;
        point.copy(origin).lerp(destination, t);
        point.y += Math.sin(Math.PI * t) * 1.7;
        const scatter = t * .085;
        point.x += Math.sin(index * 2.7 + now * 13) * scatter;
        point.z += Math.cos(index * 2.9 + now * 12) * scatter;
        dummy.position.copy(point);
        dummy.rotation.set(0, 0, 0);
        const size = (.065 + (index % 4) * .011) * strength;
        dummy.scale.set(size, size * 1.3, size);
        dummy.updateMatrix();
        stream.current.setMatrixAt(index, dummy.matrix);
      }
      stream.current.instanceMatrix.needsUpdate = true;
    }
    if (splash.current) {
      for (let index = 0; index < 18; index++) {
        const angle = index * 2.399 + Math.max(0, age) * 3.5;
        const radius = .13 + (index % 5) * .13;
        dummy.position.set(
          destination.x + Math.sin(angle) * radius,
          destination.y + .15 + Math.abs(Math.sin(now * 6 + index)) * .58,
          destination.z + Math.cos(angle) * radius,
        );
        const size = .063 * strength;
        dummy.scale.set(size, size, size);
        dummy.updateMatrix();
        splash.current.setMatrixAt(index, dummy.matrix);
      }
      splash.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={stream} args={[undefined, undefined, 42]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#50cbea" transparent opacity={.85}
          metalness={.03} roughness={.25} emissive="#164e66" emissiveIntensity={.28}
          depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={splash} args={[undefined, undefined, 18]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#b9effb" transparent opacity={.7}
          roughness={.4} depthWrite={false} />
      </instancedMesh>
    </>
  );
}

export function WorldScene({
  day, overview, modelMode, lights, discovered, controls, truck,
  rescueStarted, onNearby, onRescueComplete, onMetrics,
}: SceneProps) {
  const truckGroup = useRef<THREE.Group>(null);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const cameraDesired = useMemo(() => new THREE.Vector3(), []);
  const lastNear = useRef(false);
  const elapsedSamples = useRef({ sum: 0, frames: 0, time: 0 });

  useFrame(({ camera, gl }, delta) => {
    const step = Math.max(0, Math.min(delta, .075));
    const pose = truck.current;
    if (rescueStarted.current === null && !discovered) {
      const next = advanceTruck(pose, controls.current, step);
      Object.assign(pose, next);
    }
    if (truckGroup.current) {
      truckGroup.current.position.set(pose.x, 0, pose.z);
      truckGroup.current.rotation.y = pose.heading;
    }
    const near = nearFireTrack(pose);
    if (near !== lastNear.current) {
      lastNear.current = near;
      onNearby(near);
    }
    if (rescueStarted.current !== null &&
        performance.now() / 1000 - rescueStarted.current >= RESCUE_DURATION) {
      rescueStarted.current = null;
      onRescueComplete();
    }
    if (overview) cameraDesired.set(pose.x + 11, 19, pose.z + 11);
    else {
      cameraDesired.set(
        pose.x + Math.sin(pose.heading) * 9.8,
        7.9,
        pose.z + Math.cos(pose.heading) * 9.8,
      );
    }
    camera.position.lerp(cameraDesired, damping(step, 7));
    cameraTarget.set(pose.x, 1.55, pose.z);
    camera.lookAt(cameraTarget);

    elapsedSamples.current.sum += step;
    elapsedSamples.current.frames++;
    elapsedSamples.current.time += step;
    if (elapsedSamples.current.time >= .8) {
      const fps = elapsedSamples.current.frames / Math.max(.001, elapsedSamples.current.sum);
      onMetrics(Math.round(fps), gl.info.render.calls);
      elapsedSamples.current = { sum: 0, frames: 0, time: 0 };
    }
  });

  return (
    <>
      <color attach="background" args={[day ? "#a6c9de" : "#07172b"]} />
      <fog attach="fog" args={[day ? "#a6c9de" : "#101e32", 23, 69]} />
      <ambientLight intensity={day ? 1.24 : .55} />
      <hemisphereLight args={[day ? "#e6f7ff" : "#8fa7e6", "#27394b", day ? 1.15 : .52]} />
      <directionalLight position={[9, 18, 8]} intensity={day ? 2.15 : .78}
        castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-24} shadow-camera-right={24}
        shadow-camera-top={24} shadow-camera-bottom={-24} />
      <group>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -.12, -7]}>
          <planeGeometry args={[88, 86]} />
          <meshStandardMaterial color={day ? "#89b29f" : "#23443f"} roughness={1} />
        </mesh>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -.08, -7]}>
          <planeGeometry args={[7.4, 60]} />
          <meshStandardMaterial color={day ? "#68879d" : "#263c51"} roughness={.92} />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -.05, -29 + i * 4.2]}>
            <planeGeometry args={[.12, 2]} />
            <meshStandardMaterial color="#c6d5df" />
          </mesh>
        ))}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -.07, STATION_Z]}>
          <planeGeometry args={[13, 10]} />
          <meshStandardMaterial color={day ? "#adbfc4" : "#304b59"} />
        </mesh>
      </group>
      <group ref={truckGroup} position={[0, 0, initialPose().z]}>
        {modelMode ? <LoadedTruck /> : <LowPolyTruck lights={lights} />}
      </group>
      {modelMode ? <LoadedStation /> : <LowPolyStation />}
      <Fires discovered={discovered} rescueStarted={rescueStarted} />
      <WaterSpray truck={truck} rescueStarted={rescueStarted} />
      {!day && (
        <>
          <pointLight position={[-4.5, 4.7, -10.9]} color="#ffb876" intensity={16} distance={15} />
          <pointLight position={[4.5, 4.7, -10.9]} color="#ffb876" intensity={16} distance={15} />
        </>
      )}
      <mesh position={[0, .04, STATION_Z + DISCOVERY_DISTANCE]}>
        <torusGeometry args={[.55, .055, 5, 20]} />
        <meshStandardMaterial color="#6ee7b7" emissive="#4cae9b" emissiveIntensity={.33} />
      </mesh>
    </>
  );
}
