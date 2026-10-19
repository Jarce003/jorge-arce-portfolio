import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

import { RESCUE_DURATION, stations, type Rescue, type TruckPose } from "./physics";

const Y_AXIS=new THREE.Vector3(0,1,0);

export function WaterSpray({
  truck, rescue,
}:{
  truck:MutableRefObject<TruckPose>;
  rescue:MutableRefObject<Rescue|null>;
}) {
  const stream=useRef<THREE.InstancedMesh>(null);
  const splash=useRef<THREE.InstancedMesh>(null);
  const dummy=useMemo(()=>new THREE.Object3D(),[]);
  const origin=useMemo(()=>new THREE.Vector3(),[]);
  const destination=useMemo(()=>new THREE.Vector3(),[]);
  const point=useMemo(()=>new THREE.Vector3(),[]);
  useFrame(()=>{
    const action=rescue.current;
    const now=performance.now()/1000;
    const seconds=action?now-action.startedAt:-1;
    const up=Math.max(0,Math.min(1,(seconds-.10)/.30));
    const down=Math.max(0,Math.min(1,(RESCUE_DURATION-seconds)/.25));
    const strength=seconds<0?0:Math.min(up,down);

    const pose=truck.current;
    origin.set(0,2.99,-2.63).applyAxisAngle(Y_AXIS,pose.heading);
    origin.x+=pose.x;origin.z+=pose.z;
    const station=stations.find(item=>item.id===action?.stationId);
    destination.set(station?.x??0,5.32,station?.z??0);
    if (stream.current) {
      for(let index=0;index<38;index++){
        const t=((index+.2)/38+Math.max(0,seconds)*1.4)%1;
        point.copy(origin).lerp(destination,t);
        point.y+=Math.sin(Math.PI*t)*1.72;
        point.x+=Math.sin(index*2.64+now*13)*t*.075;
        point.z+=Math.cos(index*2.88+now*12)*t*.075;
        const size=(.062+(index%4)*.012)*strength;
        dummy.position.copy(point);
        dummy.scale.set(size,size*1.35,size);
        dummy.rotation.set(0,0,0);
        dummy.updateMatrix();
        stream.current.setMatrixAt(index,dummy.matrix);
      }
      stream.current.instanceMatrix.needsUpdate=true;
    }
    if(splash.current){
      for(let index=0;index<16;index++){
        const angle=index*2.4+Math.max(0,seconds)*3.6;
        const radius=.17+(index%4)*.14;
        dummy.position.set(
          destination.x+Math.cos(angle)*radius,
          destination.y+.18+Math.abs(Math.sin(now*6.7+index))*.48,
          destination.z+Math.sin(angle)*radius,
        );
        const size=.064*strength;
        dummy.scale.setScalar(size);
        dummy.updateMatrix();
        splash.current.setMatrixAt(index,dummy.matrix);
      }
      splash.current.instanceMatrix.needsUpdate=true;
    }
  });
  return (
    <>
      <instancedMesh ref={stream} args={[undefined,undefined,38]} frustumCulled={false}>
        <icosahedronGeometry args={[1,0]}/>
        <meshStandardMaterial color="#57c7e8" transparent opacity={.78}
          emissive="#17647b" emissiveIntensity={.27} roughness={.3} depthWrite={false}/>
      </instancedMesh>
      <instancedMesh ref={splash} args={[undefined,undefined,16]} frustumCulled={false}>
        <icosahedronGeometry args={[1,0]}/>
        <meshStandardMaterial color="#c0f4ff" transparent opacity={.63}
          roughness={.35} depthWrite={false}/>
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
