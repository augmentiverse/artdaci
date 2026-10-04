import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
import {validatePrintedNotices,printedNotice,artworkVisitorPose} from '../geo/scripts/masters-hub-notices.mjs';
import {artworkExperiencePresentation} from '../geo/scripts/artwork-experience-panel.mjs';
import {createHubXrPanel,layoutGuideBubbleButtons} from '../geo/scripts/masters-hub-panel.mjs';
import {guideBubbleScreenPlacement} from '../geo/scripts/artist-guide-ui.mjs';
import {HUB_IDS,wallPlacement} from '../geo/scripts/masters-hub-core.mjs';
const root=new URL('../',import.meta.url),json=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const hub=json('geo/data/masters-hub.json'),notices=json('geo/data/masters-hub-notices.json'),ids=Object.values(HUB_IDS).flat();

test('all twelve printed notices have real editorial sources, translated summaries and verified page routes',()=>{
  assert.deepEqual(validatePrintedNotices(notices,ids),[]);
  const source=readFileSync(new URL('scripts/print-artwork.js',root),'utf8');
  for(const [id,notice] of Object.entries(notices.artworks)){
    const data=json(notice.source),record=Array.isArray(data)?data.find(item=>item.slug===notice.sourceSlug):data;
    assert.ok(record?.texts?.artisticAnalysis||record?.texts?.artistBiography,id);
    for(const language of ['fr','en','ar']){
      const n=printedNotice(notices,id,language),url=new URL(n.href,new URL('geo/masters-hub.html',root));
      assert.equal(url.searchParams.get('lang'),language);
      const path=new URL(url);path.search='';assert.ok(readFileSync(path,'utf8').length);
      if(url.pathname.endsWith('/print-artwork.html')){
        assert.equal(url.searchParams.get('painting'),notice.printedSlug);
        if(Array.isArray(data))assert.ok(data.some(item=>item.slug===notice.printedSlug));
        else assert.ok(source.includes(`"${notice.printedSlug}": "${notice.source}"`));
      }
      assert.ok(n.description.length>90);
    }
  }
  const invalid=structuredClone(notices);invalid.artworks.ld01.routes.fr='javascript:alert(1)';
  assert.ok(validatePrintedNotices(invalid,ids).length);
});

test('the user-authorized vg01 link remains explicit about 1887 versus the unchanged 1889 image',()=>{
  assert.equal(notices.artworks.vg01.relation,'other-version');
  assert.equal(json(notices.artworks.vg01.source).date,'1887');
  const work=hub.artists.flatMap(a=>a.works).find(w=>w.artworkId==='vg01');assert.equal(work.imagePresentation.date,'1889');
  for(const language of ['fr','en','ar']){const notice=printedNotice(notices,'vg01',language);assert.match(notice.description,/1889/);assert.match(notice.description,/1887/);assert.match(notice.label,/1887/);}
});

test('printed page language limitations are disclosed and all panels retain their media actions',()=>{
  for(const artist of hub.artists)for(const work of artist.works)for(const language of ['fr','en','ar']){
    const notice=printedNotice(notices,work.artworkId,language),capabilities={image:{status:'available'},audio:{status:'local-fallback'},museum:{status:'available'}};
    const view=artworkExperiencePresentation({artist,work,language,view:'about',capabilities,printedNotice:notice});
    assert.equal(view.description,notice.description);assert.equal(view.dir,language==='ar'?'rtl':'ltr');
    assert.deepEqual(view.actions.map(a=>a.id),['about','image','audio','museum','printed','goto-artwork','return']);
    assert.equal(view.actions.find(a=>a.id==='printed').href,notice.href);
    if(notices.artworks[work.artworkId].pageTextLanguages[language]!==language)assert.match(notice.label,language==='ar'?/بالإنجليزية/:/EN/);
  }
});

test('the artwork panel prefers above-only placement and docks instead of overlapping a painting',()=>{
  const options={width:1280,height:700,panelWidth:280,panelHeight:220,aboveOnly:true};
  const bounds={left:500,right:700,top:400,bottom:650},p=guideBubbleScreenPlacement(bounds,options);
  assert.equal(p.placement,'above');assert.ok(p.top+options.panelHeight<bounds.top);
  assert.equal(guideBubbleScreenPlacement({...bounds,top:100},options),null);
});

