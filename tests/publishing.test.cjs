const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { randomUUID } = require('node:crypto');

function load(configured = false, customDatabase) {
  const saved = new Map();
  const module = { exports: {} };
  const database = customDatabase || { from: () => ({ insert: () => ({ select: () => ({ single: async () => ({ error: { message: 'RLS denied' } }) }) }) }) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/supabase.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
    module, exports: module.exports, process: { env: configured ? { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test' } : {} },
    require: name => name === './local-store' ? { localStore: async (key, value) => { if (value !== undefined) saved.set(key, value); return saved.get(key); } } : { createClient: () => database },
    crypto: { randomUUID }, window: {}, localStorage: { getItem: () => null, setItem: () => { throw new Error('localStorage quota exceeded'); } }, Blob, File, DataView, URL, console, fetch, Map,
  });
  return { api: module.exports.api, saved };
}
test('large binary GLB publishes, resolves after reload, updates, and empty menus stay empty', async () => {
  const { api } = load();
  const bytes = new Uint8Array(8 * 1024 * 1024);
  const view = new DataView(bytes.buffer); view.setUint32(0, 0x46546c67, true); view.setUint32(4, 2, true); view.setUint32(8, bytes.length, true);
  const url = await api.uploadFile(new File([bytes], 'scan.glb'), 'menu-models');
  assert.match(url, /^dinevista-asset:/);
  const stored = (await api.resolveFile(url));
  assert.equal((await (await fetch(stored)).blob()).type, 'application/octet-stream'); URL.revokeObjectURL(stored);
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
test('native file clone / transaction errors reject instead of leaving uploads pending', async () => {
  const module = { exports: {} };
  let closed = false;
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/local-store.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    module, exports: module.exports, Error,
    indexedDB: { open: () => {
      const request = { result: { close: () => { closed = true; }, transaction: () => { throw new Error('File could not be cloned'); } } };
      queueMicrotask(() => request.onsuccess()); return request;
    } },
  });
  await assert.rejects(Promise.race([module.exports.localStore('asset:test', new Blob(['test'])), new Promise((_, reject) => setTimeout(() => reject(new Error('upload stayed pending')), 100))]), /File could not be cloned/);
  assert.equal(closed, true);
});
test('configured backend errors never pretend to publish locally', async () => {
  const { api, saved } = load(true);
  await assert.rejects(api.addMenuItem({ restaurant_id: 'uuid', name: 'Dish', price: 1, image_url: '', glb_model_url: '' }), /RLS denied/);
  assert.equal(saved.size, 0);
});

test('legacy menu links use the shared restaurant and empty results stay empty', async () => {
  const filters = [];
  const db = { from: table => ({ select: () => ({ eq: (key, value) => {
    filters.push([table, key, value]);
    return { single: async () => ({ data: { id: 'real-uuid', slug: 'dinevista-lounge' } }), order: async () => ({ data: [] }) };
  } }) }) };
  const { api, saved } = load(true, db);
  assert.equal((await api.getMenuItems('rest-dinevista-001')).length, 0);
  assert.equal(filters[0][2], 'dinevista-lounge');
  assert.equal(filters[1][2], 'real-uuid');
  assert.equal(saved.size, 0);
});
test('local import uploads binary assets and preserves shared IDs on repeat imports', async () => {
  let rows; let uploads = 0;
  const bytes = new Uint8Array(24);
  const header = new DataView(bytes.buffer); header.setUint32(0, 0x46546c67, true); header.setUint32(4, 2, true); header.setUint32(8, bytes.length, true);
  const db = {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'owner' } } } }) },
    storage: { from: bucket => ({ upload: async (path, file, options) => { uploads++; assert.equal(bucket, 'menu-models'); assert.equal(options.contentType, 'model/gltf-binary'); assert.match(path, /^owner\//); return {}; }, getPublicUrl: () => ({ data: { publicUrl: 'https://storage.example/model.glb' } }) }) },
    from: () => ({ select: () => ({ eq: () => ({ order: async () => ({ data: [{ id: 'shared-id', legacy_id: 'local-id' }] }) }) }), upsert: async (data, options) => { rows = data; assert.equal(options.onConflict, 'restaurant_id,legacy_id'); return {}; } }),
  };
  const { api, saved } = load(true, db);
  saved.set('asset:test', new Blob([bytes]));
  const local = { id: 'local-id', restaurant_id: 'rest-dinevista-001', name: 'Scan dish', description: '', price: 1, image_url: '/images/burger.jpg', glb_model_url: 'dinevista-asset:test' };
  saved.set('dinevista_menu_items_v6', [local]);
  assert.equal(await api.importLocalDishes('restaurant-uuid', () => {}), 1);
  assert.equal(rows[0].id, 'shared-id'); assert.equal(rows[0].glb_model_url, 'https://storage.example/model.glb');
  assert.equal(rows[0].restaurant_id, 'restaurant-uuid'); assert.equal(uploads, 1);
  assert.equal(saved.get('dinevista_menu_items_v6')[0].glb_model_url, 'dinevista-asset:test');
  saved.delete('asset:test');
  await assert.rejects(api.importLocalDishes('restaurant-uuid', () => {}), /missing/);
});
