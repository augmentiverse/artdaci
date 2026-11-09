import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=(path)=>readFile(new URL("../"+path,import.meta.url),"utf8");

for(const [path,label] of [
  ["print-multimedia-qr-fr.html","ARTDACI - Compagnon du livre imprimé"],
  ["print-multimedia-qr.html","ARTDACI - Printed Book Companion"],
]){
  test(path+" places the original logo immediately before the companion label",async()=>{
    const html=await read(path);
    assert.match(html,/styles\/qr-directory-brand\.css\?v=1/);
    const header=html.match(/<header class="qr-directory-header">([\s\S]*?)<\/header>/)?.[1];
    assert.ok(header,"QR directory header missing");
    const brand=header.match(/<div class="qr-directory-brand">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(brand,"QR brand row missing");
    assert.ok(brand.includes('src="assets/varia/artdaci-logo.png"'));
    assert.ok(brand.includes(label));
    assert.ok(brand.indexOf('class="artdaci-logo qr-directory-logo"')<
      brand.indexOf('class="eyebrow"'));
    assert.equal((header.match(/qr-directory-logo/g)||[]).length,1);
  });
}
test("QR brand styling includes mobile and print layouts",async()=>{
  const css=await read("styles/qr-directory-brand.css");
  assert.match(css,/\.qr-directory-header \.qr-directory-logo/);
  assert.match(css,/position:\s*static/);
  assert.match(css,/@media print/);
});
for(const [path,homepage,label] of [
  ["atlas.html","index-fr.html","En savoir plus sur l’Atlas augmenté"],
  ["atlas-en.html","index.html","Explore the Augmented Atlas concept"],
  ["atlas-ar.html","index-ar.html","اكتشف مفهوم الأطلس المعزّز"],
]){
  test(path+" keeps one highlighted Atlas disclosure and useful FAQ",async()=>{
    const html=await read(path);
    assert.match(html,/styles\/atlas-guide-cta\.css\?v=1/);
    assert.match(html,/<details class="guide-concept-details" id="atlas-concept">/);
    assert.ok(html.includes("<strong>"+label+"</strong>"));
    assert.equal((html.match(/class="guide-concept-icon"/g)||[]).length,1);
    assert.ok(html.indexOf('id="atlas-concept"')<html.indexOf('class="guide-faq"'));
    assert.equal((html.match(/class="guide-faq-item"/g)||[]).length,5);
    assert.equal((html.match(/guide-concept-editorial/g)||[]).length,1);
    assert.ok(html.includes('href="'+homepage+'#experiences"'));
    assert.ok(!/class="roadmap"/.test(html));
    assert.ok(!/Galerie personnelle|Personal gallery|المعرض الشخصي/.test(html));
  });
}
test("Guide CTA stays keyboard-accessible and adapts to narrow screens",async()=>{
  const css=await read("styles/atlas-guide-cta.css");
  assert.match(css,/guide-concept-chevron/);
  assert.match(css,/@media \(max-width: 600px\)/);
  const baseline=await read("styles/atlas-visitor-guide.css");
  assert.match(baseline,/guide-concept-details > summary:focus-visible/);
});
