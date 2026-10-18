/**
 * JarceDev exploration world — dependency-free WebGL2 prototype.
 *
 * The scene uses real perspective projection and depth-tested 3D meshes.
 * It intentionally avoids downloading assets or collecting visitor data.
 * A later art-production phase can replace the primitive meshes with GLB.
 */
export type WorldPosition = { x: number; z: number };

type Vec3 = [number, number, number];
type Mat4 = Float32Array;
type Geometry = { buffer: WebGLBuffer; vertices: number };
type ObjectShape = "cube" | "cone" | "cylinder";

export type WorldRenderer = {
  render: (position: WorldPosition, heading: number, elapsed: number, reducedMotion: boolean) => void;
  dispose: () => void;
};

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

export const worldStations = [
  { id: "firetrack", x: -14, z: -12, color: palette.fire },
  { id: "evacuaplan", x: 14, z: -12, color: palette.cyan },
  { id: "acreditaciones", x: -14, z: 12, color: palette.purple },
  { id: "hidrantes", x: 14, z: 12, color: palette.mint },
] as const;

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
): Mat4 {
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  return new Float32Array([
    c * sx, 0, -s * sx, 0,
    0, sy, 0, 0,
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
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: true, powerPreference: "high-performance" });
  if (!gl) throw new Error("WebGL 2 not supported");

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
    "in float vLight;",
    "in float vDepth;",
    "out vec4 outColor;",
    "void main(){",
    " vec3 color = uColor * vLight;",
    " float fog = smoothstep(28.0, 85.0, vDepth) * .30;",
    " outColor = vec4(mix(color, vec3(0.07, 0.12, 0.20), fog), 1.0);",
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

  let cameraX = -7;
  let cameraZ = -10;
  let lastShape: ObjectShape | null = null;
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
    gl.uniformMatrix4fv(modelUniform, false, modelMatrix(x, y, z, sx, sy, sz, angle));
    gl.uniform3fv(colorUniform, tint(color));
    gl.drawArrays(gl.TRIANGLES, 0, mesh.vertices);
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
    box(x, .10, z, 12, .20, 11, "#23394c");
    box(x, .23, z, 11.35, .08, 10.35, "#1a2e41");
    for (let i = -2; i <= 2; i += 1) {
      box(x + i * 2, .27, z - 5.0, .55, .1, .12, accent);
    }
  }
  function fireStation() {
    const x = -14, z = -12;
    plot(x,z,palette.fire);
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
  }
  function evacuaStation() {
    const x = 14, z = -12;
    plot(x,z,palette.cyan);
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
  }
  function accreditationStation() {
    const x = -14, z = 12;
    plot(x,z,palette.purple);
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
  }
  function hydrantsStation() {
    const x = 14, z = 12;
    plot(x,z,palette.mint);
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
  }
  function drawRoadNetwork() {
    box(0, -.05, 0, 55, .14, 55, palette.ground);
    box(0, .035, 0, 7, .08, 53, palette.road);
    box(0, .041, 0, 53, .08, 7, palette.road);
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
    for(let x=-24;x<=24;x+=4){
      for(let z=-24;z<=24;z+=4){
        if((Math.abs(x)>21 || Math.abs(z)>21) && (Math.round(x*2+z)%3===0)){
          tree(x,z,.55+(Math.abs(x+z)%3)*.1);
        }
      }
    }
    for(const st of worldStations){
      cylinder(st.x, .3, st.z, 12.8, .05, 12.8, st.color);
      cylinder(st.x, .34, st.z, 12.1, .06, 12.1, "#172b3f");
    }
  }
  /**
   * Original, deliberately generic US-style aerial ladder truck.
   * Long cab-over cab, three axles, roof-mounted extendable ladder,
   * side equipment doors and warning beacons. No third-party livery.
   */
  function drawLadderTruck(position: WorldPosition, heading: number, elapsed: number, reducedMotion: boolean) {
    const { x, z } = position;
    const bob = reducedMotion ? 0 : Math.sin(elapsed * 2.1) * .015;

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
    ) {
      const [px,pz] = local(xOffset,zOffset);
      box(px, y + bob, pz, width,height,length,color,heading);
    }

    function roundPart(
      xOffset: number, y: number, zOffset: number,
      radius: number, length: number, color: string,
    ) {
      const [px,pz] = local(xOffset,zOffset);
      // Wheels use a simplified, low-poly cylinder representation.
      cylinder(px, y + bob, pz, radius * 2, length, radius * 2, color);
    }

    // Undercarriage and long red body.
    part(0,.38,0,2.0,.25,5.95,"#172131");
    part(0,.83,.25,2.18,.88,4.95,"#c83541");
    part(0,1.39,1.06,2.18,.30,3.25,"#f2f4f7");

    // Four-wheel rear tandem axle + front steering axle.
    for(const wheelZ of [-1.95, .9, 2.05]) {
      for(const wheelX of [-1.10,1.10]) {
        roundPart(wheelX,.45,wheelZ,.58,.39,"#0d1929");
        roundPart(wheelX,.47,wheelZ,.29,.41,"#99a6b5");
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
      part(side*.78,1.11,-2.97,.36,.24,.09,"#f6e7aa");
      part(side*1.14,1.72,-1.83,.10,.54,1.24,"#a2dcf0");
      part(side*1.11,1.10,-1.86,.11,.08,1.55,"#f1eee8");
      // Fold-out mirror arm and housing.
      part(side*1.29,1.85,-2.46,.37,.08,.07,"#bdcbd6");
      part(side*1.48,1.79,-2.46,.21,.29,.15,"#c7d7e6");
    }
    part(0,1.39,-2.97,.18,.24,.07,"#202a38");
    // Emergency warning light bar: generic red / blue.
    part(0,2.50,-2.16,1.30,.12,.30,"#c5d0df");
    part(-.38,2.61,-2.16,.43,.19,.32,"#ec4b58");
    part(.38,2.61,-2.16,.43,.19,.32,"#57b9e6");

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
  }

  return {
    render(position, heading, elapsed, reducedMotion) {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.45);
      const cap = Math.min(1, Math.sqrt(1600000 / (width * height * dpr * dpr)));
      const rw = Math.round(width * dpr * cap);
      const rh = Math.round(height * dpr * cap);
      if(canvas.width !== rw || canvas.height !== rh) {
        canvas.width = rw;
        canvas.height = rh;
      }
      gl.viewport(0, 0, rw, rh);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const desiredX = position.x + Math.sin(heading) * 8.8;
      const desiredZ = position.z + Math.cos(heading) * 8.8;
      const factor = reducedMotion ? 1 : .11;
      cameraX += (desiredX - cameraX) * factor;
      cameraZ += (desiredZ - cameraZ) * factor;
      const view = lookAt([cameraX, 8.4, cameraZ], [position.x, .75, position.z]);
      gl.uniformMatrix4fv(vpUniform, false, multiply(perspective(rw / rh), view));
      lastShape = null;
      drawRoadNetwork();
      fireStation();
      evacuaStation();
      accreditationStation();
      hydrantsStation();
      drawLadderTruck(position, heading, elapsed, reducedMotion);
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
