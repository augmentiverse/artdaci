import assert from "node:assert/strict";
import test from "node:test";
import {
  assertCanonicalMediaUrl,selectHeadProbeTargets,interpretHead,probeHead,sampleCloudflareHeaders,
} from "../scripts/probe-cloudflare-media.mjs";

const item=(family,id,key,path,mimeType)=>({
  family,artworkId:id,key,mimeType,available:true,bytes:1234,
  url:"https://media.artdaci.com/artworks/"+id+"/"+path,
});
const reply=(status,headers={})=>({
  status,headers:{get:(name)=>headers[name.toLowerCase()]??null},
});
const healthy={
  "content-type":"audio/mpeg","access-control-allow-origin":"https://artdaci.com",
  "cache-control":"public, max-age=86400","cf-cache-status":"HIT","content-length":"1234",
};

test("interpretation differentiates success, warnings, HEAD restrictions and failures",()=>{
  const target=item("audio","ld01","overview.en","audio/en/overview.mp3","audio/mpeg");
  const good=interpretHead(target,reply(200,healthy),11);
  assert.equal(good.status,"ok");
  assert.equal(good.cfCacheStatus,"HIT");
  assert.equal(good.elapsedMs,11);
  assert.equal(interpretHead(target,reply(404,healthy),10).status,"error");
  assert.equal(interpretHead(target,reply(405,healthy),10).status,"inconclusive");
  assert.equal(interpretHead(target,reply(200,{"content-type":"text/html"}),10).status,"warning");
});
test("selection includes all five media families and four remote manifests",()=>{
  const rows=[
    item("images","ld01","main","images/main.png","image/png"),
    item("images","ve01","main","images/main.jpg","image/jpeg"),
    item("audio","ld01","overview.en","audio/en/overview.mp3","audio/mpeg"),
    item("audio","ve01","overview.fr","audio/fr/overview.mp3","audio/mpeg"),
    item("audio","mo01","overview.ar","audio/ar/overview.mp3","audio/mpeg"),
    item("videos","ve01","animation","videos/animation.mp4","video/mp4"),
    item("models","ld01","v2","models/main-v2.glb","model/gltf-binary"),
    item("models","ve01","v1","models/main.glb","model/gltf-binary"),
    item("ar","ld01","target","ar/target.mind","application/octet-stream"),
  ];
  const targets=selectHeadProbeTargets(rows);
  assert.equal(targets.length,13);
  assert.equal(new Set(targets.map(x=>x.url)).size,13);
  assert.ok(targets.some(x=>x.family==="manifest" && x.artworkId==="mo01"));
  const unavailable={...rows[0],available:false};
  assert.ok(!selectHeadProbeTargets([unavailable]).some(x=>x.family==="images"));
});
test("remote HEAD probes never follow redirects or download a body",async()=>{
  const target=item("audio","ld01","overview.en","audio/en/overview.mp3","audio/mpeg");
  const good=await probeHead(target,{fetchImpl:async(url,options)=>{
    assert.equal(url,target.url);assert.equal(options.method,"HEAD");
    assert.equal(options.redirect,"manual");
    assert.equal(options.headers.Origin,"https://artdaci.com");
    return reply(200,healthy);
  }});
  assert.equal(good.status,"ok");
  const failed=await probeHead(target,{fetchImpl:async()=>{throw new TypeError("Network unavailable")}});
  assert.equal(failed.status,"inconclusive");
  assert.equal(failed.httpStatus,null);
  assert.throws(()=>assertCanonicalMediaUrl("http://media.artdaci.com/artworks/x/image.jpg"));
  await assert.rejects(()=>probeHead({...target,url:"https://unsafe.example/image.jpg"}));
});
test("sample is bounded and distinguishes MIME mismatch from unreachable media",async()=>{
  const target=item("images","ld01","main","images/main.jpg","image/jpeg");
  let calls=0;
  const sampled=await sampleCloudflareHeaders([target],{
    fetchImpl:async(_url,options)=>{
      calls++;assert.equal(options.method,"HEAD");
      return reply(200,{"content-type":"image/jpeg","access-control-allow-origin":"*"});
    },
    concurrency:3,
  });
  assert.equal(sampled.sampleSize,5);
  assert.equal(calls,5);
  assert.equal(sampled.statusCounts.ok,1);
  assert.equal(sampled.statusCounts.warning,4);
});
