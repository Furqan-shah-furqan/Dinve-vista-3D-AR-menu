# DineVista AR 🍔📱
### Production Next.js 14 & MindAR 3D Restaurant Menu Web Application

**DineVista AR** is an agency-grade WebAR dining platform that allows patrons to browse a chef-curated gourmet menu and project interactive, real-scale 3D models of dishes directly onto their dining tables using WebAR (MindAR + A-Frame / Three.js). It includes a full Restaurant Admin Portal for managing dishes, .GLB 3D models, and generating printable table QR standees.

---

## ✨ Features

- **📱 Customer WebAR Menu**:
  - Floating 3D pop-out gourmet dish cards with organic border radii and subtle hover tilt animations.
  - "Place on Table" instant 3D WebAR projection with pinch-to-zoom and two-finger rotation controls.
  - Pre-seeded with authentic gourmet food photography.
- **📊 Restaurant Admin Portal**:
  - Live menu item management (create, update, delete dishes).
  - Drag-and-drop file uploaders for dish photos and 3D `.glb` assets.
  - Seamless, headerless modal with zero scrollbars.
  - **Table QR Code Studio**: Instant QR code generation with printable table standee layout.
- **🎨 Design System**:
  - Built with Next.js 14 App Router and Tailwind CSS.
  - Zero borders policy: Soft ambient shadows, warm cream (`#faf7f2`), and rich violet/purple gradients.
  - Fully responsive across mobile, tablet, and desktop.
- **⚡ Backend Ready**:
  - Supabase integration for persistent database storage and storage buckets (`menu-images`, `menu-models`).
  - Seamless local-storage fallback mode for instant demonstration without credentials.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application:
- **Customer Menu**: `/menu/dinevista-lounge`
- **Admin Dashboard**: `/admin`
- **WebAR View**: `/ar-view`

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
├── public/
│   ├── images/          # Static local assets
│   └── models/          # 3D .glb models
├── src/
│   ├── app/
│   │   ├── admin/       # Restaurant Admin Dashboard & QR Studio
│   │   ├── ar-view/     # WebAR Interactive Viewer
│   │   ├── menu/        # Customer-facing WebAR menu
│   │   └── page.tsx     # Landing / portal redirect
│   ├── components/
│   │   ├── admin/       # Admin navigation & header
│   │   ├── ar/          # Three.js / WebAR model viewers
│   │   └── ui/          # FoodCard, Modal, DropZone, etc.
│   ├── lib/
│   │   └── supabase.ts  # Database API, storage, and initial gourmet seed data
│   └── types/           # TypeScript data interfaces
└── tailwind.config.ts   # Design tokens, radii, and custom soft shadows
```
