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
    crypto: { randomUUID }, window: {}, localStorage: { getItem: () => null, setItem: () => { throw new Error('localStorage quota exceeded'); } }, Blob, File, DataView, URL, console, fetch, Map, btoa,
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

test('shared GLBs allow 78 MB and 100 MB, reject larger files, and explain global Storage limits', async () => {
  let rejectStorage = false;
  const db = {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'owner' } } } }) },
    storage: { from: () => ({ upload: async (_path, file, options) => {
      assert.equal(options.contentType, 'model/gltf-binary');
      assert.ok(file.size <= 100 * 1024 * 1024);
      return rejectStorage ? { error: { statusCode: '413', message: 'The object exceeded the maximum allowed size' } } : {};
    }, getPublicUrl: () => ({ data: { publicUrl: 'https://storage.example/scan.glb' } }) }) },
  };
  const { api } = load(true, db);
  const glb = size => {
    const header = new Uint8Array(12); const view = new DataView(header.buffer);
    view.setUint32(0, 0x46546c67, true); view.setUint32(4, 2, true); view.setUint32(8, size, true);
    return new File([header, new Uint8Array(size - 12)], 'scan.glb');
  };
  assert.equal(await api.uploadFile(glb(78 * 1024 * 1024), 'menu-models'), 'https://storage.example/scan.glb');
  assert.equal(await api.uploadFile(glb(100 * 1024 * 1024), 'menu-models'), 'https://storage.example/scan.glb');
  await assert.rejects(api.uploadFile({ size: 100 * 1024 * 1024 + 1 }, 'menu-models'), /Maximum size is 100 MB/);
  await assert.rejects(api.uploadFile({ size: 10 * 1024 * 1024 + 1 }, 'menu-images'), /Maximum size is 10 MB/);
  rejectStorage = true;
  await assert.rejects(api.uploadFile(glb(24), 'menu-models'), /Global file size limit to 100 MB/);
});

function triangleGltf(uri = 'mesh.bin') {
  return {
    asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    buffers: [{ uri, byteLength: 36 }], bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }],
  };
}
const triangleBytes = () => new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

test('glTF packs separate geometry/textures and the real Three.js loader reads its geometry', async () => {
  let uploaded;
  const db = {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'owner' } } } }) },
    storage: { from: () => ({ upload: async (_path, file, options) => {
      assert.equal(options.contentType, 'model/gltf+json');
      assert.equal(file.name.endsWith('.gltf'), true);
      uploaded = JSON.parse(await file.text()); return {};
    }, getPublicUrl: () => ({ data: { publicUrl: 'https://storage.example/dish.gltf' } }) }) },
  };
  const { api } = load(true, db);
  const doc = triangleGltf('geometry/mesh.bin');
  doc.images = [{ uri: 'textures/food%20photo.png' }];
  const url = await api.uploadModelFiles([
    new File(['texture'], 'food photo.png', { type: 'image/png' }),
    new File([JSON.stringify(doc)], 'dish.gltf'),
    new File([triangleBytes()], 'mesh.bin'),
  ]);
  assert.equal(url, 'https://storage.example/dish.gltf');
  assert.deepEqual(Buffer.from(uploaded.buffers[0].uri.split(',')[1], 'base64'), Buffer.from(triangleBytes().buffer));
  assert.equal(uploaded.images[0].uri, 'data:image/png;base64,dGV4dHVyZQ==');
  // Geometry smoke test against the same GLTFLoader used by the preview viewer.
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  global.ProgressEvent ||= class ProgressEvent { constructor(type, options) { this.type = type; Object.assign(this, options); } };
  const geometryDoc = { ...uploaded }; delete geometryDoc.images;
  const model = await new GLTFLoader().parseAsync(JSON.stringify(geometryDoc), '');
  assert.equal(model.scene.children[0].geometry.attributes.position.count, 3);
});

test('glTF local saves and shared import preserve format, while incomplete bundles fail before upload', async () => {
  const { api, saved } = load();
  const document = triangleGltf('data:application/octet-stream;base64,' + Buffer.from(triangleBytes().buffer).toString('base64'));
  const file = new File([JSON.stringify(document)], 'dish.gltf');
  const url = await api.uploadModelFiles([file]);
  const blob = saved.get(url.slice('dinevista-'.length));
  assert.equal(blob.type, 'model/gltf+json');
  const resolved = await api.resolveFile(url);
  assert.equal((await (await fetch(resolved)).json()).asset.version, '2.0'); URL.revokeObjectURL(resolved);
  await assert.rejects(api.uploadModelFiles([new File([JSON.stringify(triangleGltf())], 'missing.gltf')]), /mesh.bin/);
  await assert.rejects(api.uploadModelFiles([file, file]), /one GLB or glTF/);
  await assert.rejects(api.uploadModelFiles([new File(['not JSON'], 'bad.gltf')]), /valid glTF 2.0 JSON/);
  await assert.rejects(api.uploadModelFiles([new File(['{"asset":{"version":"1.0"}}'], 'old.gltf')]), /glTF 2.0 model/);
  await assert.rejects(api.uploadModelFiles([new File([JSON.stringify(triangleGltf())], 'wrong.gltf'), new File(['short'], 'mesh.bin')]), /byteLength/);
  await assert.rejects(api.uploadModelFiles([new File([JSON.stringify(triangleGltf('https://other.example/mesh.bin'))], 'remote.gltf')]), /local .bin/);
  let imported;
  const db = {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'owner' } } } }) },
    storage: { from: () => ({ upload: async (_path, model, options) => { assert.equal(model.name, 'import.gltf'); assert.equal(options.contentType, 'model/gltf+json'); imported = model; return {}; }, getPublicUrl: () => ({ data: { publicUrl: 'https://storage.example/import.gltf' } }) }) },
    from: () => ({ select: () => ({ eq: () => ({ order: async () => ({ data: [] }) }) }), upsert: async () => ({}) }),
  };
  const shared = load(true, db);
  shared.saved.set('asset:model', blob);
  shared.saved.set('dinevista_menu_items_v6', [{ id: 'gltf-dish', name: 'Dish', image_url: '/food.jpg', glb_model_url: 'dinevista-asset:model' }]);
  assert.equal(await shared.api.importLocalDishes('restaurant', () => {}), 1);
  assert.equal(JSON.parse(await imported.text()).asset.version, '2.0');
});
