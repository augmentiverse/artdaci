import * as THREE from "three";

const params = new URLSearchParams(location.search);
const lang = ["en", "fr"].includes(params.get("lang")) ? params.get("lang") : "en";
const tr = (en, fr) => lang === "fr" ? fr : en;

const painters = [
  {
    name: "Leonardo da Vinci", years: "1452–1519", portrait: "assets/varia/da-vinci.png", accent: "#8f5f32",
    bio: tr("Renaissance painter, engineer and anatomist, Leonardo joined close observation of nature to daring technical invention.", "Peintre, ingénieur et anatomiste de la Renaissance, Léonard unit l’observation de la nature à une invention technique audacieuse."),
    works: [tr("Mona Lisa", "La Joconde"), tr("The Last Supper", "La Cène"), tr("Lady with an Ermine", "La Dame à l’hermine"), tr("Vitruvian Man", "L’Homme de Vitruve")]
  },
  {
    name: "Vincent van Gogh", years: "1853–1890", portrait: "assets/varia/van-gogh.png", accent: "#346a8b",
    bio: tr("Van Gogh transformed colour and directional brushwork into an intensely personal language that helped shape modern art.", "Van Gogh transforma la couleur et la touche directionnelle en un langage intensément personnel qui marqua l’art moderne."),
    works: [tr("Self-Portrait", "Autoportrait"), tr("The Bedroom", "La Chambre"), tr("Starry Night", "La Nuit étoilée"), tr("Sunflowers", "Les Tournesols")]
  },
  {
    name: "Johannes Vermeer", years: "1632–1675", portrait: "assets/varia/vermeer.png", accent: "#b48a43",
    bio: tr("Working in Delft, Vermeer created quiet interiors whose balanced compositions, luminous colour and subtle light feel timeless.", "Actif à Delft, Vermeer créa des intérieurs silencieux dont les compositions équilibrées, les couleurs lumineuses et la lumière subtile semblent intemporelles."),
    works: [tr("Girl with a Pearl Earring", "La Jeune Fille à la perle"), tr("The Milkmaid", "La Laitière"), tr("The Astronomer", "L’Astronome"), tr("View of Delft", "Vue de Delft")]
  },
  {
    name: "Claude Monet", years: "1840–1926", portrait: "assets/varia/monet.png", accent: "#4d796f",
    bio: tr("A founder of Impressionism, Monet repeatedly painted changing light, atmosphere and reflection in landscapes and gardens.", "Fondateur de l’impressionnisme, Monet peignit inlassablement les variations de lumière, d’atmosphère et de reflet dans les paysages et les jardins."),
    works: [tr("Impression, Sunrise", "Impression, soleil levant"), tr("Water Lilies", "Nymphéas"), tr("Woman with a Parasol", "La Femme à l’ombrelle"), tr("Rouen Cathedral", "Cathédrale de Rouen")]
  }
];

