'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Smartphone, LayoutDashboard, Box, ArrowRight, Zap, QrCode } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-cream-100 dark:bg-slate-950 selection:bg-purple-500 selection:text-white">
      {/* 1. Hero Section */}
      <div className="relative bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 text-white pt-16 pb-24 px-6 md:px-12 rounded-b-custom-mobile md:rounded-b-custom-tablet lg:rounded-b-custom-desktop shadow-soft-xl overflow-hidden border-none">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-purple-300 text-xs font-extrabold uppercase tracking-wider mb-6 shadow-soft border-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Next.js 14 • MindAR • A-Frame • Supabase</span>
          </div>

          {/* Heading */}
          <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none mb-6">
            Dine<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">Vista AR</span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl font-body leading-relaxed mb-10">
            Interactive 3D WebAR restaurant menu application. Patrons browse dishes, view true-scale 3D models directly on their table, and restaurants manage dishes with dual photo & .GLB upload zones.
          </p>

          {/* Portal Action Cards with Strict Custom Border Radii & Zero Borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            {/* Customer Menu Portal */}
            <Link
              href="/menu/dinevista-lounge"
              className="group relative p-7 rounded-custom-mobile md:rounded-custom-tablet lg:rounded-custom-desktop bg-gradient-to-br from-purple-900/90 to-slate-900/90 shadow-soft-xl hover:shadow-glow transition-all duration-300 ease-in-out lg:hover:scale-105 text-left flex flex-col justify-between border-none"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 shadow-soft">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-[11px] font-extrabold">
                  Customer Flow
                </span>
              </div>
              <div>
                <h3 className="font-heading font-black text-xl md:text-2xl text-white group-hover:text-purple-300 transition-colors">
                  Customer 3D Menu
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-body leading-relaxed">
                  Browse 3D pop-out dishes, view nutrition, and tap &quot;Place on Table&quot; to launch WebAR.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-heading font-extrabold text-amber-300 group-hover:translate-x-1 transition-transform">
                <span>Explore Customer Menu</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Restaurant Admin Portal */}
            <Link
              href="/admin"
              className="group relative p-7 rounded-custom-mobile md:rounded-custom-tablet lg:rounded-custom-desktop bg-gradient-to-br from-slate-900/90 via-indigo-950/80 to-slate-900/90 shadow-soft-xl hover:shadow-glow transition-all duration-300 ease-in-out lg:hover:scale-105 text-left flex flex-col justify-between border-none"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-300 shadow-soft">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-extrabold">
                  Restaurant Staff
                </span>
              </div>
              <div>
                <h3 className="font-heading font-black text-xl md:text-2xl text-white group-hover:text-amber-300 transition-colors">
                  Restaurant Dashboard
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-body leading-relaxed">
                  Manage dishes, upload food images and .GLB models to Supabase, and generate table QR codes.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-heading font-extrabold text-purple-300 group-hover:translate-x-1 transition-transform">
                <span>Enter Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Direct AR Launcher Button */}
          <div className="mt-8">
            <Link
              href="/ar-view?modelUrl=https%3A%2F%2Fraw.githubusercontent.com%2FKhronosGroup%2FglTF-Sample-Models%2Fmaster%2F2.0%2FBoomBox%2FglTF-Binary%2FBoomBox.glb&restaurantId=dinevista-lounge&dishName=Double%20Truffle%20Smash%20Burger"
              className="flex items-center gap-2 px-8 py-4 rounded-custom-mobile bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-heading font-extrabold text-xs shadow-glow transition-all duration-300 ease-in-out lg:hover:scale-105 active:scale-95 border-none"
            >
              <Box className="w-4 h-4 animate-bounce" />
              <span>Direct WebAR Camera Preview</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Feature Highlights Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h2 className="font-heading font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
            Engineered for Immersive Dining
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-body">
            Strict Zero-Border Soft Depth Aesthetics • MindAR Image Tracking • 2-Finger Pinch Zoom
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-custom-mobile md:rounded-custom-tablet bg-white dark:bg-slate-900 shadow-soft flex flex-col gap-3 border-none">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shadow-soft">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Two-Finger Pinch Zoom
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-body leading-relaxed">
              Custom A-Frame gesture handler calculates Euclidean distance between touches to smoothly scale 3D models up and down.
            </p>
          </div>

          <div className="p-8 rounded-custom-mobile md:rounded-custom-tablet bg-white dark:bg-slate-900 shadow-soft flex flex-col gap-3 border-none">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shadow-soft">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              MindAR Table Tracking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-body leading-relaxed">
              High-contrast table QR standees serve as optical tracking targets for accurate physical table projection.
            </p>
          </div>

          <div className="p-8 rounded-custom-mobile md:rounded-custom-tablet bg-white dark:bg-slate-900 shadow-soft flex flex-col gap-3 border-none">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shadow-soft">
              <Box className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Dual Drag-and-Drop Media
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-body leading-relaxed">
              Upload dishes with food photos and .GLB 3D assets directly to Supabase Storage with instant HTTPS public URLs.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Footer */}
      <footer className="p-6 text-center text-xs text-slate-400 border-none font-body">
        <p>DineVista AR • 3D/WebAR Restaurant Menu Platform</p>
      </footer>
    </main>
  );
}
