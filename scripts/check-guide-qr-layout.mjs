/**
 * Local-browser layout QA: QR logo placement, native Atlas disclosure,
 * language parity and desktop/mobile/print geometry.
 * Starts against a local HTTP server, never against production or R2.
 */
import {createRequire} from "node:module";
import {mkdir,writeFile,access} from "node:fs/promises";
import {dirname,resolve,join} from "node:path";
import {fileURLToPath} from "node:url";

const require=createRequire(import.meta.url);
const BASE=process.env.ARTDACI_GUIDE_TEST_BASE_URL||"http://127.0.0.1:8765";
const QR=["print-multimedia-qr-fr.html","print-multimedia-qr.html"];
const GUIDE=["atlas.html","atlas-en.html","atlas-ar.html"];
const VIEWPORTS=[
  {name:"desktop",width:1280,height:900},
  {name:"mobile",width:390,height:844},
];

function ensure(condition,description){
  if(!condition)throw Error(description);
}
async function chrome(){
  for(const p of [process.env.ARTDACI_CHROME,"/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable","/usr/bin/chromium",
      "/usr/bin/chromium-browser"].filter(Boolean)){
    try{await access(p);return p}catch{}
  }
  throw Error("Chrome / Chromium executable unavailable");
}

async function inspectQR(page){
  const data=await page.evaluate(()=>{
    const logo=document.querySelector(".qr-directory-header .qr-directory-logo");
    const label=document.querySelector(".qr-directory-brand .eyebrow");
    const header=document.querySelector(".qr-directory-header");
    if(!logo||!label||!header)return {reason:"Logo / companion label missing"};
    const r=logo.getBoundingClientRect(),l=label.getBoundingClientRect(),
      h=header.getBoundingClientRect();
    return {
      logo:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},
      label:{x:l.x,y:l.y,right:l.right,bottom:l.bottom},
      header:{x:h.x,y:h.y},
      position:getComputedStyle(logo).position,
      imageLoaded:logo.complete&&logo.naturalWidth>0,
      scrollWidth:document.documentElement.scrollWidth,
      viewport:window.innerWidth,
    };
  });
  ensure(!data.reason,data.reason||"QR header missing");
  ensure(data.imageLoaded,"QR logo image did not load");
  ensure(data.position!=="absolute","QR logo is absolutely positioned");
  ensure(data.logo.right<=data.label.x+1,"QR logo must precede label horizontally");
  ensure(data.logo.y<data.label.bottom&&data.label.y<data.logo.bottom,
    "QR logo and companion label must share a row");
  ensure(Math.abs(data.logo.x-data.header.x)<5,
    "QR logo must be aligned to header's left edge");
  ensure(data.scrollWidth<=data.viewport+2,"QR page overflows viewport");
  return data;
}

async function inspectGuide(page){
  const disclosure=page.locator("#atlas-concept");
  ensure(await disclosure.count()===1,"Atlas disclosure missing");
  const summary=page.locator("#atlas-concept > summary");
  ensure(await summary.count()===1,"Atlas disclosure summary missing");
  ensure(await disclosure.locator(".guide-concept-icon").count()===1,
    "Atlas CTA book icon missing");
  ensure(await page.locator(".guide-faq-item").count()===5,
    "Five practical FAQ questions expected");
  const layout=await page.evaluate(()=>{
    const details=document.querySelector("#atlas-concept"),
      summary=details.querySelector("summary"),
      faq=document.querySelector("#faq"),bounds=summary.getBoundingClientRect();
    return {
      height:bounds.height,
      background:getComputedStyle(details).backgroundImage,
      beforeFaq:!!(details.compareDocumentPosition(faq)&Node.DOCUMENT_POSITION_FOLLOWING),
      scrollWidth:document.documentElement.scrollWidth,
      viewport:window.innerWidth,
    };
  });
  ensure(layout.beforeFaq,"The Atlas CTA should appear before the FAQ");
  ensure(layout.height>=70,"Atlas CTA tap area too short");
  ensure(layout.background.includes("gradient"),"Atlas CTA background is not highlighted");
  ensure(layout.scrollWidth<=layout.viewport+2,"Guide overflows viewport");
  await summary.focus();
  await page.keyboard.press("Enter");
  ensure(await disclosure.evaluate(el=>el.open),"Pressing Enter must open Atlas details");
  ensure(await disclosure.locator("#atlas-content").isVisible(),
    "Atlas content must be visible when expanded");
  await page.keyboard.press("Enter");
  ensure(!await disclosure.evaluate(el=>el.open),"Pressing Enter must close Atlas details");
  const faq=page.locator(".guide-faq-item").first();
  await faq.locator("summary").click();
  ensure(await faq.evaluate(el=>el.open),"FAQ must expand");
  await faq.locator("summary").click();
  return layout;
}

