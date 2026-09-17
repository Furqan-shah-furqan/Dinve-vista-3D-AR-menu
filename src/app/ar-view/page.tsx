'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';

const ThreeModelViewer = dynamic(() => import('@/components/ar/ThreeModelViewer').then(m => m.ThreeModelViewer), { ssr: false });
const button = 'border-none rounded-custom-mobile md:rounded-custom-tablet lg:rounded-custom-desktop px-4 py-3 bg-white/10 shadow-soft transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 text-sm';

function ARViewContent() {
  const params = useSearchParams();
  const modelUrl = params.get('modelUrl') || '';
  const dishName = params.get('dishName') || '3D dish';
  const backUrl = `/menu/${encodeURIComponent(params.get('restaurantId') || 'dinevista-lounge')}`;
  const frame = useRef<HTMLIFrameElement>(null);
  const [mode, setMode] = useState<'intro' | 'ar' | 'preview'>('intro');
  const [status, setStatus] = useState('Loading AR engine and model…');
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);
  const [attempt, setAttempt] = useState(0);
  const validModel = /^(https?:\/\/|blob:|data:(application\/octet-stream|model\/gltf-binary)[;,]|\/(?!\/))/i.test(modelUrl);
  const isSample = modelUrl.includes('glTF-Sample-Models');

  useEffect(() => {
    if (mode !== 'ar') return;
    const cameraWindow = frame.current?.contentWindow;
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.source !== 'dinevista-ar') return;
      const data = event.data;
      if (data.type === 'boot') frame.current?.contentWindow?.postMessage({ type: 'init', modelUrl }, window.location.origin);
      if (data.type === 'ready') setStatus('Point your camera at the printed marker.');
      if (data.type === 'tracking') setStatus(data.found ? 'Marker found — pinch to resize, drag to rotate.' : 'Marker lost — keep the printed image in view.');
      if (data.type === 'scale' && Number.isFinite(data.scale)) setZoom(Math.round(data.scale * 100));
      if (data.type === 'error') setError(data.message || 'AR could not start.');
    };
    window.addEventListener('message', receive);
    return () => {
      window.removeEventListener('message', receive);
      cameraWindow?.postMessage({ type: 'stop' }, window.location.origin);
    };
  }, [mode, modelUrl, attempt]);

  const start = () => {
    setError(''); setZoom(100); setStatus('Loading AR engine and model…');
    setAttempt(value => value + 1); setMode('ar');
  };

  return (
    <main className="relative w-full min-h-[100dvh] bg-slate-950 text-white font-body">
      {mode === 'ar' && !error && <iframe key={attempt} ref={frame} src="/ar/index.html" title="Live marker tracking camera" onLoad={() => frame.current?.contentWindow?.postMessage({ type: 'init', modelUrl }, window.location.origin)} allow="camera; fullscreen" className="fixed inset-0 w-full h-[100dvh] border-none" />}
      <header className="relative z-20 flex flex-wrap justify-between gap-3 p-4 pointer-events-none">
        <Link href={backUrl} className={`${button} pointer-events-auto backdrop-blur-xl bg-slate-900/80`}>Back to Menu</Link>
        <div className="flex gap-2 pointer-events-auto">
          <button className={button} onClick={() => { setMode('preview'); setError(''); }}>3D Preview</button>
          {mode !== 'intro' && <button className={button} onClick={() => { setMode('intro'); setError(''); }}>Marker & Help</button>}
        </div>
      </header>
      {(mode === 'intro' || error) && <section className="relative z-20 mx-auto max-w-lg p-6 pb-12 text-center">
        <h1 className="font-heading text-3xl font-bold mb-3">{dishName}</h1>
        <p className="text-slate-300 mb-5">Print this tracking image and lay it flat on your table. Keep it visible to the camera while viewing the dish.</p>
        <Image src="/ar/marker.png" alt="MindAR tracking card — print this exact image without cropping" width={600} height={332} className="w-full h-auto shadow-soft" />
        <a className={`${button} inline-block my-4`} href="/ar/marker.png" download="dinevista-ar-marker.png">Download Marker</a>
        <p className="text-sm text-slate-300 mb-4">The menu QR opens the website. This separate image anchors the 3D model.</p>
        {isSample && <p className="text-amber-200 text-sm mb-4">This dish currently uses a sample model. Upload its real food GLB in the dashboard to show the correct dish.</p>}
        {!validModel && <p role="alert" className="text-amber-200 mb-4">No valid 3D model is attached. Add a public GLB URL in the dashboard.</p>}
        {error && <p role="alert" className="bg-rose-950 p-4 rounded-custom-mobile mb-4">{error}</p>}
        <button disabled={!validModel} className={`${button} bg-purple-600 disabled:opacity-40 w-full`} onClick={start}>{error ? 'Retry Camera AR' : 'Start Camera AR'}</button>
      </section>}
      {mode === 'preview' && <section className="mx-auto max-w-3xl p-4">
        <h1 className="font-heading text-2xl text-center">{dishName}</h1>
        {isSample && <p className="text-amber-200 text-center text-sm mt-2">Sample model — replace it with this dish’s food GLB in the dashboard.</p>}
        <div className="h-[65dvh]"><ThreeModelViewer modelUrl={validModel ? modelUrl : undefined} dishName={dishName} /></div>
        <button disabled={!validModel} className={`${button} block mx-auto bg-purple-600 disabled:opacity-40`} onClick={() => setMode('intro')}>Place on Table</button>
      </section>}
      {mode === 'ar' && !error && <div className="fixed bottom-5 left-4 right-4 z-20 pointer-events-none text-center">
        <p role="status" className="inline-block bg-slate-900/80 backdrop-blur-xl shadow-soft rounded-custom-mobile md:rounded-custom-tablet lg:rounded-custom-desktop p-4">{status}<br /><span className="text-sm text-purple-200">{dishName} · {zoom}%</span></p>
      </div>}
    </main>
  );
}

export default function ARViewPage() {
  return <Suspense fallback={<p className="p-8">Loading AR viewer…</p>}><ARViewContent /></Suspense>;
}
