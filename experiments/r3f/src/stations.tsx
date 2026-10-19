import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

import { stations, type Rescue } from "./physics";

export const MODEL_FILES = {
  firetrack: "/models/jarcedev/v1/firetrack-station.glb",
  evacuaplan: "/models/jarcedev/v1/evacuaplan-station.glb",
  acreditaciones: "/models/jarcedev/v1/acreditaciones-station.glb",
  hidrantes: "/models/jarcedev/v1/hidrantes-station.glb",
} as const;

type Station = (typeof stations)[number];

/** Reuse the five real Blender GLBs rather than fetch extra models per tile. */
function BlenderStation({ station }: { station: Station }) {
  const source = useGLTF(MODEL_FILES[station.id as keyof typeof MODEL_FILES]);
  const clone = useMemo(() => {
    const instance=source.scene.clone(true);
    instance.traverse(child=>{
      if (child instanceof THREE.Mesh) {
        child.castShadow=true;
        child.receiveShadow=true;
      }
    });
    return instance;
  },[source.scene]);
  return (
    <primitive object={clone}
      position={[station.x, 0, station.z]}
      rotation={[0, station.z < 0 ? Math.PI : 0, 0]} />
  );
}

function Block({
  at, size, color, metallic = 0, glow = 0,
}:{
  at:[number,number,number]; size:[number,number,number];
  color:string; metallic?:number; glow?:number;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size}/>
      <meshStandardMaterial color={color} metalness={metallic}
        roughness={metallic ? .34 : .75}
        emissive={glow ? color : "#000000"} emissiveIntensity={glow}/>
    </mesh>
  );
}
function Drum({ x,y,z,radius= .42,height=1.2,color }:{
 x:number;y:number;z:number;radius?:number;height?:number;color:string;
}) {
  return <mesh position={[x,y,z]} castShadow>
    <cylinderGeometry args={[radius,radius,height,12]}/>
    <meshStandardMaterial color={color} metalness={.23} roughness={.55}/>
  </mesh>;
}

function GeometryStation({ station }: { station: Station }) {
  const {x,z}=station;
  return (
    <group position={[x,0,z]} rotation={[0,station.z<0?Math.PI:0,0]}>
      <Block at={[0,.01,0]} size={[10.4,.18,8.8]} color="#263c4c"/>
      {station.id==="firetrack" && (
        <>
          <Block at={[0,2.55,-.5]} size={[8.9,5.1,6.1]} color="#aac1cb"/>
          <Block at={[0,5.20,-.6]} size={[9.6,.40,6.6]} color="#b92b3d"/>
          {[-2.9,0,2.9].map(i=><Block key={i} at={[i,2.35,2.57]}
            size={[2.35,3.7,.16]} color="#2f657b" metallic={.2}/>)}
          <Block at={[0,4.66,2.74]} size={[3.98,.55,.20]} color="#4bc2d9" glow={.18}/>
          {[-4,4].map(i=><Drum key={i} x={i} y={.97} z={2.1} color="#dc3448"/>)}
        </>
      )}
      {station.id==="evacuaplan" && (
        <>
          <Block at={[0,1.57,-1.38]} size={[7.8,3.15,4.6]} color="#c5e9ec"/>
          <Block at={[0,3.37,-1.35]} size={[8.4,.35,5.15]} color="#6cd9ea"/>
          <Block at={[0,3.64,-1.35]} size={[7.65,.13,4.6]} color="#ebf6f5"/>
          {[-2.2,-.7,.9,2.36].map(i=><Block key={i} at={[i,3.84,-1.35]}
            size={[.095,.26,4.18]} color="#37768a"/>)}
          <Block at={[-1.2,3.86,.1]} size={[2.0,.045,.18]} color="#57f5c0" glow={.45}/>
          <Block at={[-.24,3.86,-.55]} size={[.18,.05,1.42]} color="#57f5c0" glow={.45}/>
          <Block at={[1.12,3.86,-1.26]} size={[2.68,.05,.18]} color="#57f5c0" glow={.45}/>
          <Block at={[2.9,1.5,3]} size={[.30,2.9,2.1]} color="#a1dbe8"/>
        </>
      )}
      {station.id==="acreditaciones" && (
        <>
          <Block at={[0,2,-1.2]} size={[8.1,4.0,5.5]} color="#b1a0da"/>
          <Block at={[0,4.30,-1.2]} size={[8.65,.40,5.9]} color="#8767bd"/>
          <Block at={[0,2.50,2]} size={[5.38,2.72,.23]} color="#23324e"/>
          <Block at={[0,2.58,2.15]} size={[4.83,2.22,.12]} color="#395572" glow={.17}/>
          {[-1.65,-.68,.25,1.19].map((i,index)=><Block key={i}
            at={[i,1.74+index*.14,2.23]}
            size={[.48,.75+index*.30,.09]}
            color={index%2?"#6ee0de":"#ad93f0"} glow={.22}/>)}
          <Drum x={-3.13} y={5.15} z={-.45} radius={.8} height={.4} color="#b4a0eb"/>
          {[-3.65,-2.6].map(i=><Drum key={i} x={i} y={5.65} z={-.45}
            radius={.25} height={.75} color="#5bdaca"/>)}
        </>
      )}
      {station.id==="hidrantes" && (
        <>
          <Block at={[0,1.0,-2.0]} size={[8.8,2.0,3.6]} color="#65b8bc"/>
          <Block at={[0,2.18,-2.0]} size={[9.3,.35,4.10]} color="#4cbf9d"/>
          <Drum x={-2.13} y={1.1} z={2.32} radius={.72} height={1.46} color="#d83748"/>
          <Drum x={-2.13} y={2.06} z={2.32} radius={.89} height={.24} color="#e9c983"/>
          <Block at={[.9,3.50,-1.7]} size={[3.58,2.60,.22]} color="#233f52"/>
          <Block at={[.9,3.55,-1.55]} size={[3.11,2.17,.09]} color="#43839b"/>
          {[0,.9,1.8].map(i=><Block key={i} at={[i,3.55,-1.46]}
            size={[.08,1.95,.045]} color="#c9e6e2"/>)}
          <Drum x={3.20} y={3.75} z={-2.05} radius={1.15} height={1.13} color="#64d6b5"/>
          <Drum x={3.20} y={4.38} z={-2.05} radius={1.35} height={.19} color="#e7f2ee"/>
        </>
      )}
    </group>
  );
}

