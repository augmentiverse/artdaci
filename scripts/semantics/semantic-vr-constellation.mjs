import * as THREE from "../../vendor/three.module.js";

const NODE_COLOR = 0xd4b77f;
const PANEL_COLOR = "rgba(20,18,16,0.82)";

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
  group.position.set(Math.cos(angle) * radiusX, 0.72 + Math.sin(angle) * radiusY * 0.55, 0.2);

  const selection = { kind: "concept", item: concept };
  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 24, 16),
    new THREE.MeshBasicMaterial({
      color: NODE_COLOR,
      transparent: true,
      opacity: 0.001,
      depthWrite: false,
      toneMapped: false
    })
  );
  hit.name = "semantic-vr-hit";
  hit.userData.semanticSelection = selection;
  group.add(hit);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.048, 0.062, 40),
    new THREE.MeshBasicMaterial({
      color: NODE_COLOR,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      toneMapped: false
    })
  );
  ring.name = "semantic-vr-ring";
  ring.position.z = 0.005;
  group.add(ring);

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.015, 28),
    new THREE.MeshBasicMaterial({
      color: NODE_COLOR,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      toneMapped: false
    })
  );
  dot.name = "semantic-vr-dot";
  dot.position.z = 0.008;
  group.add(dot);

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
  label.name = "semantic-vr-label";
  label.scale.set(0.44, 0.128, 1);
  label.position.set(0, 0.15, 0.02);
  label.material.opacity = 0.92;
  label.visible = false;
  label.userData.semanticSelection = selection;
  group.add(label);

  return { group, hit, selection };
}

function makePortal(step, index, count, rtl) {
  const group = new THREE.Group();
  const spacing = count > 1 ? 1.8 / (count - 1) : 0;
  const x = count > 1 ? -0.9 + index * spacing : 0;
  group.name = `semantic-vr-portal-${step.stage}-${step.id}`;
  group.position.set(x, 0.18, 0.58);

  const selection = { kind: "portal", item: step };
  const hit = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.55),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
      colorWrite: false,
      toneMapped: false
    })
  );
  hit.name = "semantic-vr-portal-hit";
  hit.userData.semanticSelection = selection;
  group.add(hit);

  const texture = makeTexture({
    title: step.label,
    kicker: step.action || step.stage,
    width: 620,
    height: 190,
    rtl
  });
  const label = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  }));
  label.name = "semantic-vr-portal-label";
  label.scale.set(0.40, 0.124, 1);
  label.position.set(0, -0.34, 0.02);
  label.material.opacity = 0.78;
  label.userData.semanticSelection = selection;
  group.add(label);

  return { group, hit, label, selection };
}

function findPedagogy(runtime, conceptId) {
  return (runtime.pedagogy || []).find((item) =>
    item.source === conceptId ||
    item.target === conceptId ||
    item.neighbor?.id === conceptId
  ) || (runtime.pedagogy || []).find((item) => item.prompt) || null;
}

