let installPrompt = null;

const language = document.documentElement.lang || "en";
const copy = language.startsWith("fr")
  ? { install: "INSTALLER ARTDACI", installed: "ARTDACI EST INSTALLÉ", unavailable: "Installation disponible depuis le menu du navigateur" }
  : language.startsWith("ar")
    ? { install: "تثبيت ARTDACI", installed: "تم تثبيت ARTDACI", unavailable: "التثبيت متاح من قائمة المتصفح" }
    : { install: "INSTALL ARTDACI", installed: "ARTDACI IS INSTALLED", unavailable: "Install from the browser menu" };

function installButton() {
  let button = document.getElementById("artdaci-install");
  if (button) return button;
  button = document.createElement("button");
  button.id = "artdaci-install";
  button.className = "artdaci-install-button";
  button.type = "button";
  button.textContent = copy.install;
  button.hidden = true;
  button.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    button.hidden = true;
  });
  document.body.appendChild(button);
  return button;
}

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch((error) => console.warn("ARTDACI service worker unavailable.", error)));
}

addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton().hidden = false;
});

addEventListener("appinstalled", () => {
  installPrompt = null;
  const button = installButton();
  button.textContent = copy.installed;
  button.hidden = true;
});
