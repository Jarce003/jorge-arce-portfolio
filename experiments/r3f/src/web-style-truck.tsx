import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { TruckPose } from "./physics";

// Faithful Three.js rebuild of the approved WebGL2 American aerial apparatus.
// Static painted parts are instanced by finish: detailed geometry, few draw calls.
type Part = [number,number,number,number,number,number,string];
const parts:Part[]=[];
const put=(x:number,y:number,z:number,w:number,h:number,l:number,color:string)=>{
  parts.push([x,y,z,w,h,l,color]);
};
function buildParts(){
  if(parts.length)return parts;
  put(0,.38,0,2.0,.25,5.95,"#172131");
  put(0,.83,.25,2.18,.88,4.95,"#c83541");
  put(0,1.39,1.06,2.18,.30,3.25,"#f2f4f7");
  // Rear bumpers, utility deck, and lamps.
  put(0,.73,2.78,2.18,.42,.30,"#29384a");
  for(const x of [-.72,.72])put(x,.84,2.98,.39,.17,.09,"#ffb482");
  // American cab proportions retained from the WebGL2 reference.
  put(0,1.51,-1.89,2.20,1.52,1.73,"#e8464f");
  put(0,2.34,-1.88,2.29,.20,1.87,"#f5f7fc");
  put(0,1.76,-2.79,1.83,.62,.09,"#92c9df");
  put(0,1.48,-2.85,2.03,.13,.15,"#e8f0f8");
  put(0,.84,-2.96,1.54,.39,.12,"#9faec0");
  for(let i=-2;i<=2;i++)put(0,.74+i*.065,-3.03,1.34,.023,.04,"#e7edf6");
  put(0,.52,-3.06,2.34,.24,.30,"#c7d3dd");
  put(0,1.39,-2.97,.18,.24,.07,"#202a38");
  // Emergency bar sits on the cab roof; it does not intersect the aerial.
  put(0,2.50,-2.50,2.06,.10,.30,"#3b5268");
  // No solid full-length ladder roof deck: the aerial must read as open truss.
  for(const side of [-1,1]){
    put(side*.78,1.11,-2.97,.36,.24,.09,"#fff1b3");
    put(side*1.14,1.72,-1.83,.10,.54,1.24,"#a2dcf0");
    put(side*1.11,1.10,-1.86,.11,.08,1.55,"#f1eee8");
    put(side*1.29,1.85,-2.46,.37,.08,.07,"#bdcbd6");
    put(side*1.48,1.79,-2.46,.21,.29,.15,"#c7d7e6");
    put(side*1.11,1.27,.98,.055,.12,3.03,"#f3edca");
    put(side*1.12,.91,1.04,.07,.10,3.00,"#f7ca65");
    // Authentic compartment doors, recessed metal panels and pull handles.
    for(const compartment of [-.15,.77,1.69]){
      put(side*1.13,1.10,compartment,.075,.50,.72,"#cbd7dc");
      put(side*1.19,1.11,compartment,.078,.38,.59,"#a2b0bf");
      put(side*1.24,1.25,compartment,.035,.04,.23,"#36465b");
    }
    put(side*1.13,.65,-2.14,.26,.11,1.13,"#b8c9d6");
    // Costa Rica civil flag on each cab door: blue / white / double red /
    // white / blue. Readable from both drive-side and passenger-side views.
    // The emblem is not a fake national coat of arms.
    const flagX=side*1.213;
    const flagZ=-1.66;
    const flagBands:[number,number,string][]=[
      [1.112,.042,"#002B7F"],[1.155,.042,"#FFFFFF"],
      [1.224,.094,"#CE1126"],[1.293,.042,"#FFFFFF"],
      [1.336,.042,"#002B7F"],
    ];
    for(const [height,thickness,finish] of flagBands){
      put(flagX,height,flagZ,.035,thickness,.51,finish);
    }
    // Rear-side alert lens belongs to the animated beacon system only.
  }
  // A single open aerial ladder, with a clearly separated turntable pivot.
  // Earlier versions accidentally rendered a large deck AND two overlapping
  // rung layers, producing a white floating slab/duplicate ladder silhouette.
  put(0,1.90,1.42,1.35,.20,1.25,"#9aaebd");
  put(0,2.15,1.42,1.28,.29,1.12,"#455e72");
  put(0,2.37,1.42,1.21,.12,1.05,"#bed0de");
  for(const side of [-.60,.60]){
    // Structural upper and lower longitudinal rails.
    put(side,2.85,-.06,.115,.12,5.48,"#dce6f0");
    put(side,2.58,-.06,.115,.12,5.48,"#879fb1");
    // One row of open side truss uprights, not a second ladder.
    for(let index=0;index<11;index++){
      put(side,2.72,-2.54+index*.50,.095,.30,.095,"#bdcddc");
    }
  }
  // Exactly one continuous line of rungs between the lower rails.
  for(let index=0;index<14;index++){
    put(0,2.66,-2.62+index*.40,1.28,.082,.11,"#e5eef5");
  }
  // Side support and the compact ladder tip/nozzle.
  put(0,2.48,1.75,.53,.10,1.19,"#758fa4");
  put(0,2.70,-2.77,.37,.20,.20,"#b4c5d4");
  return parts;
}
const matrices=buildParts().reduce<Record<string,THREE.Matrix4[]>>((groups,p)=>{
  const [x,y,z,w,h,l,color]=p;
  const matrix=new THREE.Matrix4().compose(
    new THREE.Vector3(x,y,z),new THREE.Quaternion(),
    new THREE.Vector3(w,h,l)
  );
  (groups[color]??=[]).push(matrix);
  return groups;
},{});
function PaintedParts({color,items}:{color:string;items:THREE.Matrix4[]}){
  const ref=useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(()=>{
    if(!ref.current)return;
    items.forEach((matrix,i)=>ref.current?.setMatrixAt(i,matrix));
    ref.current.instanceMatrix.needsUpdate=true;
    ref.current.computeBoundingSphere();
  },[items]);
  return (
    <instancedMesh ref={ref} args={[undefined,undefined,items.length]}
      castShadow receiveShadow>
      <boxGeometry args={[1,1,1]}/>
      <meshStandardMaterial color={color}
        metalness={(color.startsWith("#c")||color.startsWith("#e")) ? .34 : .10}
        roughness={.49}/>
    </instancedMesh>
  );
}
function Wheel({side,z,pose}:{side:number;z:number;pose:MutableRefObject<TruckPose>}){
  const axle=useRef<THREE.Group>(null);
  useFrame((_,delta)=>{
    if(axle.current)axle.current.rotation.x+=pose.current.speed*Math.min(delta,.07)/.56;
  });
  return <group ref={axle} position={[side*1.1,.48,z]}>
    <mesh rotation={[0,0,Math.PI/2]} castShadow>
      <cylinderGeometry args={[.56,.56,.35,20]}/>
      <meshStandardMaterial color="#101923" roughness={.94}/>
    </mesh>
    <mesh rotation={[0,0,Math.PI/2]} position={[side*.20,0,0]}>
      <cylinderGeometry args={[.325,.325,.042,16]}/>
      <meshStandardMaterial color="#a9bbcb" metalness={.70} roughness={.30}/>
    </mesh>
    <mesh rotation={[0,0,Math.PI/2]} position={[side*.23,0,0]}>
      <cylinderGeometry args={[.135,.135,.053,12]}/>
      <meshStandardMaterial color="#e6ebf0" metalness={.72} roughness={.29}/>
    </mesh>
  </group>;
}
export function WebStyleTruck({truck}:{truck:MutableRefObject<TruckPose>}){
  const wheels=useMemo(()=>[-1.95,.9,2.05].flatMap(z=>[-1,1].map(side=>({z,side}))),[]);
  return (
    <group>
      {Object.entries(matrices).map(([color,items])=>
        <PaintedParts key={color} color={color} items={items}/>)}
      {wheels.map(w=><Wheel key={w.z+":"+w.side} {...w} pose={truck}/>)}
      <mesh position={[0,1.64,1.48]} castShadow>
        <cylinderGeometry args={[.82,.82,.25,20]}/>
        <meshStandardMaterial color="#d9e5ed" metalness={.68} roughness={.32}/>
      </mesh>
    </group>
  );
}
