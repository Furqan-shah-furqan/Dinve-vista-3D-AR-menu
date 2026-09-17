const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

test('pinch scales uniformly, clamps, transitions to drag and removes listeners', () => {
  let definition;
  const listeners = new Map();
  const events = [];
  vm.runInNewContext(fs.readFileSync('public/gesture-handler.js', 'utf8'), {
    AFRAME: { components: {}, registerComponent: (_, component) => { definition = component; } },
    window: { dispatchEvent: e => events.push(e) },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  });
  let angle = 0;
  const scale = { x: 1, y: 1, z: 1 };
  const instance = { ...definition, data: { minScale: 0.25, maxScale: 3 }, el: {
    sceneEl: { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: (name, fn) => { assert.equal(listeners.get(name), fn); listeners.delete(name); } },
    object3D: { scale, rotateY: value => { angle += value; } },
    setAttribute: (name, value) => { assert.equal(name, 'scale'); Object.assign(scale, value); }
  } };
  instance.init();
  const event = xs => ({ touches: xs.map(clientX => ({ clientX, clientY: 0 })), preventDefault() {} });
  instance.begin(event([0, 100]));
  instance.move(event([0, 200]));
  assert.deepEqual(scale, { x: 2, y: 2, z: 2 });
  instance.move(event([0, 1000]));
  assert.equal(scale.x, 3);
  instance.begin(event([0, 100]));
  instance.move(event([0, 1]));
  assert.equal(scale.x, 0.25);
  instance.begin(event([40]));
  instance.move(event([50]));
  assert.equal(angle, 0.08);
  instance.begin(event([]));
  assert.equal(instance.lastX, null);
  assert.equal(events.at(-1).detail.scale, 0.25);
  instance.remove();
  assert.equal(listeners.size, 0);
});
