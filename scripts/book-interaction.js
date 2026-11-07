/* ARTDACI book inline movement.
 * Rotating/zooming on the model remains handled by <model-viewer>.
 * This separate handle translates the visible book in its large viewing field.
 * No camera tracking, no background jobs and no external dependencies.
 */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    const stage = document.querySelector('.hv2-smart-art');
    const book = stage && stage.querySelector('.hv2-book-hero');
    const handle = book && book.querySelector('[data-book-move]');
    const reset = book && book.querySelector('[data-book-recenter]');
    if (!stage || !book || !handle || !reset) return;
    let x = 0, y = 0, drag = null;
    const limits = function () {
      const width = stage.getBoundingClientRect().width;
      const height = stage.getBoundingClientRect().height;
      return {
        x: Math.max(30, Math.min(170, width * (width < 690 ? .12 : .16))),
        y: Math.max(35, Math.min(110, height * .16))
      };
    };
    const setPan = function (nextX, nextY) {
      const max = limits();
      x = Math.min(max.x, Math.max(-max.x, nextX));
      y = Math.min(max.y, Math.max(-max.y, nextY));
      book.style.setProperty('--hv2-book-pan-x', x.toFixed(1) + 'px');
      book.style.setProperty('--hv2-book-pan-y', y.toFixed(1) + 'px');
    };
    handle.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      event.preventDefault();
      drag = { id:event.pointerId, startX:event.clientX, startY:event.clientY, x:x, y:y };
      handle.setPointerCapture(event.pointerId);
      handle.dataset.dragging = 'true';
    });
    handle.addEventListener('pointermove', function (event) {
      if (!drag || drag.id !== event.pointerId) return;
      setPan(drag.x + event.clientX - drag.startX, drag.y + event.clientY - drag.startY);
    });
    const finish = function (event) {
      if (drag && drag.id === event.pointerId) {
        drag = null;
        handle.removeAttribute('data-dragging');
        if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      }
    };
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
    handle.addEventListener('lostpointercapture', function () {
      drag = null;
      handle.removeAttribute('data-dragging');
    });
    handle.addEventListener('keydown', function (event) {
      const step = event.shiftKey ? 35 : 16;
      if (event.key === 'ArrowLeft') setPan(x - step,y);
      else if (event.key === 'ArrowRight') setPan(x + step,y);
      else if (event.key === 'ArrowUp') setPan(x,y - step);
      else if (event.key === 'ArrowDown') setPan(x,y + step);
      else return;
      event.preventDefault();
    });
    reset.addEventListener('click', function () { setPan(0,0); });
    window.addEventListener('resize', function () { setPan(x,y); }, {passive:true});
  });
})();
