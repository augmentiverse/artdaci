/**
 * Sample the canonical Cloudflare media host without downloading media bodies.
 * HEAD requests only. A successful HEAD is not a guarantee of playback.
 * Usage: node scripts/probe-cloudflare-media.mjs [--json] [--output FILE] [--strict]
 */
import {mkdir,writeFile} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {inventoryDeclaredCloudflareMedia} from "./audit-media-storage.mjs";

const HOST="media.artdaci.com";
const ORIGIN="https://artdaci.com";
const QUOTAS={images:2,audio:3,videos:1,models:2,ar:1};
const MANIFEST_IDS=["ld01","ve01","vg01","mo01"];

export function assertCanonicalMediaUrl(url){
  const target=new URL(url);
  if(target.protocol!=="https:" || target.hostname!==HOST ||
     target.port || target.username || target.password || target.search || target.hash ||
     !(target.pathname.startsWith("/artworks/") || target.pathname.startsWith("/shared/")))
    throw new TypeError("Only HTTPS URLs from media.artdaci.com can be inspected");
  return target.href;
}

export function selectHeadProbeTargets(records){
  if(!Array.isArray(records))throw new TypeError("Expected an array of manifest records");
  const targets=[];
  for(const [family,max] of Object.entries(QUOTAS)){
    const options=records.filter(row=>row.available && row.family===family && row.url)
      .sort((a,b)=>a.artworkId.localeCompare(b.artworkId) ||
        a.key.localeCompare(b.key));
    const picked=[],urls=new Set(),artists=new Set();
    for(const distinctOnly of [true,false]){
      for(const row of options){
        if(picked.length>=max)break;
        const artist=row.artworkId.slice(0,2);
        if(urls.has(row.url)||(distinctOnly && artists.has(artist)))continue;
        picked.push(row);urls.add(row.url);artists.add(artist);
      }
    }
    targets.push(...picked.map(row=>({
      artworkId:row.artworkId,family,key:row.key,
      url:assertCanonicalMediaUrl(row.url),
      mimeType:row.mimeType,
      expectedBytes:row.bytes,
    })));
  }
  for(const id of MANIFEST_IDS){
    targets.push({
      artworkId:id,family:"manifest",key:"manifest.json",
      url:assertCanonicalMediaUrl("https://"+HOST+"/artworks/"+id+"/manifest.json"),
      mimeType:"application/json",expectedBytes:null,
    });
  }
  return targets;
}

export function interpretHead(target,response,elapsedMs,origin=ORIGIN){
  const headers=response.headers;
  const mime=headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() || null;
  const cors=headers.get("access-control-allow-origin")||null;
  const length=headers.get("content-length");
  const issues=[];
  if(response.status!==200 && response.status!==206)issues.push("HTTP "+response.status);
  if(!mime)issues.push("Content-Type not reported");
  else if(target.mimeType && target.mimeType.toLowerCase()!==mime)
    issues.push("MIME differs from manifest: "+mime+" / "+target.mimeType);
  if(cors!=="*" && cors!==origin)issues.push("CORS header does not allow "+origin);
  if(length!==null && target.expectedBytes!==null && target.expectedBytes!==undefined &&
     Number.isFinite(Number(length)) && Number(length)!==target.expectedBytes)
    issues.push("Content-Length differs from recorded byte count");
  return {
    artworkId:target.artworkId,family:target.family,key:target.key,url:target.url,
    method:"HEAD",httpStatus:response.status,
    status:(response.status!==200 && response.status!==206)
      ? [403,405,429].includes(response.status)?"inconclusive":"error"
      : issues.length?"warning":"ok",
    issues,elapsedMs,mimeType:mime,cors,
    cacheControl:headers.get("cache-control")||null,
    cfCacheStatus:headers.get("cf-cache-status")||null,
    contentLength:length===null?null:Number(length),
    acceptRanges:headers.get("accept-ranges")||null,
  };
}

export async function probeHead(target,{
  fetchImpl=fetch,origin=ORIGIN,timeoutMs=9000,
}={}){
  assertCanonicalMediaUrl(target.url);
  const started=Date.now();
  try{
    const response=await fetchImpl(target.url,{
      method:"HEAD",headers:{Origin:origin},
      redirect:"manual",signal:AbortSignal.timeout(timeoutMs),
    });
    return interpretHead(target,response,Date.now()-started,origin);
  }catch(err){
    return {
      artworkId:target.artworkId,family:target.family,key:target.key,url:target.url,
      method:"HEAD",httpStatus:null,status:"inconclusive",
      issues:["Transport failure / timeout: "+String(err?.name||"Error")],
      elapsedMs:Date.now()-started,mimeType:null,cors:null,cacheControl:null,
      cfCacheStatus:null,contentLength:null,acceptRanges:null,
    };
  }
}

export async function sampleCloudflareHeaders(records,{
  fetchImpl=fetch,origin=ORIGIN,timeoutMs=9000,concurrency=3,
}={}){
  const targets=selectHeadProbeTargets(records);
  const results=[];
  for(let i=0;i<targets.length;i+=concurrency){
    const batch=await Promise.all(targets.slice(i,i+concurrency).map(item=>
      probeHead(item,{fetchImpl,origin,timeoutMs})));
    results.push(...batch);
  }
  const counts=Object.fromEntries(["ok","warning","error","inconclusive"].map(name=>
    [name,results.filter(result=>result.status===name).length]));
  return {
    inspectedAt:new Date().toISOString(),origin,host:HOST,
    method:"HEAD",sampleSize:results.length,statusCounts:counts,
    caveat:"Only an HTTP HEAD sample of manifest-declared media and four manifest URLs; not a Cloudflare bucket list or verified browser playback. Missing HEAD headers may differ from GET.",
    results,
  };
}

async function main(args=process.argv.slice(2)){
  const allowed=new Set(["--json","--strict","--output"]);
  for(let i=0;i<args.length;i++){
    if(args[i]==="--output"){if(!args[++i] || args[i].startsWith("--"))throw Error("Missing --output file");continue}
    if(!allowed.has(args[i]))throw Error("Unknown option: "+args[i]);
  }
  const manifest=await inventoryDeclaredCloudflareMedia();
  const report=await sampleCloudflareHeaders(manifest.records);
  const index=args.indexOf("--output");
  if(index!==-1){
    const file=resolve(args[index+1]);
    await mkdir(dirname(file),{recursive:true});
    await writeFile(file,JSON.stringify(report,null,2)+"\n","utf8");
  }
  if(args.includes("--json"))console.log(JSON.stringify(report,null,2));
  else {
    console.log("ARTDACI Cloudflare HEAD sample: "+report.sampleSize+" URLs; "+JSON.stringify(report.statusCounts));
    for(const item of report.results){
      console.log(item.status.toUpperCase()+" "+(item.httpStatus??"-")+" "+item.family+" "+item.url);
      if(item.issues.length)console.log("  "+item.issues.join("; "));
      console.log("  MIME: "+(item.mimeType||"-")+"; CORS: "+(item.cors||"-")+
        "; cache: "+(item.cacheControl||"-")+"; CF-cache: "+(item.cfCacheStatus||"-"));
    }
    console.log(report.caveat);
  }
  if(args.includes("--strict") &&
     (report.statusCounts.error||report.statusCounts.warning||report.statusCounts.inconclusive))
     process.exitCode=1;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))
  main().catch(err=>{console.error(err.message);process.exitCode=1});
