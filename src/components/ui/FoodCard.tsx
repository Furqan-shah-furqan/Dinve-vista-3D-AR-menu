'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MenuItem } from '@/lib/supabase';
import { Box } from 'lucide-react';

interface FoodCardProps {
  dish: MenuItem;
  restaurantId?: string;
  index?: number;
}

export function FoodCard({ dish, restaurantId = 'rest-dinevista-001', index = 0 }: FoodCardProps) {
  const [imgSrc, setImgSrc] = useState(dish.image_url);

  const bgGradients = [
    'bg-gradient-to-br from-purple-50/95 via-white to-pink-50/95 dark:from-purple-950/50 dark:via-slate-900 dark:to-slate-900',
    'bg-gradient-to-br from-amber-50/95 via-white to-orange-50/95 dark:from-amber-950/50 dark:via-slate-900 dark:to-slate-900',
    'bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/95 dark:from-emerald-950/50 dark:via-slate-900 dark:to-slate-900',
    'bg-gradient-to-br from-rose-50/95 via-white to-purple-50/95 dark:from-rose-950/50 dark:via-slate-900 dark:to-slate-900',
  ];
  const gradientClass = bgGradients[index % bgGradients.length];

  const arUrl = `/ar-view?modelUrl=${encodeURIComponent(dish.glb_model_url)}&restaurantId=${encodeURIComponent(restaurantId)}&dishName=${encodeURIComponent(dish.name)}`;

  return (
    <div
      className={`group relative pt-[210px] sm:pt-[220px] md:pt-[235px] p-[10px] rounded-custom-mobile md:rounded-custom-tablet lg:rounded-custom-desktop ${gradientClass} shadow-darker hover:shadow-soft-xl transition-all duration-300 ease-out lg:hover:scale-[1.02] flex flex-col justify-between select-none border-none`}
    >
      {/* 1. Pop-Out Food Image (Height Decreased by 30px, 55px Radius, Straight by Default, Tilt on Hover, Soft Ambient Shadow) */}
      <div className="absolute -top-10 sm:-top-12 md:-top-14 left-1/2 -translate-x-1/2 w-[240px] h-[240px] sm:w-[260px] sm:h-[255px] md:w-[280px] md:h-[270px] z-10 pointer-events-none">
        <div className="relative w-full h-full rotate-0 group-hover:-rotate-3 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-400 ease-out">
          {/* Lighter Ambient Depth Shadow */}
          <div className="absolute inset-2 rounded-[55px] bg-slate-950/15 dark:bg-purple-950/40 blur-lg group-hover:blur-xl transition-all duration-400" />

          {/* 55px Border Radius Image Container */}
          <div className="relative w-full h-full rounded-[55px] overflow-hidden shadow-darker border-none bg-slate-100">
            <Image
              src={imgSrc}
              alt={dish.name}
              fill
              unoptimized
              sizes="(max-width: 768px) 240px, 280px"
              priority={index < 3}
              onError={() => {
                setImgSrc('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80');
              }}
              className="object-cover rounded-[55px] select-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Card Content (Snug 10px Padding, Balanced Spacing) */}
      <div className="flex flex-col gap-3.5 z-20 px-3 pb-1">
        {/* Name & Price */}
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="font-heading font-black text-lg md:text-xl text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
            {dish.name}
          </h3>
          <span className="font-heading font-black text-xl md:text-2xl text-slate-900 dark:text-amber-300 shrink-0">
            ${dish.price.toFixed(2)}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-body -mt-1">
          {dish.description}
        </p>

        {/* Action Button: "Place on Table" (Directly at the bottom) */}
        <div className="pt-0.5">
          <Link
            href={arUrl}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-heading font-extrabold text-xs tracking-wide rounded-custom-mobile shadow-darker hover:shadow-glow flex items-center justify-center gap-2 transition-all duration-300 ease-in-out border-none active:scale-95"
          >
            <Box className="w-4 h-4 text-purple-200 animate-pulse" />
            <span>Place on Table</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
