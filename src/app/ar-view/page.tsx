'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeft, Box, Sparkles, Smartphone, Eye, RotateCcw, Loader2 } from 'lucide-react';
import { ThreeModelViewer } from '@/components/ar/ThreeModelViewer';

function ARViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modelUrl = searchParams.get('modelUrl') || 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb';
  const restaurantId = searchParams.get('restaurantId') || 'dinevista-lounge';
  const dishName = searchParams.get('dishName') || 'Gourmet Dish';

  const [aframeLoaded, setAframeLoaded] = useState(false);
  const [mindARLoaded, setMindARLoaded] = useState(false);
  const [gestureLoaded, setGestureLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(100);
  const [mode, setMode] = useState<'mindar' | 'simulator'>('simulator');
  const [isTracking, setIsTracking] = useState(false);

  // Listen to custom scale changes dispatched from gesture-handler.js
  useEffect(() => {
    const handleScaleEvent = (e: any) => {
      if (e.detail && e.detail.scale) {
        setCurrentZoom(Math.round(e.detail.scale * 100));
      }
    };
    window.addEventListener('ar-scale-change', handleScaleEvent);
    return () => window.removeEventListener('ar-scale-change', handleScaleEvent);
  }, []);

  const backUrl = `/menu/${restaurantId}`;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none text-white">
      {/* 1. Dynamic Script Loading for A-Frame 1.4.2, MindAR 1.2.2, and Custom Gesture Handler */}
      <Script
        src="https://aframe.io/releases/1.4.2/aframe.min.js"
        onLoad={() => setAframeLoaded(true)}
      />
      {aframeLoaded && (
        <Script
          src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image-aframe.prod.js"
          onLoad={() => setMindARLoaded(true)}
        />
      )}
      {mindARLoaded && (
        <Script
          src="/gesture-handler.js"
          onLoad={() => setGestureLoaded(true)}
        />
      )}

      {/* 2. Top-Left Soft Blurred "Back to Menu" Button */}
      <div className="absolute top-6 left-6 z-30 pointer-events-auto">
        <Link
          href={backUrl}
          className="flex items-center gap-2 px-5 py-3 rounded-custom-mobile bg-slate-900/70 hover:bg-slate-900/90 text-white backdrop-blur-xl shadow-soft transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 border-none group"
        >
          <ArrowLeft className="w-4 h-4 text-purple-300 group-hover:-translate-x-1 transition-transform" />
          <span className="font-heading font-extrabold text-xs tracking-wide">
            Back to Menu
          </span>
        </Link>
      </div>

      {/* 3. Top Mode Switcher (WebAR Camera vs 3D Simulator) */}
      <div className="absolute top-6 right-6 z-30 pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1.5 rounded-custom-mobile bg-slate-900/80 backdrop-blur-xl shadow-soft border-none">
          <button
            onClick={() => setMode('simulator')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-custom-mobile text-xs font-heading font-bold transition-all duration-300 ${
              mode === 'simulator'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D Simulator</span>
          </button>
          <button
            onClick={() => setMode('mindar')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-custom-mobile text-xs font-heading font-bold transition-all duration-300 ${
              mode === 'mindar'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Live Camera AR</span>
          </button>
        </div>
      </div>

      {/* VIEW A: Live MindAR Image Tracking Camera Scene */}
      {mode === 'mindar' && aframeLoaded && mindARLoaded && (
        <div className="w-full h-full">
          {/* @ts-ignore */}
          <a-scene
            mindar-image="imageTargetSrc: https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.2/examples/image-tracking/assets/card-example/card.mind; filterMinCF:0.0001; filterBeta: 0.001;"
            color-space="sRGB"
            renderer="colorManagement: true, physicallyCorrectLights"
            vr-mode-ui="enabled: false"
            device-orientation-permission-ui="enabled: false"
            gesture-handler
            embedded
            style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}
          >
            {/* @ts-ignore */}
            <a-assets>
              {/* @ts-ignore */}
              <a-asset-item id="foodGlbModel" src={modelUrl}></a-asset-item>
            {/* @ts-ignore */}
            </a-assets>

            {/* @ts-ignore */}
            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

            {/* @ts-ignore */}
            <a-entity
              mindar-image-target="targetIndex: 0"
              onTargetFound={() => setIsTracking(true)}
              onTargetLost={() => setIsTracking(false)}
            >
              {/* @ts-ignore */}
              <a-gltf-model
                id="ar-food-model"
                src="#foodGlbModel"
                position="0 0 0"
                scale="1 1 1"
                rotation="0 0 0"
              ></a-gltf-model>
            {/* @ts-ignore */}
            </a-entity>
          {/* @ts-ignore */}
          </a-scene>
        </div>
      )}

      {/* VIEW B: 3D Surface Simulator (Touch Pinch & Orbit Interactive View) */}
      {mode === 'simulator' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Table Surface Target Light */}
          <div className="absolute bottom-20 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full max-w-lg h-[65vh] flex items-center justify-center">
            <ThreeModelViewer
              dishName={dishName}
              modelUrl={modelUrl}
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* 4. Bottom HUD: Gesture Guidance & Dish Info Card */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30 pointer-events-none">
        <div className="flex flex-col items-center gap-3">
          {/* Gesture hint pill */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-xl rounded-custom-mobile shadow-soft text-xs text-purple-200 border-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pinch with 2 fingers to zoom • 1 finger to rotate 360°</span>
          </div>

          {/* Dish summary pill */}
          <div className="w-full p-4 bg-slate-900/90 backdrop-blur-2xl rounded-custom-mobile shadow-soft-xl flex items-center justify-between pointer-events-auto border-none">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-soft">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-white">
                  {dishName}
                </h3>
                <span className="text-[11px] text-purple-300 font-semibold">
                  Zoom Scale: {currentZoom}%
                </span>
              </div>
            </div>

            <Link
              href={backUrl}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-custom-mobile text-xs font-bold transition-all border-none"
            >
              Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ARViewPage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          <p className="font-heading font-bold text-sm text-purple-300">
            Initializing WebAR Experience...
          </p>
        </div>
      }
    >
      <ARViewContent />
    </Suspense>
  );
}
