import { getWorldStations, type StructureType } from "@/content/projects";

import type { WorldPosition, WorldRenderer } from "./world-contract";

/**
 * JarceDev exploration world — dependency-free WebGL2 prototype.
 *
 * The scene uses real perspective projection and depth-tested 3D meshes.
 * It intentionally avoids downloading assets or collecting visitor data.
 * A later art-production phase can replace the primitive meshes with GLB.
 */
type Vec3 = [number, number, number];
type Mat4 = Float32Array;
type Geometry = { buffer: WebGLBuffer; vertices: number };
type ObjectShape = "cube" | "cone" | "cylinder";


const palette = {
  ground: "#101f30",
  road: "#26384a",
  markings: "#8296ac",
  night: "#0a1424",
  pavement: "#172b3d",
  fire: "#e76b6b",
  cyan: "#55d3e3",
  purple: "#a78bfa",
  mint: "#65d8af",
  gold: "#ffcd83",
  white: "#e8f0ff",
};

export const worldStations = getWorldStations();

function hexColor(hex: string): Vec3 {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function multiply(a: Mat4, b: Mat4): Mat4 {
  const result = new Float32Array(16);
  for (let col = 0; col < 4; col += 1) {
    for (let row = 0; row < 4; row += 1) {
      let value = 0;
      for (let k = 0; k < 4; k += 1) {
        value += a[k * 4 + row] * b[col * 4 + k];
      }
      result[col * 4 + row] = value;
    }
  }
  return result;
}

function perspective(aspect: number): Mat4 {
  const near = 0.1;
  const far = 105;
  const f = 1 / Math.tan((49 * Math.PI / 180) / 2);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * far * near) / (near - far), 0,
  ]);
}

function normalize(a: Vec3): Vec3 {
  const len = Math.hypot(...a) || 1;
  return [a[0] / len, a[1] / len, a[2] / len];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function lookAt(eye: Vec3, at: Vec3): Mat4 {
  const z = normalize([eye[0] - at[0], eye[1] - at[1], eye[2] - at[2]]);
  const x = normalize(cross([0, 1, 0], z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -x[0] * eye[0] - x[1] * eye[1] - x[2] * eye[2],
    -y[0] * eye[0] - y[1] * eye[1] - y[2] * eye[2],
    -z[0] * eye[0] - z[1] * eye[1] - z[2] * eye[2],
    1,
  ]);
}

function modelMatrix(
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  angle: number,
  roll = 0,
): Mat4 {
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  // R_y(heading) * R_z(roll) * scale: wheels can rotate around their axle.
  return new Float32Array([
    c * cr * sx, sr * sx, -s * cr * sx, 0,
    -c * sr * sy, cr * sy, s * sr * sy, 0,
    s * sz, 0, c * sz, 0,
    x, y, z, 1,
  ]);
}

function makeCube(): Float32Array {
  const faces: { n: Vec3; p: Vec3[] }[] = [
    { n: [0, 0, 1], p: [[-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]] },
    { n: [0, 0, -1], p: [[.5, -.5, -.5], [-.5, -.5, -.5], [-.5, .5, -.5], [.5, .5, -.5]] },
    { n: [1, 0, 0], p: [[.5, -.5, .5], [.5, -.5, -.5], [.5, .5, -.5], [.5, .5, .5]] },
    { n: [-1, 0, 0], p: [[-.5, -.5, -.5], [-.5, -.5, .5], [-.5, .5, .5], [-.5, .5, -.5]] },
    { n: [0, 1, 0], p: [[-.5, .5, .5], [.5, .5, .5], [.5, .5, -.5], [-.5, .5, -.5]] },
    { n: [0, -1, 0], p: [[-.5, -.5, -.5], [.5, -.5, -.5], [.5, -.5, .5], [-.5, -.5, .5]] },
  ];
  const result: number[] = [];
  for (const face of faces) {
    for (const index of [0, 1, 2, 0, 2, 3]) {
      result.push(...face.p[index], ...face.n);
    }
  }
  return new Float32Array(result);
}

function makeRound(cone: boolean): Float32Array {
  const steps = 12;
  const vertices: number[] = [];
  function tri(a: Vec3, b: Vec3, c: Vec3, normal: Vec3) {
    vertices.push(...a, ...normal, ...b, ...normal, ...c, ...normal);
  }
  for (let i = 0; i < steps; i += 1) {
    const a = i / steps * Math.PI * 2;
    const b = (i + 1) / steps * Math.PI * 2;
    const pa: Vec3 = [Math.cos(a) * .5, -.5, Math.sin(a) * .5];
    const pb: Vec3 = [Math.cos(b) * .5, -.5, Math.sin(b) * .5];
    const qa: Vec3 = [Math.cos(a) * (cone ? 0 : .5), .5, Math.sin(a) * (cone ? 0 : .5)];
    const qb: Vec3 = [Math.cos(b) * (cone ? 0 : .5), .5, Math.sin(b) * (cone ? 0 : .5)];
    const n: Vec3 = normalize([Math.cos((a+b)/2), cone ? .45 : 0, Math.sin((a+b)/2)]);
    tri(pa, pb, qb, n);
    if (!cone) tri(pa, qb, qa, n);
    tri([0, -.5, 0], pb, pa, [0, -1, 0]);
    if (!cone) tri([0, .5, 0], qa, qb, [0, 1, 0]);
  }
  return new Float32Array(vertices);
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to allocate WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader) || "WebGL shader compilation failed";
    gl.deleteShader(shader);
    throw new Error(error);
  }
  return shader;
}

