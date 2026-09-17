/* Scale the unit pivot, leaving the GLB's fitted size and proportions intact. */
if (typeof AFRAME !== 'undefined' && !AFRAME.components['gesture-handler']) {
  AFRAME.registerComponent('gesture-handler', {
    schema: { minScale: { default: 0.25 }, maxScale: { default: 3 } },
    init: function () {
      this.distance = null;
      this.lastX = null;
      this.surface = this.el.sceneEl;
      this.begin = event => {
        const touches = event.touches;
        this.distance = touches.length === 2 ? Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY) : null;
        this.startScale = this.el.object3D.scale.x;
        this.lastX = touches.length === 1 ? touches[0].clientX : null;
      };
      this.move = event => {
        const touches = event.touches;
        if (touches.length === 2 && this.distance > 0) {
          event.preventDefault();
          const distance = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
          const scale = Math.max(this.data.minScale, Math.min(this.data.maxScale, this.startScale * distance / this.distance));
          this.el.setAttribute('scale', { x: scale, y: scale, z: scale });
          window.dispatchEvent(new CustomEvent('ar-scale-change', { detail: { scale } }));
        } else if (touches.length === 1 && this.lastX !== null) {
          event.preventDefault();
          this.el.object3D.rotateY((touches[0].clientX - this.lastX) * 0.008);
          this.lastX = touches[0].clientX;
        }
      };
      this.surface.addEventListener('touchstart', this.begin, { passive: false });
      this.surface.addEventListener('touchmove', this.move, { passive: false });
      this.surface.addEventListener('touchend', this.begin);
      this.surface.addEventListener('touchcancel', this.begin);
    },
    remove: function () {
      this.surface.removeEventListener('touchstart', this.begin);
      this.surface.removeEventListener('touchmove', this.move);
      this.surface.removeEventListener('touchend', this.begin);
      this.surface.removeEventListener('touchcancel', this.begin);
    }
  });
}
