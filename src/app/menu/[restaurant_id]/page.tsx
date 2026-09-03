'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MenuItem, Restaurant, DEFAULT_RESTAURANT, INITIAL_MENU_ITEMS, api } from '@/lib/supabase';
import { FoodCard } from '@/components/ui/FoodCard';
import { Sparkles, UtensilsCrossed, Box } from 'lucide-react';

export default function CustomerMenuPage() {
  const params = useParams();
  const restaurantIdentifier = (params?.restaurant_id as string) || 'dinevista-lounge';

  const [restaurant, setRestaurant] = useState<Restaurant>(DEFAULT_RESTAURANT);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);

  useEffect(() => {
    async function loadData() {
      try {
        const rest = await api.getRestaurant(restaurantIdentifier);
        if (rest) setRestaurant(rest);
        const items = await api.getMenuItems(rest.id);
        if (items && items.length > 0) setMenuItems(items);
      } catch (err) {
        console.error('Failed to load menu:', err);
      }
    }
    loadData();
  }, [restaurantIdentifier]);

  return (
    <main className="min-h-screen bg-cream-100 dark:bg-slate-950 pb-20 selection:bg-purple-500 selection:text-white">
      {/* 1. Organic Hero Section with Strict Custom Border Radii & Zero Borders */}
      <section className="relative bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white pt-12 pb-20 px-6 md:px-12 rounded-b-custom-mobile md:rounded-b-custom-tablet lg:rounded-b-custom-desktop shadow-soft-xl overflow-hidden border-none">
        {/* Soft Background Ambient Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-600/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md shadow-soft self-start border-none">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300">
                Interactive WebAR Dining
              </span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
              {restaurant?.name || 'DineVista Lounge & Bistro'}
            </h1>

            <p className="text-sm md:text-base text-slate-300 max-w-xl font-body leading-relaxed">
              Explore our chef-curated selection. Tap <span className="text-amber-300 font-bold">&quot;Place on Table&quot;</span> on any dish to project its real-scale 3D model right onto your dining table.
            </p>
          </div>

          {/* Quick Admin Switch / Table Marker Info Card */}
          <div className="flex flex-col gap-3 self-start md:self-auto">
            <div className="p-4 rounded-custom-mobile bg-white/10 backdrop-blur-xl shadow-soft flex items-center gap-3 border-none">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-heading font-black text-white block">
                  MindAR Ready
                </span>
                <span className="text-[11px] text-purple-200 block">
                  Pinch to zoom & rotate in 3D
                </span>
              </div>
            </div>

            <Link
              href="/admin"
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-heading font-bold text-xs rounded-custom-mobile shadow-soft text-center transition-all duration-300 ease-in-out hover:scale-105 border-none"
            >
              Restaurant Admin Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Menu Items Grid Section */}
      <section className="max-w-6xl mx-auto px-6 md:px-8 mt-12">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="font-heading font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
              Gourmet Menu
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-body">
              Select any dish to view ingredients and project in WebAR
            </p>
          </div>

          <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/60 px-4 py-1.5 rounded-full shadow-soft border-none">
            {menuItems.length} Dishes
          </span>
        </div>

        {menuItems.length === 0 ? (
          <div className="p-16 rounded-custom-mobile md:rounded-custom-tablet bg-white dark:bg-slate-900 shadow-soft text-center flex flex-col items-center gap-3 border-none">
            <UtensilsCrossed className="w-12 h-12 text-purple-400" />
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              No Dishes Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              The restaurant has not published any dishes to this menu yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24 pt-8">
            {menuItems.map((dish, index) => (
              <FoodCard
                key={dish.id}
                dish={dish}
                restaurantId={restaurant?.id}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
