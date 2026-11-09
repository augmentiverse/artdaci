/**
 * ARTDACI homepage museum-immersion section QA in a LOCAL Chromium browser.
 * Ensures FR/EN/AR parity, proper immersion deep links, and a legible green
 * "Virtual Museums" panel on desktop and phones. Creates review screenshots.
 */
import {createRequire} from "node:module";
import {access,mkdir,writeFile} from "node:fs/promises";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

const require=createRequire(import.meta.url);
const HOST=process.env.ARTDACI_HERO_TEST_ORIGIN||"http://127.0.0.1:8765";
const PAGES=[
  {file:"index-fr.html",lang:"fr",atlas:"museums-atlas.html"},
  {file:"index.html",lang:"en",atlas:"museums-atlas-en.html"},
  {file:"index-ar.html",lang:"ar",atlas:"museums-atlas-ar.html"},
];
const VIEWPORTS=[{name:"desktop",width:1280,height:900},{name:"mobile",width:390,height:844}];
function ensure(value,message){if(!value)throw Error(message)}
async function findChrome(){
  for(const path of [process.env.ARTDACI_CHROME,"/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable","/usr/bin/chromium","/usr/bin/chromium-browser"].filter(Boolean)){
    try{await access(path);return path}catch{}
  }
  throw Error("Chrome/Chromium is not present");
}
function lightness(hex){
  const comps=hex.match(/\d+/g).slice(0,3).map(Number).map(v=>{
    const value=v/255;return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;
  });
  return comps[0]*.2126+comps[1]*.7152+comps[2]*.0722;
}
function contrast(a,b){
  const x=lightness(a),y=lightness(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}

async function checkPage(page,p){
  const selector="#places.hv2-museum-immersive";
  const section=page.locator(selector);
  ensure(await section.count()===1,"Missing distinct immersive museum section");
  const data=await page.evaluate(()=>{
    const sect=document.querySelector("#places.hv2-museum-immersive"),
      card=sect.querySelector(".hv2-place-primary"),
      label=card.querySelector(".hv2-section-kicker"),
      title=card.querySelector("h3"),
      head=sect.querySelector("#places-title"),
      bounds=card.getBoundingClientRect(),
      labelRect=label.getBoundingClientRect();
    return {
      heading:head.textContent.trim(),
      kicker:sect.querySelector(".hv2-section-head .hv2-section-kicker").textContent.trim(),
      virtualLabel:label.textContent.trim(),
      labelColor:getComputedStyle(label).color,
      labelBackground:getComputedStyle(label).backgroundColor,
      cardBackground:getComputedStyle(card).backgroundImage,
      titleColor:getComputedStyle(title).color,
      labelInside:labelRect.left>=bounds.left && labelRect.right<=bounds.right &&
        labelRect.top>=bounds.top && labelRect.bottom<=bounds.bottom,
      scrollWidth:document.documentElement.scrollWidth,
      viewport:window.innerWidth,
      cardWidth:bounds.width,
    };
  });
  ensure(data.heading.includes("AR & VR"),"AR / VR should be featured in museum title");
  ensure(data.kicker.length>0&&data.virtualLabel.length>0,"Museum labels must be present");
  ensure(data.cardBackground.includes("rgb(16, 63, 51)"),
    "Blue virtual-museum background is still active");
  ensure(data.labelColor==="rgb(233, 255, 208)",
    "Virtual-museum label has insufficient contrast; actual="+data.labelColor);
  ensure(contrast(data.labelColor,"rgb(23, 99, 74)")>=4.5,
    "Label is not sufficiently legible against the green panel");
  ensure(data.labelInside,"Virtual-museum heading clips outside the green panel");
  ensure(data.cardWidth>250,"Virtual museum card too narrow to read");
  ensure(data.scrollWidth<=data.viewport+2,"Homepage has horizontal scroll overflow");
  const general=section.locator(".hv2-museum-explorer-entry .hv2-button-primary");
  const museumUrl=await general.getAttribute("href");
  ensure(museumUrl==="museums.html?lang="+p.lang,
    "General museum button must open the full museum portal; got "+museumUrl);
  const immersive=section.locator(".hv2-museum-immersive-footer .hv2-museum-immersive-link");
  ensure(await immersive.count()===1,"AR/VR CTA must appear once at the section's end");
  const url=await immersive.getAttribute("href");
  ensure(url==="museums.html?lang="+p.lang+"&tab=immersive",
    "Bottom immersive button should open the AR/VR tab; got "+url);
  const bottomAligned=await page.evaluate(()=>{
    const card=document.querySelector("#places .hv2-place-secondary");
    const cta=document.querySelector("#places .hv2-museum-immersive-footer");
    return cta.getBoundingClientRect().top>=card.getBoundingClientRect().bottom-2;
  });
  ensure(bottomAligned,"Immersive CTA should be below both VR and GEO cards");
  const atlas=section.locator('.hv2-museum-explorer-entry a[href="'+p.atlas+'"]');
  ensure(await atlas.count()===1,"Atlas link missing: "+p.atlas);
  const res=await page.request.head(HOST+"/"+p.atlas);
  ensure(res.status()===200,"Museum atlas missing "+p.atlas);
  return data;
}
async function run(){
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=="--output"||args[2]!=="--screenshots")
    throw Error("Use --output REPORT --screenshots DIR");
  const output=resolve(args[1]),dir=resolve(args[3]);
  await mkdir(dirname(output),{recursive:true});
  await mkdir(dir,{recursive:true});
  const {chromium}=require(process.env.ARTDACI_PLAYWRIGHT_CORE||"playwright-core");
  const browser=await chromium.launch({headless:true,executablePath:await findChrome(),
    args:["--no-sandbox","--disable-dev-shm-usage"]});
  const cases=[];
  try{
    for(const viewport of VIEWPORTS){
      for(const p of PAGES){
        const page=await browser.newPage({viewport});
        const row={page:p.file,viewport:viewport.name,status:"ok"};
        try{
          const response=await page.goto(HOST+"/"+p.file,{waitUntil:"domcontentloaded",timeout:20000});
          ensure(response.status()===200,"Home page returned "+response.status());
          row.layout=await checkPage(page,p);
          await page.locator("#places").screenshot({
            path:join(dir,p.lang+"-"+viewport.name+".png"),animations:"disabled"});
        }catch(err){row.status="error";row.error=String(err?.stack||err)}
        cases.push(row);
        console.log(row.status.toUpperCase()+" "+viewport.name+" "+p.file+
          (row.error?" "+row.error.slice(0,350):""));
        await page.close();
      }
    }
  }finally{await browser.close()}
  const failed=cases.filter(x=>x.status!=="ok").length;
  const report={checkedAt:new Date().toISOString(),summary:{
    total:cases.length,passed:cases.length-failed,failed},cases};
  await writeFile(output,JSON.stringify(report,null,2)+"\n");
  console.log("ARTDACI immersive museums layout: "+JSON.stringify(report.summary));
  if(failed)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))
  run().catch(err=>{console.error(err);process.exitCode=1});
