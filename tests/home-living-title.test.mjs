import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const file=(name)=>readFile(new URL("../"+name,import.meta.url),"utf8");

for(const [name,first,second] of [
  ["index-fr.html","Chefs-d’œuvre","vivants"],
  ["index.html","Masterpieces","Alive"],
]){
  test(name+" has a clear accessible heading with right-aligned living word",async()=>{
    const html=await file(name);
    assert.match(html,/styles\/home-living-title\.css\?v=1/);
    assert.ok(html.includes('<h1 id="book-title"><span class="hv2-title-first">'+first+
      '</span> <span class="hv2-title-alive">'+second+'</span></h1>'));
    assert.equal((html.match(/id="book-title"/g)||[]).length,1);
    assert.equal((html.match(/class="hv2-title-alive"/g)||[]).length,1);
  });
}
test("living word pulses gently without disrupting visitors preferring reduced motion",async()=>{
  const css=await file("styles/home-living-title.css");
  assert.match(css,/align-self:\s*flex-end/);
  assert.match(css,/artdaci-living-heartbeat/);
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css,/animation:\s*none/);
  assert.match(css,/@media \(max-width: 600px\)/);
});
