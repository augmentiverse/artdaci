/**
 * Browser acceptance check for the eleven additional museums in the homepage
 * collection index. All data comes from the existing 17-museum Atlas.
 * Run against the repository via a local HTTP server.
 */
import {createRequire} from "node:module";
import {access,mkdir,writeFile} from "node:fs/promises";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

const require=createRequire(import.meta.url);
const ORIGIN=process.env.ARTDACI_HERO_TEST_ORIGIN||"http://127.0.0.1:8765";
const PAGES=[
  {file:"index-fr.html",lang:"fr",atlas:"museums-atlas.html"},
  {file:"index.html",lang:"en",atlas:"museums-atlas-en.html"},
  {file:"index-ar.html",lang:"ar",atlas:"museums-atlas-ar.html"},
];
function ensure(ok,message){if(!ok)throw Error(message)}
async function browserExe(){
  for(const path of [process.env.ARTDACI_CHROME,
    "/usr/bin/google-chrome","/usr/bin/google-chrome-stable",
    "/usr/bin/chromium","/usr/bin/chromium-browser"].filter(Boolean)){
    try{await access(path);return path}catch{}
  }
  throw Error("Chrome/Chromium unavailable");
}
async function inspect(page,spec){
  await page.waitForSelector("#catalogue-app[data-ready='true'] .museum-more > summary",
    {timeout:45000});
  const featured=page.locator("#catalogue-app .museum-index-grid .museum-index-card");
  ensure(await featured.count()===6,"Exactly six featured museum cards expected");
  const expand=page.locator("#catalogue-app .museum-more");
  const summary=expand.locator("summary");
  ensure(await expand.locator(".museum-more-item").count()===0,
    "Additional museums should not be fetched until expanded");
  await summary.focus();
  await page.keyboard.press("Enter");
  ensure(await expand.evaluate(el=>el.open),"Enter must open the native disclosure");
  await page.waitForFunction(()=>{
    const el=document.querySelector("#catalogue-app .museum-more");
    return el?.dataset.expandedLoaded==="true";
  },null,{timeout:20000});
  const cards=expand.locator(".museum-more-item");
  ensure(await cards.count()===11,
    "Expected eleven different additional museums, got "+await cards.count());
  const hrefs=await cards.locator("a").evaluateAll(links=>links.map(x=>x.getAttribute("href")));
  ensure(new Set(hrefs).size===11,"Duplicate additional museum destinations");
  ensure(hrefs.every(x=>x.startsWith(spec.atlas+"#")),
    "Links must point to the matching-language Atlas rather than invented AR/VR");
  const names=await cards.locator("strong").allTextContents();
  ensure(names.every(x=>x.trim().length>0),"Museum names must be visible");
  const overflow=await page.evaluate(()=>{
    const el=document.querySelector(".museum-more");
    const r=el.getBoundingClientRect();
    return {viewport:window.innerWidth,scrollWidth:document.documentElement.scrollWidth,
      panelRight:r.right,panelLeft:r.left};
  });
  ensure(overflow.scrollWidth<=overflow.viewport+2,"Horizontal overflow");
  ensure(overflow.panelRight<=overflow.viewport+3&&overflow.panelLeft>=-3,
    "Museum expansion outside viewport");
  const a=await page.request.head(ORIGIN+"/"+spec.atlas);
  ensure(a.status()===200,"Atlas destination not found");
  await summary.focus();
  await page.keyboard.press("Enter");
  ensure(!await expand.evaluate(el=>el.open),"Enter must close the list");
  ensure(await cards.count()===11,"Closing keeps the museum cards ready for next opening");
  await summary.focus();
  await page.keyboard.press("Enter");
  return {featured:6,additional:11,links:hrefs,overflow};
}
async function main(){
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=="--output"||args[2]!=="--screenshots")
    throw Error("Use --output REPORT --screenshots DIR");
  const reportFile=resolve(args[1]),shots=resolve(args[3]);
  await mkdir(dirname(reportFile),{recursive:true});
  await mkdir(shots,{recursive:true});
  const {chromium}=require(process.env.ARTDACI_PLAYWRIGHT_CORE||"playwright-core");
  const browser=await chromium.launch({headless:true,executablePath:await browserExe(),
    args:["--no-sandbox","--disable-dev-shm-usage"]});
  const results=[];
  try{
    for(const p of PAGES){
      for(const viewport of [{name:"desktop",width:1280,height:900},{name:"mobile",width:390,height:844}]){
        const page=await browser.newPage({viewport,locale:p.lang});
        const result={page:p.file,viewport:viewport.name,status:"ok"};
        try{
          const response=await page.goto(ORIGIN+"/"+p.file,{waitUntil:"domcontentloaded",timeout:25000});
          ensure(response?.status()===200,"Homepage unavailable");
          result.layout=await inspect(page,p);
          await page.locator(".museum-more").screenshot({
            path:join(shots,p.lang+"-"+viewport.name+".png"),
            animations:"disabled"});
        }catch(e){result.status="error";result.error=String(e?.stack||e)}
        results.push(result);
        console.log(result.status.toUpperCase()+" "+p.lang+" "+viewport.name+
          (result.error?" "+result.error.slice(0,440):""));
        await page.close();
      }
    }
  }finally{await browser.close()}
  const failed=results.filter(x=>x.status!=="ok").length;
  const report={checkedAt:new Date().toISOString(),
    summary:{total:results.length,passed:results.length-failed,failed},results};
  await writeFile(reportFile,JSON.stringify(report,null,2)+"\n");
  console.log("ARTDACI additional museums browser QA: "+JSON.stringify(report.summary));
  if(failed)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))
  main().catch(error=>{console.error(error);process.exitCode=1});
