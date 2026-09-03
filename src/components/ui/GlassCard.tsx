import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'gradient' | 'coral' | 'violet';
  className?: string;
  isHoverable?: boolean;
}

export function GlassCard({
  children,
  variant = 'light',
  className = '',
  isHoverable = false,
  ...props
}: GlassCardProps) {
  const baseStyles = 'rounded-3xl transition-all duration-300 backdrop-blur-xl';

  const variants = {
    light: 'bg-white/90 border border-white/60 shadow-soft text-slate-800',
    dark: 'bg-slate-900/80 border border-white/10 shadow-card-dark text-white',
    gradient: 'bg-gradient-to-br from-white/95 via-purple-50/70 to-pink-50/50 border border-white/80 shadow-soft-lg',
    coral: 'bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-amber-500/10 border border-rose-200/50 shadow-soft',
    violet: 'bg-gradient-to-br from-purple-900/90 via-slate-900/90 to-indigo-950/90 border border-purple-500/20 shadow-pop text-white',
  };

  const hoverEffect = isHoverable
    ? 'hover:-translate-y-1.5 hover:shadow-pop hover:border-purple-300/60'
    : '';

  return (
    <div
      className={cn(baseStyles, variants[variant], hoverEffect, className)}
      {...props}
    >
      {children}
    </div>
  );
}
