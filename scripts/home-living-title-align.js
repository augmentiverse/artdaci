/* ARTDACI — position "vivants" / "Alive" so it begins as close as
   possible to the end of the previous line, within the hero's usable width.
   This avoids shifting the word off-screen on small phones.
   No network requests, no animations managed by JavaScript. */
(() => {
  "use strict";

  function update() {
    const title = document.getElementById("book-title");
    const first = title?.querySelector(".hv2-title-first");
    const living = title?.querySelector(".hv2-title-alive");
    const hero = title?.closest(".hv2-hero-copy");
    if (!first || !living || !hero) return;

    // offsetWidth is stable during the heartbeat scale animation.
    const firstWidth = first.offsetWidth;
    const livingWidth = living.offsetWidth;
    const firstLeft = first.getBoundingClientRect().left;
    const heroRight = hero.getBoundingClientRect().right;

    // Starting precisely after "Chefs-d'œuvre" is the ideal. If there
    // is not room, start as far right as possible without clipping.
    const available = Math.max(0, Math.floor(heroRight - firstLeft - livingWidth - 6));
    const desired = Math.max(0, firstWidth - 2);
    const indent = Math.max(0, Math.min(desired, available));
    living.style.setProperty("--artdaci-alive-indent", indent + "px");
  }

  const ready = () => {
    update();
    const title = document.getElementById("book-title");
    const hero = title?.closest(".hv2-hero-copy");
    if (hero && typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(update);
      observer.observe(hero);
    } else {
      window.addEventListener("resize", update, { passive: true });
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(update).catch(() => {});
    }
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
})();
