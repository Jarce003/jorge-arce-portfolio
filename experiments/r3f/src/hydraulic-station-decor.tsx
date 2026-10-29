import { useEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * Dedicated, low-poly details for the Hydraulics Operations pump station.
 * The building's footprint, rescue anchors and the other stations are unchanged.
 *
 * The station on the north block is rotated 180 degrees by the world renderer:
 * negative local Z therefore faces the central access road.
 */
function Plate({
  at, size, color, glow = 0, metallic = .18,
}: {
  at: [number, number, number];
  size: [number, number, number];
  color: string;
  glow?: number;
  metallic?: number;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size}/>
      <meshStandardMaterial color={color} metalness={metallic} roughness={.48}
        emissive={glow ? color : "#000000"} emissiveIntensity={glow}/>
    </mesh>
  );
}

function Pipe({
  at, length, radius = .09, color = "#69b8cb", direction = "y",
}: {
  at: [number, number, number];
  length: number;
  radius?: number;
  color?: string;
  direction?: "x" | "y" | "z";
}) {
  return (
    <mesh position={at}
      rotation={direction === "x" ? [0, 0, Math.PI / 2]
        : direction === "z" ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
      castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, length, 10]}/>
      <meshStandardMaterial color={color} metalness={.56} roughness={.36}/>
    </mesh>
  );
}

/** The gauge faces the street, with a physically recessed dark dial. */
function Gauge({ at, size = 1 }: {
  at: [number, number, number];
  size?: number;
}) {
  return (
    <group position={at} scale={size}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[.48, .48, .18, 24]}/>
        <meshStandardMaterial color="#dae9f1" metalness={.65} roughness={.32}/>
      </mesh>
      <mesh position={[0, 0, -.105]}>
        <circleGeometry args={[.385, 28]}/>
        <meshStandardMaterial color="#102c43" side={THREE.DoubleSide}/>
      </mesh>
      <mesh position={[0, 0, -.116]}>
        <torusGeometry args={[.35, .024, 7, 28]}/>
        <meshStandardMaterial color="#67dce9" emissive="#2594a7" emissiveIntensity={.30}/>
      </mesh>
      {Array.from({length:7},(_,i)=>{
        const angle=-Math.PI*.78+i*Math.PI*1.56/6;
        return (
          <mesh key={i} position={[Math.sin(angle)*.295,Math.cos(angle)*.295,-.127]}
            rotation={[0,0,-angle]}>
            <boxGeometry args={[.026,.075,.012]}/>
            <meshBasicMaterial color="#d5eef5"/>
          </mesh>
        );
      })}
      <mesh position={[.105,.10,-.146]} rotation={[0,0,-.80]}>
        <boxGeometry args={[.045,.32,.025]}/>
        <meshBasicMaterial color="#ffab65"/>
      </mesh>
      <mesh position={[0,0,-.160]}>
        <sphereGeometry args={[.073,10,8]}/>
        <meshStandardMaterial color="#ecf9fd"/>
      </mesh>
    </group>
  );
}

/** Coiled hose and a metal hub, recognizable from a small 3D viewport. */
function HoseReel({ at }: { at: [number,number,number] }) {
  return (
    <group position={at}>
      <mesh>
        <torusGeometry args={[.49,.115,8,28]}/>
        <meshStandardMaterial color="#294f67" metalness={.42} roughness={.44}/>
      </mesh>
      {[.31,.18].map(r=>(
        <mesh key={r} position={[0,0,-.035]}>
          <torusGeometry args={[r,.072,8,24]}/>
          <meshStandardMaterial color="#47c7d6" metalness={.22} roughness={.48}/>
        </mesh>
      ))}
      <mesh position={[0,0,-.115]}>
        <cylinderGeometry args={[.13,.13,.20,12]}/>
        <meshStandardMaterial color="#e5eff3" metalness={.55} roughness={.35}/>
      </mesh>
      <Plate at={[.32,-.38,-.13]} size={[.46,.10,.10]} color="#ffd18c"/>
    </group>
  );
}

function makeNameplate() {
  if (typeof document === "undefined") return null;
  const canvas=document.createElement("canvas");
  canvas.width=1024;
  canvas.height=256;
  const ctx=canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle="#0a273b";
  ctx.fillRect(0,0,1024,256);
  ctx.fillStyle="#2bc6df";
  ctx.fillRect(0,0,1024,14);
  ctx.fillStyle="#5c9ab0";
  ctx.fillRect(28,28,7,198);
  ctx.fillStyle="#ebfaff";
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.font="bold 90px Arial, sans-serif";
  ctx.fillText("HIDRÁULICA",535,98);
  ctx.font="bold 76px Arial, sans-serif";
  ctx.fillStyle="#80e7ee";
  ctx.fillText("OPERATIVA",535,192);
  ctx.fillStyle="#2bc6df";
  ctx.fillRect(0,243,1024,13);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;
  return texture;
}

/**
 * Adds architectural identity without a new GLB download, remote fonts,
 * real-time lights, or changes to rescue/game mechanics.
 */
