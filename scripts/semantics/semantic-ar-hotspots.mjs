import * as THREE from "../../vendor/three.module.js";

const DEFAULT_COLOR = 0xd4b77f;

function labelTexture(label, rtl = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 112;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(16,14,12,0.78)";
  roundRect(ctx, 20, 12, 472, 88, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(212,183,127,0.48)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff8eb";
  ctx.font = "650 31px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  const text = String(label || "").length > 26 ? String(label).slice(0, 25) + "…" : String(label || "");
  ctx.fillText(text, 256, 56, 430);
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

function markerMaterial(opacity) {
  return new THREE.MeshBasicMaterial({
    color: DEFAULT_COLOR,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  });
}

function createRegionObject(hotspot, targetHeight, rtl) {
  const width = Math.max(0.035, hotspot.normalized.width);
  const height = Math.max(0.035, hotspot.normalized.height * targetHeight);
  const centerX = hotspot.normalized.x + hotspot.normalized.width / 2 - 0.5;
  const centerY = (0.5 - (hotspot.normalized.y + hotspot.normalized.height / 2)) * targetHeight;
  const selected = Boolean(hotspot.selected);

  const region = new THREE.Group();
  region.name = `semantic-ar-hotspot-${hotspot.id}`;
  region.position.set(centerX, centerY, 0.025);
  region.userData.semanticHotspot = hotspot;

  // Keep the full IIIF region as an invisible touch target.
  const hit = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      color: DEFAULT_COLOR,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    })
  );
  hit.name = "semantic-hotspot-hit";
  hit.renderOrder = 96;
  hit.userData.semanticHotspot = hotspot;
  region.add(hit);

  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(0.030, 40),
    markerMaterial(selected ? 0.16 : 0.055)
  );
  halo.name = "semantic-hotspot-halo";
  halo.position.z = 0.003;
  halo.renderOrder = 97;
  region.add(halo);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.014, 0.019, 48),
    markerMaterial(selected ? 0.96 : 0.58)
  );
  ring.name = "semantic-hotspot-ring";
  ring.position.z = 0.005;
  ring.renderOrder = 98;
  region.add(ring);

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.0052, 32),
    markerMaterial(selected ? 1 : 0.78)
  );
  dot.name = "semantic-hotspot-dot";
  dot.position.z = 0.006;
  dot.renderOrder = 99;
  region.add(dot);

  const texture = labelTexture(hotspot.label, rtl);
  const label = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.94,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  }));
  label.name = "semantic-hotspot-label";
  label.scale.set(0.22, 0.048, 1);
  label.position.set(0, 0.052, 0.009);
  label.renderOrder = 100;
  label.visible = selected;
  label.userData.semanticHotspot = hotspot;
  region.add(label);

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
        const halo = object.getObjectByName("semantic-hotspot-halo");
        const ring = object.getObjectByName("semantic-hotspot-ring");
        const dot = object.getObjectByName("semantic-hotspot-dot");
        const label = object.getObjectByName("semantic-hotspot-label");
        if (halo?.material) halo.material.opacity = selected ? 0.16 : 0.055;
        if (ring?.material) ring.material.opacity = selected ? 0.96 : 0.58;
        if (dot?.material) dot.material.opacity = selected ? 1 : 0.78;
        if (ring) ring.scale.setScalar(selected ? 1.18 : 1);
        if (label) label.visible = selected;
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
