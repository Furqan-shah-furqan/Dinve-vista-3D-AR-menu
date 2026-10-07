import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { localStore } from './local-store';

// ==============================================================================
// 1. SUPABASE DATABASE INTERFACES (Strictly Menu & Restaurant Models)
// ==============================================================================

export interface Restaurant {
  id: string; // uuid
  name: string;
  slug: string;
  owner_id?: string;
  qr_code_url?: string;
  created_at?: string;
}

export interface MenuItem {
  id: string; // uuid
  restaurant_id: string; // uuid
  name: string;
  description: string;
  price: number;
  image_url: string;
  glb_model_url: string;
  marker_id?: string | null;
  legacy_id?: string | null;
  created_at?: string;
}

// ==============================================================================
// 2. SUPABASE CLIENT INITIALIZATION
// ==============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// 3. STORAGE BUCKET NAMES
// ==============================================================================
export const STORAGE_BUCKET_IMAGES = 'menu-images';
export const STORAGE_BUCKET_MODELS = 'menu-models';
export const STORAGE_BUCKET_MARKERS = 'menu-markers';
export interface ARMarker { id: string; restaurant_id: string; name: string; image_url: string; target_url: string; }
export const DEFAULT_MARKER: ARMarker = { id: 'default', restaurant_id: 'rest-dinevista-001', name: 'Demo cloth photo', image_url: '/ar/marker.jpg', target_url: '/ar/targets.mind' };

// ==============================================================================
// 4. PRELOADED GOURMET SEED DATA (Exact Authentic High-Resolution Food Photography)
// ==============================================================================

