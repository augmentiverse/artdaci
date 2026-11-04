import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const security=require('../lib/museum-xr-security.cjs');
const gateway=require('../api/museum-xr.js');

test('pilot allowlist includes four existing artworks and National Gallery',()=>{
 const list=security.catalog();
 assert.equal(list.length,5);
 assert.ok(list.every(item=>item.id&&item.source.startsWith('https://artsandculture.google.com/streetview/')));
 assert.ok(security.museum('national-gallery-london'));
 assert.equal(security.museum('unknown-museum'),null);
});
test('only indoor scene in the specified museum radius is eligible',()=>{
 const museum=security.museum('national-gallery-london');
 const metadata={panoId:'pano_1234',lat:museum.lat,lng:museum.lng,imageryType:'indoor',copyright:'© Google'};
 assert.equal(security.validateIndoor(metadata,museum),true);
 assert.equal(security.validateIndoor({...metadata,imageryType:'outdoor'},museum),false);
 assert.equal(security.validateIndoor({...metadata,lng:0},museum),false);
 assert.equal(security.validateIndoor({...metadata,lat:null},museum),false);
});
test('signed tickets are tamper-evident, expire, and include no Google bearer',()=>{
 const secret='s'.repeat(40),now=Date.now();
 const ticket=security.signTicket({id:'national-gallery-london',session:'s',panoId:'pano1',dimensions:{columns:4,rows:2},exp:now+1000},secret);
 assert.ok(security.readTicket(ticket,secret,now));
 assert.equal(security.readTicket(ticket+'evil',secret,now),null);
 assert.equal(security.readTicket(ticket,secret,now+1001),null);
 assert.doesNotMatch(Buffer.from(ticket.split('.')[0],'base64url').toString('utf8'),/access_token|googleToken/);
});
test('atomic Redis budget uses Redis EVAL and caps at 300 requests',async()=>{
 let calls=0;
 const request=async(url,opts)=>{
  assert.equal(url,'https://redis.example');
  assert.equal(opts.method,'POST');
  const payload=JSON.parse(opts.body);
  assert.equal(payload[0],'EVAL');
  assert.equal(payload[3].startsWith('artdaci:museum-xr:google-requests:'),true);
  assert.equal(payload.at(-1),String(security.MAX_DAILY_REQUESTS));
  calls++;
  return {ok:true,json:async()=>({result:[1,42]})};
 };
 const result=await security.reserveBudget(request,{UPSTASH_REDIS_REST_URL:'https://redis.example',UPSTASH_REDIS_REST_TOKEN:'secret'});
 assert.deepEqual(result,{ok:true,usage:42});assert.equal(calls,1);
 const rejected=await security.reserveBudget(async()=>({ok:true,json:async()=>({result:[0,300]})}),{UPSTASH_REDIS_REST_URL:'https://redis.example',UPSTASH_REDIS_REST_TOKEN:'secret'});
 assert.equal(rejected.ok,false);
 await assert.rejects(security.reserveBudget(request,{}),/not configured/);
});
test('Vercel endpoint refuses requests when disabled and does not call Google',async()=>{
 const previous={...process.env};process.env.MUSEUM_XR_ENABLED='false';
 const headers={};const res={setHeader:(k,v)=>{headers[k]=v},status(n){this.code=n;return this},json(obj){this.body=obj;return this}};
 await gateway({method:'POST',headers:{},body:{action:'start',museumId:'national-gallery-london'}},res);
 assert.equal(res.code,503);assert.match(res.body.error,/inactive/);assert.equal(headers['Cache-Control'],'no-store');
 Object.keys(process.env).filter(k=>!(k in previous)).forEach(k=>delete process.env[k]);Object.assign(process.env,previous);
});
test('no browser Google secret and key restrictions remain isolated',async()=>{
 const browser=await readFile(new URL('../geo/scripts/streetview-xr.js',import.meta.url),'utf8');
 const html=await readFile(new URL('../geo/museum-xr.html',import.meta.url),'utf8');
 assert.doesNotMatch(browser,/tile\.googleapis\.com|oauth2\.googleapis\.com|GOOGLE_MAP_TILES_KEY/);
 assert.match(browser,/museum-xr/);assert.doesNotMatch(html,/pilot-token|key-label/);
 assert.doesNotMatch(browser,/pilotToken|X-Museum-XR-Preview/);
 assert.match(browser,/creditPlane/);
});

