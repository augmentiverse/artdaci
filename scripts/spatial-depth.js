/* Progressive enhancement for the ARTDACI Spatial Depth card.
   Pointer tilt uses only local coordinates; no camera, sensors, tracking or network. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-spatial-depth]').forEach(panel => {
    const scene = panel.querySelector('.sd-scene');
    const card = panel.querySelector('.sd-card');
    if (!scene || !card) return;
    let x = .4, y = .4;
    const reset = () => {
      x = .4; y = .4;
      if (!reducedMotion.matches) apply(x,y);
    };
    function apply(px, py) {
      if (reducedMotion.matches) return;
      card.style.setProperty('--sd-rx', String(-py * 18) + 'deg');
      card.style.setProperty('--sd-ry', String(px * 22) + 'deg');
    }
    scene.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      const r = scene.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
      y = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
      apply(x, y);
    }, { passive: true });
    scene.addEventListener('pointerleave', reset);
    card.addEventListener('keydown', e => {
      if (reducedMotion.matches || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      if (e.key === 'ArrowLeft') x -= .15;
      if (e.key === 'ArrowRight') x += .15;
      if (e.key === 'ArrowUp') y -= .15;
      if (e.key === 'ArrowDown') y += .15;
      x = Math.max(-1,Math.min(1,x));
      y = Math.max(-1,Math.min(1,y));
      apply(x, y);
    });
    card.addEventListener('blur', reset);
  });
})();
