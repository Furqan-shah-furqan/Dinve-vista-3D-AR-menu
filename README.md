# DineVista AR 🍔📱
### Production Next.js 14 & MindAR 3D Restaurant Menu Web Application

**DineVista AR** is an agency-grade WebAR dining platform that allows patrons to browse a chef-curated gourmet menu and project interactive, real-scale 3D models of dishes directly onto their dining tables using WebAR (MindAR + A-Frame / Three.js). It includes a full Restaurant Admin Portal for managing dishes, GLB/glTF 3D models, and generating printable table QR standees.

---

## ✨ Features

- **📱 Customer WebAR Menu**:
  - Floating 3D pop-out gourmet dish cards with organic border radii and subtle hover tilt animations.
  - "Place on Table" instant 3D WebAR projection with pinch-to-zoom and two-finger rotation controls.
  - Pre-seeded with authentic gourmet food photography.
- **📊 Restaurant Admin Portal**:
  - Live menu item management (create, update, delete dishes).
  - Drag-and-drop file uploaders for dish photos and 3D `.glb` / `.gltf` assets.
  - Scrollable mobile-friendly dish editor with visible upload/save errors.
  - Upload a marker image, compile its MindAR target, and reuse saved markers on dishes.
  - **Table QR Code Studio**: Instant QR code generation with printable table standee layout.
- **🎨 Design System**:
  - Built with Next.js 14 App Router and Tailwind CSS.
  - Zero borders policy: Soft ambient shadows, warm cream (`#faf7f2`), and rich violet/purple gradients.
  - Fully responsive across mobile, tablet, and desktop.
- **⚡ Backend Ready**:
  - Supabase integration for persistent database storage and storage buckets (`menu-images`, `menu-models`).
  - IndexedDB demo storage for large binary GLBs without localStorage quota failures.
  - Demo uploads are browser/device-local, not published to other phones.

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


## Marker AR testing

1. Open `/menu/dinevista-lounge` on an HTTPS deployment in Android Chrome or iPhone Safari.
2. Select **Place on Table** and open the displayed cloth photo on another screen, or print it without cropping.
3. Select **Start Camera AR**, allow camera access and point at the entire cloth photo.
4. Keep the marker visible. Pinch to resize; drag to rotate. Use **3D Preview** without a camera.
5. Leave AR or switch modes to release the camera. Return from a hidden tab using Retry.

The QR only opens the menu. `/ar/marker.jpg` and `/ar/targets.mind` are a matched pair
compiled from the cloth demo photo with MindAR v1.2.5 (https://github.com/hiukim/mind-ar-js, MIT).
Replace BOTH together when compiling a custom restaurant target; changing a QR alone
cannot change the image recognized by the tracker.

The AR engine is isolated in `/public/ar/index.html`; it does not enter the React/SSR
runtime. GLBs are fitted relative to marker width, not calibrated to actual portion
size. The nine seeded dishes use original, stylized food GLBs in
`public/models/demo`. These approximate each dish; they are not photorealistic
scans. Regenerate them with `node scripts/generate-demo-food.mjs`.
Known saved demo placeholders are upgraded without replacing custom uploads.

Camera AR depends on HTTPS, camera permission, WebGL, lighting and device performance;
it does not need ARCore, but support on every phone is not guaranteed. Test physical
tracking on real phones before deploying to restaurant tables.

## Publishing dishes and custom markers

Open Admin → Add New Dish (or Edit Dish). Upload a valid GLB or glTF 2.0 model,
choose a saved marker or select Add marker to upload a JPG/PNG/WebP. The image is
compiled in an isolated iframe into a matching `.mind` target; wait for completion,
then Publish Dish. Compilation needs internet and may take a few minutes. Use a
flat, non-repetitive image with detail; tracking quality is not guaranteed for cloth.
The dish viewer loads the selected image/target pair, not the global demo marker.
Existing demo dishes continue using the cloth marker.

Without Supabase, dishes and binary models persist in IndexedDB on the same
browser/device. Do not clear site data if you want to keep them. Old localStorage
dishes are migrated without deleting the old backup. Uploads never go in page URLs.

Shared publishing uses `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (legacy anon keys remain supported).
`NEXT_PUBLIC_RESTAURANT_SLUG` identifies the existing restaurant; legacy links
`/menu/rest-dinevista-001` and `/menu/dinevista-lounge` resolve to that same record.
The deployed project uses the existing **3D menu Viewer** Supabase project.
The additive `20261007171025_shared_menu_sync.sql` migration aligns its existing
schema, grants public read access and enforces owner-only edits with RLS.
Do not run the older standalone `schema.sql` over this existing project.

Sign in at `/admin` using the existing Supabase restaurant-owner account.
Use **Import laptop dishes & files** in the browser where demo uploads were saved.
This uploads GLBs and marker targets to Storage and upserts dishes without
creating repeat-import duplicates. It keeps local copies; missing attachments
stop publication with an error. Importing replaces the shared version of those
same dishes with the laptop version. Customer menus refresh every 15 seconds
while visible and whenever the tab regains focus, including empty menus.
Configured-backend errors never silently fall back to demo dishes.

The app and `menu-models` bucket accept GLBs up to 100 MB; markers support
50 MB and images support 10 MB. Supabase Free enforces a global 50 MB cap
even when the bucket allows 100 MB. For larger GLBs, upgrade to Pro or above
and set Storage → Settings → Global file size limit to at least 100 MB.
The app uploads directly to Storage, without passing files through Vercel.
No service-role or secret keys are used in the browser or committed to GitHub.

Verification: `npm run build` and `node --test tests/*.test.cjs`.

### glTF uploads
The model field accepts `.glb` and `.gltf`. For a glTF with separate resources,
select/drop **one .gltf together with all referenced .bin and texture files**,
or use **Choose folder** for an export folder containing a single model.
The app embeds those resources into the JSON before saving so the model stays
portable across devices and local-to-shared imports. Missing or ambiguous
resource filenames stop the upload and preserve the previous attachment.
Nested resource paths work when each selected filename is unique. Remote
resource URLs must be exported as local resources first. Embedded glTF also
works as a single file. No geometry, materials or textures are simplified.
The final embedded model must be under 100 MB; base64 embedding increases size.
Supabase Free still enforces its global 50 MB limit. The existing database
field `glb_model_url` stores either format's URL for compatibility.
