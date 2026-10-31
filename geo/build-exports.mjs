#!/usr/bin/env node
// ARTDACI GEO KML 1.0 — regenerate exports from geo/data/museums.json.
// Usage: node geo/build-exports.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const folder=path.dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(fs.readFileSync(path.join(folder,'data/museums.json'),'utf8'));
const museums=data.museums;
if(museums.length!==17||new Set(museums.map(m=>m.id)).size!==17)throw Error('Expected 17 unique museums');
const xml=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const paths=new Set();
for(const m of museums){
 if(!Number.isFinite(m.latitude)||!Number.isFinite(m.longitude)||Math.abs(m.latitude)>90||Math.abs(m.longitude)>180)throw Error('Bad coordinates: '+m.id);
 if(!/^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/.test(m.coordinateSource))throw Error('Missing source: '+m.id);
 if(!/^https:\/\/artdaci\.com\//.test(m.profileUrl))throw Error('Bad link: '+m.id);
 if(!Array.isArray(m.themes)||m.themes.some(t=>t==='all'||!(t in data.themes)))throw Error('Invalid theme: '+m.id);
 paths.add(m.profileUrl);
}
if(paths.size!==17)throw Error('Duplicate profile URLs');
function buildKml(key){
 const t=data.themes[key],items=key==='all'?museums:museums.filter(m=>m.themes.includes(key));
 return '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document>\n<name>'+xml(t.labelFr)+'</name>\n<description>'+xml(t.labelEn+' — Cultural collection, not a road route. ARTDACI GEO 1.0.')+'</description>\n<Style id="museum"><IconStyle><color>ff8cbcdf</color><scale>1.1</scale><Icon><href>https://maps.google.com/mapfiles/kml/shapes/museums.png</href></Icon></IconStyle></Style>\n'+items.map(m=>'<Placemark><name>'+xml(m.name)+'</name><styleUrl>#museum</styleUrl><description>'+xml(m.city+', '+m.country+' — '+m.artwork+' — ARTDACI: '+m.profileUrl)+'</description><ExtendedData><Data name="artdaciId"><value>'+xml(m.id)+'</value></Data><Data name="artwork"><value>'+xml(m.artwork)+'</value></Data><Data name="source"><value>'+xml(m.coordinateSource)+'</value></Data><Data name="profile"><value>'+xml(m.profileUrl)+'</value></Data></ExtendedData><Point><coordinates>'+m.longitude+','+m.latitude+',0</coordinates></Point></Placemark>').join('\n')+'\n</Document></kml>\n';
}
for(const key of Object.keys(data.themes)) {
 const name=data.themes[key].file;
 fs.writeFileSync(path.join(folder,name),buildKml(key));
 console.log(name, key==='all'?17:museums.filter(m=>m.themes.includes(key)).length, 'museums');
}
const geojson={type:'FeatureCollection',name:'ARTDACI museum points',features:museums.map(m=>({type:'Feature',properties:{id:m.id,name:m.name,city:m.city,country:m.country,artwork:m.artwork,themes:m.themes,profileUrl:m.profileUrl,coordinateSource:m.coordinateSource},geometry:{type:'Point',coordinates:[m.longitude,m.latitude]}}))};
fs.writeFileSync(path.join(folder,'artdaci-museums.geojson'),JSON.stringify(geojson,null,2)+'\n');
console.log('GeoJSON',geojson.features.length, 'features');
