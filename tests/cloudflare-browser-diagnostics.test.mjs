import assert from "node:assert/strict";
import test from "node:test";
import {selectBrowserMedia,classifyBrowserRange,classifySpatialModelResult} from "../scripts/check-cloudflare-browser.mjs";
import {inventoryDeclaredCloudflareMedia} from "../scripts/audit-media-storage.mjs";

test("diagnostic uses published, canonical Cloudflare media only",async()=>{
  const registry=await inventoryDeclaredCloudflareMedia();
  const choices=selectBrowserMedia(registry.records);
  assert.equal(choices.length,4);
  for(const item of choices){
    assert.ok(item.url.startsWith("https://media.artdaci.com/artworks/"));
    assert.ok(item.expectedMime);
  }
  assert.deepEqual(choices.map(x=>x.family),["audio","videos","models","ar"]);
});

test("invalid and incomplete manifest selection fails before any network access",()=>{
  assert.throws(()=>selectBrowserMedia([]),/Missing published/);
  assert.throws(()=>selectBrowserMedia("invalid"));
});

test("HTTP Range response classification separates partial, ignored and blocked",()=>{
  assert.equal(classifyBrowserRange(206,"bytes 0-1023/10240").status,"ok");
  assert.equal(classifyBrowserRange(200,null).status,"warning");
  assert.equal(classifyBrowserRange(405,null).status,"inconclusive");
  assert.equal(classifyBrowserRange(404,null).status,"error");
  assert.equal(classifyBrowserRange(206,"bytes 2-1025/10240").status,"warning");
});

test("spatial model results distinguish CDN success, fallback and headless visibility",()=>{
  const live={state:"loaded",src:"https://media.artdaci.com/artworks/ld01/models/main-v2.glb",
    loaded:true,visible:true,statusText:"Model ready"};
  assert.deepEqual(classifySpatialModelResult(live),{
    status:"ok",reason:"Cloudflare model successfully loaded in the ARTDACI viewer",
  });
  assert.equal(classifySpatialModelResult({...live,src:"assets/local.glb"}).status,"warning");
  assert.equal(classifySpatialModelResult({...live,visible:false}).status,"warning");
  assert.equal(classifySpatialModelResult({...live,loaded:false}).status,"warning");
  assert.equal(classifySpatialModelResult({...live,state:"error"}).status,"error");
  assert.equal(classifySpatialModelResult({...live,state:"deferred"}).status,"inconclusive");
  assert.equal(live.statusText,"Model ready");
});
