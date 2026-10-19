import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

import { RESCUE_DURATION, stations, type Rescue, type TruckPose } from "./physics";

const Y_AXIS=new THREE.Vector3(0,1,0);

/** Water jets use the approved WebGL2 language: slender, moving blue
 * ribbon segments, intermittent spray and restrained impact mist.
 * Instancing keeps the richer effect affordable on mobile devices. */
export function WaterSpray({
  truck,rescue,
}:{
  truck:MutableRefObject<TruckPose>;
  rescue:MutableRefObject<Rescue|null>;
}) {
  const stream=useRef<THREE.InstancedMesh>(null);
  const highlights=useRef<THREE.InstancedMesh>(null);
  const drops=useRef<THREE.InstancedMesh>(null);
  const splash=useRef<THREE.InstancedMesh>(null);
  const dummy=useMemo(()=>new THREE.Object3D(),[]);
  const origin=useMemo(()=>new THREE.Vector3(),[]);
  const target=useMemo(()=>new THREE.Vector3(),[]);
  const first=useMemo(()=>new THREE.Vector3(),[]);
  const second=useMemo(()=>new THREE.Vector3(),[]);
  const midpoint=useMemo(()=>new THREE.Vector3(),[]);
  const tangent=useMemo(()=>new THREE.Vector3(),[]);
  const xAxis=useMemo(()=>new THREE.Vector3(1,0,0),[]);
  useFrame(()=>{
    const action=rescue.current, now=performance.now()/1000;
    const age=action ? now-action.startedAt : -1;
    const up=Math.max(0,Math.min(1,(age-.06)/.27));
    const down=Math.max(0,Math.min(1,(RESCUE_DURATION-age)/.32));
    const strength=age<0?0:Math.min(up,down);
    const pose=truck.current;
    origin.set(0,2.72,-2.78).applyAxisAngle(Y_AXIS,pose.heading);
    origin.x+=pose.x;origin.z+=pose.z;
    const st=stations.find(item=>item.id===action?.stationId);
    const localHeight=st?.id==="firetrack"?5.99:st?.id==="evacuaplan"?3.73:
      st?.id==="acreditaciones"?4.05:2.07;
    target.set(st?.x??0,localHeight+.37,st?.z??0);
    function jet(t:number,point:THREE.Vector3){
      point.copy(origin).lerp(target,t);
      point.y+=Math.sin(t*Math.PI)*1.60;
      const wobble=Math.sin(t*16-now*17)*.06*t;
      point.x+=wobble;point.z-=wobble;
      return point;
    }
    if(stream.current){
      for(let index=0;index<17;index++){
        const visible=strength>.01&&(index<2||(index+Math.floor(now*19))%6!==0);
        const t=index/17;
        jet(t,first);jet((index+1)/17,second);
        tangent.subVectors(second,first);
        const length=tangent.length();
        midpoint.copy(first).add(second).multiplyScalar(.5);
        dummy.position.copy(midpoint);
        dummy.quaternion.setFromUnitVectors(xAxis,tangent.normalize());
        const width=(.16+t*.055)*strength*(.90+.10*Math.sin(now*22-index*1.7));
        dummy.scale.set(visible?length*.94:.00001,visible?width:.00001,visible?width:.00001);
        dummy.updateMatrix();
        stream.current.setMatrixAt(index,dummy.matrix);
        if(highlights.current){
          dummy.position.y+=.026;
          dummy.scale.set(visible&&index%3===0?length*.55:.00001,
            visible&&index%3===0?width*.38:.00001,
            visible&&index%3===0?width*.38:.00001);
          dummy.updateMatrix();
          highlights.current.setMatrixAt(index,dummy.matrix);
        }
      }
      stream.current.instanceMatrix.needsUpdate=true;
      if(highlights.current)highlights.current.instanceMatrix.needsUpdate=true;
    }
    if(drops.current){
      for(let index=0;index<25;index++){
        const t=((index+.3)/25+Math.max(0,age)*1.6)%1;
        jet(t,midpoint);
        const wobble=Math.sin(index*7.7+now*11)*t*.055;
        const size=(.095+index%3*.025)*strength;
        dummy.position.set(midpoint.x+wobble,midpoint.y,midpoint.z-wobble);
        dummy.quaternion.identity();
        dummy.scale.set(size,size*1.5,size);
        dummy.updateMatrix();
        drops.current.setMatrixAt(index,dummy.matrix);
      }
      drops.current.instanceMatrix.needsUpdate=true;
    }
    if(splash.current){
      for(let index=0;index<12;index++){
        const a=index*2.4+Math.max(0,age)*3.8;
        const radius=.12+(index%4)*.10;
        dummy.position.set(target.x+Math.cos(a)*radius,
          target.y+.12+Math.abs(Math.sin(now*7+index))*.30,
          target.z+Math.sin(a)*radius);
        dummy.quaternion.identity();
        dummy.scale.setScalar(.052*strength);
        dummy.updateMatrix();
        splash.current.setMatrixAt(index,dummy.matrix);
      }
      splash.current.instanceMatrix.needsUpdate=true;
    }
  });
  return (
    <>
      <instancedMesh ref={stream} args={[undefined,undefined,17]} frustumCulled={false}>
        <boxGeometry args={[1,1,1]}/>
        <meshStandardMaterial color="#27b8dc" transparent opacity={.87}
          emissive="#138aaa" emissiveIntensity={.37} depthWrite={false} roughness={.29}/>
      </instancedMesh>
      <instancedMesh ref={highlights} args={[undefined,undefined,17]} frustumCulled={false}>
        <boxGeometry args={[1,1,1]}/>
        <meshStandardMaterial color="#c1f1fa" transparent opacity={.64}
          depthWrite={false} roughness={.31}/>
      </instancedMesh>
      <instancedMesh ref={drops} args={[undefined,undefined,25]} frustumCulled={false}>
        <icosahedronGeometry args={[1,0]}/>
        <meshStandardMaterial color="#68d5f0" transparent opacity={.81}
          depthWrite={false} roughness={.35}/>
      </instancedMesh>
      <instancedMesh ref={splash} args={[undefined,undefined,12]} frustumCulled={false}>
        <icosahedronGeometry args={[1,0]}/>
        <meshStandardMaterial color="#c4f5fd" transparent opacity={.48}
          depthWrite={false} roughness={.35}/>
      </instancedMesh>
    </>
  );
}

