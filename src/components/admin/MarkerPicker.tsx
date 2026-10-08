'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Check } from 'lucide-react';
import { api, ARMarker, DEFAULT_MARKER, STORAGE_BUCKET_IMAGES, STORAGE_BUCKET_MARKERS } from '@/lib/supabase';

export function MarkerPicker({ restaurantId, value, onChange, onBusy }: {
  restaurantId: string; value: string; onChange: (id: string) => void; onBusy: (busy: boolean) => void;
}) {
  const [markers, setMarkers] = useState<ARMarker[]>([DEFAULT_MARKER]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const picker = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (picker.current && !picker.current.contains(event.target as Node)) picker.current.open = false; };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
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
      <details ref={picker} className="relative min-w-0 flex-1" onKeyDown={event => { if (event.key === 'Escape' && picker.current) { picker.current.open = false; picker.current.querySelector('summary')?.focus(); } }}>
        <summary aria-label="Choose AR marker" aria-disabled={busy} onClick={event => { if (busy) event.preventDefault(); }} className="h-[44px] px-3 pr-[15px] flex items-center justify-between gap-2 list-none [&::-webkit-details-marker]:hidden cursor-pointer bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-none rounded-custom-mobile shadow-soft text-xs transition-all duration-300 ease-in-out">
          <span className="truncate">{selected?.name || 'Select marker'}</span>
          <ChevronDown aria-hidden="true" className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-300" />
        </summary>
        <div className="absolute bottom-full mb-2 left-0 z-10 w-full min-w-[180px] max-h-[180px] overflow-y-auto p-2 bg-[#faf7f2] dark:bg-slate-900 border-none rounded-custom-mobile shadow-darker" aria-label="Uploaded markers">
          {markers.map(marker => <button key={marker.id} type="button" disabled={busy} aria-pressed={marker.id === value} onClick={() => { onChange(marker.id); if (picker.current) { picker.current.open = false; picker.current.querySelector('summary')?.focus(); } }} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs border-none rounded-custom-mobile transition-all duration-300 ease-in-out ${marker.id === value ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-soft' : 'text-slate-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/60'}`}>
            <Image src={marker.image_url} alt="" width={28} height={28} unoptimized className="w-7 h-7 rounded-full object-cover shrink-0" />
            <span className="truncate flex-1">{marker.name}</span>
            {marker.id === value && <Check aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />}
          </button>)}
        </div>
      </details>
      <button type="button" disabled={busy} onClick={() => input.current?.click()} className="h-[44px] px-3 shrink-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white border-none rounded-custom-mobile shadow-glow text-xs transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50">Add marker</button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload marker image" className="hidden" onChange={event => { if (event.target.files?.[0]) void upload(event.target.files[0]); }} />
    </div>
    <p className="text-xs mt-2">Use a flat, detailed image. Compilation may take a few minutes. Print or display that exact image for tracking.</p>
    {status && <p role="status" className="text-xs mt-2">{status}</p>}
    {error && <p role="alert" className="text-xs text-red-500 mt-2">{error}</p>}
  </section>;
}