export function ThemedStations({ modelMode }: {modelMode:boolean}) {
  return (
    <group>
      {stations.map(station=>(
        <group key={station.id}>
          {modelMode
            ? <BlenderStation station={station}/>
            : <GeometryStation station={station}/>}
        </group>
      ))}
    </group>
  );
}

function FireAtStation({
  station,discovered,rescue,
}:{
  station:Station;discovered:boolean;
  rescue:MutableRefObject<Rescue|null>;
}) {
  const flames=useRef<(THREE.Group|null)[]>([]);
  useFrame(()=>{
    const r=rescue.current;
    const seconds=r?.stationId===station.id
      ? performance.now()/1000-r.startedAt : -1;
    const strength=discovered?0:seconds<.58?1:Math.max(0,1-(seconds-.58)/.9);
    const motion=performance.now()*.0041;
    flames.current.forEach((flame,index)=>{
      if(!flame)return;
      flame.visible=strength>.02;
      const wave=.90+Math.sin(motion+index*1.7)*.10;
      flame.scale.setScalar(strength*wave);
    });
  });
  return (
    <group position={[station.x,0,station.z]}>
      {[-3.1,-1.0,1.4,3.17].map((offset,index)=>(
        <group key={offset}
          ref={node=>{flames.current[index]=node;}}
          position={[offset,5.8,index%2?-.8:1.1]}>
          <mesh>
            <coneGeometry args={[.73,2.12+(index%2)*.47,7]}/>
            <meshStandardMaterial color="#f76f2a" emissive="#ee4618"
              emissiveIntensity={1} transparent opacity={.88} depthWrite={false}/>
          </mesh>
          <mesh position={[.17,-.30,.13]}>
            <coneGeometry args={[.46,1.44,6]}/>
            <meshStandardMaterial color="#ffe19b" emissive="#ffba52"
              emissiveIntensity={.90} transparent opacity={.88} depthWrite={false}/>
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function StationFires({
  rescued,rescue,
}:{
  rescued:ReadonlySet<string>;
  rescue:MutableRefObject<Rescue|null>;
}) {
  return (
    <>
      {stations.map(s=><FireAtStation key={s.id} station={s}
        discovered={rescued.has(s.id)} rescue={rescue}/>)}
    </>
  );
}
