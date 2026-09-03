/**
 * Custom A-Frame Gesture Handler Component for MindAR 3D Food Models
 * Enables two-finger pinch-to-zoom scaling and single-finger 360-degree rotation.
 */
if (typeof window !== 'undefined') {
  const registerGestureHandler = () => {
    if (typeof window.AFRAME === 'undefined') {
      setTimeout(registerGestureHandler, 100);
      return;
    }

    if (window.AFRAME.components['gesture-handler']) {
      return;
    }

    window.AFRAME.registerComponent('gesture-handler', {
      schema: {
        enabled: { default: true },
        rotationFactor: { default: 5 },
        minScale: { default: 0.2 },
        maxScale: { default: 3.5 },
      },

      init: function () {
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        this.initialDistance = null;
        this.initialScale = { x: 1, y: 1, z: 1 };
        this.currentScale = 1;
        this.initialTouchX = 0;
        this.initialRotationY = 0;
        this.targetEl = null;

        window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        window.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
      },

      remove: function () {
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
        window.removeEventListener('touchcancel', this.handleTouchEnd);
      },

      getTarget: function () {
        if (!this.targetEl) {
          this.targetEl = this.el.querySelector('a-gltf-model') || this.el;
        }
        return this.targetEl;
      },

      getTouchDistance: function (touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      },

      handleTouchStart: function (e) {
        if (!this.data.enabled) return;
        const target = this.getTarget();
        if (!target) return;

        if (e.touches.length === 2) {
          this.initialDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
          const currentScaleAttr = target.getAttribute('scale');
          if (currentScaleAttr) {
            this.initialScale = {
              x: currentScaleAttr.x || 1,
              y: currentScaleAttr.y || 1,
              z: currentScaleAttr.z || 1,
            };
          }
        } else if (e.touches.length === 1) {
          this.initialTouchX = e.touches[0].clientX;
          const currentRotAttr = target.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
          this.initialRotationY = currentRotAttr.y || 0;
        }
      },

      handleTouchMove: function (e) {
        if (!this.data.enabled) return;
        const target = this.getTarget();
        if (!target) return;

        if (e.touches.length === 2 && this.initialDistance) {
          e.preventDefault();
          const currentDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
          
          if (currentDistance > 0 && this.initialDistance > 0) {
            const scaleFactor = currentDistance / this.initialDistance;
            
            const newScaleX = Math.max(
              this.data.minScale,
              Math.min(this.data.maxScale, this.initialScale.x * scaleFactor)
            );
            const newScaleY = Math.max(
              this.data.minScale,
              Math.min(this.data.maxScale, this.initialScale.y * scaleFactor)
            );
            const newScaleZ = Math.max(
              this.data.minScale,
              Math.min(this.data.maxScale, this.initialScale.z * scaleFactor)
            );

            target.setAttribute('scale', {
              x: newScaleX,
              y: newScaleY,
              z: newScaleZ,
            });

            window.dispatchEvent(
              new CustomEvent('ar-scale-change', {
                detail: { scale: newScaleX },
              })
            );
          }
        } else if (e.touches.length === 1 && this.initialTouchX !== null) {
          const deltaX = e.touches[0].clientX - this.initialTouchX;
          const newRotationY = (this.initialRotationY + deltaX * (this.data.rotationFactor / 10)) % 360;

          const currentRot = target.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
          target.setAttribute('rotation', {
            x: currentRot.x || 0,
            y: newRotationY,
            z: currentRot.z || 0,
          });
        }
      },

      handleTouchEnd: function (e) {
        if (e.touches.length < 2) {
          this.initialDistance = null;
        }
        if (e.touches.length === 1) {
          this.initialTouchX = e.touches[0].clientX;
          const target = this.getTarget();
          if (target) {
            const rot = target.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
            this.initialRotationY = rot.y || 0;
          }
        } else {
          this.initialTouchX = null;
        }
      },
    });
  };

  registerGestureHandler();
}
