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
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'hv2-book-zoom-close';
    close.textContent = expand.dataset.zoomClose;
    head.append(heading, close);

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