document.documentElement.lang = lang;
document.getElementById("back-link").href = `book-3d.html?lang=${lang}`;
document.getElementById("back-link").textContent = tr("← Living Book", "← Livre vivant");
document.getElementById("book-subtitle").textContent = tr("Four masters · hand-tracked book", "Quatre maîtres · livre contrôlé par les mains");
document.getElementById("language-link").textContent = lang === "en" ? "FR" : "EN";
document.getElementById("language-link").href = `h-book.html?lang=${lang === "en" ? "fr" : "en"}`;
document.getElementById("help-title").textContent = tr("Hand controls", "Commandes gestuelles");
document.getElementById("help-copy").textContent = tr("Pinch with your left hand for the previous painter, or your right hand for the next one.", "Pincez avec la main gauche pour revenir, ou avec la main droite pour avancer.");
document.getElementById("start-title").textContent = tr("The hand-tracked book", "Le livre contrôlé par les mains");
document.getElementById("start-copy").textContent = tr("Allow camera access, then move one hand in front of the camera. Swipe left or right to turn the pages.", "Autorisez la caméra, puis placez une main devant elle. Balayez vers la gauche ou la droite pour tourner les pages.");
document.getElementById("start-camera").textContent = tr("Open book and camera", "Ouvrir le livre et la caméra");
document.getElementById("start-without-camera").textContent = tr("Continue without camera", "Continuer sans caméra");
document.getElementById("camera-note").textContent = tr("Camera images stay in your browser and are used only for gesture recognition.", "Les images restent dans votre navigateur et servent uniquement à reconnaître les gestes.");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120f0b);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .05, 30);
camera.position.set(0, 3.25, 4.2);
camera.lookAt(0, .9, 0);
const renderer = new THREE.WebGLRenderer({ antialias: !matchMedia("(max-width: 700px)").matches, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, matchMedia("(max-width: 700px)").matches ? 1.25 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.xr.enabled = true;
document.getElementById("scene").appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffefd1, 0x21160f, 2.1));
const key = new THREE.DirectionalLight(0xffdda0, 2.5); key.position.set(2, 4, 3); scene.add(key);
const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 40), new THREE.MeshStandardMaterial({ color: 0x1d1712, roughness: 1 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -.02; scene.add(floor);

const book = new THREE.Group(); book.position.set(0, 1.25, 0); book.rotation.x = -.16; book.scale.setScalar(1.15); scene.add(book);
const cover = new THREE.Mesh(new THREE.BoxGeometry(3.42, .11, 2.18), new THREE.MeshStandardMaterial({ color: 0x3d2115, roughness: .8 }));
cover.position.y = -.08; book.add(cover);
const pageGeo = new THREE.PlaneGeometry(1.62, 2.02);
const leftPage = new THREE.Mesh(pageGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
const rightPage = leftPage.clone();
leftPage.rotation.x = -Math.PI / 2; rightPage.rotation.x = -Math.PI / 2;
leftPage.position.set(-.83, 0, 0); rightPage.position.set(.83, .006, 0); book.add(leftPage, rightPage);
const turningPivot = new THREE.Group(); turningPivot.position.set(0, .018, 0); book.add(turningPivot);
const turningGeo = new THREE.PlaneGeometry(1.62, 2.02, 18, 10);
const turningPage = new THREE.Mesh(turningGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide }));
turningPage.rotation.x = -Math.PI / 2; turningPage.position.x = .81; turningPivot.add(turningPage);
const turningBasePositions = Float32Array.from(turningGeo.attributes.position.array);

const textureSize = matchMedia("(max-width: 700px)").matches ? [600, 760] : [768, 972];
const textures = painters.map(makeSpreadTextures);
let current = 0, animation = null, touchStart = null, lastGesture = 0;

function canvasTexture(draw) {
  const canvas = document.createElement("canvas"); [canvas.width, canvas.height] = textureSize;
  const ctx = canvas.getContext("2d", { alpha: false }); draw(ctx, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas); texture.encoding = THREE.sRGBEncoding; texture.minFilter = THREE.LinearFilter; return texture;
}
function paper(ctx, w, h, accent) { ctx.fillStyle = "#efe5cc"; ctx.fillRect(0,0,w,h); ctx.fillStyle = accent; ctx.fillRect(0,0,w,14); ctx.fillStyle = "rgba(80,50,24,.08)"; for(let y=35;y<h;y+=42) ctx.fillRect(34,y,w-68,1); }
function wrap(ctx, text, x, y, max, line) { const words=text.split(" "); let row=""; for (const word of words) { const test=`${row}${word} `; if(ctx.measureText(test).width>max && row){ctx.fillText(row,x,y); row=`${word} `; y+=line;} else row=test;} ctx.fillText(row,x,y); return y+line; }
function makeSpreadTextures(painter) {
  const left = canvasTexture((ctx,w,h)=>{ paper(ctx,w,h,painter.accent); const img=new Image(); img.onload=()=>{ctx.save();ctx.beginPath();ctx.roundRect(55,70,w-110,h*.48,16);ctx.clip();ctx.drawImage(img,55,70,w-110,h*.48);ctx.restore();left.needsUpdate=true;}; img.src=painter.portrait; ctx.fillStyle="#21170f";ctx.font=`700 ${w*.058}px Georgia`;ctx.textAlign="center";ctx.fillText(painter.name,w/2,h*.64);ctx.fillStyle=painter.accent;ctx.font=`700 ${w*.03}px system-ui`;ctx.fillText(painter.years,w/2,h*.69);ctx.textAlign="left";ctx.fillStyle="#3c3026";ctx.font=`500 ${w*.028}px system-ui`;wrap(ctx,painter.bio,55,h*.76,w-110,w*.043); });
  const right = canvasTexture((ctx,w,h)=>{ paper(ctx,w,h,painter.accent);ctx.fillStyle=painter.accent;ctx.font=`800 ${w*.026}px system-ui`;ctx.fillText(tr("SELECTED WORKS","ŒUVRES CHOISIES"),55,85);ctx.fillStyle="#21170f";ctx.font=`700 ${w*.048}px Georgia`;ctx.fillText(tr("Explore the collection","Explorer la collection"),55,145);painter.works.forEach((work,i)=>{const y=245+i*145;ctx.fillStyle=painter.accent;ctx.beginPath();ctx.arc(76,y-10,22,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff7e7";ctx.font=`700 ${w*.025}px system-ui`;ctx.textAlign="center";ctx.fillText(String(i+1),76,y);ctx.textAlign="left";ctx.fillStyle="#2d2118";ctx.font=`600 ${w*.035}px Georgia`;wrap(ctx,work,118,y,w-170,w*.045);});ctx.fillStyle="#675744";ctx.font=`500 ${w*.022}px system-ui`;ctx.fillText(tr("Discover 3D models, stories and media in ARTDACI.","Découvrez modèles 3D, récits et médias dans ARTDACI."),55,h-65);});
  return { left, right };
}
function renderSpread() { leftPage.material.map=textures[current].left; rightPage.material.map=textures[current].right; leftPage.material.needsUpdate=rightPage.material.needsUpdate=true; document.getElementById("previous-page").disabled=current===0;document.getElementById("next-page").disabled=current===painters.length-1;document.getElementById("status").textContent=`${painters[current].name} · ${current+1}/${painters.length}`; }
function shapeTurningPage(progress, direction) {
  const positions = turningGeo.attributes.position;
  const lift = Math.sin(progress * Math.PI);
  for (let i = 0; i < positions.count; i++) {
    const x = turningBasePositions[i * 3];
    const y = turningBasePositions[i * 3 + 1];
    const edge = direction > 0 ? (x + .81) / 1.62 : (.81 - x) / 1.62;
    const curl = Math.sin(Math.max(0, Math.min(1, edge)) * Math.PI);
    const softEdge = 1 - Math.pow(Math.abs(y) / 1.01, 2) * .12;
    positions.setXYZ(i, x, y, lift * (.18 + curl * .34) * softEdge);
  }
  positions.needsUpdate = true;
}
function resetTurningPage() { turningGeo.attributes.position.array.set(turningBasePositions); turningGeo.attributes.position.needsUpdate = true; }
function turn(direction) { if(animation || (direction<0&&current===0) || (direction>0&&current===painters.length-1)) return; turningPage.material.map=direction>0?textures[current].right:textures[current].left;turningPage.material.opacity=1;turningPage.material.needsUpdate=true;turningPage.position.x=direction>0?.81:-.81;turningPivot.rotation.y=0;resetTurningPage();animation={direction,start:performance.now()}; }
function animate(time) { if(animation){const p=Math.min(1,(time-animation.start)/820), eased=.5-Math.cos(p*Math.PI)/2;turningPivot.rotation.y=animation.direction*(eased*Math.PI);shapeTurningPage(p,animation.direction);if(p===1){current+=animation.direction;animation=null;turningPage.material.opacity=0;turningPivot.rotation.y=0;resetTurningPage();renderSpread();}} book.rotation.z=Math.sin(time*.00025)*.008;renderer.render(scene,camera); }

document.getElementById("previous-page").addEventListener("click",()=>turn(-1));
document.getElementById("next-page").addEventListener("click",()=>turn(1));
addEventListener("keydown",e=>{if(e.key==="ArrowLeft")turn(-1);if(e.key==="ArrowRight")turn(1);});
renderer.domElement.addEventListener("pointerdown",e=>touchStart=e.clientX);
renderer.domElement.addEventListener("pointerup",e=>{if(touchStart===null)return;const d=e.clientX-touchStart;if(Math.abs(d)>45)turn(d<0?1:-1);touchStart=null;});

const startScreen = document.getElementById("start-screen");
const webcam = document.getElementById("webcam-feed");
let cameraStream = null;
let mediaPipeHands = null;
let handSample = null;
let handFrameBusy = false;
let lastHandFrame = 0;

function closeStartScreen() {
  startScreen.hidden = true;
}

function onCameraHands(results) {
  const landmarks = results.multiHandLandmarks?.[0];
  if (!landmarks) {
    if (handSample && performance.now() - handSample.time > 450) handSample = null;
    return;
  }
  const now = performance.now();
  const screenX = 1 - landmarks[0].x;
  if (!handSample) {
    handSample = { x: screenX, time: now };
    return;
  }
  const elapsed = now - handSample.time;
  const movement = screenX - handSample.x;
  if (elapsed < 700 && Math.abs(movement) > .17 && now - lastGesture > 850) {
    lastGesture = now;
    turn(movement < 0 ? 1 : -1);
    handSample = null;
    document.getElementById("status").textContent = tr("Gesture detected · turning page", "Geste détecté · page en mouvement");
  } else if (elapsed > 700) {
    handSample = { x: screenX, time: now };
  }
}

async function processCameraFrame(time) {
  if (!cameraStream || !mediaPipeHands) return;
  if (!document.hidden && !renderer.xr.isPresenting && webcam.readyState >= 2 && !handFrameBusy && time - lastHandFrame > 66) {
    handFrameBusy = true;
    lastHandFrame = time;
    try { await mediaPipeHands.send({ image: webcam }); } catch { /* A dropped frame is harmless. */ }
    handFrameBusy = false;
  }
  requestAnimationFrame(processCameraFrame);
}

async function startCameraTracking() {
  const status = document.getElementById("status");
  status.textContent = tr("Requesting camera access…", "Demande d’accès à la caméra…");
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("camera-unavailable");
    if (!window.Hands) throw new Error("tracker-unavailable");
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } },
      audio: false
    });
    webcam.srcObject = cameraStream;
    await webcam.play();
    mediaPipeHands = new window.Hands({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
    mediaPipeHands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: .58, minTrackingConfidence: .55 });
    mediaPipeHands.onResults(onCameraHands);
    webcam.classList.add("active");
    closeStartScreen();
    status.textContent = tr("Camera ready · swipe your hand to turn a page", "Caméra prête · balayez la main pour tourner une page");
    requestAnimationFrame(processCameraFrame);
  } catch (error) {
    console.warn("ARTDACI hand tracking could not start:", error);
    status.textContent = tr("Camera access failed. Check the browser permission and try again.", "Échec de la caméra. Vérifiez l’autorisation du navigateur puis réessayez.");
    document.getElementById("start-copy").textContent = tr("The camera could not start. Allow camera access in the browser address bar, then press the button again.", "La caméra n’a pas démarré. Autorisez-la dans la barre d’adresse du navigateur, puis réessayez.");
  }
}

document.getElementById("start-camera").addEventListener("click", startCameraTracking);
document.getElementById("start-without-camera").addEventListener("click", closeStartScreen);

for (let i=0;i<2;i++) { const hand=renderer.xr.getHand(i); scene.add(hand); hand.addEventListener("pinchstart",()=>{const now=performance.now();if(now-lastGesture<650)return;lastGesture=now;const handedness=hand.userData.handedness || (i===0?"left":"right");turn(handedness==="left"?-1:1);}); hand.addEventListener("connected",e=>{hand.userData.handedness=e.data.handedness;}); }

const vrButton=document.getElementById("enter-vr");
if(navigator.xr){navigator.xr.isSessionSupported("immersive-vr").then(ok=>{vrButton.hidden=!ok;});}
vrButton.textContent=tr("Enter VR · hand tracking","Entrer en VR · suivi des mains");
vrButton.addEventListener("click",async()=>{if(renderer.xr.isPresenting){await renderer.xr.getSession().end();return;}try{const session=await navigator.xr.requestSession("immersive-vr",{requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking","bounded-floor"]});renderer.xr.setReferenceSpaceType("local-floor");book.position.set(0,1.18,-1.85);book.rotation.x=-.16;book.scale.setScalar(.72);await renderer.xr.setSession(session);vrButton.textContent=tr("Exit VR","Quitter la VR");session.addEventListener("end",()=>{book.position.set(0,1.25,0);book.scale.setScalar(1.15);vrButton.textContent=tr("Enter VR · hand tracking","Entrer en VR · suivi des mains");},{once:true});}catch{book.position.set(0,1.25,0);book.scale.setScalar(1.15);document.getElementById("status").textContent=tr("VR access was not granted.","L’accès VR n’a pas été autorisé.");}});

function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
addEventListener("resize",resize); renderSpread(); renderer.setAnimationLoop(animate);
