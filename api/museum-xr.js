"use strict";
const security=require("../lib/museum-xr-security.cjs");
const federation=require("../lib/museum-xr-oidc.cjs");
const finder=require("../lib/museum-xr-search.cjs");
const GOOGLE="https://tile.googleapis.com/v1",TIMEOUT=12000;
const LIMIT_BODY=2_000_000;
const env=process.env;
const fail=(res,code,message)=>res.status(code).json({error:message});
function allowedOrigin(req){
  // Same-origin browser calls. Vercel Authentication protects the Preview URL.
  // Do not accept cross-site requests merely because they target a DACI host.
  const origin=req.headers.origin;
  if(!origin)return true;
  try{
    const u=new URL(origin);
    return u.protocol==="https:"&&u.host===req.headers.host&&
      (u.hostname==="artdaci.vercel.app"||u.hostname.endsWith("-daci.vercel.app"));
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
  const route=path.split("?")[0].replace(/\/streetview\/tiles\/\d+\/\d+\/\d+$/,"/streetview/tiles");
  const attempts=2; // a single bounded retry for transient Google 5xx errors
  for(let attempt=0;attempt<attempts;attempt++){
    await quota();
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),TIMEOUT);
    try{
      const response=await fetch(GOOGLE+path,{...opts,headers:{
        ...(opts.body?{"Content-Type":"application/json"}:{}),
        Authorization:"Bearer "+token,"X-Goog-User-Project":env.MUSEUM_XR_GOOGLE_PROJECT_ID
      },signal:controller.signal});
      if(response.ok)return response;
      if(attempt+1<attempts&&[500,502,503,504].includes(response.status)){
        await new Promise(resolve=>setTimeout(resolve,250));
        continue;
      }
      const error=new Error("Google Maps Tiles upstream HTTP "+response.status);
      error.status=response.status;
      error.stage=route;
      // Google supplies stable error reasons such as "invalid" for coordinates.
      // Only known reason names and integer tile coords are exposed, never raw
      // response bodies, URLs, session tokens or service-account credentials.
      if(route==="/streetview/tiles"){
        const tile=path.match(/^\/streetview\/tiles\/(\d+)\/(\d+)\/(\d+)\?/);
        if(tile)error.tile={zoom:Number(tile[1]),x:Number(tile[2]),y:Number(tile[3])};
        if(response.status===400)try{
          const body=await response.json();
          const reason=body?.error?.errors?.[0]?.reason;
          if(["invalid","notFound","badRequest","required","expired"].includes(reason))
            error.reason=reason;
        }catch{}
      }
      throw error;
    }finally{clearTimeout(timer)}
  }
  throw Error("Google Maps Tiles retry exhausted");
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
function ticketResponse(res,payload,meta,mode="adjacent-unverified"){
  // All ticket dimensions and modes are created by our server, never client-supplied.
  const signed={...payload,selectionMode:mode};
  res.status(200).json({
    ticket:security.signTicket(signed,env.MUSEUM_XR_TICKET_SECRET),
    metadata:security.safeMetadata(meta),dimension:signed.dimensions,selectionMode:mode
  });
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
  const configured=Boolean(env.MUSEUM_XR_ENABLED==="true"&&(!env.VERCEL_GIT_COMMIT_REF||env.VERCEL_GIT_COMMIT_REF==="feature/streetview-webxr-museums-v1")&&env.MUSEUM_XR_GOOGLE_SERVICE_ACCOUNT_EMAIL&&env.MUSEUM_XR_GOOGLE_PROJECT_NUMBER&&env.MUSEUM_XR_WORKLOAD_POOL_ID&&env.MUSEUM_XR_WORKLOAD_PROVIDER_ID&&env.MUSEUM_XR_GOOGLE_PROJECT_ID&&env.VERCEL_ENV==="preview"&&env.MUSEUM_XR_TICKET_SECRET?.length>=32);
  if(!configured)return fail(res,503,"Museum XR pilot inactive");
  if(!allowedOrigin(req))return fail(res,403,"Origin not approved");
  // No extra pilot passphrase: this is already a Vercel Authentication-protected
  // branch-scoped Preview. Production has no Museum XR enablement variables.
  try{
    const action=body.action;
    if(action==="diagnose")return res.status(200).json({status:"preview",enabled:true,oidcTokenAvailable:Boolean(req.headers["x-vercel-oidc-token"]||env.VERCEL_OIDC_TOKEN)});
    if(action==="catalog")return res.status(200).json({museums:security.catalog().map(x=>({id:x.id,title:x.title,museum:x.museum,source:x.source})),perInstanceDailyLimit:security.MAX_DAILY_REQUESTS,globalLimitGuaranteed:Boolean(env.UPSTASH_REDIS_REST_URL&&env.UPSTASH_REDIS_REST_TOKEN)});
    if(!validId(body.museumId))return fail(res,400,"Invalid museum");
    const m=security.museum(body.museumId);
    if(!m)return fail(res,404,"Museum not in pilot catalog");
    if(action==="start"||action==="start-exterior"){
      if(!["hd","standard"].includes(body.quality))return fail(res,400,"Invalid image quality");
      const requestedZoom=body.quality==="hd"?3:2;
      const google=await googleToken(req);
      const sessionResult=await googleFetch("/createSession",google,{
        method:"POST",body:JSON.stringify({mapType:"streetview",language:"en-US",region:"US"})
      });
      const session=await sessionResult.json();
      if(!session.session)throw Error("Invalid session");
      if(action==="start-exterior"){
        // Deliberate VR functionality demo, NOT verified as a museum room.
        const q=new URLSearchParams({session:session.session,lat:String(m.lat),lng:String(m.lng),radius:"30"});
        let scene=null;
        try{scene=await(await googleFetch("/streetview/metadata?"+q,google)).json()}
        catch(error){if(error.status!==404)throw error}
        if(!scene?.panoId||!scene?.copyright||!Number.isFinite(scene.lat)||!Number.isFinite(scene.lng)||
           security.distance(scene,m)>35)return res.status(404).json({
          error:"No demonstration Street View panorama near this location.",code:"DEMO_PANORAMA_NOT_FOUND"
        });
        const dims=security.grid(scene,requestedZoom);
        return ticketResponse(res,{id:m.id,session:session.session,panoId:scene.panoId,
          dimensions:dims,exp:Date.now()+20*60000},scene,"location-demo-unverified");
      }
      const match=await searchIndoorNearMuseum(m,session.session,google);
      if(!match.metadata)return res.status(404).json({
        error:"No indoor Street View panorama found in Google Maps Tiles close to this museum.",
        code:"INDOOR_PANORAMA_NOT_FOUND",nearestType:match.nearestType,inspected:match.inspected
      });
      const data=match.metadata;
      const dims=security.grid(data,requestedZoom);
      return ticketResponse(res,{id:m.id,session:session.session,panoId:data.panoId,dimensions:dims,exp:Date.now()+20*60000},data,match.mode);
    }
    if(!["neighbor","tile","rescale"].includes(action))return fail(res,400,"Unsupported action");
    const ticket=security.readTicket(body.ticket,env.MUSEUM_XR_TICKET_SECRET);
    if(!ticket||ticket.id!==m.id)return fail(res,403,"Invalid or expired ticket");
    const google=await googleToken(req);
    if(action==="rescale"){
      // Signed ticket proves prior authorization for this specific panoId.
      const z=Number(body.zoom);
      if(!Number.isInteger(z)||z<0||z>2||z>=ticket.dimensions.zoom)
        return fail(res,400,"Zoom must decrease from signed ticket");
      const q=new URLSearchParams({session:ticket.session,panoId:ticket.panoId});
      const data=await(await googleFetch("/streetview/metadata?"+q,google)).json();
      const demo=ticket.selectionMode==="location-demo-unverified";
      const nearby=data?.panoId===ticket.panoId&&Number.isFinite(data.lat)&&Number.isFinite(data.lng)&&
        security.distance(data,m)<=(demo?security.MAX_DEMO_NAV_RADIUS_METRES:35);
      const permitted=nearby&&(demo||security.validateIndoor(data,m));
      if(!permitted)return fail(res,403,"Panorama is no longer eligible");
      const dims=security.grid(data,z);
      return ticketResponse(res,{...ticket,dimensions:dims,exp:Date.now()+20*60000},data,ticket.selectionMode||"nearest");
    }
    if(action==="neighbor"){
      if(!validPanoId(body.panoId))return fail(res,400,"Invalid pano");
      const current=await(await googleFetch("/streetview/metadata?"+new URLSearchParams({session:ticket.session,panoId:ticket.panoId}),google)).json();
      if(current?.panoId!==ticket.panoId||!current.links?.some(link=>link.panoId===body.panoId))
        return fail(res,403,"Panorama not adjacent");
      const data=await(await googleFetch("/streetview/metadata?"+new URLSearchParams({session:ticket.session,panoId:body.panoId}),google)).json();
      const allowed=ticket.selectionMode==="location-demo-unverified"
        ?security.validateDemoNeighbor(current,data,m,body.panoId)
        :security.validateIndoor(current,m)&&security.validateIndoor(data,m);
      if(!allowed)return fail(res,403,"Neighbor outside allowed museum vicinity");
      const dims=security.grid(data,ticket.dimensions.zoom);
      return ticketResponse(res,{...ticket,panoId:data.panoId,dimensions:dims,exp:Date.now()+20*60000},data,ticket.selectionMode||"nearby-unverified");
    }
    const x=Number(body.x),y=Number(body.y),z=Number(body.zoom);
    if(!Number.isInteger(x)||!Number.isInteger(y)||!ticket.dimensions||!Number.isInteger(z)||z<0||z>3||z!==ticket.dimensions.zoom||x<0||y<0||x>=ticket.dimensions.columns||y>=ticket.dimensions.rows)return fail(res,400,"Invalid tile");
    const path="/streetview/tiles/"+z+"/"+x+"/"+y+"?"+new URLSearchParams({session:ticket.session,panoId:ticket.panoId});
    const response=await googleFetch(path,google);
    const mime=response.headers.get("content-type")||"";
    if(!mime.startsWith("image/"))throw Error("Unexpected tile content");
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length>LIMIT_BODY)throw Error("Tile too large");
    res.setHeader("Content-Type",mime);return res.status(200).send(bytes);
  }catch(error){
    const stage=typeof error.stage==="string"&&/^\/(?:createSession|streetview\/(?:metadata|panoIds|tiles))$/.test(error.stage)?error.stage:"gateway";
    const status=Number.isInteger(error.status)?error.status:502;
    // Log only fixed endpoint names and status; NEVER Google session IDs or tokens.
    console.warn("Museum XR failure:",stage,"HTTP",status,
      error.tile?JSON.stringify(error.tile):"",error.reason||"");
    return res.status(status).json({
      error:status===429?"Daily usage cap reached":status>=500?"Google Street View upstream unavailable":"Panorama gateway unavailable",
      code:status>=500?"UPSTREAM_UNAVAILABLE":"GATEWAY_ERROR",stage,
      ...(error.reason?{reason:error.reason}:{})
    });
  }
};