/** Flashing red warning lights around the cab, equipment body and aerial.
 * Night-time pools on the asphalt restore the road reflections of WebGL2.
 * Animation is disabled for people who prefer reduced motion.
 */
const BEACONS = [
  // Two cab roof groups and front grille warning lights.
  {at:[-.78,2.95,-2.34], size:[.40,.20,.28], phase:0, light:true},
  {at:[ .78,2.95,-2.34], size:[.40,.20,.28], phase:1, light:true},
  {at:[-.69,1.13,-3.02], size:[.36,.23,.10], phase:0, light:false},
  {at:[ .69,1.13,-3.02], size:[.36,.23,.10], phase:1, light:false},
  // Both sides: cab, middle service body and rear equipment bays.
  {at:[-1.24,1.79,-1.86], size:[.10,.28,.43], phase:0, light:true},
  {at:[ 1.24,1.79,-1.86], size:[.10,.28,.43], phase:1, light:true},
  {at:[-1.24,1.72,.62], size:[.10,.27,.41], phase:1, light:false},
  {at:[ 1.24,1.72,.62], size:[.10,.27,.41], phase:0, light:false},
  {at:[-1.24,1.74,2.14], size:[.10,.28,.44], phase:0, light:true},
  {at:[ 1.24,1.74,2.14], size:[.10,.28,.44], phase:1, light:true},
  // Tail lamps and elevated rear ladder warning markers.
  {at:[-.82,1.20,3.01], size:[.33,.23,.10], phase:1, light:false},
  {at:[ .82,1.20,3.01], size:[.33,.23,.10], phase:0, light:false},
  {at:[-.61,2.48,2.47], size:[.19,.19,.25], phase:1, light:true},
  {at:[ .61,2.48,2.47], size:[.19,.19,.25], phase:0, light:true},
] as const;

export function RedEmergencyLights({
  active,day,reducedMotion=false,
}:{
  active:boolean;day:boolean;reducedMotion?:boolean;
}) {
  const lenses=useRef<(THREE.Mesh|null)[]>([]);
  const lamps=useRef<(THREE.PointLight|null)[]>([]);
  const reflected=useRef<(THREE.Mesh|null)[]>([]);
  useFrame(({clock})=>{
    const flash=Math.floor(clock.elapsedTime*4.6)%2;
    BEACONS.forEach((b,index)=>{
      const on=active&&(reducedMotion||b.phase===flash);
      const lens=lenses.current[index];
      if(lens){
        const material=lens.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity=on?(day?4.2:6.8):.06;
      }
      const point=lamps.current[index];
      if(point)point.intensity=on?(day?3.4:7.6):0;
      const ground=reflected.current[index];
      if(ground){
        const material=ground.material as THREE.MeshBasicMaterial;
        material.opacity=on?(day?.12:.28):0;
      }
    });
  });
  return (
    <group name="emergency-lightbar-and-body-flashers">
      {BEACONS.map((b,index)=>{
        const [x,y,z]=b.at;
        return (
          <group key={index}>
            <mesh ref={node=>{lenses.current[index]=node;}}
              position={[x,y,z]}>
              <boxGeometry args={[...b.size]}/>
              <meshStandardMaterial color="#c93442" emissive="#ff3047"
                emissiveIntensity={.06} metalness={.16} roughness={.24}/>
            </mesh>
            {b.light && (
              <pointLight ref={node=>{lamps.current[index]=node;}}
                position={[x,y+.06,z]} color="#ff4156" intensity={0}
                distance={day?5.2:9.5} decay={2}/>
            )}
            <mesh ref={node=>{reflected.current[index]=node;}}
              rotation={[-Math.PI/2,0,0]}
              position={[x*1.1,-.047,z]} renderOrder={4}>
              <circleGeometry args={[index<4?1.55:1.2,22]}/>
              <meshBasicMaterial color="#ff344c" transparent opacity={0}
                blending={THREE.AdditiveBlending} depthWrite={false}/>
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
