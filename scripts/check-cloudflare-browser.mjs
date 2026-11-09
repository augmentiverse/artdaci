/**
 * ARTDACI R2 browser playback + 3D and bounded HTTP Range diagnostics.
 * Read-only: tests live artdaci.com pages and media.artdaci.com assets.
 * A GitHub runner is not a substitute for mobile Safari, Quest or native AR.
 * playwright-core installed OUTSIDE the repository; Chrome preinstalled on CI.
 */
import {createRequire} from "node:module";
import {access,mkdir,writeFile} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {inventoryDeclaredCloudflareMedia} from "./audit-media-storage.mjs";
import {assertCanonicalMediaUrl} from "./probe-cloudflare-media.mjs";

const require=createRequire(import.meta.url);
const PRODUCTION="https://artdaci.com";
const VIEWER_URL=PRODUCTION+"/space.html?painting=mona-lisa&lang=en";

const CASES=[
  {artworkId:"ld04",family:"audio",key:"overview.fr",role:"audio-playback"},
  {artworkId:"ve01",family:"videos",key:"animation",role:"video-playback"},
  {artworkId:"ld01",family:"models",key:"main-v2",role:"model-range"},
  {artworkId:"ld01",family:"ar",key:"target-v2",role:"ar-range"},
];

export function selectBrowserMedia(records){
  if(!Array.isArray(records))throw new TypeError("Expected media inventory records");
  return CASES.map(spec=>{
    const found=records.find(item=>
      item.artworkId===spec.artworkId && item.family===spec.family &&
      item.key===spec.key && item.available===true && item.url);
    if(!found)throw new Error("Missing published browser diagnostic media: "+
      spec.artworkId+" "+spec.family+"."+spec.key);
    return {...spec,url:assertCanonicalMediaUrl(found.url),
      expectedMime:found.mimeType};
  });
}

export function classifyBrowserRange(status, contentRange){
  if(status===206){
    if(contentRange && !/^bytes 0-\d+\/\d+$/i.test(contentRange))
      return {status:"warning",note:"206 with unexpected Content-Range format"};
    return {status:"ok",note:"Partial content (HTTP 206)"};
  }
  if(status===200)return {status:"warning",note:"Range not honored (HTTP 200); body was stopped after the first chunk"};
  if(status===403||status===405||status===429)
    return {status:"inconclusive",note:"Server restricted this probe (HTTP "+status+")"};
  return {status:"error",note:"Unexpected HTTP "+status};
}

async function executableChrome(){
  for(const path of [process.env.ARTDACI_CHROME,
    "/usr/bin/google-chrome","/usr/bin/google-chrome-stable",
    "/usr/bin/chromium","/usr/bin/chromium-browser"].filter(Boolean)){
    try{await access(path);return path}catch{}
  }
  throw Error("No Chrome/Chromium executable found on runner");
}

async function inspectBrowserRange(page,item){
  const raw=await page.evaluate(async ({url})=>{
    const aborter=new AbortController();
    const timeout=setTimeout(()=>aborter.abort(),12000);
    try{
      const response=await fetch(url,{
        method:"GET",mode:"cors",cache:"no-store",redirect:"error",
        headers:{"Range":"bytes=0-1023"},signal:aborter.signal,
      });
      const contentRange=response.headers.get("content-range");
      const mime=response.headers.get("content-type");
      let firstChunkBytes=0;
      if(response.body){
        const reader=response.body.getReader();
        const part=await reader.read();
        firstChunkBytes=part.value?.byteLength||0;
        aborter.abort(); // stops transfer even when server ignores Range
      }
      return {httpStatus:response.status,contentRange,mime,
        firstChunkBytes};
    }catch(error){return {error:String(error?.name||error)}}
    finally{clearTimeout(timeout);aborter.abort()}
  },{url:item.url});
  if(raw.error)return {...item,status:"inconclusive",reason:raw.error,...raw};
  const classified=classifyBrowserRange(raw.httpStatus,raw.contentRange);
  return {...item,...raw,...classified};
}

