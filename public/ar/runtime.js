/* The iframe owns A-Frame, its camera stream and WebGL context. */
(() => {
  let scene;
  let stopped = false;
  let initialized = false;
  let loadTimer;
  const send = (type, detail = {}) => parent.postMessage({ source: 'dinevista-ar', type, ...detail }, location.origin);
  const stop = () => {
    stopped = true;
    clearTimeout(loadTimer);
    try { scene?.systems['mindar-image-system']?.stop(); } catch (_) { /* May not have started yet. */ }
    document.querySelectorAll('video').forEach(video => {
      video.srcObject?.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    });
    scene?.pause();
  };
  const fail = (message) => { send('error', { message }); stop(); };
  const script = (src) => new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = resolve;
    el.onerror = () => reject(new Error('AR engine could not load. Check your connection and retry.'));
    document.head.appendChild(el);
  });

  async function start(modelUrl) {
    if (initialized) return;
    initialized = true;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      fail('Camera AR needs HTTPS and a browser with camera access. Open in Safari or Chrome.');
      return;
    }
    try {
      loadTimer = setTimeout(() => fail('AR loading timed out. Check your connection and camera permission, then retry.'), 90000);
      await script('https://aframe.io/releases/1.4.2/aframe.min.js');
      if (stopped) return;
      await script('https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image-aframe.prod.js');
      if (stopped) return;
      await script('/gesture-handler.js');
      if (stopped) return;
      scene = document.createElement('a-scene');
      scene.setAttribute('mindar-image', 'imageTargetSrc: /ar/targets.mind; autoStart: false; uiLoading: no; uiScanning: no; uiError: no;');
      scene.setAttribute('renderer', 'alpha: true; antialias: false; colorManagement: true; physicallyCorrectLights: true;');
      scene.setAttribute('vr-mode-ui', 'enabled: false');
      scene.setAttribute('device-orientation-permission-ui', 'enabled: false');
      scene.setAttribute('embedded', '');
      scene.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
      const camera = document.createElement('a-camera');
      camera.setAttribute('position', '0 0 0');
      camera.setAttribute('look-controls', 'enabled: false');
      scene.appendChild(camera);
      const target = document.createElement('a-entity');
      target.setAttribute('mindar-image-target', 'targetIndex: 0');
      target.addEventListener('targetFound', () => send('tracking', { found: true }));
      target.addEventListener('targetLost', () => send('tracking', { found: false }));
      // MindAR's image plane is XY. Rotate a Y-up GLB so its base rests on that plane.
      const pivot = document.createElement('a-entity');
      pivot.setAttribute('rotation', '90 0 0');
      pivot.setAttribute('gesture-handler', '');
      const model = document.createElement('a-gltf-model');
      let modelReady = false;
      let cameraReady = false;
      const ready = () => {
        if (modelReady && cameraReady && !stopped) { clearTimeout(loadTimer); send('ready'); }
      };
      model.addEventListener('model-loaded', () => {
        if (stopped) return;
        const mesh = model.getObject3D('mesh');
        const THREE = AFRAME.THREE;
        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3());
        const extent = Math.max(size.x, size.y, size.z);
        if (!Number.isFinite(extent) || extent <= 0) { fail('This model has no visible geometry.'); return; }
        const center = box.getCenter(new THREE.Vector3());
        const fit = 0.9 / extent;
        model.object3D.scale.setScalar(fit);
        model.object3D.position.set(-center.x * fit, -box.min.y * fit, -center.z * fit);
        modelReady = true;
        ready();
      });
      model.addEventListener('model-error', () => fail('The 3D model could not load. Check its public URL, GLB format and storage CORS settings.'));
      // Use the component object form: never interpolate untrusted URLs into HTML.
      model.setAttribute('gltf-model', modelUrl);
      pivot.appendChild(model);
      target.appendChild(pivot);
      scene.appendChild(target);
      scene.addEventListener('arReady', () => { cameraReady = true; ready(); });
      scene.addEventListener('arError', () => fail('Camera could not start. Allow camera access, close other camera apps and retry in Safari or Chrome.'));
      scene.addEventListener('loaded', async () => {
        if (stopped) return;
        scene.renderer?.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        try {
          await scene.systems['mindar-image-system'].start();
          if (stopped) stop();
        } catch (_) { fail('AR could not start. Check camera permission and your connection, then retry.'); }
      }, { once: true });
      document.body.appendChild(scene);
    } catch (error) { fail(error.message || 'AR could not start.'); }
  }
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent) return;
    if (event.data?.type === 'stop') stop();
    if (event.data?.type === 'init' && typeof event.data.modelUrl === 'string') start(event.data.modelUrl);
  });
  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && initialized && !stopped) { send('error', { message: 'Camera paused while the page was hidden. Tap Retry to resume.' }); stop(); }
  });
  window.addEventListener('ar-scale-change', event => send('scale', { scale: event.detail.scale }));
  send('boot');
})();
