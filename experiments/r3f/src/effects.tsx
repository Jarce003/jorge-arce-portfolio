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
        const width=(.077+t*.028)*strength*(.90+.10*Math.sin(now*22-index*1.7));
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
        const size=(.075+index%3*.017)*strength;
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
        <meshStandardMaterial color="#36bde0" transparent opacity={.68}
          emissive="#138aaa" emissiveIntensity={.37} depthWrite={false} roughness={.29}/>
      </instancedMesh>
      <instancedMesh ref={highlights} args={[undefined,undefined,17]} frustumCulled={false}>
        <boxGeometry args={[1,1,1]}/>
        <meshStandardMaterial color="#b0ebf5" transparent opacity={.42}
          depthWrite={false} roughness={.31}/>
      </instancedMesh>
      <instancedMesh ref={drops} args={[undefined,undefined,25]} frustumCulled={false}>
        <icosahedronGeometry args={[1,0]}/>
        <meshStandardMaterial color="#55cae6" transparent opacity={.66}
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

/** Two clear red flashers work identically on procedural and imported trucks. */
export function RedEmergencyLights({ active }: {active:boolean}) {
  const refs=useRef<(THREE.Mesh|null)[]>([]);
  useFrame(({clock})=>{
    const tick=Math.floor(clock.elapsedTime*5);
    refs.current.forEach((mesh,index)=>{
      if(!mesh)return;
      const material=mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity=active && (tick+index)%2===0 ? 3.0 : .08;
    });
  });
  return (
    <>
      {[-.76,.76].map((x,index)=>(
        <group key={index}>
          <mesh ref={mesh=>{refs.current[index]=mesh;}}
            position={[x,2.94,-2.34]}>
            <boxGeometry args={[.46,.21,.27]}/>
            <meshStandardMaterial color="#e52c43" emissive="#ff1f38"
              emissiveIntensity={0.08} metalness={.22} roughness={.33}/>
          </mesh>
        </group>
      ))}
    </>
  );
}
