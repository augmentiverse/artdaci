/* ARTDACI Spatial Depth.
   Desktop: pointer tilt and keyboard arrows.
   Touch-only mobile: slow automatic 3D motion while visible, and optional
   touch drag on the card. No gyroscope permissions, tracking or timers. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(hover: none) and (pointer: coarse)');

  document.querySelectorAll('[data-spatial-depth]').forEach(panel => {
    const scene = panel.querySelector('.sd-scene');
    const card = panel.querySelector('.sd-card');
    if (!scene || !card) return;

    let x = .4;
    let y = .4;
    let touchId = null;
    let visible = !('IntersectionObserver' in window);
    const clamp = value => Math.max(-1, Math.min(1, value));

    function apply(px, py) {
      if (reducedMotion.matches) return;
      card.style.setProperty('--sd-rx', String(-py * 18) + 'deg');
      card.style.setProperty('--sd-ry', String(px * 22) + 'deg');
    }

    function syncAmbient() {
      scene.classList.toggle(
        'sd-mobile-ambient',
        coarsePointer.matches && !reducedMotion.matches && visible &&
          !document.hidden && touchId === null && !card.matches(':focus-visible')
      );
    }

    function reset() {
      x = .4;
      y = .4;
      if (touchId === null && !reducedMotion.matches) apply(x, y);
    }

    function updateFromPointer(event) {
      const rect = scene.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      x = clamp((event.clientX - rect.left) / rect.width * 2 - 1);
      y = clamp((event.clientY - rect.top) / rect.height * 2 - 1);
      apply(x, y);
    }

    scene.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch' || reducedMotion.matches || event.target.closest('a, button')) return;
      touchId = event.pointerId;
      card.classList.add('sd-touch-active');
      syncAmbient();
      if (scene.setPointerCapture) {
        try { scene.setPointerCapture(event.pointerId); } catch (_) {}
      }
      updateFromPointer(event);
    }, { passive: true });

    scene.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') {
        if (touchId === event.pointerId) updateFromPointer(event);
        return;
      }
      if (touchId === null && (event.pointerType === 'mouse' || event.pointerType === 'pen')) {
        updateFromPointer(event);
      }
    }, { passive: true });

    function finishTouch(event) {
      if (touchId !== event.pointerId) return;
      touchId = null;
      card.classList.remove('sd-touch-active');
      card.style.removeProperty('--sd-rx');
      card.style.removeProperty('--sd-ry');
      syncAmbient();
    }
    scene.addEventListener('pointerup', finishTouch);
    scene.addEventListener('pointercancel', finishTouch);
    scene.addEventListener('pointerleave', () => {
      if (touchId === null && !coarsePointer.matches) reset();
    });

    card.addEventListener('keydown', event => {
      if (event.target !== card || reducedMotion.matches || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      scene.classList.remove('sd-mobile-ambient');
      if (event.key === 'ArrowLeft') x -= .15;
      if (event.key === 'ArrowRight') x += .15;
      if (event.key === 'ArrowUp') y -= .15;
      if (event.key === 'ArrowDown') y += .15;
      x = clamp(x);
      y = clamp(y);
      apply(x, y);
    });
    card.addEventListener('focus', syncAmbient);
    card.addEventListener('blur', () => { reset(); syncAmbient(); });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        syncAmbient();
      }, { threshold: .08 });
      observer.observe(scene);
    }
    const onMediaChange = () => { if (reducedMotion.matches) reset(); syncAmbient(); };
    for (const media of [reducedMotion, coarsePointer]) {
      if (media.addEventListener) media.addEventListener('change', onMediaChange);
      else if (media.addListener) media.addListener(onMediaChange);
    }
    document.addEventListener('visibilitychange', syncAmbient);
    syncAmbient();
  });
})();