test('private pilot has a best-effort guard without Redis (not a distributed global cap)',()=>{
 const before=security.reserveProcessBudget();
 assert.equal(before.ok,true);
 assert.ok(before.usage>=1);
 let last;
 for(let i=0;i<65;i++)last=security.reserveProcessBudget();
 assert.equal(last.ok,false);
 assert.equal(last.reason,'minute');
 assert.ok(last.retryAfterSeconds>=1&&last.retryAfterSeconds<=60);
 const nextMinute=Date.now()+61000;
 assert.equal(security.reserveProcessBudget(nextMinute).ok,true);
});
test('server configuration requires Preview and keeps Google credentials server-side',async()=>{
 const source=await readFile(new URL('../api/museum-xr.js',import.meta.url),'utf8');
 assert.match(source,/VERCEL_GIT_COMMIT_REF==="feature\/streetview-webxr-museums-v1"/);
 assert.match(source,/VERCEL_ENV==="preview"/);
 assert.doesNotMatch(source,/MUSEUM_XR_GOOGLE_PRIVATE_KEY/);
 assert.match(source,/reserveProcessBudget/);
 assert.doesNotMatch(source,/MUSEUM_XR_PREVIEW_TOKEN|x-museum-xr-preview/);
 assert.match(source,/Google Street View upstream unavailable/);
 assert.match(source,/UPSTREAM_UNAVAILABLE/);
});

test('lower resolution tiles are accepted only with server-signed zoom authorization',async()=>{
 const federation=require('../lib/museum-xr-oidc.cjs');
 const originalGoogleToken=federation.googleServiceToken;
 const originalFetch=global.fetch;
 const envKeys=['MUSEUM_XR_ENABLED','MUSEUM_XR_GOOGLE_SERVICE_ACCOUNT_EMAIL','MUSEUM_XR_GOOGLE_PROJECT_NUMBER',
 'MUSEUM_XR_WORKLOAD_POOL_ID','MUSEUM_XR_WORKLOAD_PROVIDER_ID','MUSEUM_XR_GOOGLE_PROJECT_ID',
 'MUSEUM_XR_TICKET_SECRET','VERCEL_ENV','VERCEL_GIT_COMMIT_REF'];
 const originalEnv=Object.fromEntries(envKeys.map(k=>[k,process.env[k]]));
 const museum=security.museum('national-gallery-london');
 const metadata={panoId:'pano_test_1234',lat:museum.lat,lng:museum.lng,imageryType:'outdoor',
  imageHeight:6656,imageWidth:13312,tileHeight:512,tileWidth:512,heading:0,copyright:'© Google'};
 const secret='test-secret-must-be-longer-than-32-chars!';
 assert.equal(security.grid(metadata,3).width,3328);
 assert.equal(security.grid(metadata,3).height,1664);
 assert.equal(security.grid(metadata,3).columns,7);
 assert.equal(security.grid(metadata,3).rows,4);
 assert.equal(security.grid(metadata,3).columns*security.grid(metadata,3).rows,28);
 assert.equal(security.grid(metadata,2).width,1664);
 assert.throws(()=>security.grid(metadata,4),/Zoom denied/);
 const initTicket=security.signTicket({
  id:museum.id,session:'session123',panoId:metadata.panoId,dimensions:security.grid(metadata),
  selectionMode:'location-demo-unverified',exp:Date.now()+20*60000
 },secret);
 const makeRes=()=>({
  status(n){this.code=n;return this},
  json(x){this.body=x;return this},
  setHeader(){},
  send(x){this.bytes=x;return this}
 });
 const req=(data)=>({method:'POST',headers:{origin:'https://artdaci-test-daci.vercel.app',host:'artdaci-test-daci.vercel.app'},
  body:{museumId:museum.id,...data}});
 try{
  Object.assign(process.env,{
   MUSEUM_XR_ENABLED:'true',MUSEUM_XR_GOOGLE_SERVICE_ACCOUNT_EMAIL:'artdaci-museum-xr@artdaci-museum-xr.iam.gserviceaccount.com',
   MUSEUM_XR_GOOGLE_PROJECT_NUMBER:'1021521576659',MUSEUM_XR_WORKLOAD_POOL_ID:'artdaci-vercel',
   MUSEUM_XR_WORKLOAD_PROVIDER_ID:'vercel-artdaci-preview',MUSEUM_XR_GOOGLE_PROJECT_ID:'artdaci-museum-xr',
   MUSEUM_XR_TICKET_SECRET:secret,VERCEL_ENV:'preview',
   VERCEL_GIT_COMMIT_REF:'feature/streetview-webxr-museums-v1'
  });
  federation.googleServiceToken=async()=> 'test-google-access';
  global.fetch=async(url)=>{
   if(url.includes('/streetview/metadata?'))return {ok:true,json:async()=>metadata};
   if(url.includes('/streetview/tiles/1/0/0?'))return {
    ok:true,headers:{get:()=> 'image/jpeg'},
    arrayBuffer:async()=> Uint8Array.from([255,216,255,217]).buffer
   };
   throw Error('Unexpected upstream URL');
  };
  const down=makeRes();
  await gateway(req({action:'rescale',ticket:initTicket,zoom:1}),down);
  assert.equal(down.code,200);
  assert.equal(down.body.dimension.zoom,1);
  assert.equal(down.body.selectionMode,'location-demo-unverified');
  assert.ok(security.readTicket(down.body.ticket,secret));
  const tile=makeRes();
  await gateway(req({action:'tile',ticket:down.body.ticket,zoom:1,x:0,y:0}),tile);
  assert.equal(tile.code,200);
  assert.ok(tile.bytes?.length>0);
  const wrongZoom=makeRes();
  await gateway(req({action:'tile',ticket:down.body.ticket,zoom:2,x:0,y:0}),wrongZoom);
  assert.equal(wrongZoom.code,400);
  const sameZoom=makeRes();
  await gateway(req({action:'rescale',ticket:down.body.ticket,zoom:1}),sameZoom);
  assert.equal(sameZoom.code,400);
 }finally{
  federation.googleServiceToken=originalGoogleToken;global.fetch=originalFetch;
  for(const [k,value] of Object.entries(originalEnv))if(value===undefined)delete process.env[k];else process.env[k]=value;
 }
});

