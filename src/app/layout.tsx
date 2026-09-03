import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'DineVista AR - 3D/WebAR Restaurant Menu',
  description:
    'Browse gourmet menus and project real-scale 3D food models onto your physical dining table with MindAR & A-Frame.',
  keywords: ['WebAR Menu', 'MindAR', 'A-Frame', 'Next.js AR', '3D Food Menu', 'Interactive Dining'],
  openGraph: {
    title: 'DineVista AR - 3D/WebAR Restaurant Menu',
    description: 'Place delicious 3D gourmet dishes directly on your physical table with WebAR.',
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#faf7f2] dark:bg-[#0B0E17] text-slate-900 dark:text-slate-100 flex flex-col font-body antialiased selection:bg-purple-500 selection:text-white border-none">
        {children}
      </body>
    </html>
  );
}
