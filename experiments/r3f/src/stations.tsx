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
      {station.id==="hidraulica" && (
        <>
          {/* A new pumping and hydraulic-training hall, distinct from the
              original EvacuaPlan drafting studio. */}
          <Block at={[0,2.05,-1.35]} size={[9.1,4.1,5.8]} color="#9ab6c8"/>
          <Block at={[0,4.26,-1.35]} size={[9.7,.42,6.5]} color="#166e90" metallic={.3}/>
          <Block at={[0,4.55,-1.35]} size={[8.8,.16,5.7]} color="#a4e1e9"/>
          {[-2.85,0,2.85].map(offset=>(
            <group key={offset}>
              <Block at={[offset,1.85,1.62]} size={[2.4,2.85,.19]} color="#173c57" metallic={.4}/>
              <Block at={[offset,1.85,1.73]} size={[1.94,2.35,.12]} color="#3c89a3"/>
              <Block at={[offset,2.9,1.81]} size={[1.58,.13,.08]} color="#83e0f0" glow={.3}/>
            </group>
          ))}
          {/* Pump manifolds, an exterior pressure gauge, tank and pipework. */}
          <Block at={[0,.68,3.25]} size={[6.7,1.18,.88]} color="#1a425e" metallic={.35}/>
          {[-2.35,0,2.35].map(offset=>(
            <group key={offset}>
              <Drum x={offset} y={.94} z={3.72} radius={.46} height={1.55} color="#c5d5df"/>
              <Drum x={offset} y={1.64} z={3.72} radius={.55} height={.20} color="#34c8e2"/>
            </group>
          ))}
          <Drum x={3.55} y={5.35} z={-1.55} radius={1.18} height={1.45} color="#7ebad0"/>
          <Drum x={3.55} y={6.13} z={-1.55} radius={1.30} height={.18} color="#d3e8ed"/>
          <Block at={[3.55,4.61,-1.55]} size={[1.85,.26,1.85]} color="#2d617b" metallic={.3}/>
          <Block at={[-3.55,5.35,-1.6]} size={[.20,2.0,.20]} color="#d2edf2" metallic={.3}/>
          <Block at={[-3.55,6.35,-1.6]} size={[1.3,.15,1.3]} color="#34c8e2" glow={.35}/>
          {/* Large analog gauge identifies the hydraulic operations building. */}
          <mesh position={[0,4.66,1.35]} castShadow>
            <cylinderGeometry args={[1.11,1.11,.30,30]}/>
            <meshStandardMaterial color="#effaff" metalness={.42} roughness={.33}/>
          </mesh>
          <mesh position={[0,4.86,1.35]} rotation={[Math.PI/2,0,0]}>
            <torusGeometry args={[.79,.12,8,32]}/>
            <meshStandardMaterial color="#147da2" emissive="#126b91" emissiveIntensity={.25}/>
          </mesh>
          <Block at={[.23,4.91,1.36]} size={[.14,.80,.10]} color="#ed754d" metallic={.15}/>
          <mesh position={[0,4.95,1.35]}>
            <sphereGeometry args={[.19,12,8]}/>
            <meshStandardMaterial color="#123a51"/>
          </mesh>
          <Block at={[0,6.56,-1.5]} size={[3.55,.25,.75]} color="#28b6d8" glow={.32}/>
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
          {modelMode && station.id!=="hidraulica"
            ? <BlenderStation station={station}/>
            : <GeometryStation station={station}/>}
        </group>
      ))}
    </group>
  );
}

// Flame bases belong to architectural surfaces, not a shared world height.
// Coordinates match Blender model local X/Y/Z after glTF's Z-up to Y-up conversion.
// The outer group mirrors the orientation of the imported building on southern lots.
// Local coordinates are Three.js Y-up, with Blender's positive Y facing -Z.
// Each building gets roof fires, illuminated facade fires and two accessible
// front-court fires. They remain anchored to architectural or ground surfaces.
export const FIRE_ANCHORS: Record<Station["id"], readonly [number,number,number][]> = {
  firetrack: [
    [-3.2,5.98,.45],[0,5.98,1.1],[3.1,5.98,.45],
    [-2.75,3.3,-2.51],[0,3.55,-2.51],[2.75,3.3,-2.51],
    [-3.7,.11,-3.43],[3.7,.11,-3.43],
  ],
  hidraulica: [
    [-3.0,4.46,.45],[0,4.5,-.75],[3.0,4.46,.45],
    [-2.9,3.00,-1.70],[0,3.0,-1.70],[2.9,3.00,-1.70],
    [-3.7,.1,-3.3],[3.7,.1,-3.3],
  ],
  evacuaplan: [
    [-3.0,3.66,.4],[0,3.70,1.1],[3.05,3.66,.4],
    [-2.6,2.30,-1.24],[0,2.4,-1.24],[2.65,2.3,-1.24],
    [-3.1,.10,-3.06],[3.1,.10,-3.06],
  ],
  acreditaciones: [
    [-2.9,4.06,.32],[0,4.06,1.02],[2.95,4.06,.32],
    [-2.9,2.3,-1.67],[0,2.6,-1.67],[2.9,2.3,-1.67],
    [-3.6,.10,-3.35],[3.6,.10,-3.35],
  ],
  hidrantes: [
    [-3.35,2.05,2.15],[-.8,2.05,2.15],[2.05,2.05,2.15],
    [-3.60,1.25,.34],[0,1.4,.34],[3.45,1.25,.34],
    [-3.90,.10,-3.20],[3.90,.10,-3.20],
  ],
};

