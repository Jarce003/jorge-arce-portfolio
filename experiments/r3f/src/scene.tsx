import { Suspense, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { RedEmergencyLights, WaterSpray } from "./effects";
import { WebStyleTruck } from "./web-style-truck";
import { StreetLights } from "./streetlights";
import { ThemedStations, StationFires } from "./stations";
import {
  RESCUE_DURATION, advanceTruck, closestStation, damping,
  initialPose, stations, type Controls, type TruckPose,
  type Rescue, type StationId,
} from "./physics";

export type SceneProps = {
  day:boolean;
  overview:boolean;
  modelMode:boolean;
  lights:boolean;
  reducedMotion:boolean;
  rescued:ReadonlySet<string>;
  controls:MutableRefObject<Controls>;
  truck:MutableRefObject<TruckPose>;
  rescue:MutableRefObject<Rescue|null>;
  onNearby:(stationId:StationId|null)=>void;
  onRescueComplete:(stationId:StationId)=>void;
  onMetrics:(fps:number,calls:number)=>void;
};

export function WorldScene({
  day,overview,modelMode,lights,reducedMotion,rescued,controls,truck,rescue,
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
      <color attach="background" args={[day?"#a9cadd":"#1d3046"]}/>
      <fog attach="fog" args={[day?"#a9cadd":"#253b51",44,120]}/>
      <ambientLight intensity={day?1.04:.75}/>
      <hemisphereLight args={[day?"#e6f9ff":"#a4c3dd","#24424c",day?1.12:.84]}/>
      <directionalLight position={[17,26,9]} intensity={day?2.14:1.20}
        castShadow shadow-mapSize={[1024,1024]}
        shadow-camera-left={-38} shadow-camera-right={38}
        shadow-camera-top={38} shadow-camera-bottom={-38}/>
      {/* A real traversable four-way road network, not a cosmetic start podium. */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.16,0]} receiveShadow>
        <planeGeometry args={[115,115]}/>
        <meshStandardMaterial color={day?"#8bb29f":"#37574f"} roughness={1}/>
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.10,0]} receiveShadow>
        <planeGeometry args={[8,87]}/>
        <meshStandardMaterial color={day?"#6d8390":"#39516b"} roughness={1}/>
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.09,0]} receiveShadow>
        <planeGeometry args={[87,8]}/>
        <meshStandardMaterial color={day?"#6d8390":"#39516b"} roughness={1}/>
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
          <meshStandardMaterial color={day?"#bbd0ce":"#446171"} roughness={.93}/>
        </mesh>
      ))}
      <Suspense fallback={<ThemedStations modelMode={false}/>}>
        <ThemedStations modelMode={modelMode}/>
      </Suspense>
      <StreetLights day={day}/>
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
      <StationFires rescued={rescued} rescue={rescue} modelMode={modelMode}/>
      <group ref={truckGroup} position={[0,0,initialPose().z]}>
        <WebStyleTruck truck={truck}/>
        <RedEmergencyLights active={lights} day={day} reducedMotion={reducedMotion}/>
      </group>
      <WaterSpray truck={truck} rescue={rescue}/>
      {!day && stations.map(s=>(
        <pointLight key={s.id+"-lamp"} position={[s.x,7.5,s.z+3.5]}
          color={s.color} intensity={12} distance={15}/>
      ))}
    </>
  );
}
