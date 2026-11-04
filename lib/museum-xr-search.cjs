"use strict";
// A small, fixed set of search locations around the user-provided museum view.
// This is discovery only: an "indoor" match does not verify the exhibition room.
const OFFSETS_METRES=Object.freeze([[0,0],[8,0],[-8,0],[0,8],[0,-8],[8,8],[8,-8],[-8,8],[-8,-8],[16,0],[-16,0],[0,16],[0,-16]]);
const MAX_CANDIDATE_METADATA=8;
function searchLocations(museum){
  if(!Number.isFinite(museum?.lat)||!Number.isFinite(museum?.lng)||Math.abs(museum.lat)>85)throw Error("Invalid museum coordinates");
  const latPerMetre=1/111320,lonPerMetre=1/(111320*Math.cos(museum.lat*Math.PI/180));
  return OFFSETS_METRES.map(([north,east])=>({
    lat:Math.round((museum.lat+north*latPerMetre)*1e8)/1e8,
    lng:Math.round((museum.lng+east*lonPerMetre)*1e8)/1e8
  }));
}
function distinctPanoIds(result){
  if(!Array.isArray(result?.panoIds))return [];
  return [...new Set(result.panoIds.filter(x=>typeof x==="string"&&/^[A-Za-z0-9_-]{5,256}$/.test(x)))].slice(0,MAX_CANDIDATE_METADATA);
}
function classify(metadata,museum,validateIndoor){
  if(!metadata?.panoId)return "no-panorama";
  if(metadata.imageryType!=="indoor")return "nearest-outdoor";
  if(!validateIndoor(metadata,museum))return "outside-museum-radius";
  return "indoor-nearby";
}
module.exports={searchLocations,distinctPanoIds,classify,MAX_CANDIDATE_METADATA};