// Curved flame tongues replace the previous visible cone primitives.
const FLAME_SHAPE = new THREE.Shape();
FLAME_SHAPE.moveTo(-.46,0);
FLAME_SHAPE.bezierCurveTo(-.67,.31,-.34,.50,-.24,.78);
FLAME_SHAPE.bezierCurveTo(-.12,1.10,-.03,1.24,0,1.72);
FLAME_SHAPE.bezierCurveTo(.22,1.29,.13,.91,.36,.66);
FLAME_SHAPE.bezierCurveTo(.68,.28,.49,.18,.46,0);
FLAME_SHAPE.closePath();
const SHARED_FLAME_GEOMETRY=new THREE.ShapeGeometry(FLAME_SHAPE,10);
const SHARED_EMBER_GEOMETRY=new THREE.IcosahedronGeometry(.059,0);


function FireAtStation({
  station,discovered,rescue,modelMode,
}:{
  station:Station;discovered:boolean;modelMode:boolean;
  rescue:MutableRefObject<Rescue|null>;
}) {
  const flames=useRef<(THREE.Group|null)[]>([]);
  const roofGlow=useRef<THREE.PointLight>(null);
  const anchors=FIRE_ANCHORS[station.id];
  useFrame(()=>{
    const r=rescue.current;
    const seconds=r?.stationId===station.id
      ? performance.now()/1000-r.startedAt : -1;
    const strength=discovered?0:seconds<.58?1:Math.max(0,1-(seconds-.58)/.9);
    const motion=performance.now()*.0041;
    if(roofGlow.current)roofGlow.current.intensity=strength*4.8;
    flames.current.forEach((flame,index)=>{
      if(!flame)return;
      flame.visible=strength>.02;
      const wave=.93+Math.sin(motion+index*1.7)*.07;
      flame.scale.setScalar(strength*wave);
    });
  });
  return (
    <group position={[station.x,0,station.z]}
      rotation={[0,station.z<0?Math.PI:0,0]}>
      <pointLight ref={roofGlow}
        position={[0,station.id==="firetrack"?6.45:station.id==="acreditaciones"?4.7:
          station.id==="evacuaplan"?4.3:station.id==="hidraulica"?5.0:2.8,0]}
        color="#ff853e" distance={9} intensity={0} decay={2}/>
      {anchors.map(([x,height,z],index)=>{
        const fallbackHeight=station.id==="hidrantes"?2.37:
          station.id==="firetrack"?5.45:station.id==="acreditaciones"?4.50:station.id==="hidraulica"?4.60:3.72;
        const flameY=modelMode?height:fallbackHeight;
        const heightScale=index>=6?.82:station.id==="hidrantes"?.96:1.08;
        return (
          <group key={index} ref={node=>{flames.current[index]=node;}}
            position={[x,flameY,z]} scale={heightScale}>
            <mesh position={[0,.12,0]}>
              <sphereGeometry args={[.56,.26,.42,12,8]}/>
              <meshBasicMaterial color="#f26829" transparent opacity={.76}
                depthWrite={false}/>
            </mesh>
            {[0,1.05,2.1].map((angle,tongue)=>(
              <group key={tongue} rotation={[0,angle,0]}
                position={[(tongue-1)*.19,0,(tongue%2)*.15]}
                scale={[tongue===1?.82:1,tongue===2?.76:1,1]}>
                <mesh>
                  <primitive object={SHARED_FLAME_GEOMETRY} attach="geometry"/>
                  <meshBasicMaterial color={tongue===1?"#ff922c":"#ff5324"}
                    transparent opacity={.90} side={THREE.DoubleSide}
                    depthWrite={false}/>
                </mesh>
                <mesh position={[0,.03,.012]} scale={[.47,.62,1]}>
                  <primitive object={SHARED_FLAME_GEOMETRY} attach="geometry"/>
                  <meshBasicMaterial color="#ffeaa2" transparent opacity={.83}
                    side={THREE.DoubleSide} depthWrite={false}/>
                </mesh>
              </group>
            ))}
            {[0,1,2].map(ember=>(
              <mesh key={ember} position={[
                  Math.sin(index*1.9+ember*2.4)*.44,
                  .72+(ember%3)*.40,
                  Math.cos(ember*2.7+index)*.27,
                ]}>
                <primitive object={SHARED_EMBER_GEOMETRY} attach="geometry"/>
                <meshBasicMaterial color="#ffd36b"/>
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

export function StationFires({
  rescued,rescue,modelMode,
}:{
  rescued:ReadonlySet<string>;
  rescue:MutableRefObject<Rescue|null>;
  modelMode:boolean;
}) {
  return (
    <>
      {stations.map(s=><FireAtStation key={s.id} station={s}
        discovered={rescued.has(s.id)} rescue={rescue} modelMode={modelMode}/>)}
    </>
  );
}