test('all artwork XR panels stay body-locked off-centre and remain targetable by both hands',()=>{
  const previous=globalThis.document,ctx={clearRect(){},fillRect(){},strokeRect(){},fillText(){},drawImage(){},measureText:text=>({width:text.length*12})};
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
  try{
    for(const artist of hub.artists)for(const [index,work] of artist.works.entries())for(const language of ['fr','en','ar'])for(const image of [null,{width:768,height:1024}]){
      const p=wallPlacement(artist.zone.wall,index),mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial());mesh.position.set(p.x,2,p.z);mesh.rotation.y=p.yaw;mesh.scale.set(2.2,2.1,1);mesh.updateMatrixWorld(true);
      const panel=createHubXrPanel(THREE,language,{bubble:true,showStatus:true}),rig=new THREE.Group();rig.add(panel.mesh);rig.updateMatrixWorld(true);
      const view=artworkExperiencePresentation({artist,work,language,view:'about',status:'Local audio',image,capabilities:{image:{status:'available'},audio:{status:'available'},museum:{status:'available'}},printedNotice:printedNotice(notices,work.artworkId,language)});
      const matrix=new THREE.Matrix4().makeTranslation(0,1.65,0);panel.draw(view);panel.mesh.visible=true;panel.placeBodyLocked(matrix,{force:true});
      const local=panel.mesh.position.clone().applyMatrix4(matrix.clone().invert());
      assert.ok(Math.abs(local.x)>.71);assert.ok(Math.abs(local.x)<.73);assert.ok(local.z< -1.44&&local.z> -1.46);assert.equal(Math.sign(local.x),language==='ar'?-1:1);
      const start=(image?344:240)+40,height=start+32+Math.ceil(view.actions.length/2)*96;
      for(const button of layoutGuideBubbleButtons(view.actions,language==='ar',start)){
        assert.ok(button.y+button.height<=height);
        if(image)assert.ok(button.y>316);
        const point=panel.mesh.localToWorld(new THREE.Vector3(((button.x+button.width/2)/1024-.5)*1.05,(.5-(button.y+button.height/2)/height)*1.05,0));
        for(const x of [-.2,.2]){const origin=new THREE.Vector3(x,1.65,0),ray=new THREE.Raycaster(origin,point.clone().sub(origin).normalize());assert.equal(panel.hit(ray)?.action,button.id);panel.setHover(button.id);}
      }
      const originalWorld=panel.mesh.getWorldPosition(new THREE.Vector3()),movedHead=new THREE.Matrix4().makeRotationY(Math.PI/2);movedHead.setPosition(2,1.65,3);panel.placeBodyLocked(movedHead);
      assert.ok(panel.mesh.getWorldPosition(new THREE.Vector3()).distanceTo(originalWorld)<1e-9,'physical head movement must not move the panel');
      const originalLocal=panel.mesh.position.clone();rig.position.set(1,0,2);rig.rotation.y=.5;rig.updateMatrixWorld(true);
      assert.ok(panel.mesh.position.distanceTo(originalLocal)<1e-9);assert.ok(panel.mesh.getWorldPosition(new THREE.Vector3()).distanceTo(originalWorld)>1,'rig locomotion must carry the panel');
      panel.dispose();mesh.geometry.dispose();mesh.material.dispose();
    }
  }finally{globalThis.document=previous;}
});

test('go-to-artwork poses are derived from every real exhibit transform and face the artwork',()=>{
  for(const artist of hub.artists)for(const [index] of artist.works.entries()){
    const p=wallPlacement(artist.zone.wall,index),mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial());mesh.position.set(p.x,2,p.z);mesh.rotation.y=p.yaw;mesh.updateMatrixWorld(true);
    const pose=artworkVisitorPose(THREE,{mesh}),center=mesh.getWorldPosition(new THREE.Vector3()),direction=center.clone().sub(new THREE.Vector3(pose.x,center.y,pose.z)).normalize();
    assert.ok(pose.x>=hub.navigation.bounds.minX&&pose.x<=hub.navigation.bounds.maxX);assert.ok(pose.z>=hub.navigation.bounds.minZ&&pose.z<=hub.navigation.bounds.maxZ);
    assert.ok(Math.abs(Math.hypot(center.x-pose.x,center.z-pose.z)-2.15)<1e-9);
    const forward=new THREE.Vector3(-Math.sin(pose.yaw),0,-Math.cos(pose.yaw));assert.ok(forward.dot(direction)>.999999);
    mesh.geometry.dispose();mesh.material.dispose();
  }
});

test('printed navigation stops audio and ends XR before opening the existing page',async()=>{
  const source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8'),calls=[],url=printedNotice(notices,'ld01','fr').href;
  const state=vm.createContext({stopAudio:()=>calls.push('audio'),renderer:{xr:{getSession:()=>({end:async()=>calls.push('xr-end')})}},location:{assign:value=>calls.push(value)}});
  vm.runInContext(source.slice(source.indexOf('async function navigate('),source.indexOf('async function runAction(')),state);
  await state.navigate(url);assert.deepEqual(calls,['audio','xr-end',url]);
  assert.match(source,/if\(action==='printed'\)/);assert.match(source,/if\(action==='goto-artwork'\)/);assert.match(source,/xrPanel\.placeBodyLocked\(/);assert.doesNotMatch(source,/needsPanelPlacement/);
});

test('fullscreen includes the artwork dock, and touch movement remains available beside a docked panel',()=>{
  const html=readFileSync(new URL('geo/masters-hub.html',root),'utf8'),css=readFileSync(new URL('geo/styles/masters-hub.css',root),'utf8'),source=readFileSync(new URL('geo/scripts/masters-hub-viewer.js',root),'utf8');
  assert.match(html,/id="hub-artwork-dock"><\/div>\s*<\/div>/);
  assert.match(source,/stage\.parentElement\.requestFullscreen\(\)/);
  assert.match(css,/#hub-stage\[data-panel=true\] \.hub-movement\{display:grid\}/);
  assert.match(css,/\.hub-experience:fullscreen\{display:grid/);
});
