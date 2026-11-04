"use strict";
const {createHmac,timingSafeEqual}=require("node:crypto");
const views=require("../geo/data/artwork-museum-views.json");
const NATIONAL_GALLERY="https://artsandculture.google.com/streetview/the-national-gallery/1AGVN5JVf0UVkw?sv_lng=-0.12933405572537834&sv_lat=51.508872946710625&sv_h=62.98523590673666&sv_p=8.01027775120724&sv_pid=CAoSHENJQUJJaEFCYmM4bXdTakJKMnhsWmd5VjVnT0Y.&sv_z=2";
const MAX_DAILY_REQUESTS=300;
// Best-effort safety only: Vercel isolates have independent memory and can restart.
let processDay="",processRequests=0;
let minuteWindow=0,minuteRequests=0;
const MAX_DISTANCE_METRES=35;
const RESTRICTED_ZOOM=2;
const LUA_BUDGET="local c=tonumber(redis.call('GET',KEYS[1]) or 0);local n=tonumber(ARGV[1]);local lim=tonumber(ARGV[3]);if c+n>lim then return {0,c} end;local v=redis.call('INCRBY',KEYS[1],n);redis.call('EXPIRE',KEYS[1],tonumber(ARGV[2]));return {1,v}";

function parseMuseumLink(source){
  try{
    const u=new URL(source);
    if(u.protocol!=="https:"||u.hostname!=="artsandculture.google.com"||!u.pathname.startsWith("/streetview/"))return null;
    if(!u.searchParams.has("sv_lat")||!u.searchParams.has("sv_lng"))return null;
    const lat=Number(u.searchParams.get("sv_lat")),lng=Number(u.searchParams.get("sv_lng"));
    if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)return null;
    return {lat,lng};
  }catch{return null}
}
function catalog(){
  const records=views.items.filter(x=>x.exactPanoramaUrl).map(x=>({id:x.slug,title:x.title,museum:x.museum,source:x.exactPanoramaUrl}));
  records.push({id:"national-gallery-london",title:"National Gallery · London",museum:"The National Gallery",source:NATIONAL_GALLERY});
  return records.filter(x=>parseMuseumLink(x.source));
}
function museum(id){
  if(typeof id!=="string")return null;
  const item=catalog().find(x=>x.id===id);
  return item?{...item,...parseMuseumLink(item.source)}:null;
}
function distance(a,b){
  const r=Math.PI/180;
  const dLat=(a.lat-b.lat)*r,dLng=(a.lng-b.lng)*r;
  return 12742000*Math.asin(Math.min(1,Math.sqrt(Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLng/2)**2)));
}
function validateIndoor(metadata,location){
  return !!metadata&&typeof metadata.panoId==="string"&&metadata.panoId.length>0&&metadata.imageryType==="indoor"&&
    Number.isFinite(metadata.lat)&&Number.isFinite(metadata.lng)&&distance(metadata,location)<=MAX_DISTANCE_METRES;
}
function safeMetadata(data){
  if(!data||!data.panoId||!data.copyright)return null;
  const fields=["panoId","lat","lng","heading","tilt","roll","imageHeight","imageWidth","tileHeight","tileWidth","copyright","date","imageryType"];
  const result=Object.fromEntries(fields.map(k=>[k,data[k]]));
  result.links=Array.isArray(data.links)?data.links.slice(0,12).filter(x=>typeof x.panoId==="string"&&Number.isFinite(x.heading)).map(x=>({panoId:x.panoId,heading:x.heading,text:String(x.text||"").slice(0,80)})):[];
  try{
    const u=new URL(data.reportProblemLink);
    result.reportProblemLink=u.protocol==="https:"?u.href:null;
  }catch{result.reportProblemLink=null}
  return result;
}
function grid(data,zoom=RESTRICTED_ZOOM){
  // Lower zooms are reserved for retrying Google tile failures during private VR testing.
  if(!Number.isInteger(zoom)||zoom<0||zoom>RESTRICTED_ZOOM)throw Error("Zoom denied");
  const all=["imageWidth","imageHeight","tileWidth","tileHeight"].map(k=>Number(data[k]));
  if(!all.every(n=>Number.isInteger(n)&&n>0))throw Error("Invalid dimensions");
  const [w,h,tw,th]=all,factor=2**(5-zoom);
  const width=Math.ceil(w/factor),height=Math.ceil(h/factor);
  const columns=Math.ceil(width/tw),rows=Math.ceil(height/th);
  if(width>4096||height>2048||columns*rows>40)throw Error("Texture budget exceeded");
  return {width,height,tileWidth:tw,tileHeight:th,columns,rows,zoom};
}
function signTicket(payload,secret){
  const body=Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature=createHmac("sha256",secret).update(body).digest("base64url");
  return body+"."+signature;
}
function readTicket(token,secret,now=Date.now()){
  if(typeof token!=="string"||token.length>4096)return null;
  const [body,signature,...extra]=token.split(".");
  if(extra.length||!body||!signature)return null;
  const expect=createHmac("sha256",secret).update(body).digest("base64url");
  const a=Buffer.from(signature),b=Buffer.from(expect);
  if(a.length!==b.length||!timingSafeEqual(a,b))return null;
  try{
    const payload=JSON.parse(Buffer.from(body,"base64url").toString("utf8"));
    if(!payload||!Number.isSafeInteger(payload.exp)||payload.exp<now||payload.exp>now+1800000||
       typeof payload.session!=="string"||!museum(payload.id)||typeof payload.panoId!=="string"||!payload.dimensions)return null;
    return payload;
  }catch{return null}
}
function isPilotAuthorized(provided,expected){
  if(!expected||expected.length<24||typeof provided!=="string")return false;
  const a=Buffer.from(provided),b=Buffer.from(expected);
  return a.length===b.length&&timingSafeEqual(a,b);
}
function reserveProcessBudget(now=Date.now()){
  const day=new Date(now).toISOString().slice(0,10);
  const minute=Math.floor(now/60000);
  if(processDay!==day){processDay=day;processRequests=0}
  if(minuteWindow!==minute){minuteWindow=minute;minuteRequests=0}
  if(processRequests>=MAX_DAILY_REQUESTS||minuteRequests>=60)return {ok:false,usage:processRequests};
  processRequests++;minuteRequests++;
  return {ok:true,usage:processRequests};
}
async function reserveBudget(fetchImpl,env,now=Date.now()){
  const url=env.UPSTASH_REDIS_REST_URL,token=env.UPSTASH_REDIS_REST_TOKEN;
  if(!url||!token||!/^https:\/\//.test(url))throw Error("Budget store not configured");
  const current=new Date(now);
  const key="artdaci:museum-xr:google-requests:"+current.toISOString().slice(0,10);
  const ttl=Math.ceil((Date.UTC(current.getUTCFullYear(),current.getUTCMonth(),current.getUTCDate()+1)-now)/1000)+7200;
  const response=await fetchImpl(url.replace(/\/$/,""),{
    method:"POST",
    headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},
    body:JSON.stringify(["EVAL",LUA_BUDGET,"1",key,"1",String(ttl),String(MAX_DAILY_REQUESTS)])
  });
  if(!response.ok)throw Error("Budget store unavailable");
  const json=await response.json();
  if(json.error||!Array.isArray(json.result)||json.result.length!==2)throw Error("Invalid budget result");
  const [allowed,usage]=json.result.map(Number);
  if(allowed!==1)return {ok:false,usage};
  return {ok:true,usage};
}
module.exports={MAX_DAILY_REQUESTS,RESTRICTED_ZOOM,catalog,museum,parseMuseumLink,distance,validateIndoor,safeMetadata,grid,signTicket,readTicket,isPilotAuthorized,reserveBudget,reserveProcessBudget};
