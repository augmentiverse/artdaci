const mobileMenus = [...document.querySelectorAll(".hv2-mobile-menu")];

for (const menu of mobileMenus) {
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) menu.removeAttribute("open");
  });

  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    menu.removeAttribute("open");
    menu.querySelector("summary")?.focus();
  });
}

document.addEventListener("pointerdown", (event) => {
  for (const menu of mobileMenus) {
    if (menu.open && !menu.contains(event.target)) menu.removeAttribute("open");
  }
});

const desktopMenuQuery = window.matchMedia("(min-width: 781px)");
desktopMenuQuery.addEventListener("change", ({ matches }) => {
  if (!matches) return;
  for (const menu of mobileMenus) menu.removeAttribute("open");
});
