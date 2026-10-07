'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { api, ARMarker, DEFAULT_MARKER, STORAGE_BUCKET_IMAGES, STORAGE_BUCKET_MARKERS } from '@/lib/supabase';

export function MarkerPicker({ restaurantId, value, onChange, onBusy }: {
  restaurantId: string; value: string; onChange: (id: string) => void; onBusy: (busy: boolean) => void;
}) {
  const [markers, setMarkers] = useState<ARMarker[]>([DEFAULT_MARKER]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { api.getMarkers(restaurantId).then(setMarkers).catch(err => setError(err.message)); }, [restaurantId]);
  const upload = async (file: File) => {
    if (busy) return;
    setError(''); setBusy(true); onBusy(true); setStatus('Compiling marker…');
    try {
      if (!/image\/(jpeg|png|webp)/.test(file.type) || file.size > 10 * 1024 * 1024) throw new Error('Choose a JPG, PNG or WebP under 10 MB.');
      const target = await new Promise<ArrayBuffer>((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.hidden = true; iframe.src = '/ar/compiler.html';
        const cleanup = () => { clearTimeout(timer); window.removeEventListener('message', receive); iframe.remove(); };
        const receive = (event: MessageEvent) => {
          if (event.origin !== location.origin || event.source !== iframe.contentWindow || event.data?.source !== 'marker-compiler') return;
          if (event.data.error) { cleanup(); reject(new Error(event.data.error)); }
          else if (event.data.target) { cleanup(); resolve(event.data.target); }
          else if (Number.isFinite(event.data.progress)) setStatus(`Compiling marker… ${Math.round(event.data.progress)}%`);
        };
        const timer = setTimeout(() => { cleanup(); reject(new Error('Compilation timed out. Try a smaller detailed image on a desktop.')); }, 180000);
        window.addEventListener('message', receive);
        iframe.onload = () => iframe.contentWindow?.postMessage({ type: 'compile-marker', file }, location.origin);
        document.body.appendChild(iframe);
      });
      setStatus('Saving marker…');
      const image_url = await api.uploadFile(file, STORAGE_BUCKET_IMAGES);
      const target_url = await api.uploadFile(new File([target], 'target.mind', { type: 'application/octet-stream' }), STORAGE_BUCKET_MARKERS);
      const marker = await api.addMarker({ restaurant_id: restaurantId, name: file.name, image_url, target_url });
      setMarkers(previous => [...previous, marker]); onChange(marker.id); setStatus('Marker saved. You can reuse it on other dishes.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save marker.'); setStatus(''); }
    finally { setBusy(false); onBusy(false); if (input.current) input.current.value = ''; }
  };
  const selected = markers.find(marker => marker.id === value);
  return <section className="p-3 bg-purple-100/50 dark:bg-slate-800 rounded-custom-mobile md:rounded-custom-tablet lg:rounded-custom-desktop border-none shadow-soft">
    <label htmlFor="dish-marker" className="block text-xs font-bold mb-2">3. AR marker — select an uploaded image</label>
    <div className="flex gap-2 items-center">
      {selected && <Image src={selected.image_url} alt="Selected tracking marker" width={44} height={44} unoptimized className="object-cover h-[44px] w-[44px] rounded-full shrink-0 shadow-soft" />}
      <select id="dish-marker" value={value} disabled={busy} onChange={event => onChange(event.target.value)} className="min-w-0 h-[44px] flex-1 px-3 bg-white dark:bg-slate-900 border-none rounded-custom-mobile shadow-soft text-xs">
        {markers.map(marker => <option key={marker.id} value={marker.id}>{marker.name}</option>)}
      </select>
      <button type="button" disabled={busy} onClick={() => input.current?.click()} className="h-[44px] px-3 shrink-0 bg-purple-600 text-white border-none rounded-custom-mobile shadow-soft text-xs transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50">Add marker</button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload marker image" className="hidden" onChange={event => { if (event.target.files?.[0]) void upload(event.target.files[0]); }} />
    </div>
    <p className="text-xs mt-2">Use a flat, detailed image. Compilation may take a few minutes. Print or display that exact image for tracking.</p>
    {status && <p role="status" className="text-xs mt-2">{status}</p>}
    {error && <p role="alert" className="text-xs text-red-500 mt-2">{error}</p>}
  </section>;
}