export const DEFAULT_RESTAURANT: Restaurant = {
  id: 'rest-dinevista-001',
  name: 'DineVista Lounge & Bistro',
  slug: 'dinevista-lounge',
  qr_code_url: 'https://dinevista.app/menu/dinevista-lounge',
  created_at: new Date().toISOString(),
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dish-burger-01',
    restaurant_id: 'rest-dinevista-001',
    name: 'Double Truffle Smash Burger',
    description: 'Dry-aged Angus beef patties, molten Gruyère cheese, caramelized balsamic shallots, and black truffle garlic aioli on a toasted brioche bun.',
    price: 14.99,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    glb_model_url: '/models/demo/burger.glb',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'dish-shake-02',
    restaurant_id: 'rest-dinevista-001',
    name: 'Strawberry Bliss Cloud Shake',
    description: 'Decadent strawberry gelato spun with Madagascar vanilla milk, topped with cloud-whipped foam, ruby strawberry syrup, and fresh berry crunch.',
    price: 7.95,
    image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80',
    glb_model_url: '/models/demo/shake.glb',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'dish-ramen-03',
    restaurant_id: 'rest-dinevista-001',
    name: 'Spicy Tokyo Tonkotsu Ramen',
    description: '18-hour slow-simmered rich pork bone broth with handmade ramen noodles, slow-braised chashu pork belly, ajitsuke tamago egg, chili oil, and nori.',
    price: 16.50,
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
    glb_model_url: '/models/demo/ramen.glb',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'dish-pizza-04',
    restaurant_id: 'rest-dinevista-001',
    name: 'Artisan Burrata & Truffle Pizza',
    description: '48-hour fermented sourdough crust, San Marzano tomato reduction, whole creamy Italian burrata, fresh basil, and shaved black truffles with olive oil.',
    price: 18.90,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    glb_model_url: '/models/demo/pizza.glb',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'dish-seafood-05',
    restaurant_id: 'rest-dinevista-001',
    name: 'Crispy Tiger Prawn Tempura',
    description: 'Jumbo tiger prawns encased in ultra-light golden panko tempura, paired with sweet yuzu dipping glaze, wasabi mayo, and pickled daikon slaw.',
    price: 15.75,
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
    glb_model_url: '/models/demo/tempura.glb',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'dish-bakery-06',
    restaurant_id: 'rest-dinevista-001',
    name: 'Pistachio Supreme Croissant',
    description: 'Honeycomb laminated French butter pastry piped with Sicilian roasted pistachio cream, topped with chopped Bronte pistachios and golden flakes.',
    price: 6.80,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
    glb_model_url: '/models/demo/croissant.glb',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'dish-steak-07',
    restaurant_id: 'rest-dinevista-001',
    name: 'Grilled Prime Ribeye Steak',
    description: 'USDA Prime 14oz center-cut ribeye steak char-grilled with smoked sea salt, rosemary-infused confit garlic butter, and roasted asparagus.',
    price: 28.50,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    glb_model_url: '/models/demo/steak.glb',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'dish-sushi-08',
    restaurant_id: 'rest-dinevista-001',
    name: 'Dragon Roll Avocado Sushi',
    description: 'Fresh grilled freshwater eel, crispy tempura cucumber, layered with Hass avocado slices, sweet kabayaki unagi reduction, and roasted sesame.',
    price: 16.90,
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
    glb_model_url: '/models/demo/sushi.glb',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'dish-dessert-09',
    restaurant_id: 'rest-dinevista-001',
    name: 'Matcha Molten Lava Cake',
    description: 'Warm dark chocolate sponge cake with an oozing liquid Uji matcha white chocolate molten center, dusted with powdered sugar and berries.',
    price: 8.50,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
    glb_model_url: '/models/demo/cake.glb',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

// Upgrade only known demo placeholders; keep custom models and user edits.
export function migrateDemoModels(items: MenuItem[]): MenuItem[] {
  return items.map(item => {
    const seed = INITIAL_MENU_ITEMS.find(dish => dish.id === item.id && dish.name === item.name);
    return seed && (item.glb_model_url || '').startsWith('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/')
      ? { ...item, glb_model_url: seed.glb_model_url } : item;
  });
}

const LOCAL_STORAGE_KEY_MENU = 'dinevista_menu_items_v6';
const LOCAL_STORAGE_KEY_REST = 'dinevista_restaurant_v6';

// ==============================================================================
// 5. DATA API FUNCTIONS
// ==============================================================================

export const api = {
  async getLocalDishes(): Promise<MenuItem[]> {
    const saved = await localStore<MenuItem[]>(LOCAL_STORAGE_KEY_MENU);
    if (saved) return saved;
    try { return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_MENU) || '[]'); }
    catch { return []; }
  },
  async importLocalDishes(restaurantId: string, onProgress: (message: string) => void): Promise<number> {
    if (!supabase) throw new Error('Shared storage is not configured.');
    const dishes = await this.getLocalDishes();
    const uploaded = new Map<string, string>();
    const transfer = async (url: string, bucket: string) => {
      if (!url || (!url.startsWith('dinevista-asset:') && !url.startsWith('data:'))) return url;
      if (uploaded.has(url)) return uploaded.get(url)!;
      const blob = url.startsWith('data:') ? await (await fetch(url)).blob() : await localStore<Blob>(url.slice('dinevista-'.length));
      if (!blob) throw new Error('A local attachment is missing. Re-upload that file before importing. Local dishes were kept.');
      const ext = bucket === STORAGE_BUCKET_MODELS ? 'glb' : bucket === STORAGE_BUCKET_MARKERS ? 'mind' : blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
      const shared = await this.uploadFile(new File([blob], `import.${ext}`, { type: blob.type }), bucket);
      uploaded.set(url, shared); return shared;
    };
    const markers = await localStore<ARMarker[]>('markers:rest-dinevista-001') || [];
    for (const marker of markers) {
      onProgress(`Uploading marker: ${marker.name}`);
      const shared = { ...marker, restaurant_id: restaurantId, image_url: await transfer(marker.image_url, STORAGE_BUCKET_IMAGES), target_url: await transfer(marker.target_url, STORAGE_BUCKET_MARKERS) };
      const { error } = await supabase.from('ar_markers').upsert(shared);
      if (error) throw new Error(error.message);
    }
    // Upload every attachment before publishing rows. Failed imports leave the local copy intact.
    const existing = await this.getMenuItems(restaurantId);
    const sharedDishes = [];
    for (const [index, dish] of dishes.entries()) {
      onProgress(`Uploading ${index + 1}/${dishes.length}: ${dish.name}`);
      const { id, created_at, ...fields } = dish;
      sharedDishes.push({ ...fields, id: existing.find(item => item.legacy_id === id)?.id || crypto.randomUUID(), restaurant_id: restaurantId, legacy_id: id, marker_id: dish.marker_id === 'default' ? null : dish.marker_id || null, image_url: await transfer(dish.image_url, STORAGE_BUCKET_IMAGES), glb_model_url: await transfer(dish.glb_model_url, STORAGE_BUCKET_MODELS) });
    }
    if (sharedDishes.length) {
      const { error } = await supabase.from('menu_items').upsert(sharedDishes, { onConflict: 'restaurant_id,legacy_id' });
      if (error) throw new Error(error.message);
    }
    return sharedDishes.length;
  },
  // Fetch Restaurant by ID or Slug
  async getRestaurant(identifier: string = 'dinevista-lounge'): Promise<Restaurant> {
    if (isSupabaseConfigured && supabase) {
      try {
        if (identifier === 'rest-dinevista-001' || identifier === 'dinevista-lounge') identifier = process.env.NEXT_PUBLIC_RESTAURANT_SLUG || 'dinevista-lounge';
        const query = (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier))
          ? supabase.from('restaurants').select('*').eq('id', identifier)
          : supabase.from('restaurants').select('*').eq('slug', identifier);

        const { data, error } = await query.single();
        if (error) throw new Error(error.message);
        if (data) return data as Restaurant;
      } catch (err) {
        throw err;
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_REST);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return DEFAULT_RESTAURANT;
  },

  // Fetch all Menu Items for a restaurant
  async getMenuItems(restaurantId: string = 'rest-dinevista-001'): Promise<MenuItem[]> {
    if (supabase && restaurantId === 'rest-dinevista-001') restaurantId = (await this.getRestaurant(restaurantId)).id;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return migrateDemoModels(data as MenuItem[]);
      } catch (err) {
        throw err;
      }
    }

    if (typeof window === 'undefined') return INITIAL_MENU_ITEMS;

    const saved = await localStore<MenuItem[]>(LOCAL_STORAGE_KEY_MENU);
    if (saved) return migrateDemoModels(saved).filter(item => item.restaurant_id === restaurantId);

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_MENU);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const migrated = migrateDemoModels(parsed);
          await localStore(LOCAL_STORAGE_KEY_MENU, migrated);
          return migrated;
        }
      } catch {}
    }

    await localStore(LOCAL_STORAGE_KEY_MENU, INITIAL_MENU_ITEMS);
    return INITIAL_MENU_ITEMS;
  },

  // Insert a new menu item
  async addMenuItem(item: Omit<MenuItem, 'id' | 'created_at'>): Promise<MenuItem> {
    const newItem: MenuItem = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .insert(newItem)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data as MenuItem;
      } catch (err) {
        throw err;
      }
    }

    if (typeof window !== 'undefined') {
      const items = await this.getMenuItems(item.restaurant_id);
      const updated = [newItem, ...items];
      await localStore(LOCAL_STORAGE_KEY_MENU, updated);
    }
    return newItem;
  },

  // Update an existing menu item
  async updateMenuItem(item: MenuItem): Promise<MenuItem> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .update(item)
          .eq('id', item.id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data as MenuItem;
      } catch (err) {
        throw err;
      }
    }

    if (typeof window !== 'undefined') {
      const items = await this.getMenuItems(item.restaurant_id);
      const updated = items.map((i) => (i.id === item.id ? item : i));
      await localStore(LOCAL_STORAGE_KEY_MENU, updated);
    }
    return item;
  },

  // Delete a menu item
  async deleteMenuItem(id: string, restaurantId: string = 'rest-dinevista-001'): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('menu_items').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (err) {
        throw err;
      }
    }

    if (typeof window !== 'undefined') {
      const items = await this.getMenuItems(restaurantId);
      const filtered = items.filter((i) => i.id !== id);
      await localStore(LOCAL_STORAGE_KEY_MENU, filtered);
    }
    return true;
  },

  // Upload file to Supabase Storage Bucket ('menu-images' or 'menu-models')
  async uploadFile(file: File, bucket: string): Promise<string> {
    if (!file.size) throw new Error('File is empty.');
    if (file.size > (supabase ? 50 : 100) * 1024 * 1024) throw new Error(`File too large. Use a file under ${supabase ? 50 : 100} MB.`);
    if (bucket === STORAGE_BUCKET_MODELS) {
      const header = new DataView(await file.slice(0, 12).arrayBuffer());
      if (!file.name.toLowerCase().endsWith('.glb') || header.byteLength < 12 || header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2 || header.getUint32(8, true) !== file.size) throw new Error('Choose a valid self-contained GLB 2.0 file, not GLTF.');
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) throw new Error('Sign in as the restaurant owner to upload shared files.');
        const filePath = `${sessionData.session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: bucket === STORAGE_BUCKET_MODELS ? 'model/gltf-binary' : file.type || 'application/octet-stream' });

        if (uploadError) throw new Error(uploadError.message);
        if (!uploadError) {
          const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
          return data.publicUrl;
        }
      } catch (err) {
        throw err;
      }
    }

    if (bucket !== STORAGE_BUCKET_IMAGES) {
      const key = `asset:${crypto.randomUUID()}`;
      // Store a plain Blob: some browsers cannot clone native file-picker File objects.
      await localStore(key, new Blob([file], { type: file.type || 'application/octet-stream' }));
      return `dinevista-${key}`;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error('Could not read image.'));
      reader.readAsDataURL(file);
    });
  },
  async resolveFile(url: string): Promise<string> {
    if (!url.startsWith('dinevista-asset:')) return url;
    const blob = await localStore<Blob>(url.slice('dinevista-'.length));
    if (!blob) throw new Error('This demo file is unavailable on this browser. Upload it here, or configure Supabase for shared files.');
    return URL.createObjectURL(blob);
  },
  async getMarkers(restaurantId: string): Promise<ARMarker[]> {
    if (supabase) {
      const { data, error } = await supabase.from('ar_markers').select('*').eq('restaurant_id', restaurantId);
      if (error) throw new Error(error.message);
      return [DEFAULT_MARKER, ...(data || [])];
    }
    return [DEFAULT_MARKER, ...(await localStore<ARMarker[]>(`markers:${restaurantId}`) || [])];
  },
  async addMarker(marker: Omit<ARMarker, 'id'>): Promise<ARMarker> {
    const saved = { ...marker, id: crypto.randomUUID() };
    if (supabase) {
      const { error } = await supabase.from('ar_markers').insert(saved);
      if (error) throw new Error(error.message);
    } else {
      const markers = (await this.getMarkers(marker.restaurant_id)).filter(item => item.id !== 'default');
      await localStore(`markers:${marker.restaurant_id}`, [...markers, saved]);
    }
    return saved;
  },
};
