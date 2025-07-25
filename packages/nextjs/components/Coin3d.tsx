"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { NextPage } from "next";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { cn } from "~~/lib/shadcn/utils";

type Coin3DProps = {
  coinName: "optimis" | "arbitrum";
  className?: string;
  appearanceRight?: boolean;
};

const Coin3d: NextPage<Coin3DProps> = ({ coinName, className, appearanceRight = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 350 / 350, 0.1, 1000);
    camera.position.z = 3;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setSize(350, 350);

    renderer.setClearColor(0x000000, 0);
    container?.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);

    //mouse control
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const loader = new GLTFLoader();
    loader.load(
      `models/${coinName}.glb`,
      function (gltf) {
        gltf.scene.scale.set(0.3, 0.3, 0.3);
        gltf.scene.rotation.set(Math.PI / 2, THREE.MathUtils.degToRad(70), 0);
        gltf.scene.position.y = -3;
        gltf.scene.position.x = appearanceRight ? -3 : 3;

        gltf.scene.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material.side = THREE.DoubleSide;
          }
        });

        scene.add(gltf.scene);

        //Timeline
        const tl = gsap.timeline();

        tl.to(gltf.scene.position, {
          y: 0,
          x: 0,
          duration: 1.2,
          ease: "power2.out",
        });

        tl.to(
          gltf.scene.rotation,
          {
            x: "+=" + Math.PI * 2 * 5, // 5 rounds
            duration: 2,
            // ease: "power4.out",
            ease: "slow(0.7, 0.7, false)",
          },
          "-=0.4",
        );
      },
      undefined,
      function (error) {
        console.error(error);
      },
    );

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    return () => {
      renderer.dispose();
      container?.removeChild(renderer.domElement);
    };
  }, [appearanceRight, coinName]);

  return <div ref={mountRef} className={cn("absolute bg-transparent top-0", className)} />;
};

export default Coin3d;
