/**
 * ARTDACI Museum XR — small testable helpers.
 * The sv_pid from Google Arts & Culture is NOT assumed to be a Map Tiles panoId.
 */
export function parseMuseumLink(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "artsandculture.google.com") return null;
    const lat = Number(parsed.searchParams.get("sv_lat"));
    const lng = Number(parsed.searchParams.get("sv_lng"));
    if (!parsed.searchParams.has("sv_lat") || !parsed.searchParams.has("sv_lng") ||
        !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat)>90 || Math.abs(lng)>180) return null;
    const heading = Number(parsed.searchParams.get("sv_h"));
    const pitch = Number(parsed.searchParams.get("sv_p"));
    return { lat, lng, heading:Number.isFinite(heading)?heading:0, pitch:Number.isFinite(pitch)?pitch:0, source:url };
  } catch {return null;}
}

export function metersBetween(a,b) {
  const radians = Math.PI/180;
  const dLat=(b.lat-a.lat)*radians, dLng=(b.lng-a.lng)*radians;
  const h=Math.sin(dLat/2)**2+Math.cos(a.lat*radians)*Math.cos(b.lat*radians)*Math.sin(dLng/2)**2;
  return 12742000*Math.asin(Math.min(1,Math.sqrt(h)));
}

export function validateIndoorPanorama(metadata,target,maxDistance=20) {
  if (!metadata || typeof metadata.panoId!=="string" || !metadata.panoId ||
      !Number.isFinite(metadata.lat)||!Number.isFinite(metadata.lng)) return {ok:false,reason:"missing"};
  const distance=metersBetween(target,{lat:metadata.lat,lng:metadata.lng});
  if (distance>maxDistance) return {ok:false,reason:"distance",distance};
  if (metadata.imageryType!=="indoor") return {ok:false,reason:"outdoor",distance};
  return {ok:true,distance};
}

export function tileGrid(metadata,level=2) {
  if (!Number.isInteger(level)||level<0||level>5) throw Error("Invalid panorama zoom");
  const width=Number(metadata.imageWidth),height=Number(metadata.imageHeight);
  const tileWidth=Number(metadata.tileWidth),tileHeight=Number(metadata.tileHeight);
  if (![width,height,tileWidth,tileHeight].every(v=>Number.isInteger(v)&&v>0)) throw Error("Invalid panorama dimensions");
  const divisor=2**(5-level);
  const outputWidth=Math.max(1,Math.ceil(width/divisor));
  const outputHeight=Math.max(1,Math.ceil(height/divisor));
  if (outputWidth>4096||outputHeight>2048) throw Error("Panorama exceeds headset memory budget");
  const columns=Math.ceil(outputWidth/tileWidth),rows=Math.ceil(outputHeight/tileHeight);
  if (columns*rows>40) throw Error("Too many tile requests");
  return {outputWidth,outputHeight,tileWidth,tileHeight,columns,rows,level};
}

export function bearingVector(heading,radius=3) {
  const rad=heading*Math.PI/180;
  return {x:Math.sin(rad)*radius,y:0,z:-Math.cos(rad)*radius};
}
