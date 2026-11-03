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
 assert.match(browser,/museum-xr/);assert.match(html,/pilot-token/);
 assert.match(browser,/creditPlane/);
});
