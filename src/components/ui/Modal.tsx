'use client';

import React, { useState } from 'react';
import { MenuItem } from '@/lib/supabase';
import { DropZone } from '@/components/ui/DropZone';
import { X, Sparkles, Save, Loader2 } from 'lucide-react';

interface DishModalProps {
  dish?: MenuItem | null;
  restaurantId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dish: Omit<MenuItem, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
}

export function DishModal({
  dish,
  restaurantId = 'rest-dinevista-001',
  isOpen,
  onClose,
  onSave,
}: DishModalProps) {
  const [name, setName] = useState(dish?.name || '');
  const [description, setDescription] = useState(dish?.description || '');
  const [price, setPrice] = useState(dish?.price?.toString() || '14.99');
  const [imageUrl, setImageUrl] = useState(
    dish?.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80'
  );
  const [glbModelUrl, setGlbModelUrl] = useState(
    dish?.glb_model_url || 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb'
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setIsSaving(true);
    try {
      await onSave({
        id: dish?.id,
        restaurant_id: restaurantId,
        name,
        description,
        price: parseFloat(price) || 9.99,
        image_url: imageUrl,
        glb_model_url: glbModelUrl,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-sm">
      {/* Direct Seamless Dialog (No Separate Header/Footer Blocks, No Scrollbar, 10px Padding, Matching Theme) */}
      <div className="relative w-full max-w-xl bg-[#faf7f2] dark:bg-slate-900 rounded-custom-mobile md:rounded-custom-tablet shadow-darker overflow-hidden border-none p-[10px] flex flex-col">
        {/* Compact Inline Header with Close Icon */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 rounded-2xl text-white shadow-soft">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <h2 className="font-heading font-black text-sm md:text-base text-white tracking-wide">
              {dish ? 'Edit Dish & 3D WebAR Model' : 'Add New Gourmet Dish'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200 border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Form Body (Entirely Visible On Screen - Zero Scrollbar) */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3">
          {/* Row 1: Title & Price */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-8">
              <label className="text-[11px] font-heading font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Dish Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Double Truffle Smash Burger"
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-darker border-none"
              />
            </div>

            <div className="col-span-4">
              <label className="text-[11px] font-heading font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="14.99"
                className="w-full px-3.5 py-2 text-xs font-black text-amber-600 dark:text-amber-400 rounded-2xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-darker border-none"
              />
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="text-[11px] font-heading font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Description & Ingredients
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Gourmet description for customers..."
              className="w-full px-3.5 py-2 text-xs font-body rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-darker border-none leading-tight"
            />
          </div>

          {/* Row 3: Two Side-by-Side Dedicated Drag-and-Drop Zones */}
          <div className="grid grid-cols-2 gap-2.5 p-[10px] rounded-2xl bg-purple-100/50 dark:bg-slate-800/60 shadow-darker border-none">
            <DropZone
              label="1. Food Image"
              accept="image/*"
              type="image"
              currentValue={imageUrl}
              onUploaded={(url) => setImageUrl(url)}
              helperText="High-res photo"
            />
            <DropZone
              label="2. 3D Model (.glb)"
              accept=".glb,.gltf"
              type="model"
              currentValue={glbModelUrl}
              onUploaded={(url) => setGlbModelUrl(url)}
              helperText="MindAR .glb asset"
            />
          </div>

          {/* Row 4: Action Buttons directly inside form */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-all duration-200 border-none"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-heading font-extrabold text-xs shadow-glow transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 border-none"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{dish ? 'Save Changes' : 'Publish Dish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
