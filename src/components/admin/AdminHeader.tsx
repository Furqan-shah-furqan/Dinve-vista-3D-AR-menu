'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, UtensilsCrossed, ExternalLink, QrCode } from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  restaurantSlug?: string;
}

export function AdminHeader({
  title = 'DineVista Admin Dashboard',
  subtitle = 'Manage gourmet menu items, WebAR 3D models, and table QR codes',
  restaurantSlug = 'dinevista-lounge',
}: AdminHeaderProps) {
  return (
    <header className="w-full bg-slate-900 text-white p-6 rounded-custom-mobile md:rounded-custom-tablet shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4 border-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-glow">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-black text-xl md:text-2xl text-white">
            {title}
          </h1>
          <p className="text-xs text-slate-400 font-body mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/menu/${restaurantSlug}`}
          target="_blank"
          className="flex items-center gap-2 px-5 py-2.5 rounded-custom-mobile bg-purple-600 hover:bg-purple-700 text-white font-heading font-bold text-xs shadow-soft transition-all duration-300 ease-in-out hover:scale-105 border-none"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>View Live Menu</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </header>
  );
}
