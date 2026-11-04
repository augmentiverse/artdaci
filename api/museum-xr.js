"use strict";
const security=require("../lib/museum-xr-security.cjs");
const federation=require("../lib/museum-xr-oidc.cjs");
const finder=require("../lib/museum-xr-search.cjs");
const GOOGLE="https://tile.googleapis.com/v1",TIMEOUT=12000;
const LIMIT_BODY=2_000_000;
const env=process.env;
const fail=(res,code,message)=>res.status(code).json({error:message});
function allowedOrigin(req){
  const origin=req.headers.origin;
  if(!origin)return true;
  try{
    const u=new URL(origin);
    return u.protocol==="https:"&&(u.hostname==="artdaci.com"||u.hostname==="www.artdaci.com"||u.hostname==="artdaci.vercel.app"||u.hostname.endsWith("-daci.vercel.app"));
  }catch{return false}
}
async function quota(){
  // Best-effort per-isolate guard, not a globally guaranteed daily cap.
  const local=security.reserveProcessBudget();
  if(!local.ok){const error=new Error("Pilot process request limit reached");error.status=429;throw error}
  // Redis can be added later without changing the viewer or Google authentication.
  if(env.UPSTASH_REDIS_REST_URL&&env.UPSTASH_REDIS_REST_TOKEN){
    const shared=await security.reserveBudget(fetch,env);
    if(!shared.ok){const error=new Error("Pilot shared daily limit reached");error.status=429;throw error}
  }
}
async function googleToken(req){
  return federation.googleServiceToken(fetch,req,env,quota);
}
async function googleFetch(path,token,opts={}){
  await quota();
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),TIMEOUT);
  try{
    const response=await fetch(GOOGLE+path,{...opts,headers:{
      ...(opts.body?{"Content-Type":"application/json"}:{}),Authorization:"Bearer "+token,"X-Goog-User-Project":env.MUSEUM_XR_GOOGLE_PROJECT_ID
    },signal:controller.signal});
    if(!response.ok){const error=new Error("Google Maps Tiles request failed: "+response.status);error.status=response.status;throw error;}
    return response;
  }finally{clearTimeout(timer)}
}
async function searchIndoorNearMuseum(m,session,google){
  const rootQuery=new URLSearchParams({session,lat:String(m.lat),lng:String(m.lng),radius:"20"});
  let nearest=null;
  try{
    nearest=await(await googleFetch("/streetview/metadata?"+rootQuery,google)).json();
    if(security.validateIndoor(nearest,m))return {metadata:nearest,mode:"nearest"};
  }catch(error){if(error.status!==404)throw error}
  const nearestType=finder.classify(nearest,m,security.validateIndoor);
  // Google's lat/lng metadata returns the nearest panorama, not the nearest
  // indoor panorama. A small fixed multi-point search may find other views.
  let ids=[];
  try{
    const q=new URLSearchParams({session});
    const r=await googleFetch("/streetview/panoIds?"+q,google,{method:"POST",body:JSON.stringify({
      locations:finder.searchLocations(m),radius:12
    })});
    ids=finder.distinctPanoIds(await r.json()).filter(x=>x!==nearest?.panoId);
  }catch(error){if(error.status!==404)throw error}
  let inspected=0;
  for(const panoId of ids){
    inspected++;
    try{
      const q=new URLSearchParams({session,panoId});
      const data=await(await googleFetch("/streetview/metadata?"+q,google)).json();
      if(security.validateIndoor(data,m))return {metadata:data,mode:"nearby-unverified"};
    }catch(error){if(error.status!==404)throw error}
  }
  return {metadata:null,mode:"none",nearestType,inspected};
}
function validId(id){return typeof id==="string"&&/^[a-z0-9-]{1,64}$/.test(id)}
function validPanoId(id){return typeof id==="string"&&/^[A-Za-z0-9_-]{5,256}$/.test(id)}
function ticketResponse(res,payload,meta){
  
  res.status(200).json({ticket:security.signTicket(payload,env.MUSEUM_XR_TICKET_SECRET),metadata:security.safeMetadata(meta),dimension:security.grid(meta)});
}
module.exports=async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  res.setHeader("X-Content-Type-Options","nosniff");
  // Same-origin browser requests only; do not allow cross-origin API access.
  res.setHeader("Vary","Origin");
  res.setHeader("X-Robots-Tag","noindex, nofollow");
  if(req.method!=="POST")return fail(res,405,"POST required");
  if((Number(req.headers["content-length"])||0)>8192)return fail(res,413,"Request too large");
  const body=req.body&&typeof req.body==="object"?req.body:{};
  const configured=Boolean(env.MUSEUM_XR_ENABLED==="true"&&(!env.VERCEL_GIT_COMMIT_REF||env.VERCEL_GIT_COMMIT_REF==="feature/streetview-webxr-museums-v1")&&env.MUSEUM_XR_GOOGLE_SERVICE_ACCOUNT_EMAIL&&env.MUSEUM_XR_GOOGLE_PROJECT_NUMBER&&env.MUSEUM_XR_WORKLOAD_POOL_ID&&env.MUSEUM_XR_WORKLOAD_PROVIDER_ID&&env.MUSEUM_XR_GOOGLE_PROJECT_ID&&env.VERCEL_ENV==="preview"&&env.MUSEUM_XR_TICKET_SECRET?.length>=32&&env.MUSEUM_XR_PREVIEW_TOKEN?.length>=24);
  if(!configured)return fail(res,503,"Museum XR pilot inactive");
  if(!allowedOrigin(req))return fail(res,403,"Origin not approved");
  if(!security.isPilotAuthorized(req.headers["x-museum-xr-preview"],env.MUSEUM_XR_PREVIEW_TOKEN))return fail(res,401,"Pilot access required");
  try{
    const action=body.action;
    if(action==="diagnose")return res.status(200).json({status:"authorized",enabled:true,oidcTokenAvailable:Boolean(req.headers["x-vercel-oidc-token"]||env.VERCEL_OIDC_TOKEN)});
    if(action==="catalog")return res.status(200).json({museums:security.catalog().map(x=>({id:x.id,title:x.title,museum:x.museum,source:x.source})),perInstanceDailyLimit:security.MAX_DAILY_REQUESTS,globalLimitGuaranteed:Boolean(env.UPSTASH_REDIS_REST_URL&&env.UPSTASH_REDIS_REST_TOKEN)});
    if(!validId(body.museumId))return fail(res,400,"Invalid museum");
    const m=security.museum(body.museumId);
    if(!m)return fail(res,404,"Museum not in pilot catalog");
    if(action==="start"){
      const google=await googleToken(req);
      const sessionResult=await googleFetch("/createSession",google,{
        method:"POST",body:JSON.stringify({mapType:"streetview",language:"en-US",region:"US"})
      });
      const session=await sessionResult.json();
      if(!session.session)throw Error("Invalid session");
      const match=await searchIndoorNearMuseum(m,session.session,google);
      if(!match.metadata)return res.status(404).json({
        error:"No indoor Street View panorama found in Google Maps Tiles close to this museum.",
        code:"INDOOR_PANORAMA_NOT_FOUND",nearestType:match.nearestType,inspected:match.inspected
      });
      const data=match.metadata;
      security.grid(data);
      return ticketResponse(res,{id:m.id,session:session.session,panoId:data.panoId,dimensions:security.grid(data),exp:Date.now()+20*60000},data);
    }
    if(!["neighbor","tile"].includes(action))return fail(res,400,"Unsupported action");
    const ticket=security.readTicket(body.ticket,env.MUSEUM_XR_TICKET_SECRET);
    if(!ticket||ticket.id!==m.id)return fail(res,403,"Invalid or expired ticket");
    const google=await googleToken(req);
    if(action==="neighbor"){
      if(!validPanoId(body.panoId))return fail(res,400,"Invalid pano");
      const current=await(await googleFetch("/streetview/metadata?"+new URLSearchParams({session:ticket.session,panoId:ticket.panoId}),google)).json();
      if(!security.validateIndoor(current,m)||!current.links?.some(link=>link.panoId===body.panoId))return fail(res,403,"Pano not adjacent");
      const data=await(await googleFetch("/streetview/metadata?"+new URLSearchParams({session:ticket.session,panoId:body.panoId}),google)).json();
      if(!security.validateIndoor(data,m))return fail(res,403,"Pano outside allowed indoor area");
      security.grid(data);
      return ticketResponse(res,{...ticket,panoId:data.panoId,dimensions:security.grid(data),exp:Date.now()+20*60000},data);
    }
    const x=Number(body.x),y=Number(body.y),z=Number(body.zoom);
    if(!Number.isInteger(x)||!Number.isInteger(y)||z!==2||!ticket.dimensions||x<0||y<0||x>=ticket.dimensions.columns||y>=ticket.dimensions.rows)return fail(res,400,"Invalid tile");
    const path="/streetview/tiles/"+z+"/"+x+"/"+y+"?"+new URLSearchParams({session:ticket.session,panoId:ticket.panoId});
    const response=await googleFetch(path,google);
    const mime=response.headers.get("content-type")||"";
    if(!mime.startsWith("image/"))throw Error("Unexpected tile content");
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length>LIMIT_BODY)throw Error("Tile too large");
    res.setHeader("Content-Type",mime);return res.status(200).send(bytes);
  }catch(error){
    console.warn("Museum XR gateway failure:",error.status||502);
    return fail(res,error.status||502,error.status===429?"Daily usage cap reached":"Panorama gateway unavailable");
  }
};