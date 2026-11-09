import assert from "node:assert/strict";
import test from "node:test";
import {selectBrowserMedia,classifyBrowserRange} from "../scripts/check-cloudflare-browser.mjs";
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