async function run(){
  const args=process.argv.slice(2);
  let output="",shots="";
  for(let i=0;i<args.length;i++){
    if(args[i]==="--output")output=args[++i];
    else if(args[i]==="--screenshots")shots=args[++i];
    else throw Error("Unknown option "+args[i]);
  }
  ensure(output&&shots,"--output and --screenshots are required");
  const target=resolve(output),screens=resolve(shots);
  await mkdir(dirname(target),{recursive:true});
  await mkdir(screens,{recursive:true});
  const {chromium}=require(process.env.ARTDACI_PLAYWRIGHT_CORE||"playwright-core");
  const browser=await chromium.launch({headless:true,executablePath:await chrome(),
    args:["--no-sandbox","--disable-dev-shm-usage"]});
  const results=[];
  try{
    for(const viewport of VIEWPORTS){
      const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});
      for(const file of QR.concat(GUIDE)){
        const result={page:file,viewport:viewport.name,status:"ok"};
        try{
          const response=await page.goto(BASE+"/"+file,{waitUntil:"networkidle",timeout:20000});
          ensure(response?.status()===200,"HTTP status "+response?.status());
          result.layout=QR.includes(file)?await inspectQR(page):await inspectGuide(page);
          if(file==="print-multimedia-qr-fr.html"||file==="atlas.html"||
            viewport.name==="desktop"){
            await page.screenshot({path:join(screens,file+"-"+viewport.name+".png"),
              fullPage:true});
          }
        }catch(error){
          result.status="error";
          result.error=String(error?.stack||error);
        }
        results.push(result);
        console.log(result.status.toUpperCase()+" "+viewport.name+" "+file+
          (result.error?" "+result.error.slice(0,400):""));
      }
      await page.close();
    }
    // Separate print-CSS check with print emulation.
    const page=await browser.newPage({viewport:{width:1122,height:794}});
    try{
      await page.emulateMedia({media:"print"});
      const response=await page.goto(BASE+"/"+QR[0],{waitUntil:"networkidle",timeout:20000});
      ensure(response?.status()===200,"Print QR page HTTP "+response?.status());
      const layout=await inspectQR(page);
      await page.screenshot({path:join(screens,"print-multimedia-qr-fr.html-print.png"),
        fullPage:true});
      results.push({page:QR[0],viewport:"print",status:"ok",layout});
      console.log("OK print "+QR[0]);
    }catch(error){
      results.push({page:QR[0],viewport:"print",status:"error",
        error:String(error?.stack||error)});
      console.log("ERROR print "+QR[0]+" "+String(error));
    }finally{await page.close()}
  }finally{await browser.close()}
  const failures=results.filter(x=>x.status!=="ok");
  const report={checkedAt:new Date().toISOString(),origin:BASE,
    summary:{checked:results.length,passed:results.length-failures.length,
      failed:failures.length},results};
  await writeFile(target,JSON.stringify(report,null,2)+"\n","utf8");
  console.log("ARTDACI QR and guide layouts: "+JSON.stringify(report.summary));
  if(failures.length)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  run().catch(error=>{console.error(error);process.exitCode=1});
}
