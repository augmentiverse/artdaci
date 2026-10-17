import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import {artists,copy,language,homepage,targetPath,bookModel,introVideo} from "../scripts/book-ar-data.mjs";
const here=dirname(fileURLToPath(import.meta.url)), root=resolve(here,"..");
const read=path=>readFileSync(resolve(root,path),"utf8");
test("FR EN AR translation coverage and correct home links",()=>{
  for(const lang of ["fr","en","ar"]){
    assert.equal(language(lang),lang);
    assert.ok(homepage(lang));
    for(const key of ["title","desc","start","pending","found","lost","media","narr"]){assert.ok(copy[lang][key],lang+"."+key);}
  }
  assert.equal(language("invalid"),"fr");
});
test("four painter media files from existing ARTDACI collection",()=>{
  assert.equal(artists.length,4);
  for(const artist of artists){
    for(const lang of ["fr","en","ar"])assert.ok(artist.title[lang]);
    for(const p of [artist.image,artist.video])assert.ok(existsSync(resolve(root,p)),p);
  }
  assert.ok(existsSync(resolve(root,introVideo)));
  assert.ok(existsSync(resolve(root,bookModel)));
});
test("WebAR page, user action media, and optional target workflow",()=>{
  const html=read("book-ar.html"),js=read("scripts/book-ar.js");
  assert.match(html,/id="cover-file"/);
  assert.match(html,/id="play"/);
  assert.match(html,/scripts\/book-ar\.js/);
  assert.match(js,/new MindARThree\(/);
  assert.match(js,/state\.anchor\.onTargetFound/);
  assert.match(js,/await el\.media\.play\(\)/);
  assert.match(js,/compileImageTargets/);
  assert.ok(targetPath.endsWith(".mind"));
  assert.ok(existsSync(resolve(root,"tools/book-ar/compile-target.html")));
});
