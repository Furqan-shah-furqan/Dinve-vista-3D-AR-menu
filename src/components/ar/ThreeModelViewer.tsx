'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Loader2, RotateCw, ZoomIn, Eye } from 'lucide-react';

interface ThreeModelViewerProps {
  modelUrl?: string;
  dishName?: string;
  className?: string;
  autoRotate?: boolean;
  scale?: number;
}

export function ThreeModelViewer({
  modelUrl,
  dishName = 'Gourmet Dish',
  className = '',
  autoRotate = true,
  scale = 1.0,
}: ThreeModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isInteracting = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 2.5);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.PointLight(0xa78bfa, 1.2, 10);
    fillLight.position.set(-4, 2, -2);
    scene.add(fillLight);

    // Subtle soft shadow floor
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.6;
    floor.receiveShadow = true;
    scene.add(floor);

    // 4. Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Procedural Stylized Food Creation (Ultra-fast and dependable)
    const createStylizedFoodMesh = (name: string) => {
      const g = new THREE.Group();

      if (name.toLowerCase().includes('shake') || name.toLowerCase().includes('beverage')) {
        // Cup Body
        const cupGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.9, 32);
        const cupMat = new THREE.MeshPhysicalMaterial({
          color: 0xff6b81,
          roughness: 0.1,
          transmission: 0.8,
          thickness: 0.5,
        });
        const cup = new THREE.Mesh(cupGeo, cupMat);
        cup.castShadow = true;
        g.add(cup);

        // Whipped Cream Cloud
        for (let i = 0; i < 6; i++) {
          const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
          const creamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
          const cream = new THREE.Mesh(sphereGeo, creamMat);
          const angle = (i / 6) * Math.PI * 2;
          cream.position.set(Math.cos(angle) * 0.18, 0.48, Math.sin(angle) * 0.18);
          g.add(cream);
        }

        // Strawberry Topping
        const strawGeo = new THREE.ConeGeometry(0.14, 0.22, 16);
        const strawMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4 });
        const straw = new THREE.Mesh(strawGeo, strawMat);
        straw.position.set(0, 0.72, 0);
        g.add(straw);

      } else if (name.toLowerCase().includes('ramen') || name.toLowerCase().includes('noodle') || name.toLowerCase().includes('rice') || name.toLowerCase().includes('soup')) {
        // Ceramic Bowl
        const bowlGeo = new THREE.SphereGeometry(0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const bowlMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.2 });
        const bowl = new THREE.Mesh(bowlGeo, bowlMat);
        bowl.rotation.x = Math.PI;
        bowl.position.y = 0.2;
        bowl.castShadow = true;
        g.add(bowl);

        // Rich Broth Surface
        const brothGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.05, 32);
        const brothMat = new THREE.MeshPhysicalMaterial({ color: 0xd97706, roughness: 0.1, transmission: 0.5 });
        const broth = new THREE.Mesh(brothGeo, brothMat);
        broth.position.y = 0.18;
        g.add(broth);

        // Tamago Egg
        const eggGeo = new THREE.SphereGeometry(0.14, 16, 16);
        const eggMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });
        const egg = new THREE.Mesh(eggGeo, eggMat);
        egg.position.set(0.2, 0.22, 0.1);
        g.add(egg);

        // Chashu Roll
        const chashuGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 16);
        const chashuMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 });
        const chashu = new THREE.Mesh(chashuGeo, chashuMat);
        chashu.position.set(-0.18, 0.22, -0.1);
        g.add(chashu);

      } else if (name.toLowerCase().includes('pizza')) {
        // Pizza Crust Disc
        const crustGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.06, 32);
        const crustMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
        const crust = new THREE.Mesh(crustGeo, crustMat);
        crust.castShadow = true;
        g.add(crust);

        // Melted Mozzarella & Burrata
        const cheeseGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.07, 32);
        const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.2 });
        const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
        cheese.position.y = 0.01;
        g.add(cheese);

        // Burrata Center Sphere
        const burrataGeo = new THREE.SphereGeometry(0.22, 24, 24);
        const burrataMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
        const burrata = new THREE.Mesh(burrataGeo, burrataMat);
        burrata.position.y = 0.16;
        g.add(burrata);

      } else {
        // Gourmet Burger Stack
        // Bottom Bun
        const bBunGeo = new THREE.CylinderGeometry(0.5, 0.48, 0.15, 32);
        const bunMat = new THREE.MeshStandardMaterial({ color: 0xc27803, roughness: 0.5 });
        const bBun = new THREE.Mesh(bBunGeo, bunMat);
        bBun.position.y = -0.3;
        bBun.castShadow = true;
        g.add(bBun);

        // Angus Patty
        const pattyGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.14, 32);
        const pattyMat = new THREE.MeshStandardMaterial({ color: 0x3e1f0e, roughness: 0.9 });
        const patty = new THREE.Mesh(pattyGeo, pattyMat);
        patty.position.y = -0.15;
        g.add(patty);

        // Melted Cheese Layer
        const cheeseGeo = new THREE.BoxGeometry(0.9, 0.04, 0.9);
        const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2 });
        const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
        cheese.rotation.y = Math.PI / 4;
        cheese.position.y = -0.06;
        g.add(cheese);

        // Tomato Slice
        const tomatoGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.06, 32);
        const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2 });
        const tomato = new THREE.Mesh(tomatoGeo, tomatoMat);
        tomato.position.y = 0.02;
        g.add(tomato);

        // Top Brioche Bun Dome
        const tBunGeo = new THREE.SphereGeometry(0.52, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const tBun = new THREE.Mesh(tBunGeo, bunMat);
        tBun.position.y = 0.06;
        g.add(tBun);
      }

      g.scale.set(scale, scale, scale);
      return g;
    };

    const foodMesh = createStylizedFoodMesh(dishName);
    modelGroup.add(foodMesh);
    setLoading(false);

    // 5. Pointer Interaction (Rotate & Tilt)
    const handlePointerDown = (e: PointerEvent) => {
      isInteracting.current = true;
      previousPointerPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isInteracting.current) return;
      const deltaX = e.clientX - previousPointerPosition.current.x;
      const deltaY = e.clientY - previousPointerPosition.current.y;

      modelGroup.rotation.y += deltaX * 0.012;
      modelGroup.rotation.x = Math.max(-0.4, Math.min(0.6, modelGroup.rotation.x + deltaY * 0.008));

      previousPointerPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isInteracting.current = false;
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 6. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (autoRotate && !isInteracting.current) {
        modelGroup.rotation.y += 0.012;
      }
      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [dishName, modelUrl, autoRotate, scale]);

  return (
    <div className={`relative w-full h-full min-h-[220px] flex items-center justify-center select-none ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-3xl z-10">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
          <p className="text-xs font-medium text-purple-800">Generating 3D Food Mesh...</p>
        </div>
      )}

      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive 3D Guide pill */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-soft border border-white/40 text-[11px] font-medium text-slate-700 dark:text-slate-200 pointer-events-none">
        <RotateCw className="w-3 h-3 text-purple-600 animate-spin-slow" />
        <span>Drag to rotate 360°</span>
      </div>
    </div>
  );
}