function portalInstruction(lang) {
  if (lang === "ar") return "اختر البوابة مرة أخرى لفتح هذه المرحلة.";
  if (lang === "fr") return "Sélectionnez à nouveau ce portail pour ouvrir cette étape.";
  return "Select this portal again to open this step.";
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
  const pathSteps = (runtime.learningPath?.steps || []).slice(0, 4);
  // Curated cross-artwork VR doors supplement — not duplicate — the contextual path.
  const bridges = (runtime.journeyBridges || [])
    .filter((bridge) => typeof bridge.href === "string" && bridge.href.startsWith("/") &&
      !bridge.href.startsWith("//") && bridge.toArtworkId !== runtime.focus?.id)
    .slice(0, 3);
  const hitTargets = [];
  const interactiveGroups = new Map();

  concepts.forEach((concept, index) => {
    const node = makeNode(concept, index, concepts.length, rtl);
    interactiveGroups.set(`concept:${concept.id}`, node.group);
    hitTargets.push(node.hit);
    group.add(node.group);
  });

  pathSteps.forEach((step, index) => {
    const portal = makePortal(step, index, pathSteps.length, rtl);
    interactiveGroups.set(`portal:${step.stage}:${step.id}`, portal.group);
    hitTargets.push(portal.hit, portal.label);
    group.add(portal.group);
  });


  bridges.forEach((bridge, index) => {
    const action = lang === "ar" ? "انتقل إلى عمل آخر" :
      lang === "fr" ? "Vers une autre œuvre" : "Go to another artwork";
    const evidence = (bridge.sharedConcepts || []).map((item) => item.label).join(" · ");
    const step = {
      stage: "bridge",
      id: `${bridge.id}:${bridge.toArtworkId}`,
      label: bridge.toArtworkLabel,
      action,
      description: [bridge.title, evidence, bridge.question].filter(Boolean).join("\n"),
      href: bridge.href,
      channel: "vr"
    };
    const portal = makePortal(step, index, bridges.length, rtl);
    portal.group.name = `semantic-vr-bridge-${step.id}`;
    portal.group.position.y = -0.46;
    portal.group.position.z = 0.69;
    portal.label.material.opacity = 1;
    interactiveGroups.set(`portal:${step.stage}:${step.id}`, portal.group);
    hitTargets.push(portal.hit, portal.label);
    group.add(portal.group);
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
  panel.scale.set(0.88, 0.34, 1);
  panel.position.set(0, 1.62, 0.28);
  panel.visible = false;
  group.add(panel);

  let selectedKey = null;

  const setPanel = ({ title, body, kicker }) => {
    panelMaterial.map?.dispose?.();
    panelMaterial.map = makeTexture({ title, body, kicker, rtl });
    panelMaterial.needsUpdate = true;
  };

  const updateConceptPanel = (concept) => {
    const relation = findPedagogy(runtime, concept.id);
    const body = [
      concept.definition || "",
      relation?.prompt ? `${lang === "ar" ? "سؤال" : lang === "fr" ? "Question" : "Question"} : ${relation.prompt}` : ""
    ].filter(Boolean).join("\n");
    setPanel({
      title: concept.label,
      body,
      kicker: relation
        ? (lang === "ar" ? "تعلم وملاحظة" : lang === "fr" ? "Apprendre et observer" : "Learn and observe")
        : (lang === "ar" ? "مفهوم" : lang === "fr" ? "Notion" : "Concept")
    });
  };

  const updatePortalPanel = (step) => {
    const body = [step.description || "", portalInstruction(lang)].filter(Boolean).join("\n");
    setPanel({
      title: step.label,
      body,
      kicker: step.action || step.stage
    });
  };

  const selectionKey = (selection) => selection?.kind === "portal"
    ? `portal:${selection.item.stage}:${selection.item.id}`
    : `concept:${selection?.item?.id || ""}`;

  const select = (selection) => {
    if (!selection?.item) return { handled: false, activate: false };
    const key = selectionKey(selection);
    const activate = selection.kind === "portal" && selectedKey === key;
    selectedKey = key;

    for (const [id, object] of interactiveGroups) {
      const conceptHit = object.getObjectByName("semantic-vr-hit");
      const portalHit = object.getObjectByName("semantic-vr-portal-hit");
      const selected = id === key;
      if (conceptHit?.material) conceptHit.material.opacity = 0.001;
      if (portalHit?.material) portalHit.material.opacity = 0.001;
      const ring = object.getObjectByName("semantic-vr-ring");
      const dot = object.getObjectByName("semantic-vr-dot");
      const label = object.getObjectByName("semantic-vr-label");
      if (ring?.material) ring.material.opacity = selected ? 0.98 : 0.58;
      if (ring) ring.scale.setScalar(selected ? 1.22 : 1);
      if (dot?.material) dot.material.opacity = selected ? 1 : 0.72;
      if (label) label.visible = selected;
    }

    panel.visible = true;
    if (selection.kind === "portal") updatePortalPanel(selection.item);
    else updateConceptPanel(selection.item);

    return {
      handled: true,
      activate,
      kind: selection.kind,
      item: selection.item,
      href: activate ? selection.item.href : ""
    };
  };

  return {
    group,
    hitTargets,
    hasPortals: pathSteps.length > 0 || bridges.length > 0,
    hasCrossArtworkBridges: bridges.length > 0,
    intersect(raycaster) {
      const intersection = raycaster.intersectObjects(hitTargets, false)[0];
      return intersection?.object?.userData?.semanticSelection || null;
    },
    intersectDetailed(raycaster) {
      const intersection = raycaster.intersectObjects(hitTargets, false)[0];
      if (!intersection) return null;
      const selection = intersection.object?.userData?.semanticSelection || null;
      return selection ? { selection, distance: intersection.distance, object: intersection.object } : null;
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
