'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { MenuItem, Restaurant, api } from '@/lib/supabase';
import { DishModal } from '@/components/ui/Modal';
import {
  UtensilsCrossed,
  QrCode,
  Plus,
  Edit3,
  Trash2,
  Box,
  ExternalLink,
  Sparkles,
  Printer,
  Menu as MenuIcon,
  X,
  Search,
} from 'lucide-react';

export default function RestaurantAdminPage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'qrcode'>('menu');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const rest = await api.getRestaurant('dinevista-lounge');
      setRestaurant(rest);
      const items = await api.getMenuItems(rest.id);
      setMenuItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNew = () => {
    setEditingDish(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dish: MenuItem) => {
    setEditingDish(dish);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this dish from the menu?')) {
      await api.deleteMenuItem(id, restaurant?.id);
      await loadData();
    }
  };

  const handleSaveDish = async (dishData: Omit<MenuItem, 'id' | 'created_at'> & { id?: string }) => {
    if (dishData.id) {
      await api.updateMenuItem(dishData as MenuItem);
    } else {
      await api.addMenuItem(dishData);
    }
    await loadData();
  };

  const filteredDishes = menuItems.filter((dish) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return dish.name.toLowerCase().includes(q) || dish.description.toLowerCase().includes(q);
  });

  const menuUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/menu/${restaurant?.slug || 'dinevista-lounge'}`
    : `https://dinevista.app/menu/${restaurant?.slug || 'dinevista-lounge'}`;

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row selection:bg-purple-500 selection:text-white">
      {/* 1. Mobile Top Header Bar with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white shadow-darker border-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-soft">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-heading font-black text-base text-white">
            Dine<span className="text-purple-300">Vista</span> AR
          </span>
        </div>

        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-xl bg-white/10 text-white border-none"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* 2. Left Sidebar Navigation (Unified Preview Menu Purple/Cream Aesthetic) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-gradient-to-b from-purple-950 via-slate-900 to-purple-950 text-white p-5 flex flex-col justify-between shadow-darker z-40 transition-transform duration-300 ease-in-out border-none ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-7">
          {/* Logo */}
          <div className="flex items-center gap-3 px-1 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-heading font-black text-lg text-white block leading-tight">
                Dine<span className="text-purple-300">Vista</span>
              </span>
              <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest block">
                Restaurant Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveTab('menu');
                setMobileNavOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-heading font-extrabold transition-all duration-300 ease-in-out border-none text-left ${
                activeTab === 'menu'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-glow'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Menu Items & 3D Models</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('qrcode');
                setMobileNavOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-heading font-extrabold transition-all duration-300 ease-in-out border-none text-left ${
                activeTab === 'qrcode'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-glow'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Table QR & AR Marker</span>
            </button>
          </nav>
        </div>

        {/* Bottom Menu Link Card (10px padding, darker shadow) */}
        <div className="p-[10px] rounded-2xl bg-white/10 backdrop-blur-md shadow-darker flex flex-col gap-2 border-none">
          <span className="text-[11px] font-bold text-purple-200 px-1">Customer Live Menu</span>
          <Link
            href={`/menu/${restaurant?.slug || 'dinevista-lounge'}`}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 text-white rounded-xl text-xs font-heading font-bold shadow-soft transition-all duration-300 ease-in-out hover:scale-102 border-none"
          >
            <span>Preview Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* 3. Main Dashboard Content (Same Cream & Purple Theme as Preview Menu) */}
      <main className="flex-1 p-5 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full">
        {/* Top Header Hero Banner */}
        <div className="p-6 md:p-8 rounded-custom-mobile md:rounded-custom-tablet bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-darker flex flex-col md:flex-row md:items-center justify-between gap-4 border-none">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-[11px] font-bold mb-2 shadow-soft">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>DineVista Restaurant Console</span>
            </div>
            <h1 className="font-heading font-black text-2xl md:text-3xl text-white">
              {activeTab === 'menu' ? 'Menu Management' : 'Table QR Code Studio'}
            </h1>
            <p className="text-xs md:text-sm text-purple-200 font-body mt-1">
              {activeTab === 'menu'
                ? 'Manage gourmet dishes, attach 3D .GLB models, and configure WebAR experiences'
                : 'Download printable table QR codes and MindAR marker standees for patrons'}
            </p>
          </div>

          {activeTab === 'menu' && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-heading font-extrabold text-xs rounded-2xl shadow-glow transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 border-none self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish (.GLB Ready)</span>
            </button>
          )}
        </div>

        {/* TAB 1: MENU ITEMS CRUD */}
        {activeTab === 'menu' && (
          <div className="flex flex-col gap-5">
            {/* Search Input Bar (10px padding, darker shadow, cream theme) */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish title, description..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 shadow-darker focus:outline-none focus:ring-2 focus:ring-purple-500 border-none"
              />
            </div>

            {/* Menu Items Grid (Strict 10px Padding, Darker Shadows, Matching Cream Theme) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="p-[10px] rounded-custom-mobile bg-white dark:bg-slate-900 shadow-darker flex flex-col justify-between gap-3 border-none transition-all duration-300 ease-in-out hover:shadow-soft-xl hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-3 p-1">
                    <div className="relative w-[84px] h-[84px] rounded-2xl overflow-hidden shadow-darker shrink-0 border-none bg-slate-100">
                      <Image
                        src={dish.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'}
                        alt={dish.name}
                        fill
                        unoptimized
                        sizes="84px"
                        className="object-cover rounded-2xl"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-black text-sm md:text-base text-purple-700 dark:text-amber-400">
                          ${dish.price.toFixed(2)}
                        </span>
                        {dish.glb_model_url && (
                          <span className="p-1 rounded-lg bg-purple-600 text-white shadow-soft" title="3D WebAR Model Linked">
                            <Box className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-bold text-xs md:text-sm text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                        {dish.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 font-body leading-tight">
                        {dish.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 px-1 border-none">
                    <Link
                      href={`/ar-view?modelUrl=${encodeURIComponent(dish.glb_model_url)}&restaurantId=${encodeURIComponent(restaurant?.id || 'rest-dinevista-001')}&dishName=${encodeURIComponent(dish.name)}`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white text-[11px] font-bold transition-all border-none"
                    >
                      <Box className="w-3 h-3" />
                      <span>Test WebAR</span>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(dish)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border-none"
                        title="Edit Dish"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dish.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-all border-none"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: QR CODE STUDIO (Exact Equal Container Heights & 10px Padding) */}
        {activeTab === 'qrcode' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left Container: Standee Configuration (10px padding, equal height) */}
            <div className="p-[10px] rounded-custom-mobile md:rounded-custom-tablet bg-white dark:bg-slate-900 shadow-darker flex flex-col justify-between border-none h-full">
              <div className="flex flex-col gap-4 p-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-glow">
                  <QrCode className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="font-heading font-black text-lg md:text-xl text-slate-900 dark:text-white">
                    Restaurant Table QR Marker
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-body leading-relaxed mt-1">
                    Place this high-contrast QR code on each dining table. Patrons simply scan it with any smartphone camera to open the 3D menu and project dishes in WebAR with MindAR.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 shadow-soft flex flex-col gap-1 border-none mt-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    Direct Customer URL
                  </span>
                  <span className="text-xs font-mono text-purple-700 dark:text-purple-300 break-all font-semibold">
                    {menuUrl}
                  </span>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => window.print()}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-heading font-extrabold text-xs rounded-2xl shadow-glow transition-all duration-300 ease-in-out hover:scale-102 border-none flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Table Standee</span>
                </button>
              </div>
            </div>

            {/* Right Container: Printable Standee Preview (10px padding, exact equal height) */}
            <div className="p-[10px] rounded-custom-mobile md:rounded-custom-tablet bg-gradient-to-b from-purple-950 via-indigo-950 to-slate-900 shadow-darker flex flex-col justify-between items-center text-center border-none h-full text-white">
              <div className="flex flex-col items-center gap-4 p-4 w-full">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="font-heading font-black text-sm md:text-base text-white tracking-wide">
                    {restaurant?.name || 'DineVista Lounge'}
                  </span>
                </div>

                {/* QR Code Container with 10px padding and darker shadow */}
                <div className="p-[10px] bg-white rounded-3xl shadow-darker my-auto">
                  <QRCodeSVG
                    value={menuUrl}
                    size={210}
                    level="H"
                    fgColor="#0f172a"
                  />
                </div>

                <div>
                  <h3 className="font-heading font-black text-base md:text-lg text-white">
                    Scan to View 3D Menu
                  </h3>
                  <p className="text-[11px] text-purple-200 font-body mt-1 max-w-xs">
                    Point your camera to project gourmet dishes in real scale onto your table
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Dish Modal */}
        <DishModal
          dish={editingDish}
          restaurantId={restaurant?.id}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDish}
        />
      </main>
    </div>
  );
}
