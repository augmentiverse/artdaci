import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {workloadAudience,vercelSubjectToken,googleServiceToken}=require('../lib/museum-xr-oidc.cjs');

const env={
  VERCEL_ENV:'preview',
  MUSEUM_XR_GOOGLE_PROJECT_NUMBER:'123456789012',
  MUSEUM_XR_WORKLOAD_POOL_ID:'artdaci-vercel',
  MUSEUM_XR_WORKLOAD_PROVIDER_ID:'vercel-artdaci-preview',
  MUSEUM_XR_GOOGLE_SERVICE_ACCOUNT_EMAIL:'artdaci-museum-xr@artdaci-museum-xr.iam.gserviceaccount.com'
};
const req={headers:{'x-vercel-oidc-token':'ey.test.signature'}};
test('Google OIDC audience is built from the WIF provider IDs',()=>{
 assert.equal(workloadAudience(env),'//iam.googleapis.com/projects/123456789012/locations/global/workloadIdentityPools/artdaci-vercel/providers/vercel-artdaci-preview');
 assert.throws(()=>workloadAudience({...env,MUSEUM_XR_GOOGLE_PROJECT_NUMBER:'not-a-number'}));
});
test('only Preview requests with a Vercel OIDC subject token are accepted',()=>{
 assert.equal(vercelSubjectToken(req,env),'ey.test.signature');
 assert.throws(()=>vercelSubjectToken(req,{...env,VERCEL_ENV:'production'}),/Preview/);
 assert.throws(()=>vercelSubjectToken({headers:{}},env),/Missing/);
});
test('token exchange grants only short-lived Google service-account access and never creates keys',async()=>{
 const calls=[];
 const fetchImpl=async(url,options)=>{
   calls.push({url,options});
   if(url.includes('/v1/token'))return {ok:true,json:async()=>({access_token:'temporary-sts-token'})};
   if(url.includes(':generateAccessToken'))return {ok:true,json:async()=>({
       accessToken:'short-lived-google-token',expireTime:new Date(Date.now()+20*60_000).toISOString()
   })};
   throw Error('Unexpected upstream: '+url);
 };
 let reserves=0;
 const token=await googleServiceToken(fetchImpl,req,env,async()=>{reserves++});
 assert.equal(token,'short-lived-google-token');
 assert.equal(reserves,2);
 assert.equal(calls.length,2);
 assert.equal(calls[0].options.body.get('subject_token'),'ey.test.signature');
 assert.equal(calls[0].options.body.get('subject_token_type'),'urn:ietf:params:oauth:token-type:jwt');
 assert.equal(calls[1].options.headers.Authorization,'Bearer temporary-sts-token');
 assert.match(calls[1].url,/artdaci-museum-xr%40artdaci-museum-xr\.iam\.gserviceaccount\.com/);
 assert.deepEqual(JSON.parse(calls[1].options.body).scope,['https://www.googleapis.com/auth/cloud-platform']);
});
test('authentication fails closed if Google STS or budget storage fails',async()=>{
 await assert.rejects(googleServiceToken(async()=>({ok:false,status:403}),req,env,async()=>{}),/upstream/);
 await assert.rejects(googleServiceToken(async()=>{throw Error('No upstream expected')},{headers:{}},env,async()=>{}),/Missing/);
});
