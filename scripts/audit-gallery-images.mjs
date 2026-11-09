/* Read-only audit of ARTDACI's 24 home Index image files. Never recrops art. */
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

export function intrinsicSize(b) {
  if (b.length > 30 && b.toString("ascii",0,4)==="RIFF" && b.toString("ascii",8,12)==="WEBP") {
    const kind=b.toString("ascii",12,16);
    if (kind==="VP8 ") return {width:b.readUInt16LE(26)&16383,height:b.readUInt16LE(28)&16383};
    if (kind==="VP8X") return {width:1+b[24]+(b[25]<<8)+(b[26]<<16),height:1+b[27]+(b[28]<<8)+(b[29]<<16)};
    if (kind==="VP8L" && b[20]===47) {
      const bits=b.readUInt32LE(21);
      return {width:(bits&16383)+1,height:((bits>>>14)&16383)+1};
    }
  }
  if (b.length>24 && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
  }
  if (b[0]===255 && b[1]===216) {
    let i=2;
    while (i+9<b.length) {
      if(b[i++]!==255) continue;
      while(b[i]===255)i++;
      const marker=b[i++];
      if(marker===217||marker===218)break;
      if(marker===1||(marker>=208&&marker<=215))continue;
      const length=b.readUInt16BE(i);
      if(length<2||i+length>b.length)break;
      if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
        return {height:b.readUInt16BE(i+3),width:b.readUInt16BE(i+5)};
      }
      i+=length;
    }
  }
  return null;
}

export function extractHomepageImages(source) {
  const prefix="const HOME_GALLERY_IMAGE_OVERRIDES = Object.freeze({";
  const table=source.split(prefix)[1]?.split("\n});")[0];
  if(!table)throw Error("Gallery overrides missing");
  const list=[...table.matchAll(/^\s*"([^"]+)":\s*"([^"]+)"[,]?/gm)]
    .map(m=>({slug:m[1],path:m[2]}));
  if(list.length!==24||new Set(list.map(x=>x.slug)).size!==24)throw Error("Expected 24 distinct gallery artworks");
  for(const item of list) {
    if(!item.path.startsWith("assets/")||item.path.includes(".."))throw Error("Unsafe gallery asset path");
  }
  return list;
}

export async function auditGalleryImages() {
  const manifest=await readFile(new URL("./catalogue.js",import.meta.url),"utf8");
  const assets=await Promise.all(extractHomepageImages(manifest).map(async image=>{
    const data=await readFile(resolve(ROOT,image.path));
    const size=intrinsicSize(data);
    if(!size||size.width<1||size.height<1)throw Error("Cannot inspect "+image.path);
    return {...image,...size,bytes:data.length,lowResolution:size.width<600||size.height<400};
  }));
  const logo=await stat(resolve(ROOT,"assets/varia/artdaci-logo.png"));
  return {count:assets.length,totalBytes:assets.reduce((n,x)=>n+x.bytes,0),logoBytes:logo.size,assets};
}

if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const report=await auditGalleryImages();
  if(process.argv.includes("--json"))console.log(JSON.stringify(report,null,2));
  else {
    console.log("ARTDACI Index: "+report.count+" images, "+(report.totalBytes/1048576).toFixed(2)+" MiB; header logo "+(report.logoBytes/1048576).toFixed(2)+" MiB");
    for(const im of report.assets)console.log(im.slug+": "+im.width+"x"+im.height+", "+Math.round(im.bytes/1024)+" KiB"+(im.lowResolution?" — review resolution":""));
  }
}
