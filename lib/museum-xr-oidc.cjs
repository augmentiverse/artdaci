"use strict";
/**
 * Vercel OIDC -> Google STS -> short-lived service-account OAuth token.
 * Preview only, no persistent Google private key. No token is returned to clients.
 *
 * Vercel injects x-vercel-oidc-token into Function requests, see
 * https://vercel.com/docs/oidc
 */
const GOOGLE_SCOPE="https://www.googleapis.com/auth/cloud-platform";
const STS_URL="https://sts.googleapis.com/v1/token";
const CREDENTIALS_URL="https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/";
const TIMEOUT_MS=12000;
let cached=null;

function workloadAudience(env){
  const number=env.MUSEUM_XR_GOOGLE_PROJECT_NUMBER;
  const pool=env.MUSEUM_XR_WORKLOAD_POOL_ID;
  const provider=env.MUSEUM_XR_WORKLOAD_PROVIDER_ID;
  if(!/^\d{5,22}$/.test(number||"")||!(/^[a-z][a-z0-9-]{2,63}$/.test(pool||""))||
     !(/^[a-z][a-z0-9-]{2,63}$/.test(provider||"")))throw Error("Invalid workload identity configuration");
  return "//iam.googleapis.com/projects/"+number+"/locations/global/workloadIdentityPools/"+pool+"/providers/"+provider;
}

function vercelSubjectToken(req,env){
  // An independent Google-side attribute condition also enforces this boundary.
  if(env.VERCEL_ENV!=="preview")throw Error("Museum XR OAuth only available in Vercel Preview");
  const token=req.headers?.["x-vercel-oidc-token"];
  if(typeof token!=="string"||token.length>20000||token.split(".").length!==3)throw Error("Missing Vercel OIDC token");
  return token;
}

async function jsonPost(fetchImpl,url,headers,body,reserve){
  // Reserve a distributed budget slot BEFORE every upstream request, including
  // non-billable federation calls. Fail closed if Redis is unreachable.
  await reserve();
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),TIMEOUT_MS);
  try{
    const response=await fetchImpl(url,{method:"POST",headers,body,signal:controller.signal});
    if(!response.ok)throw Error("Google federation upstream HTTP "+response.status);
    return response.json();
  }finally{clearTimeout(timeout)}
}
async function googleServiceToken(fetchImpl,req,env,reserve){
  const sourceToken=vercelSubjectToken(req,env);
  const audience=workloadAudience(env);
  const email=env.MUSEUM_XR_GOOGLE_SERVICE_ACCOUNT_EMAIL;
  if(typeof email!=="string"||!/^[-a-z0-9]+@[-a-z0-9.]+\.iam\.gserviceaccount\.com$/.test(email))
    throw Error("Invalid Google service account");
  const {createHash}=require("node:crypto");
  const cacheKey=createHash("sha256").update(sourceToken+"|"+audience+"|"+email).digest("hex");
  if(cached&&cached.key===cacheKey&&cached.until>Date.now()+60000)return cached.token;

  const sts=await jsonPost(fetchImpl,STS_URL,{"Content-Type":"application/x-www-form-urlencoded"},
    new URLSearchParams({
      grant_type:"urn:ietf:params:oauth:grant-type:token-exchange",
      audience,
      scope:GOOGLE_SCOPE,
      requested_token_type:"urn:ietf:params:oauth:token-type:access_token",
      subject_token_type:"urn:ietf:params:oauth:token-type:jwt",
      subject_token:sourceToken
    }),reserve);
  if(typeof sts.access_token!=="string"||!sts.access_token)throw Error("Invalid Google STS response");

  const impersonated=await jsonPost(fetchImpl,CREDENTIALS_URL+encodeURIComponent(email)+":generateAccessToken",{
    "Content-Type":"application/json",Authorization:"Bearer "+sts.access_token
  },JSON.stringify({scope:[GOOGLE_SCOPE],lifetime:"1800s"}),reserve);
  const expires=Date.parse(impersonated.expireTime);
  if(typeof impersonated.accessToken!=="string"||!impersonated.accessToken||!Number.isFinite(expires)||expires<=Date.now())
    throw Error("Invalid Google impersonation response");
  cached={key:cacheKey,token:impersonated.accessToken,until:expires};
  return cached.token;
}
module.exports={workloadAudience,vercelSubjectToken,googleServiceToken};
