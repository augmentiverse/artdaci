/* ARTDACI — display-only removal of photographic frames around artworks.
   Applied to the 24 Painting Index images and the primary paintings of
   printable notices, never to VR, AR tracking, museum photos or close-look
   coordinates. Source files remain immutable. */
(() => {
  "use strict";

  // Artwork files already cropped and confirmed, or direct museum painting
  // images not packaged with a decorative border. Never crop these.
  const unframed = new Set([
    "lady-with-an-ermine", "belle-ferronniere", "pont-d-argenteuil",
    "van-gogh", "van-gogh-bedroom", "woman-with-parasol",
    "view-of-delft"
  ]);

  // The first three have measured painted-area boundaries from the existing
  // ARTDACI art-first section (top, right, bottom, left).
  const measured = {
    "mona-lisa": [.10, .131, .10, .131],
    "vermeer-girl-with-a-pearl-earring": [.131, .135, .166, .135],
    "monet-impression-sunrise": [.13, .102, .15, .102]
  };

  // Conservative fallback used only with framed collection reproductions
  // when the automatic inner-edge locator cannot identify four clean edges.
  const fallback = {
    "last-supper": [.055, .065, .055, .065],
    "annunciation": [.085, .085, .085, .085],
    "ginevra-de-benci": [.105, .105, .105, .105],
    "vermeer-milkmaid": [.095, .095, .095, .095],
    "art-of-painting": [.095, .095, .095, .095],
    "vermeer-astronomer": [.095, .095, .095, .095],
    "woman-holding-balance": [.095, .095, .095, .095],
    "starry-night": [.08, .08, .08, .08],
    "sunflowers": [.095, .095, .095, .095],
    "cafe-terrace": [.085, .085, .085, .085],
    "night-cafe": [.085, .085, .085, .085],
    "water-lilies": [.07, .075, .07, .075],
    "japanese-bridge": [.075, .08, .075, .08],
    "poppies": [.075, .08, .075, .08]
  };

  const images = new WeakSet();
  const urls = new Set();
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const median = list => {
    const sorted = list.slice().sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] || 0;
  };

  function locateFrame(img) {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (width < 75 || height < 75) return null;
    const factor = Math.min(1, 360 / Math.max(width, height));
    const w = Math.round(width * factor), h = Math.round(height * factor);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext("2d", {willReadFrequently:true});
    if (!context) return null;
    context.drawImage(img, 0, 0, w, h);
    const pixels = context.getImageData(0, 0, w, h).data;

    const difference = (ax, ay, bx, by) => {
      const a = (ay * w + ax) * 4, b = (by * w + bx) * 4;
      return (Math.abs(pixels[a]-pixels[b]) +
        Math.abs(pixels[a+1]-pixels[b+1]) +
        Math.abs(pixels[a+2]-pixels[b+2])) / 3;
    };
    const profile = (side, axis) => {
      const size = axis === "x" ? w : h;
      const other = axis === "x" ? h : w;
      const low = side === "start" ? Math.round(size*.035) : Math.round(size*.76);
      const high = side === "start" ? Math.round(size*.24) : Math.round(size*.965);
      const result = [];
      for (let k = Math.max(3,low); k < Math.min(size-3,high); k++) {
        let score = 0, count = 0;
        for (let t=Math.round(other*.28); t<Math.round(other*.72); t+=2) {
          score += axis === "x" ? difference(k-2,t,k+2,t)
                                : difference(t,k-2,t,k+2);
          count++;
        }
        if (count) result.push({k,score:score/count});
      }
      if (!result.length) return null;
      const baseline = median(result.map(item=>item.score));
      const candidates = result.filter(p =>
        p.score >= Math.max(7,baseline*1.65));
      if (!candidates.length) return null;
      const best = candidates.reduce((a,b)=>a.score>b.score?a:b);
      return {position:best.k/size, confidence:best.score/Math.max(1,baseline)};
    };

    const left=profile("start","x"), right=profile("end","x");
    const top=profile("start","y"), bottom=profile("end","y");
    const good=[left,right,top,bottom].filter(Boolean).length;
    if (good < 3) return null;
    const t=top?.position ?? (1-bottom.position);
    const r=right ? (1-right.position) : left.position;
    const b=bottom ? (1-bottom.position) : top.position;
    const l=left?.position ?? (1-right.position);
    if ([t,r,b,l].some(v=>v<.025||v>.235)) return null;
    if (Math.abs(l-r)>.105 || Math.abs(t-b)>.12) return null;
    if (t+b>.4 || l+r>.4) return null;
    const pad=.004;
    return [t+pad,r+pad,b+pad,l+pad];
  }

  function createCroppedBlob(img, bounds, callback) {
    const [top,right,bottom,left] = bounds;
    const sx = Math.round(img.naturalWidth * left);
    const sy = Math.round(img.naturalHeight * top);
    const sw = img.naturalWidth - sx - Math.round(img.naturalWidth * right);
    const sh = img.naturalHeight - sy - Math.round(img.naturalHeight * bottom);
    if (sw < 50 || sh < 50) return;
    const canvas = document.createElement("canvas");
    canvas.width = sw; canvas.height = sh;
    const ctx=canvas.getContext("2d",{alpha:false});
    if (!ctx) return;
    ctx.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
    canvas.toBlob(blob => {
      canvas.width = 0; canvas.height = 0;
      if (blob) callback(blob);
    }, "image/webp", .93);
  }

  function prepare(img) {
    if (images.has(img)) return;
    images.add(img);
    const figure = img.closest("[data-artwork-slug]");
    if (!figure) return;
    const slug = figure.dataset.artworkSlug;
    if (unframed.has(slug)) return;
    const render = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      let bounds;
      // The pre-established crop values are more reliable than automatic
      // edge detection for these three known ornamental reproductions.
      if (measured[slug]) bounds = measured[slug];
      else {
        try { bounds = locateFrame(img); } catch (_) {}
        if (!bounds) bounds = fallback[slug];
      }
      if (!bounds) return;
      createCroppedBlob(img,bounds,blob=>{
        if (!img.isConnected) return;
        const url=URL.createObjectURL(blob);
        urls.add(url);
        img.dataset.framelessProcessed="true";
        img.src=url;
      });
    };
    if (img.complete && img.naturalWidth) render();
    else img.addEventListener("load",render,{once:true});
  }

  const selector = [
    ".painting-index-gallery .artwork-card[data-artwork-slug] .artwork-image img",
    ".target-body .catalogue-spread .target-art[data-artwork-slug] .frameless-artwork-media img"
  ].join(",");
  let intersection=null;
  if ("IntersectionObserver" in window) {
    intersection=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if (entry.isIntersecting) {
          intersection.unobserve(entry.target);
          prepare(entry.target);
        }
      });
    },{rootMargin:"700px 0px"});
  }

  function scan() {
    document.querySelectorAll(selector).forEach(img=>{
      if (!images.has(img)) {
        if (intersection) intersection.observe(img);
        else prepare(img);
      }
    });
  }
  const roots = [document.getElementById("catalogue-app"),
    document.getElementById("dynamic-artwork-spread"),
    document.getElementById("arabic-print")].filter(Boolean);
  for (const root of roots) {
    new MutationObserver(scan).observe(root,{childList:true,subtree:true});
  }
  scan();
  window.addEventListener("pagehide",()=>{
    urls.forEach(url=>URL.revokeObjectURL(url));
    urls.clear();
  },{once:true});
})();