async function inspectMediaPlayback(page,item,kind){
  const raw=await page.evaluate(async ({url,kind})=>{
    const el=document.createElement(kind);
    el.preload="metadata";
    el.crossOrigin="anonymous";
    el.muted=kind==="video";
    el.playsInline=true;
    el.style.position="absolute";
    el.style.width="2px";el.style.height="2px";
    el.style.opacity="0";
    const events=[];
    for(const event of ["loadedmetadata","canplay","playing","timeupdate","error"])
      el.addEventListener(event,()=>events.push(event));
    document.body.append(el);
    el.src=url;
    const timeout=(ms)=>new Promise(resolve=>setTimeout(()=>resolve("timeout"),ms));
    const result=()=>({
      readyState:el.readyState,
      networkState:el.networkState,
      duration:Number.isFinite(el.duration)?el.duration:null,
      currentTime:Number(el.currentTime.toFixed(3)),
      mediaErrorCode:el.error?.code??null,
      events:events.slice(0,10),
    });
    try{
      const metadata=await Promise.race([
        new Promise(resolve=>{
          if(el.readyState>=1)resolve("metadata");
          else{
            el.addEventListener("loadedmetadata",()=>resolve("metadata"),{once:true});
            el.addEventListener("error",()=>resolve("media-error"),{once:true});
          }
        }),timeout(12000),
      ]);
      if(metadata!=="metadata")return {...result(),stage:"metadata",outcome:metadata};
      const attempt=await Promise.race([
        el.play().then(()=>"play").catch(err=>"play-error:"+String(err?.name||err)),
        timeout(12000),
      ]);
      if(attempt!=="play")return {...result(),stage:"play",outcome:attempt};
      const start=el.currentTime;
      await Promise.race([
        new Promise(resolve=>el.addEventListener("timeupdate",()=>resolve(true),{once:true})),
        timeout(1100),
      ]);
      return {...result(),stage:"play",outcome:!el.paused?"playing":"paused",
        advanced:el.currentTime>start};
    }finally{
      el.pause();
      el.removeAttribute("src");
      el.load();
      el.remove();
    }
  },{url:item.url,kind});
  const status=raw.outcome==="playing" && raw.readyState>=2 ? "ok" :
    raw.outcome==="timeout" || raw.outcome?.startsWith("play-error:NotAllowedError")?
      "inconclusive":"warning";
  return {...item,status,...raw};
}

async function inspectModelViewer(page){
  const model={kind:"site-model-viewer",site:VIEWER_URL,status:"inconclusive"};
  try{
    await page.goto(VIEWER_URL,{waitUntil:"domcontentloaded",timeout:25000});
    const element=page.locator("#space-model");
    await element.waitFor({state:"attached",timeout:15000});
    await page.waitForFunction(()=>{
      const el=document.getElementById("space-model");
      return el && ["deferred","loaded","error"].includes(el.dataset.modelLoadState);
    },null,{timeout:20000});
    const initialState=await element.getAttribute("data-model-load-state");
    if(initialState==="deferred"){
      await element.dispatchEvent("pointerdown",{bubbles:true});
    }
    await page.waitForFunction(()=>{
      const el=document.getElementById("space-model");
      return el && ["loaded","error"].includes(el.dataset.modelLoadState);
    },null,{timeout:45000});
    const result=await element.evaluate(el=>({
      state:el.dataset.modelLoadState,
      src:el.getAttribute("src"),
      loaded:typeof el.loaded==="boolean"?el.loaded:null,
      visible:typeof el.modelIsVisible==="boolean"?el.modelIsVisible:null,
      status:document.getElementById("space-status")?.textContent?.trim()||"",
    }));
    const remote=result.src?.startsWith("https://media.artdaci.com/");
    model.status=result.state==="loaded" && remote && result.loaded!==false?"ok":
      result.state==="loaded"?"warning":"error";
    model.reason=remote?"Loaded the Cloudflare model":"The page used a local model or fallback";
    if(result.state==="error")model.reason="Model viewer raised an error";
    Object.assign(model,result);
    return model;
  }catch(error){
    return {...model,reason:"Site model test did not finish in headless Chrome: "+String(error?.name||error)};
  }
}

