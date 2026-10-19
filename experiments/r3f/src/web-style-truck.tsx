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
  put(0,2.5,-2.16,1.30,.12,.30,"#c5d0df");
  put(0,2.52,.49,2.20,.16,3.92,"#f0f4f7");
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
    put(side*1.15,1.82,1.62,.08,.24,.30,"#c63c4b");
  }
  // Apparatus turntable and nested ladder.
  put(0,1.85,1.48,1.52,.23,1.65,"#cbd8e0");
  put(0,2.03,1.48,1.62,.21,1.61,"#8ea1b1");
  for(const side of [-.58,.58]){
    put(side,2.38,.04,.12,.16,5.48,"#f0f5f8");
    put(side,2.20,.04,.13,.14,5.48,"#98a9bd");
    for(let index=0;index<11;index++)put(side,2.30,-2.47+index*.49,.10,.23,.10,"#dfe9f4");
  }
  for(let index=0;index<13;index++)put(0,2.32,-2.50+index*.42,1.20,.075,.105,"#cbdde8");
  for(const side of [-.39,.39])put(side,2.58,-.41,.08,.10,3.86,"#aabccf");
  for(let index=0;index<9;index++)put(0,2.60,-2.12+index*.39,.82,.052,.10,"#ebf1f5");
  put(0,2.44,-2.68,1.53,.13,.21,"#d7e3e9");
  for(const x of [-.68,.68])put(x,2.50,-2.68,.17,.18,.19,"#f7c66d");
  put(0,2.15,2.34,1.36,.13,.65,"#cbd7e1");
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
