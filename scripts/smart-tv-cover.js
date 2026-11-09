/* ARTDACI Smart TV cover: prefer a static image on TV browsers.
   Override with ?tv=1 or ?tv=0, saved for subsequent visits. */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var override = params.get('tv');
  try { if (override === '1' || override === '0') localStorage.setItem('artdaci-tv-mode', override); else override = localStorage.getItem('artdaci-tv-mode'); } catch (_) {}
  var ua = navigator.userAgent || '';
  var tv = override === '1' || (override !== '0' && /SmartTV|Smart-TV|Tizen|Web0S|WebOS|NetCast|HbbTV|BRAVIA|GoogleTV|Android TV|AFTT|AppleTV|Roku|Viera|VIDAA|Hisense|PhilipsTV|TV Safari/i.test(ua));
  document.documentElement.classList.toggle('artdaci-tv', tv);
  window.ARTDACI_TV_MODE = tv;
  document.addEventListener('DOMContentLoaded', function () {
    var hero = document.querySelector('.hv2-book-hero');
    if (!hero) return;
    var model = hero.querySelector('model-viewer');
    var cover = hero.querySelector('.hv2-tv-book-cover');
    var toggle = hero.querySelector('.hv2-tv-toggle');
    // Only fetch the Web Component when the 3D experience is near the viewport.
    // TV cover mode still avoids it entirely unless visitors switch to 3D.
    var modelObserver = null;
    if (model && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      model.removeAttribute('auto-rotate');
    }
    function loadModel() {
      if (!model || customElements.get('model-viewer') || document.querySelector('script[data-artdaci-model-viewer]')) return;
      var script = document.createElement('script');
      script.type = 'module';
      script.src = 'vendor/model-viewer.min.js?v=3.5.0';
      script.dataset.artdaciModelViewer = '1';
      document.head.appendChild(script);
    }
    function scheduleModel() {
      if (!model || customElements.get('model-viewer')) return;
      if (!('IntersectionObserver' in window)) { loadModel(); return; }
      if (modelObserver) return;
      var observer = new IntersectionObserver(function (entries) {
        if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
        observer.disconnect();
        if (modelObserver === observer) modelObserver = null;
        if (!document.documentElement.classList.contains('artdaci-tv')) loadModel();
      }, { rootMargin: '350px 0px' });
      modelObserver = observer;
      observer.observe(hero);
    }
    function activate(enabled, userInitiated) {
      document.documentElement.classList.toggle('artdaci-tv', enabled);
      if (enabled && modelObserver) { modelObserver.disconnect(); modelObserver = null; }
      if (!enabled) {
        if (userInitiated) {
          if (modelObserver) { modelObserver.disconnect(); modelObserver = null; }
          loadModel();
        } else {
          scheduleModel();
        }
      }
      if (toggle) {
        toggle.textContent = enabled ? toggle.dataset.show3d : toggle.dataset.showCover;
        toggle.setAttribute('aria-pressed', String(enabled));
      }
    }
    if (cover) {
      cover.addEventListener('error', function () { activate(false); if (toggle) toggle.hidden = true; }, { once: true });
      if (tv && cover.complete && cover.naturalWidth === 0) activate(false);
    }
    if (toggle) toggle.addEventListener('click', function () {
      var next = !document.documentElement.classList.contains('artdaci-tv');
      try { localStorage.setItem('artdaci-tv-mode', next ? '1' : '0'); } catch (_) {}
      activate(next, true);
    });
    activate(tv);
  });
})();