export async function runBrowserDiagnostics(){
  const inventory=await inventoryDeclaredCloudflareMedia();
  const assets=selectBrowserMedia(inventory.records);
  const playwrightPath=process.env.ARTDACI_PLAYWRIGHT_CORE||"playwright-core";
  const {chromium}=require(playwrightPath);
  const browser=await chromium.launch({
    headless:true,executablePath:await executableChrome(),
    args:["--no-sandbox","--disable-dev-shm-usage","--autoplay-policy=no-user-gesture-required",
      "--enable-webgl","--use-gl=angle","--use-angle=swiftshader","--mute-audio"],
  });
  const report={
    executedAt:new Date().toISOString(),
    origin:PRODUCTION,runner:"headless Chromium in GitHub Actions",
    approach:"Real production space.html page; browser GET Range and media playback from artdaci.com origin",
    notes:["No published media or R2 settings changed",
      "Real device-specific AR and VR require device validation",
      "Headless browser audio/video codecs and software WebGL may differ from visitor devices"],
    results:[],errors:[],
  };
  try{
    const context=await browser.newContext({viewport:{width:1280,height:800},
      ignoreHTTPSErrors:false});
    const page=await context.newPage();
    page.setDefaultTimeout(20000);
    const model=await inspectModelViewer(page);
    report.results.push(model);
    if(model.status==="inconclusive")report.errors.push(model.reason);
    if(!page.url().startsWith(PRODUCTION)){
      try{await page.goto(PRODUCTION+"/space.html?painting=mona-lisa",{
        waitUntil:"domcontentloaded",timeout:25000});
      }catch(error){report.errors.push("Cannot reach production origin: "+String(error?.name||error))}
    }
    for(const item of assets){
      if(item.family==="audio"||item.family==="videos"){
        try{report.results.push(await inspectMediaPlayback(page,item,
          item.family==="audio"?"audio":"video"))}
        catch(error){report.results.push({...item,status:"inconclusive",reason:String(error?.name||error)})}
      }
      try{report.results.push(await inspectBrowserRange(page,item))}
      catch(error){report.results.push({...item,status:"inconclusive",reason:String(error?.name||error)})}
    }
    await context.close();
  }finally{await browser.close()}
  report.summary=Object.fromEntries(["ok","warning","error","inconclusive"]
    .map(status=>[status,report.results.filter(row=>row.status===status).length]));
  return report;
}

async function main(args){
  const index=args.indexOf("--output");
  if(args.length && (index!==0 || args.length!==2 || !args[1]))
    throw Error("Only --output PATH is supported");
  const target=index===0?resolve(args[1]):null;
  let report;
  try{report=await runBrowserDiagnostics()}
  catch(error){report={executedAt:new Date().toISOString(),status:"inconclusive",
    error:String(error?.stack||error),summary:{inconclusive:1}}}
  if(target){await mkdir(dirname(target),{recursive:true});
    await writeFile(target,JSON.stringify(report,null,2)+"\n","utf8")}
  console.log("ARTDACI browser media diagnostics: "+JSON.stringify(report.summary));
  for(const row of report.results||[]){
    console.log(row.status?.toUpperCase()+" "+(row.family||row.kind)+" "+
      (row.artworkId||"") +" "+(row.url||row.site||"")+
      " "+(row.reason||row.note||row.outcome||""));
  }
  if(report.error)console.error(report.error);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))
  main(process.argv.slice(2)).catch(err=>{console.error(err);process.exitCode=1});