test('private Preview enforces explicit quality choices and authorized tile zoom 3',async()=>{
 const source=await readFile(new URL('../api/museum-xr.js',import.meta.url),'utf8');
 assert.match(source,/\["hd","standard"\]\.includes\(body\.quality\)/);
 assert.match(source,/requestedZoom=body\.quality==="hd"\?3:2/);
 assert.match(source,/z<0\|\|z>3\|\|z!==ticket\.dimensions\.zoom/);
 assert.match(source,/const dims=security\.grid\(data,requestedZoom\)/);
 assert.match(source,/const dims=security\.grid\(scene,requestedZoom\)/);
});

test('demo neighbor is bounded to linked Street View scenes close to the same museum',()=>{
 const m=security.museum('van-gogh');
 const current={panoId:'current_pano',lat:m.lat,lng:m.lng,imageryType:'outdoor',
  links:[{panoId:'linked_pano',heading:80}],copyright:'© Google'};
 const nearby={panoId:'linked_pano',lat:m.lat+0.00022,lng:m.lng,imageryType:'outdoor',copyright:'© Google'};
 assert.equal(security.validateDemoNeighbor(current,nearby,m,'linked_pano'),true);
 assert.equal(security.validateDemoNeighbor(current,{...nearby,lat:m.lat+0.003},m,'linked_pano'),false);
 assert.equal(security.validateDemoNeighbor(current,{...nearby,panoId:'unlinked_pano'},m,'unlinked_pano'),false);
 assert.equal(security.validateDemoNeighbor(current,{...nearby,copyright:''},m,'linked_pano'),false);
 assert.equal(security.validateDemoNeighbor({...current,lat:0},nearby,m,'linked_pano'),false);
 assert.equal(security.MAX_DEMO_NAV_RADIUS_METRES,90);
});
test('outdoor demo navigation is distinct from verified indoor painting-room traversal',async()=>{
 const source=await readFile(new URL('../api/museum-xr.js',import.meta.url),'utf8');
 assert.match(source,/security\.validateDemoNeighbor\(current,data,m,body\.panoId\)/);
 assert.match(source,/security\.validateIndoor\(current,m\)&&security\.validateIndoor\(data,m\)/);
 assert.match(source,/NEIGHBOR_OUT_OF_RANGE/);
});

test('429 budget reasons and retry window are explicit without increasing pilot limits',async()=>{
 const gatewaySource=await readFile(new URL('../api/museum-xr.js',import.meta.url),'utf8');
 const securitySource=await readFile(new URL('../lib/museum-xr-security.cjs',import.meta.url),'utf8');
 assert.equal(security.MAX_DAILY_REQUESTS,300);
 assert.match(securitySource,/reason:"daily"/);
 assert.match(securitySource,/reason:"minute"/);
 assert.match(gatewaySource,/PILOT_DAILY_CAP/);
 assert.match(gatewaySource,/PILOT_MINUTE_CAP/);
 assert.match(gatewaySource,/Retry-After/);
 assert.match(gatewaySource,/retryAfterSeconds/);
 assert.match(gatewaySource,/GOOGLE_RATE_LIMIT/);
});
