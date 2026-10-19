import * as THREE from "three";

/**
 * Purpose-built street lighting for the four-way playable town.
 * Posts stay outside the drivable lanes; their heads project warm light
 * toward the asphalt and their transparent discs suggest road reflections.
 * Eight unshadowed local lights avoid a large night-time GPU cost.
 */
const LAMPS = [
  [-4.8, -30, "vertical"], [4.8, -18, "vertical"],
  [-4.8, 18, "vertical"], [4.8, 30, "vertical"],
  [-30, -4.8, "horizontal"], [-18, 4.8, "horizontal"],
  [18, -4.8, "horizontal"], [30, 4.8, "horizontal"],
] as const;

export function StreetLights({ day }: { day: boolean }) {
  return (
    <group name="town-street-lighting">
      {LAMPS.map(([x,z,axis],index)=>{
        const towardX=axis==="vertical"?-Math.sign(x):0;
        const towardZ=axis==="horizontal"?-Math.sign(z):0;
        const lampX=towardX*.88;
        const lampZ=towardZ*.88;
        return (
          <group key={index} position={[x,0,z]}>
            <mesh position={[0,.17,0]} castShadow receiveShadow>
              <cylinderGeometry args={[.25,.32,.34,10]}/>
              <meshStandardMaterial color="#526373" metalness={.45} roughness={.54}/>
            </mesh>
            <mesh position={[0,2.55,0]} castShadow>
              <cylinderGeometry args={[.075,.12,5.10,10]}/>
              <meshStandardMaterial color="#394e5d" metalness={.46} roughness={.44}/>
            </mesh>
            <mesh position={[lampX*.50,5.04,lampZ*.50]} castShadow>
              <boxGeometry args={[towardX!==0?1.06:.13,.12,towardZ!==0?1.06:.13]}/>
              <meshStandardMaterial color="#506679" metalness={.36} roughness={.49}/>
            </mesh>
            <mesh position={[lampX,4.94,lampZ]}>
              <boxGeometry args={[.65,.17,.65]}/>
              <meshStandardMaterial color="#bfcdd1" metalness={.2} roughness={.38}/>
            </mesh>
            <mesh position={[lampX,4.82,lampZ]}>
              <boxGeometry args={[.58,.075,.58]}/>
              <meshStandardMaterial color="#fff0c7" emissive="#ffe0a0"
                emissiveIntensity={day?.13:3.4} roughness={.27}/>
            </mesh>
            {!day && (
              <>
                <pointLight position={[lampX,4.65,lampZ]}
                  color="#ffe0ac" intensity={16} distance={14} decay={2}/>
                <mesh position={[lampX,4.75,lampZ]}>
                  <sphereGeometry args={[.35,12,8]}/>
                  <meshBasicMaterial color="#ffddac" transparent opacity={.20}
                    depthWrite={false} blending={THREE.AdditiveBlending}/>
                </mesh>
                <mesh rotation={[-Math.PI/2,0,0]} position={[lampX,-.068,lampZ]}>
                  <circleGeometry args={[3.8,32]}/>
                  <meshBasicMaterial color="#ffd08d" transparent opacity={.14}
                    depthWrite={false} blending={THREE.AdditiveBlending}/>
                </mesh>
                <mesh rotation={[-Math.PI/2,0,0]} position={[lampX,-.066,lampZ]}>
                  <circleGeometry args={[1.6,24]}/>
                  <meshBasicMaterial color="#fff0c4" transparent opacity={.25}
                    depthWrite={false} blending={THREE.AdditiveBlending}/>
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}
