"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_FOV, CAMERA_Z, SPHERE_RADIUS } from "./frame";

/**
 * The mark in three dimensions.
 *
 * A sphere and nothing else — the silhouette never deforms. The colour ramp is
 * the same seven stops as the CSS egg, so the two sit on top of each other
 * during the cross-fade without a visible seam. All the lighting is baked into
 * the fragment shader — no lights in the scene, which is why this costs almost
 * nothing to draw. What WebGL buys over the CSS version is a highlight that
 * follows the cursor and a surface that is very slightly alive.
 */

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec4 world = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normalize(position));
    vView = normalize(-world.xyz);
    gl_Position = projectionMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uPointer;
  varying vec3 vNormal;
  varying vec3 vView;

  const vec3 C0 = vec3(1.000, 0.969, 0.831); // #fff7d4
  const vec3 C1 = vec3(1.000, 0.918, 0.643); // #ffeaa4
  const vec3 C2 = vec3(0.988, 0.816, 0.388); // #fcd063
  const vec3 C3 = vec3(0.973, 0.671, 0.165); // #f8ab2a
  const vec3 C4 = vec3(0.957, 0.565, 0.110); // #f4901c
  const vec3 C5 = vec3(0.918, 0.478, 0.071); // #ea7a12
  const vec3 C6 = vec3(0.867, 0.400, 0.039); // #dd660a

  // The gradient of the logo, stop for stop.
  vec3 ramp(float t) {
    t = clamp(t, 0.0, 1.0);
    if (t < 0.10) return mix(C0, C1, smoothstep(0.00, 0.10, t));
    if (t < 0.26) return mix(C1, C2, smoothstep(0.10, 0.26, t));
    if (t < 0.48) return mix(C2, C3, smoothstep(0.26, 0.48, t));
    if (t < 0.66) return mix(C3, C4, smoothstep(0.48, 0.66, t));
    if (t < 0.84) return mix(C4, C5, smoothstep(0.66, 0.84, t));
    return mix(C5, C6, smoothstep(0.84, 1.00, t));
  }

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  float noise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);

    // Upper-left-front, which puts the highlight where the logo has it.
    vec3 L = normalize(vec3(-0.42 + uPointer.x * 0.16, 0.50 + uPointer.y * 0.16, 0.76));

    float d = clamp(dot(N, L), 0.0, 1.0);
    float t = pow(1.0 - d, 0.85);

    // Barely-there movement, so the surface is alive without looking noisy.
    t += (noise(N * 3.4 + vec3(0.0, 0.0, uTime * 0.09)) - 0.5) * 0.022;

    vec3 col = ramp(t);

    // Lit from within, not just from outside.
    col += vec3(0.10, 0.06, 0.00) * pow(d, 2.0);

    // A warm edge, kept low — the mark has a dark rim, not a bright one.
    col += vec3(0.26, 0.11, 0.01) * pow(1.0 - max(dot(N, V), 0.0), 3.5) * 0.45;

    // Dither. A gradient this large bands visibly on 8-bit displays without it.
    col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const FLOAT_PERIOD = 9; // seconds — one slow, constant breath

function Egg({
  onReady,
  onShaderError,
}: {
  onReady?: () => void;
  onShaderError?: () => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const announced = useRef(false);
  const { size, gl } = useThree();

  // A shader that fails to compile doesn't throw — it just draws nothing, and
  // the CSS egg has already faded out by then, leaving a hole. This is the one
  // hook Three gives us to notice, so we use it to put the CSS egg back.
  useEffect(() => {
    // gl is Three's renderer, an external system. Installing a debug hook on
    // it is exactly what an effect is for; it is not React state.
    // eslint-disable-next-line react-hooks/immutability
    gl.debug.onShaderError = (context, program, vs, fs) => {
      console.error(
        "BreadEgg: the egg shader failed to compile — falling back to the CSS egg.",
        {
          vertex: context.getShaderInfoLog(vs),
          fragment: context.getShaderInfoLog(fs),
          program: context.getProgramInfoLog(program),
        },
      );
      onShaderError?.();
    };
    return () => {
      gl.debug.onShaderError = null;
    };
  }, [gl, onShaderError]);

  // Created once. Every per-frame value is written through the refs below,
  // which is how a Three.js render loop is meant to work — no re-renders.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!mesh.current || !material.current) return;

    // Pointer in -1..1, eased so it trails the cursor instead of snapping.
    pointer.current.lerp(state.pointer, Math.min(1, delta * 2.2));

    const phase = (state.clock.elapsedTime * Math.PI * 2) / FLOAT_PERIOD;
    // 0 at the bottom of the breath, 1 at the top — the same point in the cycle
    // the CSS keyframes start on, so the two eggs are in step wherever the
    // cross-fade happens to land.
    const swell = (1 - Math.cos(phase)) / 2;

    material.current.uniforms.uTime.value = state.clock.elapsedTime;
    material.current.uniforms.uPointer.value.copy(pointer.current);

    // Floating: mostly a slow rise and fall, with the faintest swell.
    mesh.current.position.y = (swell * 2 - 1) * 0.072;
    mesh.current.scale.setScalar(1 + swell * 0.008);
    mesh.current.rotation.y = pointer.current.x * 0.16;
    mesh.current.rotation.x = -pointer.current.y * 0.12;

    if (!announced.current) {
      announced.current = true;
      onReady?.();
    }
  });

  // Enough segments that the silhouette stays perfectly round at hero scale.
  const segments = size.width < 640 ? 96 : 160;

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[SPHERE_RADIUS, segments, segments]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function EggCanvas({
  onReady,
  onShaderError,
  className = "",
}: {
  onReady?: () => void;
  onShaderError?: () => void;
  className?: string;
}) {
  return (
    <Canvas
      className={className}
      // Retina is wasted on a smooth gradient; 1.75 is indistinguishable here.
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      // Framed so the sphere sits just inside the canvas with room to float.
      // EggStage oversizes the canvas to compensate — see ./frame.
      camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
      style={{ pointerEvents: "none" }}
    >
      <Egg onReady={onReady} onShaderError={onShaderError} />
    </Canvas>
  );
}
