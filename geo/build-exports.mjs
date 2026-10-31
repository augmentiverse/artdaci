#!/usr/bin/env node
// ARTDACI GEO 2.0 — regenerate public KML files from canonical geographical and editorial datasets.
// Run: node geo/build-exports.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const load=(file)=>JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
const geo=load('data/museums.json');
const artworks=load('data/artworks.json');
const editorial=JSON.parse(fs.readFileSync(path.join(dir,'../museum-atlas/data/museums.json'),'utf8'));
if(geo.museums.length!==17||new Set(geo.museums.map(m=>m.id)).size!==17)throw Error('Expected 17 unique museums');
for(const m of geo.museums){
 if(!Number.isFinite(m.latitude)||!Number.isFinite(m.longitude)||Math.abs(m.latitude)>90||Math.abs(m.longitude)>180)throw Error('Bad coordinates: '+m.id);
 if(!editorial.museums.some(e=>e.id===m.id))throw Error('Missing museum dossier: '+m.id);
}
function renderKml(key,data,atlasData,artworkData){
 const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,'&quot;').replace(/'/g,"&#39;");
 const xml=esc;
 const short=(s,max=390)=>{let value=String(s||"").trim();return value.length<=max?value:value.slice(0,max).replace(/\s+\S*$/,"")+"…";};
 const url=s=>/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(s||"")?s:"#";
 const link=(href,label)=>'<a href="'+esc(url(href))+'">'+esc(label)+'</a>';
 const theme=data.themes[key],byId=new Map(atlasData.museums.map(m=>[m.id,m]));
 const items=key==="all"?data.museums:data.museums.filter(m=>m.themes.includes(key));
 const six=new Set(["louvre","orsay","mauritshuis","czartoryski","van-gogh-museum","national-gallery-of-art-washington"]);
 const html=m=>{
  const record=byId.get(m.id);if(!record)throw Error("missing editorial "+m.id);
  const paintings=artworkData.museums[m.id]||[];
  const prefix="https://artdaci.com/";
  const ext=paintings.map(p=>'<li>'+link(prefix+p.href,p.title.fr)+"</li>").join("");
  const docs=record.sources.filter(s=>s.url&&/^https:\/\//.test(s.url)).slice(0,2).map(s=>link(s.url,s.name)).join(" · ");
  const map="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(m.name+", "+m.city+", "+m.country);
  const pano="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint="+encodeURIComponent(m.latitude+","+m.longitude);
  const photo=record.hero?.page&&/^https:\/\//.test(record.hero.page)?link(record.hero.page,"Photographie et crédits (Wikimedia Commons)"):"";
  return '<div style="font-family:Arial,sans-serif;color:#22313b;max-width:480px;line-height:1.48">'+
   '<h2 style="margin:0 0 6px;color:#123447">'+esc(m.name)+'</h2>'+
   '<p><b>'+esc(m.city+", "+m.country)+'</b> · '+esc("Ouverture : "+(record.opened||"voir dossier"))+'</p>'+
   '<p><b>Histoire :</b> '+esc(short(record.history,460))+'</p>'+
   '<p><b>Architecture :</b> '+esc(short(record.architecture,360))+'</p>'+
   '<p><b>Collections :</b> '+esc(short(record.collections,410))+'</p>'+
   '<p><b>Œuvre(s) associée(s) à ARTDACI :</b> '+esc(m.artwork)+'</p>'+
   (paintings.length?'<p><b>Ouvrir les fiches des tableaux :</b></p><ul>'+ext+'</ul>':'<p>Pour les œuvres, consultez le dossier du musée et les références ARTDACI.</p>')+
   '<p><b>Explorer dans ARTDACI :</b> '+link(m.profileUrl,"Dossier du musée")+' · '+link(prefix+"earth-explorer.html?lang=fr","Atlas géographique")+(six.has(m.id)?" · "+link(prefix+"museums.html?lang=fr&museum="+encodeURIComponent(m.id)+"&tab=immersive","3D / AR / VR / GEO"):"")+'</p>'+
   '<p><b>Localisation :</b> '+link(map,"Google Maps")+' · '+link(pano,"Street View 360°")+'</p>'+
   (docs?'<p><b>Sources :</b> '+docs+'</p>':"")+
   (photo?'<p>'+photo+'</p>':"")+
   '<p style="font-size:11px;color:#566570">Le repère indique la position approximative du musée, non celle d’une salle ou d’une œuvre. Accrochages, prêts et couverture Street View peuvent évoluer.</p></div>';
 };
 const lines=items.map(m=>{
  const balloon=html(m).replace(/]]>/g,"]]]]><![CDATA[>");
  const rec=byId.get(m.id);
  return '<Placemark><name>'+xml(m.name)+'</name><styleUrl>#museum</styleUrl><Snippet maxLines="2">'+xml(m.city+", "+m.country+" · "+m.artwork)+'</Snippet><description><![CDATA['+balloon+']]></description><ExtendedData><Data name="artdaciId"><value>'+xml(m.id)+'</value></Data><Data name="artwork"><value>'+xml(m.artwork)+'</value></Data><Data name="profile"><value>'+xml(m.profileUrl)+'</value></Data><Data name="coordinateSource"><value>'+xml(m.coordinateSource)+'</value></Data><Data name="officialMuseum"><value>'+xml(rec.sources?.[0]?.url||"")+'</value></Data></ExtendedData><Point><coordinates>'+m.longitude+','+m.latitude+',0</coordinates></Point></Placemark>';
 });
 return '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>'+xml(theme.labelFr)+'</name><description>'+xml(theme.labelEn+' — ARTDACI GEO interactive museum dossiers. Locations are approximate.')+'</description><Style id="museum"><IconStyle><color>ff8cbcdf</color><scale>1.1</scale><Icon><href>https://maps.google.com/mapfiles/kml/shapes/museums.png</href></Icon></IconStyle></Style>\n'+lines.join("\n")+"\n</Document></kml>\n";
}
for(const key of Object.keys(geo.themes)){
 const name=geo.themes[key].file;
 const kml=renderKml(key,geo,editorial,artworks);
 fs.writeFileSync(path.join(dir,name),kml);
 console.log(name,(kml.match(/<Placemark>/g)||[]).length);
}
// Individual museum exports reuse exactly the same enriched Placemark descriptions as the collective KML.
// This avoids divergent coordinates, links or research notes across GEO exports.
const individual=renderKml('all',geo,editorial,artworks);
const placemarks=[...individual.matchAll(/<Placemark>[\s\S]*?<\/Placemark>/g)].map(match=>match[0]);
if(placemarks.length!==17)throw Error('Expected 17 enriched individual placemarks');
const destination=path.join(dir,'museums');fs.mkdirSync(destination,{recursive:true});
for(const [index,m] of geo.museums.entries()){
 if(!/^[a-z0-9-]+$/.test(m.id))throw Error('Invalid museum id');
  if(!placemarks[index].includes('<value>'+m.id+'</value>'))throw Error('Misaligned museum profile: '+m.id);
 const document='<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>'+m.name+' — ARTDACI GEO</name><description>ARTDACI GEO 2.0 — enriched museum dossier, approximate point</description><Style id="museum"><IconStyle><color>ff8cbcdf</color><scale>1.1</scale><Icon><href>https://maps.google.com/mapfiles/kml/shapes/museums.png</href></Icon></IconStyle></Style>\n'+placemarks[index]+'\n</Document></kml>\n';
 fs.writeFileSync(path.join(destination,m.id+'.kml'),document);
}
console.log('Generated 17 individual enriched KML profiles');
const geojson={type:'FeatureCollection',name:'ARTDACI museum points',features:geo.museums.map(m=>({type:'Feature',properties:{id:m.id,name:m.name,city:m.city,country:m.country,artwork:m.artwork,themes:m.themes,profileUrl:m.profileUrl,coordinateSource:m.coordinateSource},geometry:{type:'Point',coordinates:[m.longitude,m.latitude]}}))};
fs.writeFileSync(path.join(dir,'artdaci-museums.geojson'),JSON.stringify(geojson,null,2)+'\n');
