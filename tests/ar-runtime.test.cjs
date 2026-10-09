const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const THREE = require('three');

test('AR runtime preserves model materials/proportions, bounds rendering and stops its resources', async () => {
  const elements = []; const messages = []; const handlers = new Map();
  let scene; let cameraStopped = false; let trackingStopped = false; let paused = false;
  class Element {
    constructor(tag) { this.tag = tag; this.attrs = {}; this.handlers = {}; this.style = {}; this.object3D = new THREE.Object3D(); elements.push(this); }
    setAttribute(name, value) { this.attrs[name] = value; }
    addEventListener(name, handler) { this.handlers[name] = handler; }
    appendChild() {}
    getObject3D() { return this.mesh; }
  }
  const material = new THREE.MeshStandardMaterial({ color: 0x997744, roughness: 0.6, metalness: 0.2 });
  const texture = new THREE.Texture(); material.map = texture;
  const original = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4), material);
  const pixelRatios = [];
  const window = { isSecureContext: true, devicePixelRatio: 3, innerWidth: 400, innerHeight: 800,
    addEventListener: (name, fn) => handlers.set(name, fn), removeEventListener: name => handlers.delete(name) };
  const document = {
    createElement: tag => { const el = new Element(tag); if (tag === 'a-scene') {
      scene = el; scene.renderer = { capabilities: { getMaxAnisotropy: () => 16 }, setPixelRatio: value => pixelRatios.push(value) };
      scene.systems = { 'mindar-image-system': { start: async () => {}, stop: () => { trackingStopped = true; } } };
      scene.pause = () => { paused = true; };
    } if (tag === 'a-gltf-model') el.mesh = original; return el; },
    head: { appendChild: el => el.onload() }, body: { appendChild: () => {} }, addEventListener: () => {},
    querySelectorAll: () => [{ srcObject: { getTracks: () => [{ stop: () => { cameraStopped = true; } }] } }],
  };
  const parent = { postMessage: message => messages.push(message) };
  vm.runInNewContext(fs.readFileSync('public/ar/runtime.js', 'utf8'), { window, document, navigator: { mediaDevices: { getUserMedia() {} } }, AFRAME: { THREE }, parent, location: { origin: 'https://dinevista.test' }, setTimeout, clearTimeout, Math, Object });
  handlers.get('message')({ origin: 'https://dinevista.test', source: parent, data: { type: 'init', modelUrl: '/dish.glb' } });
  await new Promise(resolve => setImmediate(resolve));
  await scene.handlers.loaded();
  const model = elements.find(el => el.tag === 'a-gltf-model');
  model.handlers['model-loaded']();
  scene.handlers.arReady();
  assert.ok(messages.some(message => message.type === 'ready'));
  assert.equal(model.object3D.scale.x, 0.225);
  assert.equal(model.object3D.scale.y, model.object3D.scale.z);
  assert.equal(original.material, material);
  assert.equal(material.color.getHex(), 0x997744);
  assert.equal(material.roughness, 0.6);
  assert.equal(texture.anisotropy, 4);
  assert.equal(pixelRatios.at(-1), 2);
  window.innerWidth = 2000; window.innerHeight = 1500; handlers.get('resize')();
  assert.equal(pixelRatios.at(-1), 1);
  handlers.get('message')({ origin: 'https://dinevista.test', source: parent, data: { type: 'stop' } });
  assert.ok(cameraStopped && trackingStopped && paused);
  assert.equal(handlers.has('resize'), false);
  original.geometry.dispose(); material.dispose(); texture.dispose();
});
