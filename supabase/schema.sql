-- ==============================================================================
-- DINEVISTA AR - SUPABASE DATABASE SCHEMA & STORAGE SETUP
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Restaurants Table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tagline TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    theme_color VARCHAR(50) DEFAULT '#7c3aed',
    currency VARCHAR(10) DEFAULT '$',
    tax_rate NUMERIC(5, 2) DEFAULT 8.50,
    table_count INTEGER DEFAULT 20,
    phone VARCHAR(50),
    address TEXT,
    is_open BOOLEAN DEFAULT true,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Utensils',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT NOT NULL,
    model_3d_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 4.9,
    rating_count INTEGER DEFAULT 128,
    calories INTEGER,
    prep_time_mins INTEGER DEFAULT 15,
    spice_level INTEGER DEFAULT 0, -- 0 to 3
    is_special BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    view_count_ar INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    allergens TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    customer_name VARCHAR(100) DEFAULT 'Guest',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'delivered', 'cancelled'
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public read access for customers viewing restaurant menus
CREATE POLICY "Public restaurants read" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public menu items read" ON public.menu_items FOR SELECT USING (true);

-- Public insert for customer table orders
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own table orders" ON public.orders FOR SELECT USING (true);

-- Restaurant Admin authenticated write access
CREATE POLICY "Restaurant owners manage restaurant" ON public.restaurants
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Restaurant owners manage categories" ON public.categories
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.restaurants WHERE id = categories.restaurant_id AND owner_id = auth.uid()
    ));

CREATE POLICY "Restaurant owners manage menu items" ON public.menu_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.restaurants WHERE id = menu_items.restaurant_id AND owner_id = auth.uid()
    ));

CREATE POLICY "Restaurant owners manage orders" ON public.orders
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.restaurants WHERE id = orders.restaurant_id AND owner_id = auth.uid()
    ));

-- ==============================================================================
-- SUPABASE STORAGE BUCKETS
-- ==============================================================================
-- Run these storage configurations in Supabase Storage SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('food-images', 'food-images', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('food-models', 'food-models', true) ON CONFLICT DO NOTHING;

-- CREATE POLICY "Public read storage images" ON storage.objects FOR SELECT USING (bucket_id = 'food-images');
-- CREATE POLICY "Public read storage models" ON storage.objects FOR SELECT USING (bucket_id = 'food-models');
-- CREATE POLICY "Auth users upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'food-images');
-- CREATE POLICY "Auth users upload models" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'food-models');
