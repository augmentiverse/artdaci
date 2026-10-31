#!/usr/bin/env node
// Pilot: city-level markers for artists. Regenerate with node geo/build-artist-journeys.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const src=JSON.parse(fs.readFileSync(path.join(dir,'data/artist-journeys.json'),'utf8'));
const events=src.events;
if(events.length!==6||new Set(events.map(e=>e.id)).size!==6)throw Error('Expected six distinct documented artist-city sites');
for(const e of events){if(!Number.isFinite(e.lat)||!Number.isFinite(e.lon)||Math.abs(e.lat)>90||Math.abs(e.lon)>180||!/^https:\/\//.test(e.source)||!/^https:\/\/artdaci\.com\//.test(e.artworkUrl))throw Error('Invalid artist data: '+e.id);}
const esc=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
e=>'<div style="font-family:Arial,sans-serif;max-width:430px;color:#233342;line-height:1.45"><h2>'+esc(e.artist)+' — '+esc(e.city)+'</h2><p><b>'+esc(e.from+(e.to!==e.from?'–'+e.to:''))+'</b> · '+esc(e.country)+'</p><p>'+esc(e.fr)+'</p><p><a href="'+esc(e.artworkUrl)+'">Découvrir les œuvres et les dossiers ARTDACI</a></p><p><a href="'+esc(e.source)+'">Source documentaire</a></p><p style="font-size:11px">Position indicative au centre de la ville. Aucun emplacement précis de tableau ou d’atelier n’est garanti.</p></div>'
items=>'<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>ARTDACI GEO — Artistes et lieux de création (pilote)</name><description>Six repères urbains documentés de Van Gogh, Vermeer et Monet. Repères approximatifs, pas des ateliers.</description><Style id="artist"><IconStyle><color>ff6689df</color><scale>1.15</scale></IconStyle></Style>\n'+items.map(e=>'<Placemark><name>'+esc(e.artist+' — '+e.city)+'</name><styleUrl>#artist</styleUrl><description><![CDATA['+balloon(e).replace(/]]>/g,"]]]]><![CDATA[")+']]></description>'+(e.from===e.to?'<TimeStamp><when>'+e.from+'</when></TimeStamp>':'<TimeSpan><begin>'+e.from+'</begin><end>'+e.to+'</end></TimeSpan>')+'<ExtendedData><Data name="artist"><value>'+esc(e.artist)+'</value></Data><Data name="source"><value>'+esc(e.source)+'</value></Data><Data name="cityLocationOnly"><value>true</value></Data></ExtendedData><Point><coordinates>'+e.lon+','+e.lat+',0</coordinates></Point></Placemark>').join("\n")+'\n</Document></kml>\n'
fs.writeFileSync(path.join(dir,'artdaci-artists-journeys.kml'),makeKml(events));
console.log('Six artist-city KML placemarks generated.');
