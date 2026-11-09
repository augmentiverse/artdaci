/**
 * Browser geometry QA: French / English ARTDACI hero titles, full motion
 * and prefers-reduced-motion on desktop, tablet and phones.
 * Local HTTP server only; no R2 modification.
 */
import {createRequire} from "node:module";
import {mkdir,writeFile,access} from "node:fs/promises";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

const require=createRequire(import.meta.url);
const ORIGIN=process.env.ARTDACI_HERO_TEST_ORIGIN||"http://127.0.0.1:8765";
const PAGES=[{path:"index-fr.html",title:"Chefs-d’œuvre vivants"},
  {path:"index.html",title:"Masterpieces Alive"}];
const SCREENS=[{name:"wide",width:1440,height:900},{name:"tablet",width:800,height:900},
  {name:"mobile",width:390,height:844},{name:"small-mobile",width:320,height:740}];

async function chrome(){
  for(const path of [process.env.ARTDACI_CHROME,"/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable","/usr/bin/chromium","/usr/bin/chromium-browser"].filter(Boolean)){
    try{await access(path);return path}catch{}
  }
  throw Error("Chrome/Chromium not found");
}
function check(ok,desc){if(!ok)throw Error(desc)}

async function inspectTitle(page,pageSpec,reduce){
  await page.waitForSelector("#book-title .hv2-title-alive",{state:"visible"});
  const outcome=await page.evaluate(()=>{
    const h=document.getElementById("book-title"),
      first=h.querySelector(".hv2-title-first"),
      live=h.querySelector(".hv2-title-alive"),
      hero=document.querySelector(".hv2-hero-copy");
    const a=first.getBoundingClientRect(),b=live.getBoundingClientRect(),
      c=hero.getBoundingClientRect();
    return {
      title:h.textContent.replace(/\s+/g," ").trim(),
      first:{left:a.left,right:a.right,top:a.top,bottom:a.bottom,width:a.width},
      live:{left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width},
      hero:{left:c.left,right:c.right},
      animation:getComputedStyle(live).animationName,
      indent:parseFloat(getComputedStyle(live).marginInlineStart),
      intrinsicWidth:live.offsetWidth,
      transform:getComputedStyle(live).transform,
      trail:{
        content:getComputedStyle(live,"::before").content,
        position:getComputedStyle(live,"::before").position,
        width:parseFloat(getComputedStyle(live,"::before").width),
        height:parseFloat(getComputedStyle(live,"::before").height),
        right:parseFloat(getComputedStyle(live,"::before").right),
        background:getComputedStyle(live,"::before").backgroundImage,
        oldUnderlineContent:getComputedStyle(document.querySelector(".hv2-title-row"),"::after").content,
      },
    };
  });
  check(outcome.title===pageSpec.title,"Wrong accessible heading text: "+outcome.title);
  check(outcome.trail.content!=="none" && outcome.trail.position==="absolute",
    "The four-color trail must be attached to the living word");
  check(outcome.trail.width>=25 && outcome.trail.height>=4,
    "Colored trail must remain visible on this viewport");
  check(outcome.trail.right>outcome.intrinsicWidth,
    "Colored trail should be immediately to the left of the living word");
  check(outcome.trail.background.includes("linear-gradient"),
    "The colored trail gradient is absent");
  check(outcome.trail.oldUnderlineContent==="none",
    "The old title underline must be removed");
  const optimal=Math.max(0,Math.min(outcome.first.width-2,
    outcome.hero.right-outcome.first.left-outcome.intrinsicWidth-6));
  check(Math.abs(outcome.indent-optimal)<9,
    "Living word must start as close to first-line end as available width permits: actual="+
      outcome.indent+", optimal="+optimal);
  check(outcome.live.left>=outcome.first.left-3,
    "Living word must not start to the left of the first line");
  check(outcome.live.left<=outcome.first.right+8,
    "Living word should not begin past the end of the first line");
  check(outcome.live.top>=outcome.first.bottom-2,"Living word must be below first line");
  check(outcome.first.left>=outcome.hero.left-3,"First word starts outside the hero");
  check(outcome.first.right<=outcome.hero.right+3,
    "First line overflows hero by "+Math.round(outcome.first.right-outcome.hero.right)+" px");
  check(outcome.live.right<=outcome.hero.right+3,"Living word overflows hero");
  if(reduce)check(!outcome.animation.includes("artdaci-living-heartbeat"),
    "Reduced-motion mode must stop the heartbeat");
  else check(outcome.animation.includes("artdaci-living-heartbeat"),
    "Living word is not pulsing");
  return outcome;
}

async function run(){
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=="--output"||args[2]!=="--screenshots")
    throw Error("Use --output REPORT --screenshots DIR");
  const reportFile=resolve(args[1]),shots=resolve(args[3]);
  await mkdir(dirname(reportFile),{recursive:true});
  await mkdir(shots,{recursive:true});
  const {chromium}=require(process.env.ARTDACI_PLAYWRIGHT_CORE||"playwright-core");
  const browser=await chromium.launch({headless:true,executablePath:await chrome(),
    args:["--no-sandbox","--disable-dev-shm-usage"]});
  const cases=[];
  try{
    for(const viewport of SCREENS){
      for(const spec of PAGES){
        const page=await browser.newPage({viewport});
        const result={page:spec.path,viewport:viewport.name,status:"ok"};
        try{
          const response=await page.goto(ORIGIN+"/"+spec.path,{
            waitUntil:"domcontentloaded",timeout:20000});
          check(response.status()===200,"Home page status "+response.status());
          result.layout=await inspectTitle(page,spec,false);
          await page.locator(".hv2-title-row").screenshot({
            path:join(shots,viewport.name+"-"+spec.path+".png"),
            animations:"disabled",
          });
          await page.emulateMedia({reducedMotion:"reduce"});
          result.reducedMotion=await inspectTitle(page,spec,true);
        }catch(err){result.status="error";result.error=String(err?.stack||err)}
        cases.push(result);
        console.log(result.status.toUpperCase()+" "+viewport.name+" "+spec.path+
          (result.error?" "+result.error.slice(0,340):""));
        await page.close();
      }
    }
  }finally{await browser.close()}
  const failures=cases.filter(x=>x.status==="error");
  const report={checkedAt:new Date().toISOString(),summary:{
    total:cases.length,passed:cases.length-failures.length,failed:failures.length},
    cases};
  await writeFile(reportFile,JSON.stringify(report,null,2)+"\n","utf8");
  console.log("ARTDACI living title geometry: "+JSON.stringify(report.summary));
  if(failures.length)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))
  run().catch(err=>{console.error(err);process.exitCode=1});