export function HydraulicStationDecor() {
  const nameplate=useMemo(makeNameplate,[]);
  useEffect(()=>()=>{nameplate?.dispose();},[nameplate]);

  return (
    <group name="hydraulic-operations-facade">
      {/* Front-facing pump bays: the previous building's detailed side
          pointed away from the intersection, leaving a plain street facade. */}
      {[-2.87,0,2.87].map((offset,index)=>(
        <group key={offset}>
          <Plate at={[offset,1.56,-4.345]} size={[2.48,2.73,.10]}
            color={index===1?"#183d55":"#244a60"}/>
          <Plate at={[offset-1.29,1.56,-4.425]} size={[.11,2.84,.18]} color="#a9cbd8"/>
          <Plate at={[offset+1.29,1.56,-4.425]} size={[.11,2.84,.18]} color="#a9cbd8"/>
          <Plate at={[offset,2.99,-4.43]} size={[2.63,.12,.16]} color="#5ad2e2" glow={.14}/>
          {[.68,1.13,1.58,2.03,2.48].map(y=>(
            <Plate key={y} at={[offset,y,-4.445]} size={[2.28,.037,.024]}
              color="#5b8199" metallic={.32}/>
          ))}
          <Plate at={[offset, .24,-4.45]} size={[2.6,.12,.12]} color="#2ba6bc" glow={.12}/>
        </group>
      ))}

      {/* The lettering is an actual local canvas texture, readable from
          approach and aerial views even in the night palette. */}
      <Plate at={[0,3.74,-4.44]} size={[8.48,1.12,.15]} color="#092738"/>
      {nameplate && (
        <mesh position={[0,3.74,-4.544]} rotation={[0,Math.PI,0]}>
          <planeGeometry args={[8.20,1.03]}/>
          <meshBasicMaterial map={nameplate} toneMapped={false}
            side={THREE.DoubleSide}/>
        </mesh>
      )}
      <Plate at={[0,4.35,-4.32]} size={[9.10,.16,.36]}
        color="#2cacc6" glow={.17}/>
      <Plate at={[0,4.52,-4.33]} size={[9.38,.09,.45]} color="#c8e6e9"/>
      {[-4.16,4.16].map(offset=>(
        <group key={offset}>
          <Plate at={[offset,3.74,-4.54]} size={[.10,1.0,.20]}
            color="#75deed" glow={.16}/>
          <Plate at={[offset,4.21,-4.56]} size={[.29,.10,.20]}
            color="#e0f8fc" glow={.20}/>
        </group>
      ))}

      {/* Pump control instruments positioned beside the center bay. */}
      <Gauge at={[-.64,2.36,-4.54]} size={.36}/>
      <Gauge at={[.64,2.36,-4.54]} size={.36}/>
      <Plate at={[0,1.47,-4.52]} size={[1.36,.55,.055]} color="#173044"/>
      {[0,1,2,3].map(i=>(
        <mesh key={i} position={[-.48+i*.32,1.47,-4.57]}>
          <circleGeometry args={[.065,12]}/>
          <meshBasicMaterial color={i%2?"#80ebc6":"#89daf0"}
            side={THREE.DoubleSide}/>
        </mesh>
      ))}

      {/* Side-mounted hose reels, supply pipe and manifold. The equipment
          stays within the existing plot and away from the driving lane. */}
      <group position={[-4.78,2.02,-1.55]} rotation={[0,Math.PI/2,0]}>
        <HoseReel at={[0,0,0]}/>
        <Plate at={[0,-.91,.12]} size={[1.28,.25,.38]} color="#3b7084"/>
      </group>
      <group position={[4.77,2.03,-1.30]} rotation={[0,-Math.PI/2,0]}>
        <HoseReel at={[0,0,0]}/>
        <Plate at={[0,-.91,.12]} size={[1.28,.25,.38]} color="#3b7084"/>
      </group>
      <Pipe at={[4.78,2.55,-.35]} length={2.40}
        direction="z" radius={.13} color="#a5d6e4"/>
      <Pipe at={[4.78,1.77,-.35]} length={2.4}
        direction="z" radius={.11} color="#3cbdd1"/>
      {[-1.1,0,.9].map((depth,index)=>(
        <group key={depth}>
          <Pipe at={[4.85,2.18,depth]} length={.82}
            radius={.11} color="#e7f2f7"/>
          <mesh position={[4.93,2.18,depth]} rotation={[0,Math.PI/2,0]}>
            <torusGeometry args={[.26,.07,8,16]}/>
            <meshStandardMaterial color={index===1?"#f6c177":"#65d3e5"}
              metalness={.36} roughness={.43}/>
          </mesh>
        </group>
      ))}

      {/* Guardrails, rooftop piping and antenna give the roof a functional
          silhouette without making the neighboring stations less legible. */}
      <Pipe at={[0,5.04,-3.78]} length={7.90} direction="x"
        radius={.066} color="#d3ebee"/>
      {[-3.85,-1.3,1.3,3.85].map(offset=>(
        <Pipe key={offset} at={[offset,4.79,-3.78]} length={.53}
          radius={.052} color="#a3d0db"/>
      ))}
      <Pipe at={[-2.45,4.65,-.6]} length={3.15} direction="z" radius={.18}/>
      <Pipe at={[-2.45,4.68,-2.0]} length={1.2} radius={.13}/>
      <Plate at={[-2.45,5.25,-2.0]} size={[.61,.13,.61]}
        color="#41c4d3" glow={.13}/>

      {/* A legible technical entrance and understated painted bay lines. */}
      {[-3.98,-1.1,1.74,4.3].map(offset=>(
        <Plate key={offset} at={[offset,.145,-5.06]}
          size={[.13,.024,1.0]} color="#eac67d" metallic={0}/>
      ))}
      <Plate at={[0,.15,-5.45]} size={[7.95,.025,.08]}
        color="#eac67d" metallic={0}/>
      <Plate at={[0,.18,-5.02]} size={[2.3,.09,.20]} color="#46798f"/>
    </group>
  );
}
