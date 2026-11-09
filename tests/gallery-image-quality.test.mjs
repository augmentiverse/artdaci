import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { auditGalleryImages, extractHomepageImages, intrinsicSize } from "../scripts/audit-gallery-images.mjs";

test("the 24 gallery source images all exist and have readable dimensions",async()=>{
 const r=await auditGalleryImages();
 assert.equal(r.count,24);
 assert.equal(new Set(r.assets.map(x=>x.path)).size,24);
 assert.ok(r.totalBytes>1024*1024&&r.totalBytes<12*1024*1024);
 assert.ok(r.logoBytes>0);
 for(const x of r.assets){
   assert.ok(x.width>0&&x.height>0,x.slug);
   assert.ok(x.bytes>0&&x.bytes<1024*1024,x.slug+" gallery weight");
 }
});
test("only the three known low-resolution frameless images need resolution review",async()=>{
 const r=await auditGalleryImages();
 const candidates=new Set(["lady-with-an-ermine","belle-ferronniere","pont-d-argenteuil"]);
 assert.ok(r.assets.filter(x=>x.lowResolution).every(x=>candidates.has(x.slug)));
 for(const slug of candidates)assert.ok(r.assets.some(x=>x.slug===slug));
});
test("gallery source mapping guards against duplicates and unsafe paths",async()=>{
 const c=await readFile(new URL("../scripts/catalogue.js",import.meta.url),"utf8");
 assert.equal(extractHomepageImages(c).length,24);
 assert.throws(()=>extractHomepageImages(c.replace('"mona-lisa": "assets/', '"lady-with-an-ermine": "assets/')));
 assert.throws(()=>extractHomepageImages(c.replace('"mona-lisa": "assets/', '"mona-lisa": "../assets/')));
});
test("PNG and WebP dimension parsers detect pixel width and height",()=>{
 const png=Buffer.alloc(32);
 Buffer.from([137,80,78,71,13,10,26,10]).copy(png);
 png.writeUInt32BE(1200,16);png.writeUInt32BE(800,20);
 assert.deepEqual(intrinsicSize(png),{width:1200,height:800});
 const webp=Buffer.alloc(32);webp.write("RIFF",0);webp.write("WEBP",8);webp.write("VP8X",12);
 webp[24]=127;webp[25]=2;webp[27]=223;webp[28]=1;
 assert.deepEqual(intrinsicSize(webp),{width:640,height:480});
 assert.equal(intrinsicSize(Buffer.from("invalid image")),null);
});
