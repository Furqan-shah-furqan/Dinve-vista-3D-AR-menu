/* The iframe owns A-Frame, its camera stream and WebGL context. */
(() => {
  let scene;
  let stopped = false;
  let initialized = false;
  let loadTimer;
  let resizeQuality;
  const send = (type, detail = {}) => parent.postMessage({ source: 'dinevista-ar', type, ...detail }, location.origin);
  const stop = () => {
    stopped = true;
    clearTimeout(loadTimer);
    if (resizeQuality) window.removeEventListener('resize', resizeQuality);
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

  async function start(modelUrl, targetUrl = '/ar/targets.mind') {
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
      scene.setAttribute('mindar-image', { imageTargetSrc: targetUrl, autoStart: false, maxTrack: 1, filterMinCF: 0.001, filterBeta: 100, warmupTolerance: 8, missTolerance: 8, uiLoading: 'no', uiScanning: 'no', uiError: 'no' });
      scene.setAttribute('renderer', 'alpha: true; antialias: true; colorManagement: true; physicallyCorrectLights: true; toneMapping: ACESFilmic; exposure: 1;');
      scene.setAttribute('vr-mode-ui', 'enabled: false');
      scene.setAttribute('device-orientation-permission-ui', 'enabled: false');
      scene.setAttribute('embedded', '');
      scene.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
      const camera = document.createElement('a-camera');
      camera.setAttribute('position', '0 0 0');
      camera.setAttribute('look-controls', 'enabled: false');
      scene.appendChild(camera);
      // Explicit studio lighting replaces A-Frame's automatic default lights.
      const hemisphere = document.createElement('a-entity');
      hemisphere.setAttribute('light', 'type: hemisphere; color: #ffffff; groundColor: #7c8490; intensity: 1.5');
      scene.appendChild(hemisphere);
      const key = document.createElement('a-entity');
      key.setAttribute('light', 'type: directional; color: #fff5e8; intensity: 2.5');
      key.setAttribute('position', '2 3 2');
      scene.appendChild(key);
      const fill = document.createElement('a-entity');
      fill.setAttribute('light', 'type: directional; color: #e5efff; intensity: 0.6');
      fill.setAttribute('position', '-2 1 1');
      scene.appendChild(fill);
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
        const anisotropy = Math.min(4, scene.renderer.capabilities.getMaxAnisotropy());
        mesh.traverse(object => {
          if (!object.isMesh) return;
          for (const material of [].concat(object.material || [])) {
            for (const value of Object.values(material)) if (value?.isTexture) {
              value.anisotropy = anisotropy;
              value.needsUpdate = true;
            }
          }
        });
        // Measure in model space, before the marker and table rotation are applied.
        const box = new THREE.Box3().setFromObject(mesh.clone(true));
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
      model.addEventListener('model-error', () => fail('The 3D model could not load. Check its public URL, GLB/glTF format and storage CORS settings.'));
      // Use the component object form: never interpolate untrusted URLs into HTML.
      model.setAttribute('gltf-model', modelUrl);
      pivot.appendChild(model);
      target.appendChild(pivot);
      scene.appendChild(target);
      scene.addEventListener('arReady', () => { cameraReady = true; ready(); });
      scene.addEventListener('arError', () => fail('Camera could not start. Allow camera access, close other camera apps and retry in Safari or Chrome.'));
      scene.addEventListener('loaded', async () => {
        if (stopped) return;
        // Bound the render workload so sharper output does not mean a 4K mobile canvas.
        resizeQuality = () => {
          const pixels = Math.max(1, window.innerWidth * window.innerHeight);
          scene.renderer?.setPixelRatio(Math.max(1, Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2000000 / pixels))));
        };
        resizeQuality();
        window.addEventListener('resize', resizeQuality);

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
    if (event.data?.type === 'init' && typeof event.data.modelUrl === 'string') start(event.data.modelUrl, event.data.targetUrl);
  });
  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && initialized && !stopped) { send('error', { message: 'Camera paused while the page was hidden. Tap Retry to resume.' }); stop(); }
  });
  window.addEventListener('ar-scale-change', event => send('scale', { scale: event.detail.scale }));
  send('boot');
})();
