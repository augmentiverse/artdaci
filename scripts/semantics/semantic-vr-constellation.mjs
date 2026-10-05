import * as THREE from "../../vendor/three.module.js";

const NODE_COLOR = 0xd4b77f;
const PANEL_COLOR = "rgba(20,18,16,0.92)";

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

function wrapText(ctx, text, maxWidth, maxLines = 5) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.length && lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (!String(text).endsWith(last)) lines[maxLines - 1] = last.replace(/[.…]*$/, "") + "…";
  }
  return lines;
}

function makeTexture({ title, body = "", kicker = "", width = 768, height = 300, rtl = false }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = PANEL_COLOR;
  roundRect(ctx, 8, 8, width - 16, height - 16, 26);
  ctx.fill();
  ctx.strokeStyle = "rgba(212,183,127,0.7)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = rtl ? "right" : "left";
  const x = rtl ? width - 42 : 42;

  if (kicker) {
    ctx.fillStyle = "#d4b77f";
    ctx.font = "700 24px system-ui, sans-serif";
    ctx.fillText(kicker, x, 48);
  }

  ctx.fillStyle = "#fff7ea";
  ctx.font = "700 38px system-ui, sans-serif";
  const titleLines = wrapText(ctx, title, width - 84, 2);
  titleLines.forEach((line, index) => ctx.fillText(line, x, 94 + index * 44));

  if (body) {
    ctx.fillStyle = "#ded7cc";
    ctx.font = "500 25px system-ui, sans-serif";
    const y = 110 + titleLines.length * 44;
    wrapText(ctx, body, width - 84, 5).forEach((line, index) => ctx.fillText(line, x, y + index * 34));
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function makeNode(concept, index, count, rtl) {
  const angle = (index / Math.max(1, count)) * Math.PI * 2 + Math.PI / 4;
  const radiusX = 0.92;
  const radiusY = 0.72;
  const group = new THREE.Group();
  group.name = `semantic-vr-node-${concept.id}`;
  group.position.set(Math.cos(angle) * radiusX, 0.68 + Math.sin(angle) * radiusY * 0.55, 0.2);

  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 24, 16),
    new THREE.MeshBasicMaterial({
      color: NODE_COLOR,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      toneMapped: false
    })
  );
  hit.name = "semantic-vr-hit";
  hit.userData.semanticConcept = concept;
  group.add(hit);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.105, 0.125, 32),
    new THREE.MeshBasicMaterial({
      color: NODE_COLOR,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      toneMapped: false
    })
  );
  ring.position.z = 0.005;
  group.add(ring);

  const texture = makeTexture({
    title: concept.label,
    kicker: concept.type || "Concept",
    width: 620,
    height: 180,
    rtl
  });
  const label = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  }));
  label.scale.set(0.58, 0.17, 1);
  label.position.set(0, 0.21, 0.02);
  label.userData.semanticConcept = concept;
  group.add(label);

  return { group, hit };
}

function findPedagogy(runtime, conceptId) {
  return (runtime.pedagogy || []).find((item) =>
    item.source === conceptId ||
    item.target === conceptId ||
    item.neighbor?.id === conceptId
  ) || (runtime.pedagogy || []).find((item) => item.prompt) || null;
}

export function createSemanticVrConstellation({
  parent,
  runtime,
  lang = "fr"
} = {}) {
  if (!parent || !runtime?.concepts?.length) return null;

  const rtl = lang === "ar";
  const group = new THREE.Group();
  group.name = "semantic-vr-constellation";
  parent.add(group);

  const concepts = runtime.concepts.slice(0, 5);
  const hitTargets = [];
  const nodeGroups = new Map();

  concepts.forEach((concept, index) => {
    const node = makeNode(concept, index, concepts.length, rtl);
    nodeGroups.set(concept.id, node.group);
    hitTargets.push(node.hit);
    group.add(node.group);
  });

  const panelTexture = makeTexture({
    title: runtime.focus?.label || "ARTDACI",
    body: (runtime.pedagogy || []).find((item) => item.prompt)?.prompt || "",
    kicker: rtl ? "السياق الدلالي" : lang === "fr" ? "Contexte sémantique" : "Semantic context",
    rtl
  });
  const panelMaterial = new THREE.SpriteMaterial({
    map: panelTexture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  });
  const panel = new THREE.Sprite(panelMaterial);
  panel.name = "semantic-vr-info";
  panel.scale.set(1.05, 0.41, 1);
  panel.position.set(0, 1.65, 0.28);
  group.add(panel);

  let selectedId = null;

  const updatePanel = (concept) => {
    const relation = findPedagogy(runtime, concept.id);
    const body = [
      concept.definition || "",
      relation?.prompt ? `${lang === "ar" ? "سؤال" : lang === "fr" ? "Question" : "Question"} : ${relation.prompt}` : ""
    ].filter(Boolean).join("\n");
    panelMaterial.map?.dispose?.();
    panelMaterial.map = makeTexture({
      title: concept.label,
      body,
      kicker: relation
        ? (lang === "ar" ? "تعلم وملاحظة" : lang === "fr" ? "Apprendre et observer" : "Learn and observe")
        : (lang === "ar" ? "مفهوم" : lang === "fr" ? "Notion" : "Concept"),
      rtl
    });
    panelMaterial.needsUpdate = true;
  };

  const select = (concept) => {
    if (!concept) return false;
    selectedId = concept.id;
    for (const [id, node] of nodeGroups) {
      const hit = node.getObjectByName("semantic-vr-hit");
      if (hit?.material) hit.material.opacity = id === selectedId ? 0.42 : 0.16;
    }
    updatePanel(concept);
    return true;
  };

  return {
    group,
    hitTargets,
    intersect(raycaster) {
      const intersection = raycaster.intersectObjects(hitTargets, false)[0];
      return intersection?.object?.userData?.semanticConcept || null;
    },
    select,
    setVisible(value) {
      group.visible = Boolean(value);
    },
    dispose() {
      parent.remove(group);
      group.traverse((object) => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
        materials.forEach((material) => {
          material.map?.dispose?.();
          material.dispose?.();
        });
      });
    }
  };
}
