import { Suspense, useMemo, useRef, type MutableRefObject } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { RedEmergencyLights, WaterSpray } from "./effects";
import { ThemedStations, StationFires } from "./stations";
import {
  RESCUE_DURATION, advanceTruck, closestStation, damping,
  initialPose, stations, type Controls, type TruckPose,
  type Rescue, type StationId,
} from "./physics";

const TRUCK_GLB = "/models/jarcedev/v1/ladder-truck.glb";

export type SceneProps = {
  day:boolean;
  overview:boolean;
  modelMode:boolean;
  lights:boolean;
  rescued:ReadonlySet<string>;
  controls:MutableRefObject<Controls>;
  truck:MutableRefObject<TruckPose>;
  rescue:MutableRefObject<Rescue|null>;
  onNearby:(stationId:StationId|null)=>void;
  onRescueComplete:(stationId:StationId)=>void;
  onMetrics:(fps:number,calls:number)=>void;
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

function LoadedTruck({ truck }: { truck: MutableRefObject<TruckPose> }) {
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
  const wheelNodes=useMemo(
    ()=>["Axle1_L","Axle1_R","Axle2_L","Axle2_R","Axle3_L","Axle3_R"]
      .map(key=>instance.getObjectByName(key+"_WheelPivot")).filter((obj):obj is THREE.Object3D=>Boolean(obj)),
    [instance],
  );
  useFrame((_,delta)=>{
    const spin=truck.current.speed*Math.min(delta,.07)/.56;
    for(const wheel of wheelNodes)wheel.rotation.x+=spin;
  });
  return <primitive object={instance}/>;
}


export function WorldScene({
  day,overview,modelMode,lights,rescued,controls,truck,rescue,
  onNearby,onRescueComplete,onMetrics,
}: SceneProps) {
  const truckGroup=useRef<THREE.Group>(null);
  const cameraDesired=useMemo(()=>new THREE.Vector3(),[]);
  const cameraTarget=useMemo(()=>new THREE.Vector3(),[]);
  const lastNear=useRef<StationId|null>(null);
  const perf=useRef({seconds:0,frames:0});

  useFrame(({camera,gl},delta)=>{
    const dt=Math.max(0,Math.min(delta,.075));
    const pose=truck.current;
    if(!rescue.current)Object.assign(pose,advanceTruck(pose,controls.current,dt));
    if(truckGroup.current){
      truckGroup.current.position.set(pose.x,0,pose.z);
      truckGroup.current.rotation.y=pose.heading;
    }
    const candidate=closestStation(pose);
    if(candidate!==lastNear.current){
      lastNear.current=candidate;
      onNearby(candidate);
    }
    const action=rescue.current;
    if(action && performance.now()/1000-action.startedAt>=RESCUE_DURATION){
      rescue.current=null;
      onRescueComplete(action.stationId);
    }
    const mobile=gl.domElement.clientWidth<560;
    if(overview)cameraDesired.set(pose.x+12.7,20.8,pose.z+12.7);
    else {
      // Three-quarter chase view: shows the recognizable cab and
      // compartments instead of hiding all truck detail behind its tail.
      const back = mobile ? 12.1 : 9.4;
      const side = mobile ? 2.65 : 4.6;
      cameraDesired.set(
        pose.x + Math.sin(pose.heading)*back + Math.cos(pose.heading)*side,
        mobile ? 7.5 : 6.25,
        pose.z + Math.cos(pose.heading)*back - Math.sin(pose.heading)*side,
      );
    }
    camera.position.lerp(cameraDesired,damping(dt,7));
    cameraTarget.set(pose.x,1.55,pose.z);
    camera.lookAt(cameraTarget);
    perf.current.seconds+=dt;
    perf.current.frames++;
    if(perf.current.seconds>=1){
      onMetrics(Math.round(perf.current.frames/perf.current.seconds),gl.info.render.calls);
      perf.current={seconds:0,frames:0};
    }
  });
  return (
    <>
      <color attach="background" args={[day?"#a9cadd":"#0b192c"]}/>
      <fog attach="fog" args={[day?"#a9cadd":"#14283b",36,105]}/>
      <ambientLight intensity={day?1.04:.45}/>
      <hemisphereLight args={[day?"#e6f9ff":"#8ca6cf","#1b3542",day?1.12:.52]}/>
      <directionalLight position={[17,26,9]} intensity={day?2.14:.90}
        castShadow shadow-mapSize={[1024,1024]}
        shadow-camera-left={-38} shadow-camera-right={38}
        shadow-camera-top={38} shadow-camera-bottom={-38}/>
      {/* A real traversable four-way road network, not a cosmetic start podium. */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.16,0]} receiveShadow>
        <planeGeometry args={[115,115]}/>
        <meshStandardMaterial color={day?"#8bb29f":"#294644"} roughness={1}/>
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.10,0]} receiveShadow>
        <planeGeometry args={[8,87]}/>
        <meshStandardMaterial color={day?"#6d8390":"#253e50"} roughness={1}/>
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.09,0]} receiveShadow>
        <planeGeometry args={[87,8]}/>
        <meshStandardMaterial color={day?"#6d8390":"#253e50"} roughness={1}/>
      </mesh>
      {Array.from({length:16},(_,i)=>{
        const z=-37+i*5;
        return Math.abs(z)<6?null:(
          <mesh key={"z"+i} rotation={[-Math.PI/2,0,0]} position={[0,-.055,z]}>
            <planeGeometry args={[.14,2.2]}/>
            <meshStandardMaterial color="#edf5ed"/>
          </mesh>);
      })}
      {Array.from({length:16},(_,i)=>{
        const x=-37+i*5;
        return Math.abs(x)<6?null:(
          <mesh key={"x"+i} rotation={[-Math.PI/2,0,0]} position={[x,-.055,0]}>
            <planeGeometry args={[2.2,.14]}/>
            <meshStandardMaterial color="#edf5ed"/>
          </mesh>);
      })}
      {stations.map(s=>(
        <mesh key={s.id+"-lot"} position={[s.x,-.08,s.z]} rotation={[-Math.PI/2,0,0]}
          receiveShadow>
          <planeGeometry args={[12,11]}/>
          <meshStandardMaterial color={day?"#bbd0ce":"#28475b"} roughness={.93}/>
        </mesh>
      ))}
      <Suspense fallback={<ThemedStations modelMode={false}/>}>
        <ThemedStations modelMode={modelMode}/>
      </Suspense>
      {/* Street furniture and landscaped lots add depth at driving-camera distance. */}
      {stations.map((station) => (
        <group key={station.id + "-streetscape"} position={[station.x, 0, station.z]}>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[side * 5.7, .17, 0]} castShadow receiveShadow>
                <boxGeometry args={[.34, .34, 10.8]}/>
                <meshStandardMaterial color="#dce8e4" roughness={.88}/>
              </mesh>
              {[-3.35, 3.35].map((depth) => (
                <group key={depth} position={[side * 6.55, 0, depth]}>
                  <mesh position={[0, .28, 0]} castShadow>
                    <cylinderGeometry args={[.62, .76, .56, 10]}/>
                    <meshStandardMaterial color="#b6c8c3" roughness={.93}/>
                  </mesh>
                  <mesh position={[0, .88, 0]} castShadow>
                    <icosahedronGeometry args={[.67, 1]}/>
                    <meshStandardMaterial color={day ? "#417e67" : "#28584f"} roughness={1}/>
                  </mesh>
                </group>
              ))}
            </group>
          ))}
          <mesh position={[0, .04, 5.53]} receiveShadow>
            <boxGeometry args={[11.5, .12, .34]}/>
            <meshStandardMaterial color="#f4e7b5" roughness={.86}/>
          </mesh>
          {[-4.8, 4.8].map((side) => (
            <group key={side} position={[side, 0, 5.18]}>
              <mesh position={[0, 2.02, 0]} castShadow>
                <cylinderGeometry args={[.055, .09, 4.04, 10]}/>
                <meshStandardMaterial color="#334e5b" metalness={.35} roughness={.46}/>
              </mesh>
              <mesh position={[0, 4.14, 0]}>
                <boxGeometry args={[.58, .22, .43]}/>
                <meshStandardMaterial color="#e5eff1" emissive="#fff2bd" emissiveIntensity={day ? .10 : .8}/>
              </mesh>
              {!day && <pointLight position={[0, 4.05, 0]} color="#fff0c4" intensity={2.2} distance={9}/>}
            </group>
          ))}
        </group>
      ))}
      <StationFires rescued={rescued} rescue={rescue}/>
      <group ref={truckGroup} position={[0,0,initialPose().z]}>
        <Suspense fallback={<LowPolyTruck lights={lights}/>}>
          {modelMode?<LoadedTruck truck={truck}/>:<LowPolyTruck lights={lights}/>}
        </Suspense>
        <RedEmergencyLights active={lights}/>
      </group>
      <WaterSpray truck={truck} rescue={rescue}/>
      {!day && stations.map(s=>(
        <pointLight key={s.id+"-lamp"} position={[s.x,7.5,s.z+3.5]}
          color={s.color} intensity={12} distance={15}/>
      ))}
    </>
  );
}
