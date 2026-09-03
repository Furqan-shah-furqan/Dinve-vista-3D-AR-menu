export type DietaryTag = 'Vegan' | 'Vegetarian' | 'Gluten-Free' | 'Chef Special' | 'Spicy' | 'Popular' | 'Halal' | 'Dairy-Free';

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  qr_code_url?: string;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  glb_model_url: string;
  created_at?: string;
}

export interface ARGestureState {
  scale: number;
  rotationY: number;
  isTracking: boolean;
}
