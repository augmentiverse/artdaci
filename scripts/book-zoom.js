/* Focused, unclipped 3D book inspection. Reuse the original model viewer,
   keeping its camera state and the existing Smart TV toggle working. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    const book = document.querySelector('.hv2-smart-art > .hv2-book-hero');
    const expand = book && book.querySelector('.hv2-book-expand');
    if (!book || !expand) return;
    const dialog = document.createElement('dialog');
    if (typeof dialog.showModal !== 'function') {
      expand.hidden = true;
      return;
    }
    dialog.className = 'hv2-book-zoom-dialog';
    dialog.setAttribute('aria-modal', 'true');

    const head = document.createElement('div');
    head.className = 'hv2-book-zoom-head';
    const heading = document.createElement('h2');
    heading.id = 'artdaci-book-zoom-title';
    heading.textContent = expand.dataset.zoomTitle;
    dialog.setAttribute('aria-labelledby', heading.id);
    const model = book.querySelector('model-viewer');
    const initialOrbit = model ? model.getAttribute('camera-orbit') : '32deg 68deg 112%';
    const toolsBar = document.createElement('div');
    toolsBar.className = 'hv2-book-zoom-tools';
    toolsBar.setAttribute('role','group');
    const zoomIn = document.createElement('button');
    zoomIn.type = 'button';
    zoomIn.textContent = '+';
    zoomIn.setAttribute('aria-label', expand.dataset.zoomIn);
    const zoomOut = document.createElement('button');
    zoomOut.type = 'button';
    zoomOut.textContent = '−';
    zoomOut.setAttribute('aria-label', expand.dataset.zoomOut);
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = '↺';
    reset.setAttribute('aria-label', expand.dataset.zoomReset);
    toolsBar.append(zoomIn, zoomOut, reset);
    function scaleCamera(multiplier) {
      if (!model || typeof model.getCameraOrbit !== 'function') return;
      const orbit = model.getCameraOrbit();
      if (!Number.isFinite(orbit.radius) || orbit.radius <= 0) return;
      model.cameraOrbit = orbit.theta + 'rad ' + orbit.phi + 'rad ' + (orbit.radius * multiplier) + 'm';
      if (typeof model.jumpCameraToGoal === 'function') model.jumpCameraToGoal();
    }
    zoomIn.addEventListener('click', function () { scaleCamera(0.75); });
    zoomOut.addEventListener('click', function () { scaleCamera(1.33); });
    reset.addEventListener('click', function () {
      if (!model) return;
      model.cameraOrbit = initialOrbit;
      if (typeof model.jumpCameraToGoal === 'function') model.jumpCameraToGoal();
    });
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'hv2-book-zoom-close';
    close.textContent = expand.dataset.zoomClose;
    head.append(heading, toolsBar, close);

    const view = document.createElement('div');
    view.className = 'hv2-book-zoom-view';
    const hint = document.createElement('p');
    hint.className = 'hv2-book-zoom-hint';
    hint.textContent = expand.dataset.zoomHint;
    dialog.append(head, view, hint);
    document.body.append(dialog);

    const originalParent = book.parentNode;
    const placeholder = document.createComment('ARTDACI book original position');
    originalParent.insertBefore(placeholder, book);

    expand.addEventListener('click', function () {
      if (dialog.open) return;
      view.append(book);
      try {
        dialog.showModal();
        close.focus();
      } catch (error) {
        placeholder.after(book);
      }
    });
    close.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('close', function () {
      if (placeholder.isConnected) placeholder.after(book);
      if (expand.isConnected) expand.focus({ preventScroll: true });
    });
  });
})();
