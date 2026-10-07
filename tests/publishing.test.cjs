const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { randomUUID } = require('node:crypto');

function load(configured = false) {
  const saved = new Map();
  const module = { exports: {} };
  const database = { from: () => ({ insert: () => ({ select: () => ({ single: async () => ({ error: { message: 'RLS denied' } }) }) }) }) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/supabase.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
    module, exports: module.exports, process: { env: configured ? { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test' } : {} },
    require: name => name === './local-store' ? { localStore: async (key, value) => { if (value !== undefined) saved.set(key, value); return saved.get(key); } } : { createClient: () => database },
    crypto: { randomUUID }, window: {}, localStorage: { getItem: () => null, setItem: () => { throw new Error('localStorage quota exceeded'); } }, Blob, File, DataView, URL, console,
  });
  return { api: module.exports.api, saved };
}
test('large binary GLB publishes, resolves after reload, updates, and empty menus stay empty', async () => {
  const { api } = load();
  const bytes = new Uint8Array(8 * 1024 * 1024);
  const view = new DataView(bytes.buffer); view.setUint32(0, 0x46546c67, true); view.setUint32(4, 2, true); view.setUint32(8, bytes.length, true);
  const url = await api.uploadFile(new File([bytes], 'scan.glb'), 'menu-models');
  assert.match(url, /^dinevista-asset:/);
  const item = await api.addMenuItem({ restaurant_id: 'rest-dinevista-001', name: 'Fruit dish', description: '', price: 0, image_url: '/images/burger.jpg', glb_model_url: url });
  assert.equal((await api.getMenuItems()).find(d => d.id === item.id).glb_model_url, url);
  const resolved = await api.resolveFile(url);
  assert.equal((await (await fetch(resolved)).blob()).size, bytes.length); URL.revokeObjectURL(resolved);
  const marker = await api.addMarker({ restaurant_id: item.restaurant_id, name: 'My marker', image_url: '/images/burger.jpg', target_url: url });
  await api.updateMenuItem({ ...item, marker_id: marker.id });
  assert.equal((await api.getMenuItems()).find(d => d.id === item.id).marker_id, marker.id);
  assert.equal((await api.getMarkers(item.restaurant_id)).at(-1).id, marker.id);
  for (const dish of await api.getMenuItems()) await api.deleteMenuItem(dish.id);
  assert.equal((await api.getMenuItems()).length, 0);
  await assert.rejects(api.uploadFile(new File(['bad'], 'bad.glb'), 'menu-models'), /valid self-contained GLB/);
  await assert.rejects(api.resolveFile('dinevista-asset:missing'), /unavailable/);
});
test('configured backend errors never pretend to publish locally', async () => {
  const { api, saved } = load(true);
  await assert.rejects(api.addMenuItem({ restaurant_id: 'uuid', name: 'Dish', price: 1, image_url: '', glb_model_url: '' }), /RLS denied/);
  assert.equal(saved.size, 0);
});
