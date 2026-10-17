/** ARTDACI Book AR V1: image tracking of the *cover image*, not the GLB mesh. */
import * as THREE from "../vendor/three.module.js";
import { MindARThree } from "../vendor/mindar-image-three.prod.js";
import {targetPath, introVideo, artists, copy, language, homepage, localizedRoute} from "./book-ar-data.mjs";
const lang=language(new URLSearchParams(location.search).get("lang")), t=copy[lang];
const $=id=>document.getElementById(id);
const el={stage:$("ar-stage"), gate:$("intro"),start:$("start"),warning:$("target-warning"),coverChoice:$("cover-choice"),cover:$("cover-file"),status:$("status"),progress:$("progress"),error:$("error"),controls:$("controls"),buttons:$("artist-buttons"),play:$("play"),listen:$("listen"),media:$("media")};
const state={engine:null,anchor:null,group:null,screen:null,screenMaterial:null,videoTexture:null,selection:"intro",targetInstalled:false,tracked:false,started:false,blob:null,speaking:false,posterCache:new Map()};
function localize(){
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  document.title="ARTDACI — "+t.title;
  document.querySelectorAll("[data-copy]").forEach(n=>{if(t[n.dataset.copy])n.textContent=t[n.dataset.copy];});
  document.querySelectorAll(".languages a").forEach(a=>{if(new URL(a.href).searchParams.get("lang")===lang)a.setAttribute("aria-current","page");});
  $("home").href=homepage(lang);
  $("hub").href=localizedRoute("geo/masters-hub.html",lang);
  $("semantic").href=localizedRoute("semantic/",lang);
  $("living").href=localizedRoute("book-3d.html",lang);
  for(const artist of artists){const btn=el.buttons.querySelector('[data-artist="'+artist.id+'"]');if(btn)btn.textContent=artist.title[lang];}
}
function message(v){el.status.textContent=v;}
function progress(v){el.progress.textContent=v;}
function fail(error){
  console.error("ARTDACI Book AR",error);
  el.error.hidden=false;
  el.error.textContent=(error?.message||String(error))+" — "+t.denied;
  progress("");
}
async function installedTarget(){
  try{
    const response=await fetch(targetPath,{cache:"no-store"});
    if(!response.ok||/text\/html/i.test(response.headers.get("content-type")||""))return false;
    const buf=await response.arrayBuffer();
    return buf.byteLength>512 && new Uint8Array(buf.slice(0,40)).every((v)=>Number.isFinite(v));
  }catch{return false;}
}
async function markerSource(){
 if(state.targetInstalled)return targetPath;
 const file=el.cover.files?.[0];
 if(!file)throw new Error(t.select);
 if(!/^image\/(jpeg|png|webp)$/.test(file.type))throw new Error("PNG / JPEG / WebP");
 const {Compiler}=await import("../vendor/mindar-image.prod.js");
 const inputUrl=URL.createObjectURL(file);
 try{
  const image=new Image();
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error("Invalid cover image"));image.src=inputUrl;});
  if(image.naturalWidth<500||image.naturalHeight<500)throw new Error("Cover: min 500 pixels on each side.");
  const compiler=new Compiler();
  await compiler.compileImageTargets([image],p=>progress(t.compiling+" · "+Math.round(p*100)+"%"));
  state.blob=URL.createObjectURL(new Blob([compiler.exportData()],{type:"application/octet-stream"}));
  return state.blob;
 }finally{URL.revokeObjectURL(inputUrl);}
}
function drawLabel(label){
 const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=576;
 const c=canvas.getContext("2d");const grad=c.createLinearGradient(0,0,1024,576);
 grad.addColorStop(0,"#172e47");grad.addColorStop(1,"#18202b");c.fillStyle=grad;c.fillRect(0,0,1024,576);
 c.strokeStyle="#dab780";c.lineWidth=12;c.strokeRect(18,18,988,540);
 c.fillStyle="#f3d5a3";c.textAlign="center";c.textBaseline="middle";
 c.font="bold 72px Georgia,serif";c.fillText("ARTDACI",512,135);
 c.fillStyle="#fff4e2";c.font="bold 48px sans-serif";c.fillText(label,512,293,940);
 c.font="32px sans-serif";c.fillText("Leonardo · Vermeer · Van Gogh · Monet",512,404,960);
 const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;return texture;
}
function createPanel(){
 const group=new THREE.Group();group.position.set(0,0,.04);
 const panel=new THREE.Group();panel.position.set(0,.13,.35);
 const back=new THREE.Mesh(new THREE.PlaneGeometry(1.06,.62),new THREE.MeshBasicMaterial({color:0xc3a16e,side:THREE.DoubleSide}));
 back.position.z=-.006;panel.add(back);
 state.screenMaterial=new THREE.MeshBasicMaterial({map:drawLabel(t.intro),side:THREE.DoubleSide});
 state.screen=new THREE.Mesh(new THREE.PlaneGeometry(1,.56),state.screenMaterial);panel.add(state.screen);group.add(panel);
 const thumbGroup=new THREE.Group();thumbGroup.position.set(0,-.32,.18);
 artists.forEach((artist,index)=>{
   const x=(index-1.5)*.256;
   const back=new THREE.Mesh(new THREE.PlaneGeometry(.237,.19),new THREE.MeshBasicMaterial({color:0xd4af79,side:THREE.DoubleSide}));
   back.position.set(x,0,-.003);thumbGroup.add(back);
   const front=new THREE.Mesh(new THREE.PlaneGeometry(.224,.177),new THREE.MeshBasicMaterial({color:0x24354b,side:THREE.DoubleSide}));
   front.position.set(x,0,0);thumbGroup.add(front);
   new THREE.TextureLoader().load(artist.image,texture=>{texture.encoding=THREE.sRGBEncoding;front.material.map=texture;front.material.needsUpdate=true;},undefined,()=>{});
 });
 group.add(thumbGroup);
 return group;
}
function display(texture){
 if(state.screenMaterial){state.screenMaterial.map=texture;state.screenMaterial.needsUpdate=true;}
}
async function showPoster(){
 const selected=state.selection,artist=artists.find(a=>a.id===selected);
 if(!artist){display(drawLabel(t.intro));return;}
 try{
  let texture=state.posterCache.get(artist.id);
  if(!texture){texture=await new THREE.TextureLoader().loadAsync(artist.image);texture.encoding=THREE.sRGBEncoding;state.posterCache.set(artist.id,texture);}
  if(state.selection===selected)display(texture);
 }catch{if(state.selection===selected)display(drawLabel(artist.title[lang]));}
}
function stopSpeech(){if("speechSynthesis" in window)window.speechSynthesis.cancel();state.speaking=false;el.listen.textContent=t.listen;}
function selectArtist(id){
 if(!state.started)return;
 state.selection=id;
 el.buttons.querySelectorAll("[data-artist]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.artist===id)));
 el.media.pause();el.media.removeAttribute("src");el.media.load();el.play.textContent=t.video;stopSpeech();
 void showPoster();
}
async function play(){
 if(!state.started||!state.tracked){message(t.lost);return;}
 if(!el.media.paused){el.media.pause();el.play.textContent=t.video;return;}
 const artist=artists.find(a=>a.id===state.selection), src=artist?.video||introVideo;
 if(!el.media.getAttribute("src")||!el.media.getAttribute("src").endsWith(src)){el.media.src=src;el.media.load();}
 stopSpeech();
 try{
  await el.media.play();
  if(!state.videoTexture){state.videoTexture=new THREE.VideoTexture(el.media);state.videoTexture.minFilter=THREE.LinearFilter;state.videoTexture.magFilter=THREE.LinearFilter;state.videoTexture.encoding=THREE.sRGBEncoding;}
  display(state.videoTexture);el.play.textContent=t.pause;
 }catch(err){fail(err);}
}
function listen(){
 if(!("speechSynthesis" in window))return;
 if(state.speaking){stopSpeech();return;}
 el.media.pause();el.play.textContent=t.video;
 const artist=artists.find(a=>a.id===state.selection);
 const phrase=(artist?artist.title[lang]+". ":"")+t.narr;
 const speech=new SpeechSynthesisUtterance(phrase);
 speech.lang={fr:"fr-FR",en:"en-US",ar:"ar"}[lang];speech.rate=.92;
 speech.onend=speech.onerror=()=>{state.speaking=false;el.listen.textContent=t.listen;};
 window.speechSynthesis.cancel();window.speechSynthesis.speak(speech);
 state.speaking=true;el.listen.textContent=t.stop;
}
async function start(){
 if(state.started)return;
 el.error.hidden=true;el.start.disabled=true;
 try{
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error(t.denied);
  progress(t.compiling);
  const source=await markerSource();
  progress(t.loading);
  state.engine=new MindARThree({container:el.stage,imageTargetSrc:source,filterMinCF:.0001,filterBeta:.001});
  const {renderer,scene,camera}=state.engine;
  renderer.outputEncoding=THREE.sRGBEncoding;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  scene.add(new THREE.AmbientLight(0xffffff,.9));
  state.anchor=state.engine.addAnchor(0);
  state.group=createPanel();state.anchor.group.add(state.group);
  state.anchor.onTargetFound=()=>{state.tracked=true;message(t.found);};
  state.anchor.onTargetLost=()=>{state.tracked=false;message(t.lost);el.media.pause();el.play.textContent=t.video;};
  await state.engine.start();
  renderer.setAnimationLoop(()=>renderer.render(scene,camera));
  state.started=true;
  el.gate.hidden=true;el.controls.hidden=false;progress("");message(t.searching);
 }catch(err){
  if(state.engine){try{await state.engine.stop();}catch{}}
  state.engine=null;fail(err);
 }finally{el.start.disabled=false;}
}
async function init(){
 localize();
 // Register interactions before waiting for the target download. Otherwise the
 // start button seems inert on slow mobile networks.
 el.start.disabled=true;
 progress(t.loading);
 el.start.addEventListener("click",()=>void start());
 el.buttons.addEventListener("click",ev=>{const button=ev.target.closest("button[data-artist]");if(button)selectArtist(button.dataset.artist);});
 el.play.addEventListener("click",()=>void play());
 el.listen.addEventListener("click",listen);
 el.media.addEventListener("ended",()=>{el.play.textContent=t.video;void showPoster();});
 document.addEventListener("visibilitychange",()=>{if(document.hidden){el.media.pause();stopSpeech();}});
 window.addEventListener("pagehide",()=>{el.media.pause();stopSpeech();if(state.engine)void state.engine.stop();if(state.blob)URL.revokeObjectURL(state.blob);});
 try {
   state.targetInstalled=await installedTarget();
   if(!state.targetInstalled){el.warning.hidden=false;el.warning.textContent=t.pending;el.coverChoice.hidden=false;}
 } catch(error) {
   fail(error);
 } finally {
   progress("");
   el.start.disabled=false;
 }
}
void init().catch(fail);
