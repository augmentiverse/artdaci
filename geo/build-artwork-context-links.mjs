#!/usr/bin/env node
// Generate educational artwork-place-to-museum links, not transport trajectories.
// node geo/build-artwork-context-links.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const read=p=>JSON.parse(fs.readFileSync(path.join(dir,p),'utf8'));
const dataset=read('data/artwork-context-links.json');
const museum=read('data/museums.json').museums;
const city=read('data/artist-journeys.json').events;
const artworks=read('data/artworks.json').museums;
const byMuseum=new Map(museum.map(m=>[m.id,m]));
const byCity=new Map(city.map(m=>[m.id,m]));
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const links=[];
if(dataset.connections.length!==3||new Set(dataset.connections.map(x=>x.id)).size!==3)throw Error('Expected three unique artwork connections');
for(const w of dataset.connections){
 const from=byCity.get(w.origin),to=byMuseum.get(w.museum);
 const page=(artworks[w.museum]||[]).find(x=>x.id===w.id);
 if(!from||!to||!page||!/^https:\/\//.test(w.museumSource))throw Error('Invalid reference for '+w.id);
 const href='https://artdaci.com/'+page.href;
 const desc='<div style="font-family:Arial,sans-serif;line-height:1.5;color:#233342;max-width:430px"><h2>'+esc(w.work.fr)+'</h2><p><b>'+esc(w.artist)+' · '+esc(w.year)+'</b></p><p>'+esc(w.explanation.fr)+'</p><p><b>Lieu associé :</b> '+esc(from.city+', '+from.country)+'</p><p><b>Musée de conservation :</b> '+esc(to.name+', '+to.city)+'</p><p><a href="'+esc(href)+'">Ouvrir la fiche du tableau ARTDACI</a></p><p><a href="'+esc(to.profileUrl)+'">Ouvrir la fiche du musée</a> · <a href="'+esc(w.museumSource)+'">Source institutionnelle</a></p><p style="font-size:11px">Cette ligne est une relation pédagogique, pas un déplacement historique vérifié.</p></div>';
 const description='<description><![CDATA['+desc.replace(/]]>/g,']]]]><![CDATA[>')+']]></description>';
 links.push('<Placemark><name>'+esc(w.work.fr+' — '+from.city+' / '+to.name)+'</name><styleUrl>#relation</styleUrl>'+description+'<ExtendedData><Data name="linkType"><value>interpretive-context-to-collection</value></Data><Data name="artworkId"><value>'+esc(w.id)+'</value></Data></ExtendedData><LineString><tessellate>1</tessellate><coordinates>'+from.lon+','+from.lat+',0 '+to.longitude+','+to.latitude+',0</coordinates></LineString></Placemark>');
 for(const [place,lon,lat,role] of [[from.city,from.lon,from.lat,'historical-context'],[to.name,to.longitude,to.latitude,'collection-museum']]){
  links.push('<Placemark><name>'+esc(w.work.fr+' · '+place)+'</name>'+description+'<ExtendedData><Data name="placeRole"><value>'+role+'</value></Data></ExtendedData><Point><coordinates>'+lon+','+lat+',0</coordinates></Point></Placemark>');
 }
}
const kml='<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>ARTDACI GEO — Des lieux aux tableaux (parcours pédagogique)</name><description>'+esc(dataset.noticeFr)+'</description><Style id="relation"><LineStyle><color>ff8a9de7</color><width>3</width></LineStyle></Style>\n'+links.join('\n')+'\n</Document></kml>\n';
fs.writeFileSync(path.join(dir,'artdaci-artwork-context-links.kml'),kml);
console.log('Generated three interpretive links (9 KML placemarks).');
