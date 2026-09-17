'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ThreeModelViewerProps {
  modelUrl?: string;
  dishName?: string;
  className?: string;
  autoRotate?: boolean;
  scale?: number;
}

function disposeModel(root: THREE.Object3D) {
  root.traverse(object => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    if (!mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach(material => {
      Object.values(material).forEach(value => { if (value instanceof THREE.Texture) value.dispose(); });
      material.dispose();
    });
  });
}

export function ThreeModelViewer({ modelUrl, dishName = 'Dish', className = '', autoRotate = true, scale = 1 }: ThreeModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setError(''); setLoading(true);
    if (!modelUrl) { setError('No 3D model is attached to this dish.'); setLoading(false); return; }
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch { setError('3D rendering is unavailable in this browser.'); setLoading(false); return; }
    let disposed = false;
    let loadedModel: THREE.Object3D | undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    camera.position.set(0, 0.8, 2.4);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotate = autoRotate;
    controls.minDistance = 0.7;
    controls.maxDistance = 6;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 2));
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(3, 4, 5);
    scene.add(light);
    const timer = window.setTimeout(() => {
      if (!disposed) { setLoading(false); setError('The model is taking too long to load. Check its URL and connection.'); }
    }, 60000);
    new GLTFLoader().load(modelUrl, gltf => {
      if (disposed) { disposeModel(gltf.scene); return; }
      clearTimeout(timer);
      loadedModel = gltf.scene;
      const box = new THREE.Box3().setFromObject(loadedModel);
      const size = box.getSize(new THREE.Vector3());
      const extent = Math.max(size.x, size.y, size.z);
      if (!Number.isFinite(extent) || extent <= 0) { disposeModel(loadedModel); loadedModel = undefined; setError('The model contains no visible geometry.'); setLoading(false); return; }
      const center = box.getCenter(new THREE.Vector3());
      const fit = scale / extent;
      loadedModel.scale.multiplyScalar(fit);
      loadedModel.position.sub(center.multiplyScalar(fit));
      scene.add(loadedModel);
      setError(''); setLoading(false);
    }, undefined, () => {
      clearTimeout(timer);
      if (!disposed) { setLoading(false); setError('Could not load the GLB. Check its public URL and storage CORS settings.'); }
    });
    const resize = () => {
      const width = container.clientWidth || 300;
      const height = container.clientHeight || 300;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
    return () => {
      disposed = true;
      clearTimeout(timer);
      observer.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      if (loadedModel) disposeModel(loadedModel);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [modelUrl, autoRotate, scale]);

  return <div className={`relative w-full h-full min-h-[220px] ${className}`} aria-label={`${dishName} 3D preview`}>
    <div ref={containerRef} className="w-full h-full" />
    {(loading || error) && <p role={error ? 'alert' : 'status'} className="absolute inset-0 flex items-center justify-center p-6 text-center">{error || 'Loading 3D model…'}</p>}
    {!loading && !error && <p className="absolute bottom-3 inset-x-0 text-center text-sm pointer-events-none">Drag to rotate · Pinch or scroll to zoom</p>}
  </div>;
}
