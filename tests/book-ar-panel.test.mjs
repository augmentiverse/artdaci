import test from "node:test";
import assert from "node:assert/strict";
import {setupBookDiscovery} from "../scripts/book-ar-discovery.mjs";

function makeDom(){
 const created=[];
 function element(tag){
  const n={
   tag, dataset:{}, hidden:tag==="discovery-panel", attributes:{}, handlers:{}, children:[],
   setAttribute(k,v){this.attributes[k]=v;},
   addEventListener(k,handler){this.handlers[k]=handler;},
   append(...children){this.children.push(...children);},
   replaceChildren(...children){this.children=children;},
   querySelectorAll(){return tabs;}
  };
  created.push(n);
  return n;
 }
 const tabs=["about","works","fact"].map(name=>{
  const tab=element("button");tab.dataset.exploreTab=name;return tab;
 });
 const ids=["discovery","discovery-toggle","discovery-panel","discovery-name","discovery-meta","discovery-current","discovery-body"];
 const nodes=Object.fromEntries(ids.map(id=>[id,element(id)]));
 nodes.discovery.querySelectorAll=()=>tabs;
 return {created,tabs,nodes,document:{getElementById:id=>nodes[id],createElement:element}};
}

test("AR-first drawer: painter never auto-opens, work selection returns to camera",()=>{
 const old=globalThis.document, dom=makeDom(), chosen=[];
 globalThis.document=dom.document;
 try{
  const view=setupBookDiscovery("fr",artwork=>chosen.push(artwork.id));
  assert.equal(dom.nodes["discovery-panel"].hidden,true,"Details must start closed");
  view.setArtist("leonardo","Léonard de Vinci");
  assert.equal(dom.nodes["discovery-panel"].hidden,true,"Painter selection must not cover AR");
  assert.equal(dom.nodes["discovery-name"].textContent,"Léonard de Vinci");
  assert.match(dom.nodes["discovery-current"].textContent,/Joconde/);
  dom.nodes["discovery-toggle"].handlers.click();
  assert.equal(dom.nodes["discovery-panel"].hidden,false,"Manual toggle opens details");
  assert.equal(dom.nodes["discovery-toggle"].attributes["aria-expanded"],"true");
  dom.tabs[1].handlers.click();
  const works=dom.created.filter(node=>node.dataset.workId);
  assert.equal(works.length,4);
  works.find(node=>node.dataset.workId==="ermine").handlers.click();
  assert.deepEqual(chosen,["ermine"]);
  assert.equal(dom.nodes["discovery-panel"].hidden,true,"Return to AR after selecting artwork");
  assert.match(dom.nodes["discovery-current"].textContent,/hermine/);
  view.setArtist("vangogh","Vincent van Gogh");
  assert.equal(dom.nodes["discovery-panel"].hidden,true);
  assert.match(dom.nodes["discovery-current"].textContent,/1889/);
 } finally{
  if(old===undefined)delete globalThis.document;else globalThis.document=old;
 }
});