export function createWorldRenderer(canvas: HTMLCanvasElement): WorldRenderer {
  const context = canvas.getContext("webgl2", { alpha: false, antialias: true, powerPreference: "high-performance" });
  if (!context) throw new Error("WebGL 2 not supported");
  // Assign to a non-null constant because it is captured by the render helpers.
  const gl: WebGL2RenderingContext = context;

  const vert = compile(gl, gl.VERTEX_SHADER, [
    "#version 300 es",
    "in vec3 aPosition;",
    "in vec3 aNormal;",
    "uniform mat4 uVP;",
    "uniform mat4 uModel;",
    "out float vLight;",
    "out float vDepth;",
    "void main(){",
    " vec4 world = uModel * vec4(aPosition, 1.0);",
    " gl_Position = uVP * world;",
    " vec3 normal = normalize(mat3(uModel) * aNormal);",
    " vLight = max(0.48, dot(normal, normalize(vec3(-0.4, 1.0, 0.6))) * 0.45 + 0.60);",
    " vDepth = length(world.xz);",
    "}",
  ].join("\n"));
  const frag = compile(gl, gl.FRAGMENT_SHADER, [
    "#version 300 es",
    "precision highp float;",
    "uniform vec3 uColor;",
    "uniform float uEmissive;",
    "uniform float uOpacity;",
    "uniform float uDaylight;",
    "in float vLight;",
    "in float vDepth;",
    "out vec4 outColor;",
    "void main(){",
    " float ambient = mix(0.80, 1.23, uDaylight);",
    " vec3 color = uColor * mix(vLight * ambient, 1.75, clamp(uEmissive, 0.0, 1.0));",
    " float fog = smoothstep(28.0, 85.0, vDepth) * .24 * (1.0 - clamp(uEmissive, 0.0, 1.0));",
    " vec3 horizon = mix(vec3(0.06, 0.11, 0.19), vec3(0.61, 0.73, 0.78), uDaylight);",
    " outColor = vec4(mix(color, horizon, fog), uOpacity);",
    "}",
  ].join("\n"));

  const program = gl.createProgram();
  if (!program) throw new Error("Unable to allocate WebGL program");
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Unable to link WebGL");
  }
  gl.useProgram(program);
  const positionAttrib = gl.getAttribLocation(program, "aPosition");
  const normalAttrib = gl.getAttribLocation(program, "aNormal");
  const vpUniform = gl.getUniformLocation(program, "uVP");
  const modelUniform = gl.getUniformLocation(program, "uModel");
  const colorUniform = gl.getUniformLocation(program, "uColor");
  const emissiveUniform = gl.getUniformLocation(program, "uEmissive");
  const opacityUniform = gl.getUniformLocation(program, "uOpacity");
  const daylightUniform = gl.getUniformLocation(program, "uDaylight");
  const shapes = new Map<ObjectShape, Geometry>();
  for (const [shape, vertices] of [
    ["cube", makeCube()],
    ["cone", makeRound(true)],
    ["cylinder", makeRound(false)],
  ] as const) {
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Unable to allocate WebGL geometry");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    shapes.set(shape, { buffer, vertices: vertices.length / 6 });
  }
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(.035, .065, .12, 1);

  let cameraX = 0;
  let cameraY = 8.4;
  let cameraZ = 10;
  let latestVP: Mat4 = new Float32Array(16);
  let lastShape: ObjectShape | null = null;
  let daylight = 0;
  let daylightTarget = 0;
  const colors = new Map<string, Vec3>();
  function tint(hex: string): Vec3 {
    if (!colors.has(hex)) colors.set(hex, hexColor(hex));
    return colors.get(hex)!;
  }
  function draw(
    shape: ObjectShape,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    color: string,
    angle = 0,
    roll = 0,
    emissive = 0,
    opacity = 1,
  ) {
    const mesh = shapes.get(shape)!;
    if (lastShape !== shape) {
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
      gl.enableVertexAttribArray(positionAttrib);
      gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(normalAttrib);
      gl.vertexAttribPointer(normalAttrib, 3, gl.FLOAT, false, 24, 12);
      lastShape = shape;
    }
    gl.uniformMatrix4fv(modelUniform, false, modelMatrix(x, y, z, sx, sy, sz, angle, roll));
    gl.uniform3fv(colorUniform, tint(color));
    gl.uniform1f(emissiveUniform, emissive);
    gl.uniform1f(opacityUniform, opacity);
    gl.uniform1f(daylightUniform, daylight);
    if (opacity < 1) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.depthMask(false);
    }
    gl.drawArrays(gl.TRIANGLES, 0, mesh.vertices);
    if (opacity < 1) {
      gl.disable(gl.BLEND);
      gl.depthMask(true);
    }
  }
  function box(x: number, y: number, z: number, sx: number, sy: number, sz: number, color: string, angle = 0) {
    draw("cube", x, y, z, sx, sy, sz, color, angle);
  }
  function cylinder(x: number, y: number, z: number, sx: number, sy: number, sz: number, color: string) {
    draw("cylinder", x, y, z, sx, sy, sz, color);
  }
  function tree(x: number, z: number, scale = 1) {
    cylinder(x, .55 * scale, z, .20 * scale, 1.1 * scale, .20 * scale, "#735a50");
    draw("cone", x, 1.35 * scale, z, 1.6 * scale, 1.9 * scale, 1.6 * scale, "#327e76");
    draw("cone", x, 2.05 * scale, z, 1.14 * scale, 1.45 * scale, 1.14 * scale, "#3ba394");
  }
  function plot(x: number, z: number, accent: string) {
    // Raised landscaping island and bright station forecourt.
    box(x, .10, z, 12, .20, 11, "#253e53");
    box(x, .23, z, 11.35, .08, 10.35, "#1a2e41");
    box(x, .285, z + 4.7, 10.7, .035, .25, "#486174");
    for (let i = -2; i <= 2; i += 1) {
      box(x + i * 2, .30, z - 5.0, .68, .08, .16, accent);
    }
    // Low-polygon planters unify the four zones visually.
    for (const side of [-1, 1]) {
      box(x + side * 5.2, .34, z + 1.5, .45, .38, 2.3, "#40536a");
      for (const depth of [.65, 1.45, 2.25]) {
        draw("cone", x + side * 5.2, .79, z + depth, .54, .85, .54, "#348981");
      }
    }
  }
  function streetLamp(x: number, z: number) {
    // Soft retro-futuristic lamp posts, no flashing lights.
    cylinder(x, .25, z, .36, .42, .36, "#485c70");
    cylinder(x, 1.75, z, .105, 3.2, .105, "#aebfd0");
    cylinder(x, 3.30, z, .48, .15, .48, "#d4dae3");
    draw("cone", x, 3.10, z, .70, .28, .70, daylightTarget > .5 ? "#8bafbd" : "#ffc77d", 0, 0, daylightTarget > .5 ? 0 : 1);
    cylinder(x, .037, z, 1.55, .025, 1.55, "#405a65");
  }
  function skyline() {
    // Distant low-poly silhouettes give the world depth without image assets.
    for (let i = 0; i < 28; i += 1) {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 36 + (i % 5);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = 3.8 + ((i * 17) % 11) * .55;
      const tint = ["#1b3048", "#233952", "#1c3650", "#2a4057"][i % 4];
      box(x, height / 2 - .12, z, 2.9 + (i % 3), height, 3.5, tint);
      box(x, height + .015, z, 3.0 + (i % 3), .14, 3.65, "#334a5e");
      if (i % 3 === 0) {
        for (let level = 0; level < 3; level += 1) {
          box(x, 1.55 + level * .95, z + 1.81, 1.55, .16, .045, "#5d9ca2");
        }
      }
    }
  }
  function fireStation(x: number, z: number, accent: string) {
    plot(x,z,accent);
    box(x, 1.6, z - 1.15, 5.8, 3.2, 4.2, "#dce0e8");
    box(x, 3.45, z - 1.15, 6.35, .45, 4.7, palette.fire);
    for (let i = 0; i < 3; i += 1) {
      box(x - 1.75 + i * 1.75, 1.05, z + 1.02, 1.30, 1.7, .13, "#425d71");
      box(x - 1.75 + i * 1.75, 1.05, z + 1.12, .98, 1.16, .05, palette.cyan);
    }
    for(let i=0; i<3; i+=1) {
      cylinder(x - 2 + i*2, .75, z+3.4, .65, 1.2, .65, palette.fire);
      cylinder(x - 2 + i*2, 1.43, z+3.4, .35, .18, .35, palette.white);
    }
    cylinder(x+3.95, 1.3, z-2.6, .45, 2.6, .45, palette.fire);
    cylinder(x+3.95, 2.75, z-2.6, .70, .35, .70, palette.gold);
    // Workshop gantry, tool cabinets and a distinct operational beacon.
    box(x, 3.85, z-1.3, 3.9, .25, 3.0, "#f9fafb");
    for(const side of [-1,1]) {
      box(x+side*2.6, 1.25, z+3.55, 1.2, 1.95, .5, "#b9cad8");
      box(x+side*2.6, 2.1, z+3.85, .9, .15, .10, accent);
    }
    box(x, .48, z+3.75, 3.4, .15, 2.1, "#263f57");
    box(x, .59, z+3.75, 2.75, .08, 1.55, "#4f7188");
    box(x+3.68, 3.4, z-1.95, .2, 1.0, .2, "#f3f8fc");
    draw("cone",x+3.68,4.04,z-1.95,.7,.55,.7,accent,0,0,1);
  }
  function evacuaStation(x: number, z: number, accent: string) {
    plot(x,z,accent);
    box(x, 1.25, z - 1.6, 6.0, 2.5, 3.5, "#cadde4");
    box(x - 2.7, 1.3, z + 1.4, .34, 2.6, 4, "#70b7cb");
    box(x + 2.7, 1.3, z + 1.4, .34, 2.6, 4, "#70b7cb");
    box(x, .17, z+1.4, 5.8, .12, 4.0, "#dae5e6");
    for(let i=0; i<3; i+=1) {
      box(x - 2 + i*2, 1.25, z - 1.6, 1.15, 1.65, .14, "#355477");
      box(x - 2 + i*2, 1.25, z - 1.51, .87, 1.35, .04, palette.cyan);
    }
    box(x, .8, z+.9, 2.3, 1.4, .18, "#83cee0");
    box(x+1, .8, z+2.1, .2, 1.4, 2.3, "#83cee0");
    cylinder(x-1.9, .65, z+3.3, .46, 1.3, .46, palette.mint);
    draw("cone", x-1.9, 1.5, z+3.3, .92, .75, .92, palette.white);
    // Transparent drafting studio and large model table.
    box(x, 2.75, z-1.6, 6.7, .19, 4.4, "#a6dce7");
    box(x, 3.06, z-1.6, 5.8, .25, 3.55, "#daedf3");
    for(const side of [-1,1]) {
      box(x+side*3.25,1.45,z-1.5,.10,2.5,3.25,accent);
    }
    box(x-.30,.62,z+3.05,3.4,.16,1.75,"#d6edf4");
    box(x-.30,.73,z+3.05,2.85,.07,1.2,"#5486a4");
    for(let i=0;i<4;i++){
      box(x-1.5+i*.75,.80,z+3.1,.12,.10,.9,"#bedee8");
    }
    box(x+1.90,2.85,z+1.05,.15,.9,.15,accent);
    cylinder(x+1.90,3.38,z+1.05,.6,.22,.6,"#f4f8fd");
  }
  function accreditationStation(x: number, z: number, accent: string) {
    plot(x,z,accent);
    box(x, 1.4, z-1.4, 6.5, 2.8, 4.2, "#d2cde8");
    for(let i=-2; i<=2; i+=1) {
      cylinder(x+i*1.1, 1.25, z+1.05, .27, 2.5, .27, "#a48dd8");
    }
    box(x, 2.85, z-1.35, 7.4, .45, 4.85, "#7d6fb0");
    box(x, 3.34, z-1.35, 8.2, .50, 5.2, palette.purple);
    for(let i=0;i<3;i+=1){
      box(x-2.0+i*2, .55 + i*.35, z+3.45, 1.5, 1 + i*.7, 1.5, ["#6c60ad","#8b74c9","#b69df0"][i]);
      cylinder(x-2.0+i*2, 1.2+i*.7, z+3.45, .62, .10, .62, palette.gold);
    }
    // A data-analytics tower makes the Academy recognizable at a distance.
    cylinder(x,3.85,z-1.45,1.05,.95,1.05,"#e0daff");
    cylinder(x,4.32,z-1.45,1.50,.12,1.50,accent);
    draw("cone",x,5.04,z-1.45,1.5,1.45,1.5,"#9f89d5");
    cylinder(x,5.70,z-1.45,.18,.70,.18,"#f7f3ff");
    for(const side of [-2.35,2.35]) {
      box(x+side,2.05,z+1.1,.48,1.2,.14,"#e9e4ff");
      box(x+side,2.46,z+1.24,.30,.18,.07,accent);
    }
  }
  function hydrantsStation(x: number, z: number, accent: string) {
    plot(x,z,accent);
    box(x, .65, z-2.2, 7.1, 1.3, 2.0, "#69879b");
    for(let i=0;i<3;i+=1) {
      cylinder(x-2.5+i*2.5, 1.0, z + 1, .58, 1.8, .58, i===1 ? palette.fire : palette.mint);
      cylinder(x-2.5+i*2.5, 1.98, z + 1, .9, .30, .9, palette.gold);
      cylinder(x-2.5+i*2.5, 1.18, z + 1.0, 1.25, .33, .36, palette.white);
    }
    for(let i=0;i<4;i+=1) {
      cylinder(x-3.4+i*2.3, .25, z+3.7, .42, .5, .42, "#4ea29c");
    }
    box(x, 2.05, z-2.2, 7.8, .40, 2.8, "#4ad3b5");
    // Elevated tank and mapping mast distinguish the hydrant location.
    cylinder(x+3.25,1.8,z-2.1,.25,3.2,.25,"#b2c8d3");
    cylinder(x+3.25,3.2,z-2.1,1.45,1.0,1.45,"#74d8bf");
    cylinder(x+3.25,3.76,z-2.1,1.7,.18,1.7,"#e5faf7");
    draw("cone",x+3.25,4.1,z-2.1,1.65,.45,1.65,"#4ea995");
    box(x-2.1,1.6,z-1.1,.18,2.05,1.8,"#90aebe");
    box(x-2.1,2.32,z-1.0,.25,.28,1.3,accent);
    for(let i=0;i<3;i++) {
      cylinder(x-2.1+i*2.15,.11,z+4.25,.50,.12,.50,"#378b77");
    }
  }
  // Additional projects use a reusable structure template without new renderer code.
  function genericStation(x: number, z: number, accent: string) {
    plot(x, z, accent);
    box(x, 1.1, z - 1.3, 6.4, 2.2, 4.4, "#d1dee5");
    box(x, 2.45, z - 1.3, 7.1, .35, 5.0, accent);
    box(x, 1.45, z + 1.0, 3.5, 1.4, .12, "#507b9e");
    cylinder(x, 3.0, z - 1.3, 1.2, 1.2, 1.2, accent);
    for (const offset of [-2.35, 2.35]) {
      box(x + offset, 1.35, z + 1.0, .45, 1.65, .18, "#b1d7e6");
    }
  }

  function drawStation(structure: StructureType, x: number, z: number, accent: string) {
    switch (structure) {
      case "operations": fireStation(x, z, accent); break;
      case "design-studio": evacuaStation(x, z, accent); break;
      case "academy": accreditationStation(x, z, accent); break;
      case "mapping-hub": hydrantsStation(x, z, accent); break;
      default: genericStation(x, z, accent);
    }
  }

  function drawRoadNetwork(lowDetail = false) {
    box(0, -.05, 0, 94, .14, 94, daylightTarget > .5 ? "#91bcb4" : palette.ground);
    box(0, -.047, 0, 66, .016, 66, daylightTarget > .5 ? "#79a6a4" : "#162b3c");
    box(0, .035, 0, 7, .08, 53, daylightTarget > .5 ? "#748fa6" : palette.road);
    box(0, .041, 0, 53, .08, 7, daylightTarget > .5 ? "#748fa6" : palette.road);
    // Reflective curbs edge the cross-shaped road.
    for (const side of [-1, 1]) {
      box(side * 3.67, .07, 0, .18, .17, 50.5, "#42576c");
      box(0, .073, side * 3.67, 50.5, .17, .18, "#42576c");
    }
    // Pedestrian crossings distinguish each approach to the plaza.
    for (const direction of [-1,1]) {
      for (let i=-4;i<=4;i+=1) {
        box(i * .62, .097, direction * 7.7, .30, .025, 1.15, "#a5bdc5");
        box(direction * 7.7, .098, i * .62, 1.15, .025, .30, "#a5bdc5");
      }
    }
    for(let i=-25; i<=25; i+=3.7){
      if(Math.abs(i)>5) {
        box(0, .093, i, .13, .025, 1.55, palette.markings);
        box(i, .094, 0, 1.55, .025, .13, palette.markings);
      }
    }
    cylinder(0, .12, 0, 8.6, .14, 8.6, "#334764");
    cylinder(0, .23, 0, 6.9, .12, 6.9, "#182b45");
    cylinder(0, .29, 0, 5.4, .1, 5.4, "#6659a7");
    cylinder(0, .35, 0, 4.75, .12, 4.75, "#233b58");
    for(let i=0;i<16;i+=1) {
      const angle = i/16*Math.PI*2;
      cylinder(Math.cos(angle)*3.1, .38, Math.sin(angle)*3.1, .16, .12, .16, palette.purple);
    }
    const treeSpacing = lowDetail ? 9 : 4.5;
    for(let x=-25;x<=25;x+=treeSpacing){
      for(let z=-25;z<=25;z+=treeSpacing){
        if((Math.abs(x)>22 || Math.abs(z)>22) && (Math.round(x*2+z)%3===0)){
          tree(x,z,.58+(Math.abs(x+z)%3)*.09);
        }
      }
    }
    // Each site gets its own colored perimeter, with the structural plot above it.
    for(const st of worldStations) {
      cylinder(st.x, .015, st.z, 12.9, .065, 12.9, st.color);
      cylinder(st.x, .060, st.z, 12.2, .06, 12.2, daylightTarget > .5 ? "#c4d5d3" : "#172b3f");
    }
    const lamps = lowDetail
      ? [[-4.6,-9.2],[4.6,-9.2],[-4.6,9.2],[4.6,9.2]]
      : [[-4.6,-9.2],[4.6,-9.2],[-4.6,9.2],[4.6,9.2],[-9.2,-4.6],[-9.2,4.6],[9.2,-4.6],[9.2,4.6]];
    for(const location of lamps) {
      streetLamp(location[0],location[1]);
    }
    if (!lowDetail) skyline();
  }
  /**
   * Original, deliberately generic US-style aerial ladder truck.
   * Long cab-over cab, three axles, roof-mounted extendable ladder,
   * side equipment doors and warning beacons. No third-party livery.
   */
  function drawLadderTruck(
    position: WorldPosition,
    heading: number,
    elapsed: number,
    reducedMotion: boolean,
    lightsOn: boolean,
  ) {
    const { x, z } = position;
    const bob = reducedMotion ? 0 : Math.sin(elapsed * 2.1) * .015;
    const alternating = reducedMotion ? true : Math.floor(elapsed * 3.3) % 2 === 0;
    const redBright = lightsOn && alternating;
    const rightBright = lightsOn && (reducedMotion || !alternating);

    // Local-to-world conversion preserves the vehicle's heading.
    // Front of the truck is negative local Z.
    function local(xOffset: number, zOffset: number): [number, number] {
      return [
        x + Math.cos(heading) * xOffset + Math.sin(heading) * zOffset,
        z - Math.sin(heading) * xOffset + Math.cos(heading) * zOffset,
      ];
    }

    function part(
      xOffset: number, y: number, zOffset: number,
      width: number, height: number, length: number,
      color: string,
      emission = 0,
    ) {
      const [px,pz] = local(xOffset,zOffset);
      draw("cube", px, y + bob, pz, width, height, length, color, heading, 0, emission);
    }
    function halo(xOffset: number, zOffset: number, tint: string, intensity = 1) {
      const [px, pz] = local(xOffset, zOffset);
      // Two transparent concentric ground pools brighten the street ahead and
      // behind the truck; they do not affect collision, audio or performance.
      draw("cylinder", px, .135, pz, 3.4, .018, 3.4, tint, 0, 0, 1, .12 * intensity);
      draw("cylinder", px, .143, pz, 1.75, .021, 1.75, tint, 0, 0, 1, .21 * intensity);
    }

    function wheel(xOffset: number, zOffset: number) {
      const [px, pz] = local(xOffset, zOffset);
      // Correct wheel orientation: circular sidewall faces horizontally out.
      draw("cylinder", px, .48 + bob, pz, 1.12, .35, 1.12, "#101923", heading, Math.PI / 2);
      const side = Math.sign(xOffset);
      const [hx, hz] = local(xOffset + side * .22, zOffset);
      draw("cylinder", hx, .48 + bob, hz, .65, .035, .65, "#a9bbcb", heading, Math.PI / 2);
      const [ax, az] = local(xOffset + side * .246, zOffset);
      draw("cylinder", ax, .48 + bob, az, .27, .045, .27, "#e6ebf0", heading, Math.PI / 2);
    }
    function roundPart(
      xOffset: number, y: number, zOffset: number,
      radius: number, length: number, color: string,
    ) {
      const [px,pz] = local(xOffset,zOffset);
      cylinder(px, y + bob, pz, radius * 2, length, radius * 2, color);
    }

    // Undercarriage and long red body.
    part(0,.38,0,2.0,.25,5.95,"#172131");
    part(0,.83,.25,2.18,.88,4.95,"#c83541");
    part(0,1.39,1.06,2.18,.30,3.25,"#f2f4f7");

    // Four-wheel rear tandem axle + front steering axle.
    for(const wheelZ of [-1.95, .9, 2.05]) {
      for(const wheelX of [-1.10,1.10]) {
        wheel(wheelX, wheelZ);
      }
    }
    // Tail end carries utility deck and warning reflectors.
    part(0,.73,2.78,2.18,.42,.30,"#29384a");
    part(-.72,.84,2.98,.39,.17,.09,"#ffb482");
    part(.72,.84,2.98,.39,.17,.09,"#ffb482");

    // Wide American forward cab, windshield, upper white roof.
    part(0,1.51,-1.89,2.20,1.52,1.73,"#e8464f");
    part(0,2.34,-1.88,2.29,.20,1.87,"#f5f7fc");
    part(0,1.76,-2.79,1.83,.62,.09,"#92c9df");
    part(0,1.48,-2.85,2.03,.13,.15,"#e8f0f8");
    // Silver chrome grille and heavy-duty front bumper.
    part(0,.84,-2.96,1.54,.39,.12,"#9faec0");
    for(let i=-2;i<=2;i++) part(0,.74+i*.065,-3.03,1.34,.023,.04,"#e7edf6");
    part(0,.52,-3.06,2.34,.24,.30,"#c7d3dd");
    for(const side of [-1,1]) {
      part(side*.78,1.11,-2.97,.36,.24,.09,lightsOn ? "#fff1b3" : "#8d8871",lightsOn ? 1 : 0);
      part(side*1.14,1.72,-1.83,.10,.54,1.24,"#a2dcf0");
      part(side*1.11,1.10,-1.86,.11,.08,1.55,"#f1eee8");
      // Fold-out mirror arm and housing.
      part(side*1.29,1.85,-2.46,.37,.08,.07,"#bdcbd6");
      part(side*1.48,1.79,-2.46,.21,.29,.15,"#c7d7e6");
    }
    part(0,1.39,-2.97,.18,.24,.07,"#202a38");
    // Emergency warning light bar: generic red / blue.
    part(0,2.50,-2.16,1.30,.12,.30,"#c5d0df");
    part(-.38,2.61,-2.16,.43,.19,.32,redBright ? "#ff243b" : "#7c3443",redBright ? 1 : 0);
    part(.38,2.61,-2.16,.43,.19,.32,rightBright ? "#ff3447" : "#71303a",rightBright ? 1 : 0);
    // Additional side and rear flashers keep the light toggle visible from
    // the default chase camera, which looks at the truck's back end.
    for (const side of [-1, 1]) {
      part(side * 1.13, 1.76, 1.60, .09, .30, .38,
        side === -1 ? (redBright ? "#ff3447" : "#6c3440") : (rightBright ? "#ff3447" : "#6c3440"),
        side === -1 ? Number(redBright) : Number(rightBright));
      part(side * .78, 1.34, 2.99, .32, .25, .12,
        side === -1 ? (redBright ? "#ff263a" : "#632c37") : (rightBright ? "#ff263a" : "#632c37"),
        side === -1 ? Number(redBright) : Number(rightBright));
    }

    // Bright horizontal emergency-apparatus reflectors.
    for(const side of [-1,1]) {
      part(side*1.11,1.27,.98,.055,.12,3.03,"#f3edca");
      part(side*1.12,.91,1.04,.07,.10,3.00,"#f7ca65");
      // Equipment compartment outlines, handles and recessed panels.
      for(const compartment of [-.15,.77,1.69]) {
        part(side*1.13,1.10,compartment,.075,.50,.72,"#cbd7dc");
        part(side*1.19,1.11,compartment,.078,.38,.59,"#a2b0bf");
        part(side*1.24,1.25,compartment,.035,.04,.23,"#36465b");
      }
    }

    // Aerial turntable at the rear, structurally distinct from pumper body.
    roundPart(0,1.62,1.52,.88,.33,"#e6eef4");
    part(0,1.85,1.48,1.52,.23,1.65,"#cbd8e0");
    part(0,2.03,1.48,1.62,.21,1.61,"#8ea1b1");

    // Silver nested aerial ladder raised just above the body. Side rails
    // and regularly spaced cross-rungs create a recognizable silhouette.
    for(const side of [-.58,.58]) {
      part(side,2.38,.04,.12,.16,5.48,"#f0f5f8");
      part(side,2.20,.04,.13,.14,5.48,"#98a9bd");
      for(let index=0;index<11;index++) {
        const rungZ=-2.47+index*.49;
        part(side,2.30,rungZ,.10,.23,.10,"#dfe9f4");
      }
    }
    for(let index=0;index<13;index++) {
      part(0,2.32,-2.50+index*.42,1.20,.075,.105,"#cbdde8");
    }
    // Telescoping inner section, slightly shorter and raised.
    for(const side of [-.39,.39]) {
      part(side,2.58,-.41,.08,.10,3.86,"#aabccf");
    }
    for(let index=0;index<9;index++) {
      part(0,2.60,-2.12+index*.39,.82,.052,.10,"#ebf1f5");
    }
    // Tip, small working platform and final marker lights.
    part(0,2.44,-2.68,1.53,.13,.21,"#d7e3e9");
    part(-.68,2.50,-2.68,.17,.18,.19,"#f7c66d");
    part(.68,2.50,-2.68,.17,.18,.19,"#f7c66d");

    // Distinctive white roof-mounted rescue rack.
    part(0,2.15,2.34,1.36,.13,.65,"#cbd7e1");

    if (lightsOn) {
      // Lens blooms at the lamp positions and visible pools on the road.
      for (const side of [-.78, .78]) {
        const [hx,hz] = local(side, -3.01);
        draw("cube", hx, 1.11 + bob, hz, .51, .35, .12, "#fff4bc", heading, 0, 1, .42);
        halo(side * 1.3, -4.4, "#ffe8a0", .75);
      }
      if (redBright) {
        halo(-1.6, 2.96, "#ff294b", .9);
        const [rx,rz] = local(-.38,-2.16);
        draw("cylinder",rx,2.64+bob,rz,.78,.08,.78,"#ff3d63",0,0,1,.23);
      }
      if (rightBright) {
        halo(1.6, 2.96, "#ff294b", .9);
        const [bx,bz] = local(.38,-2.16);
        draw("cylinder",bx,2.64+bob,bz,.78,.08,.78,"#ff3d63",0,0,1,.23);
      }
    }
  }

  return {
    render(position, heading, elapsed, reducedMotion, cameraMode = "chase", lightsOn = false, timeOfDay = "night") {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const lowDetail = width < 640;
      const dpr = Math.min(window.devicePixelRatio || 1, lowDetail ? 1.1 : 1.45);
      const maxPixels = lowDetail ? 600000 : 1600000;
      const cap = Math.min(1, Math.sqrt(maxPixels / (width * height * dpr * dpr)));
      const rw = Math.round(width * dpr * cap);
      const rh = Math.round(height * dpr * cap);
      if(canvas.width !== rw || canvas.height !== rh) {
        canvas.width = rw;
        canvas.height = rh;
      }
      gl.viewport(0, 0, rw, rh);
      daylightTarget = timeOfDay === "day" ? 1 : 0;
      daylight += (daylightTarget - daylight) * (reducedMotion ? 1 : .085);
      gl.clearColor(.035 + .55 * daylight, .065 + .68 * daylight, .12 + .72 * daylight, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const overview = cameraMode === "overview";
      const desiredX = position.x + (overview ? 5.5 : Math.sin(heading) * 10.5);
      const desiredZ = position.z + (overview ? 9.2 : Math.cos(heading) * 10.5);
      const desiredY = overview ? 18.0 : 8.4;
      const factor = reducedMotion ? 1 : .11;
      cameraX += (desiredX - cameraX) * factor;
      cameraZ += (desiredZ - cameraZ) * factor;
      cameraY += (desiredY - cameraY) * factor;
      const view = lookAt([cameraX, cameraY, cameraZ], [position.x, 1.1, position.z]);
      latestVP = multiply(perspective(rw / rh), view);
      gl.uniformMatrix4fv(vpUniform, false, latestVP);
      lastShape = null;
      drawRoadNetwork(lowDetail);
      for (const station of worldStations) {
        drawStation(station.structure, station.x, station.z, station.color);
      }
      drawLadderTruck(position, heading, elapsed, reducedMotion, lightsOn);
    },
    project(position, elevation = 5.2) {
      // Convert a 3D station roof into a clickable screen-space annotation.
      const x = position.x, y = elevation, z = position.z;
      const clipX = latestVP[0] * x + latestVP[4] * y + latestVP[8] * z + latestVP[12];
      const clipY = latestVP[1] * x + latestVP[5] * y + latestVP[9] * z + latestVP[13];
      const clipW = latestVP[3] * x + latestVP[7] * y + latestVP[11] * z + latestVP[15];
      if (clipW <= .2) return { x: 0, y: 0, visible: false };
      const ndcX = clipX / clipW, ndcY = clipY / clipW;
      const visible = ndcX > -.95 && ndcX < .95 && ndcY > -.87 && ndcY < .78;
      return {
        x: (ndcX * .5 + .5) * canvas.clientWidth,
        y: (1 - (ndcY * .5 + .5)) * canvas.clientHeight,
        visible,
      };
    },
    dispose() {
      for(const shape of shapes.values()) gl.deleteBuffer(shape.buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      // Preserve the canvas context; mode switching may reinitialize it.
    },
  };
}
