'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { api, DEFAULT_MARKER } from '@/lib/supabase';

const ThreeModelViewer = dynamic(() => import('@/components/ar/ThreeModelViewer').then(m => m.ThreeModelViewer), { ssr: false });
const button = 'border-none rounded-custom-mobile md:rounded-custom-tablet lg:rounded-custom-desktop px-4 py-3 bg-white/10 shadow-soft transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 text-sm';

function ARViewContent() {
  const params = useSearchParams();
  const [modelUrl, setModelUrl] = useState('');
  const [dishName, setDishName] = useState(params.get('dishName') || '3D dish');
  const [marker, setMarker] = useState(DEFAULT_MARKER);
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const backUrl = `/menu/${encodeURIComponent(params.get('restaurantId') || 'dinevista-lounge')}`;
  const frame = useRef<HTMLIFrameElement>(null);
  const [mode, setMode] = useState<'intro' | 'ar' | 'preview'>('intro');
  const [status, setStatus] = useState('Loading AR engine and model…');
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);
  const [attempt, setAttempt] = useState(0);
  const [cameraBlock, setCameraBlock] = useState('');
  const [insecure, setInsecure] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const objectUrls: string[] = [];
    const resolve = async (url: string) => {
      const resolved = await api.resolveFile(url);
      if (resolved.startsWith('blob:')) objectUrls.push(resolved);
      return resolved;
    };
    const load = async () => {
      try {
        let source = params.get('modelUrl') || '';
        let selected = DEFAULT_MARKER;
        const dishId = params.get('dishId');
        if (dishId) {
          const items = await api.getMenuItems(params.get('restaurantId') || 'rest-dinevista-001');
          const dish = items.find(item => item.id === dishId);
          if (!dish) throw new Error('Dish not found. Local demo dishes are only available on the browser that saved them.');
          source = dish.glb_model_url;
          if (!cancelled) setDishName(dish.name);
          if (dish.marker_id) {
            const markers = await api.getMarkers(dish.restaurant_id);
            const found = markers.find(item => item.id === dish.marker_id);
            if (!found) throw new Error('Selected marker is unavailable. Edit this dish and choose a marker again.');
            selected = found;
          }
        }
        const [model, target] = await Promise.all([resolve(source), resolve(selected.target_url)]);
        if (!cancelled) { setModelUrl(model); setMarker(selected); setTargetUrl(target); }
      } catch (err) { if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load dish.'); }
      finally { if (!cancelled) setLoading(false); else objectUrls.forEach(url => URL.revokeObjectURL(url)); }
    };
    void load();
    return () => { cancelled = true; objectUrls.forEach(url => URL.revokeObjectURL(url)); };
  }, [params]);
  useEffect(() => {
    if (!window.isSecureContext) {
      setInsecure(true);
      setCameraBlock('Camera blocked: this page is using an insecure HTTP address. A phone opening your PC at 192.168.x.x cannot use the camera here. Open the HTTPS live app below instead. This is not a 3D model or ARCore error.');
    } else if (!navigator.mediaDevices?.getUserMedia) {
      setCameraBlock('Camera access is unavailable in this browser. Open this page directly in Chrome on Android or Safari on iPhone, outside any in-app browser. You can still use 3D Preview.');
    }
  }, []);
  const validModel = /^(https?:\/\/|blob:|data:(application\/octet-stream|model\/gltf-binary|model\/gltf\+json)[;,]|\/(?!\/))/i.test(modelUrl);
  const isSample = modelUrl.includes('glTF-Sample-Models');
  const isDemo = modelUrl.startsWith('/models/demo/');

  useEffect(() => {
    if (mode !== 'ar') return;
    const cameraWindow = frame.current?.contentWindow;
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.source !== 'dinevista-ar') return;
      const data = event.data;
      if (data.type === 'boot') frame.current?.contentWindow?.postMessage({ type: 'init', modelUrl, targetUrl }, window.location.origin);
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
  }, [mode, modelUrl, targetUrl, attempt]);

  const start = () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(cameraBlock || 'Camera access needs a secure HTTPS page and a camera-enabled browser.');
      return;
    }
    setError(''); setZoom(100); setStatus('Loading AR engine and model…');
    setAttempt(value => value + 1); setMode('ar');
  };

  return (
    <main className="relative w-full min-h-[100dvh] bg-slate-950 text-white font-body">
      {mode === 'ar' && !error && <iframe key={attempt} ref={frame} src="/ar/index.html" title="Live marker tracking camera" onLoad={() => frame.current?.contentWindow?.postMessage({ type: 'init', modelUrl, targetUrl }, window.location.origin)} allow="camera; fullscreen" className="fixed inset-0 w-full h-[100dvh] border-none" />}
      <header className="relative z-20 flex flex-wrap justify-between gap-3 p-4 pointer-events-none">
        <Link href={backUrl} className={`${button} pointer-events-auto backdrop-blur-xl bg-slate-900/80`}>Back to Menu</Link>
        <div className="flex gap-2 pointer-events-auto">
          <button className={button} onClick={() => { setMode('preview'); setError(''); }}>3D Preview</button>
          {mode !== 'intro' && <button className={button} onClick={() => { setMode('intro'); setError(''); }}>Marker & Help</button>}
        </div>
      </header>
      {cameraBlock && <aside role="alert" className="relative z-20 mx-auto max-w-lg p-5 m-4 bg-amber-950 text-amber-100 shadow-soft border-none rounded-custom-mobile md:rounded-custom-tablet lg:rounded-custom-desktop">
        <h2 className="font-heading font-bold mb-2">{insecure ? 'Use HTTPS for phone AR' : 'Camera unavailable'}</h2>
        <p className="text-sm">{cameraBlock}</p>
        {insecure && <a href="https://dinve-vista-3-d-ar-menu.vercel.app/menu/dinevista-lounge" className={`${button} inline-block mt-3 bg-purple-600 text-white`}>Open HTTPS Live Menu</a>}
        <p className="text-xs mt-3">Local demo uploads are stored only in this browser and will not transfer to the live site. For shared models, configure Supabase Storage.</p>
      </aside>}
      {(mode === 'intro' || error) && <section className="relative z-20 mx-auto max-w-lg p-6 pb-12 text-center">
        <h1 className="font-heading text-3xl font-bold mb-3">{dishName}</h1>
        {isDemo && <p className="text-sm text-amber-200 mb-3">Stylized demo food model — appearance and portion size are approximate.</p>}
        <p className="text-slate-300 mb-5">Show this dish’s selected marker on another screen or print it without cropping. Keep the whole image visible to the camera.</p>
        <Image src={marker.image_url} alt={marker.name} width={702} height={1600} unoptimized className="w-full h-auto max-h-[45dvh] object-contain shadow-soft" priority />
        <a className={`${button} inline-block my-4`} href={marker.image_url} download="dinevista-ar-marker">Download Selected Marker</a>
        <p className="text-sm text-slate-300 mb-4">The menu QR opens the website. This separate image anchors the 3D model.</p>
        {isSample && <p className="text-amber-200 text-sm mb-4">This dish currently uses a sample model. Upload its real food GLB in the dashboard to show the correct dish.</p>}
        {loading ? <p role="status">Loading dish and marker…</p> : !validModel && <p role="alert" className="text-amber-200 mb-4">No valid 3D model is attached. Upload a GLB or glTF in the dashboard.</p>}
        {error && <p role="alert" className="bg-rose-950 p-4 rounded-custom-mobile mb-4">{error}</p>}
        <button disabled={loading || !targetUrl || !validModel || Boolean(cameraBlock)} className={`${button} bg-purple-600 disabled:opacity-40 w-full`} onClick={start}>{cameraBlock ? 'Camera AR unavailable here' : error ? 'Retry Camera AR' : 'Start Camera AR'}</button>
      </section>}
      {mode === 'preview' && <section className="mx-auto max-w-3xl p-4">
        <h1 className="font-heading text-2xl text-center">{dishName}</h1>
        {isDemo && <p className="text-sm text-amber-200 text-center mt-2">Stylized demo food model — approximate appearance.</p>}
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
