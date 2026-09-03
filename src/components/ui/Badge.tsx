import React from 'react';
import { cn } from '@/lib/utils';
import { Flame, Sparkles, Heart, Leaf, Wheat, Award } from 'lucide-react';
import { DietaryTag } from '@/types';

interface BadgeProps {
  tag: DietaryTag | string;
  variant?: 'solid' | 'soft' | 'outline';
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({ tag, className = '', size = 'sm' }: BadgeProps) {
  const getIcon = () => {
    switch (tag) {
      case 'Spicy':
        return <Flame className="w-3 h-3 text-red-500 mr-1" />;
      case 'Chef Special':
        return <Award className="w-3 h-3 text-amber-500 mr-1" />;
      case 'Popular':
        return <Sparkles className="w-3 h-3 text-purple-500 mr-1" />;
      case 'Vegan':
      case 'Vegetarian':
        return <Leaf className="w-3 h-3 text-emerald-500 mr-1" />;
      case 'Gluten-Free':
        return <Wheat className="w-3 h-3 text-amber-600 mr-1" />;
      default:
        return null;
    }
  };

  const getTagColor = () => {
    switch (tag) {
      case 'Spicy':
        return 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400';
      case 'Chef Special':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';
      case 'Popular':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300';
      case 'Vegan':
      case 'Vegetarian':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
      case 'Gluten-Free':
        return 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const sizeStyles = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium shadow-soft border-none transition-transform',
        sizeStyles,
        getTagColor(),
        className
      )}
    >
      {getIcon()}
      {tag}
    </span>
  );
}
