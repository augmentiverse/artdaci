const viewer = document.getElementById("d3-model");
const loading = document.getElementById("d3-loading");
const category = document.getElementById("d3-category");
const title = document.getElementById("d3-title");
const rotateButton = document.getElementById("d3-rotate");
const resetButton = document.getElementById("d3-reset");
const choices = [...document.querySelectorAll(".d3-model-choice")];

function selectModel(button) {
  const src = button.dataset.src;
  const nextTitle = button.dataset.title || "3D model";
  const nextCategory = button.dataset.category || "ARTDACI 3D";

  if (!src || !viewer) return;

  choices.forEach((choice) => choice.setAttribute("aria-current", choice === button ? "true" : "false"));
  category.textContent = nextCategory;
  title.textContent = nextTitle;
  loading.textContent = "Loading 3D model";
  loading.hidden = false;
  viewer.setAttribute("src", src);
  viewer.setAttribute("alt", nextTitle + " — interactive 3D model");
}

choices.forEach((button) => {
  button.addEventListener("click", () => {
    selectModel(button);
    document.querySelector(".d3-stage-wrap")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

viewer?.addEventListener("load", () => {
  loading.hidden = true;
});

viewer?.addEventListener("error", () => {
  loading.textContent = "Model unavailable";
  loading.hidden = false;
});

rotateButton?.addEventListener("click", () => {
  const enabled = viewer.hasAttribute("auto-rotate");
  if (enabled) {
    viewer.removeAttribute("auto-rotate");
    rotateButton.textContent = "Auto-rotate";
    rotateButton.setAttribute("aria-pressed", "false");
  } else {
    viewer.setAttribute("auto-rotate", "");
    rotateButton.textContent = "Stop rotation";
    rotateButton.setAttribute("aria-pressed", "true");
  }
});

resetButton?.addEventListener("click", () => {
  if (typeof viewer.resetTurntableRotation === "function") viewer.resetTurntableRotation();
  viewer.cameraOrbit = "0deg 75deg auto";
  viewer.cameraTarget = "auto auto auto";
  viewer.fieldOfView = "auto";
});

const first = choices.find((choice) => choice.getAttribute("aria-current") === "true") || choices[0];
if (first && viewer && !viewer.getAttribute("src")) selectModel(first);
