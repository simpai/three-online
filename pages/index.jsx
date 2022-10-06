import React, {
  Suspense,
  useState,
  useRef,
  forwardRef,
  useLayoutEffect,
  useEffect,
  useReducer,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Page, Annotation } from "~/src/styles";

import {
  OrbitControls,
  Environment,
  useGLTF,
  Float,
  PivotControls,
  QuadraticBezierLine,
  Backdrop,
  Html,
  useFBO,
  Sparkles,
  CameraShake,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";

function Scene(props) {
  const { scene, nodes } = useGLTF(props.gltf);

  useEffect(() => {
    const slots = [];
    Object.values(nodes).forEach((node) => {
      if (node.name.includes("slot")) {
        slots.push(node.position);
      }
    });

    props.onLoaded(slots);
  }, []);

  return <primitive object={scene} {...props} />;
}

function Model(props) {
  const { scene } = useGLTF(props.gltf);
  return <primitive object={scene} {...props} />;
}

function FloatingModel(props) {
  const { scene } = useGLTF(props.gltf);

  return (
    <Float
      position={[0, 0, 0]}
      speed={2}
      rotationIntensity={1}
      floatIntensity={2}
    >
      <primitive object={scene} {...props} />
    </Float>
  );
}

const ModelWithRef = forwardRef(function Input(props, ref) {
  const { scene } = useGLTF(props.gltf);
  return <primitive object={scene} {...props} ref={ref} />;
  // const { nodes, materials } = useGLTF(props.gltf);

  // useLayoutEffect(() => {
  //   Object.values(materials).forEach((material) => {
  //     // material.roughness = 0;
  //   });
  // }, []);

  // return (
  //   <mesh
  //     castShadow
  //     receiveShadow
  //     ref={ref}
  //     {...props}
  //     geometry={nodes.Astronaut_mesh.geometry}
  //     material={materials.Astronaut_mat}
  //     // material-envMapIntensity={0}
  //     dispose={null}
  //   ></mesh>
  // );
});

function Watch(props) {
  const ref = useRef();
  const { scene, nodes, materials } = useGLTF("/watch.glb");

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = -Math.PI / 1.75 + Math.cos(t / 4) / 8;
    ref.current.rotation.y = Math.sin(t / 4) / 8;
    ref.current.rotation.z = (1 + Math.sin(t / 1.5)) / 20;
    ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10;
  });
  return (
    <group ref={ref} {...props} dispose={null}>
      <mesh
        geometry={nodes.Object005_glass_0.geometry}
        material={materials.glass}
      >
        <Html
          scale={100}
          rotation={[Math.PI / 2, 0, 0]}
          position={[180, -350, 50]}
          transform
          occlude
        >
          <Annotation>
            Hello <span style={{ fontSize: "1.5em" }}>🥲</span>
          </Annotation>
        </Html>
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object006_watch_0.geometry}
        material={materials.watch}
      />
    </group>
  );
}

function Cable({
  start,
  end,
  v1 = new THREE.Vector3(),
  v2 = new THREE.Vector3(),
}) {
  const ref = useRef();

  useFrame(
    () =>
      ref.current.setPoints(
        start.current.getWorldPosition(v1),
        end.current.getWorldPosition(v2)
      ),
    []
  );
  return <QuadraticBezierLine ref={ref} lineWidth={3} color="#ff2060" />;
}

export default function Box() {
  const modelRef1 = useRef();
  const modelRef2 = useRef();

  const [slots, setSlots] = useState([]);

  const handleLoaded = (slots) => {
    console.log(slots);
    setSlots(slots);
  };

  const models = [
    { url: "/Astronaut-transformed.glb", scale: 0.3, floating: true },
    { url: "/FlightHelmet/glTF/FlightHelmet.gltf", scale: 2, floating: false },
  ];

  return (
    <div>
      Start 3D
      <Canvas style={{ height: "500px" }}>
        <Scene gltf={"/scene.glb"} onLoaded={handleLoaded}></Scene>
        <group position={[0, 0, 0]}>
          {slots.length === 0 ? (
            <></>
          ) : (
            models.map((model, index) => {
              if (model.floating)
                return (
                  <FloatingModel
                    key={index}
                    position={slots[index]}
                    scale={model.scale}
                    gltf={model.url}
                  ></FloatingModel>
                );
              else
                return (
                  <Model
                    key={index}
                    position={slots[index]}
                    scale={model.scale}
                    gltf={model.url}
                  ></Model>
                );
            })
          )}

          {/* <ModelWithRef
            castShadow
            scale={0.3}
            position={[5, 1, 0]}
            gltf={"/Astronaut-transformed.glb"}
          >
            <Sparkles count={12} speed={0.1} size={4} scale={2} />
            <object3D position={[0, 2, 0]} ref={modelRef1}></object3D>
          </ModelWithRef> */}
          {/* <ModelWithRef
            receiveShadow
            scale={2}
            gltf={
              "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/low-poly-farm/model.gltf"
            }
            ref={modelRef2}
          ></ModelWithRef> */}
          {/* <Cable start={modelRef1} end={modelRef2} /> */}
          {/* <ContactShadows scale={10} blur={3} opacity={0.25} far={10} /> */}
        </group>
        <OrbitControls />
        <Suspense fallback={null}>
          <Environment
            background
            resolution={1024}
            // encoding={THREE.LinearEncoding}
            // scene={true}
            // files="/royal_esplanade_2k.hdr"
            files="/env/je_gray_02_1k.hdr"
          ></Environment>
        </Suspense>
      </Canvas>
      End 3D
    </div>
  );
}
