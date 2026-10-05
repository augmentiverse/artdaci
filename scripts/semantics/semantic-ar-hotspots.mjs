import * as THREE from "../../vendor/three.module.js";

const DEFAULT_COLOR = 0xd4b77f;

function labelTexture(label, rtl = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(18,18,18,0.86)";
  roundRect(ctx, 8, 14, 496, 100, 24);
  ctx.fill();
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff7e8";
  ctx.font = "700 38px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  const text = String(label || "").length > 24 ? String(label).slice(0, 23) + "…" : String(label || "");
  ctx.fillText(text, 256, 64, 450);
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function createRegionObject(hotspot, targetHeight, rtl) {
  const width = Math.max(0.035, hotspot.normalized.width);
  const height = Math.max(0.035, hotspot.normalized.height * targetHeight);
  const centerX = hotspot.normalized.x + hotspot.normalized.width / 2 - 0.5;
  const centerY = (0.5 - (hotspot.normalized.y + hotspot.normalized.height / 2)) * targetHeight;

  const region = new THREE.Group();
  region.name = `semantic-ar-hotspot-${hotspot.id}`;
  region.position.set(centerX, centerY, 0.025);
  region.userData.semanticHotspot = hotspot;

  const geometry = new THREE.PlaneGeometry(width, height);
  const fill = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: DEFAULT_COLOR,
      transparent: true,
      opacity: hotspot.selected ? 0.18 : 0.07,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    })
  );
  fill.name = "semantic-hotspot-hit";
  fill.renderOrder = 98;
  fill.userData.semanticHotspot = hotspot;
  region.add(fill);

  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({
      color: DEFAULT_COLOR,
      transparent: true,
      opacity: hotspot.selected ? 1 : 0.86,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    })
  );
  border.position.z = 0.002;
  border.renderOrder = 99;
  region.add(border);

  const texture = labelTexture(hotspot.label, rtl);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  }));
  sprite.name = "semantic-hotspot-label";
  sprite.scale.set(Math.min(0.34, Math.max(0.19, width * 0.9)), 0.055, 1);
  sprite.position.set(0, height / 2 + 0.04, 0.008);
  sprite.renderOrder = 100;
  sprite.userData.semanticHotspot = hotspot;
  region.add(sprite);

  return region;
}

export function createSemanticArHotspots({
  parent,
  runtime,
  camera,
  root,
  lang = "fr",
  onSelect = () => {}
} = {}) {
  if (!parent || !runtime?.hotspots?.length || !runtime?.spatial?.target || !camera || !root) return null;

  const targetHeight = Number(runtime.spatial.target.height) || 1;
  const group = new THREE.Group();
  group.name = "semantic-ar-hotspots";
  group.visible = true;
  parent.add(group);

  const hitTargets = [];
  const regionObjects = new Map();
  for (const hotspot of runtime.hotspots) {
    if (!hotspot?.normalized) continue;
    const object = createRegionObject(hotspot, targetHeight, lang === "ar");
    group.add(object);
    regionObjects.set(hotspot.id, object);
    const hit = object.getObjectByName("semantic-hotspot-hit");
    if (hit) hitTargets.push(hit);
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const hitTest = (event) => {
    if (!group.visible || !hitTargets.length) return null;
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );
    raycaster.setFromCamera(pointer, camera);
    const intersection = raycaster.intersectObjects(hitTargets, false)[0];
    return intersection?.object?.userData?.semanticHotspot || null;
  };

  const onPointerDown = (event) => {
    const hotspot = hitTest(event);
    if (!hotspot) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    onSelect(hotspot);
  };
  root.addEventListener("pointerdown", onPointerDown, true);

  return {
    runtime,
    group,
    setVisible(value) {
      group.visible = Boolean(value);
    },
    select(id) {
      for (const [regionId, object] of regionObjects) {
        const selected = regionId === id;
        const hit = object.getObjectByName("semantic-hotspot-hit");
        const border = object.children.find((child) => child.isLineSegments);
        if (hit?.material) hit.material.opacity = selected ? 0.2 : 0.07;
        if (border?.material) border.material.opacity = selected ? 1 : 0.86;
      }
    },
    isVisible() {
      return group.visible;
    },
    hitTest,
    dispose() {
      root.removeEventListener("pointerdown", onPointerDown, true);
      parent.remove(group);
      group.traverse((object) => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
        for (const material of materials) {
          material.map?.dispose?.();
          material.dispose?.();
        }
      });
    }
  };
}
