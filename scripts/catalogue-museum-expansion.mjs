/* The collection homepage's eleven additional museums reuse the existing
   17-museum Atlas data. They are not advertised as AR/VR-enabled. */
const FRENCH_ANCHORS=Object.freeze({
  "louvre":"louvre","orsay":"orsay","mauritshuis":"mauritshuis",
  "czartoryski":"czartoryski","van-gogh-museum":"vangogh",
  "national-gallery-of-art-washington":"nga","rijksmuseum":"rijksmuseum",
  "moma":"moma","marmottan":"marmottan","kunsthistorisches":"khm",
  "uffizi":"uffizi","national-gallery-london":"national-gallery",
  "kroller-muller":"kroller","yale-art-gallery":"yale",
  "courtauld":"courtauld","orangerie":"orangerie","cenacolo-vinciano":"cenacolo"
});
export function getOtherMuseums(atlasMuseums,featuredMuseums,localizedMuseums=[]){
  if(!Array.isArray(atlasMuseums)||!Array.isArray(featuredMuseums))
    throw new TypeError("Museum data must be arrays");
  const primary=new Set(featuredMuseums.map(m=>m.slug||m.id));
  const localized=new Map((localizedMuseums||[]).map(m=>[m.id,m]));
  return atlasMuseums.filter(m=>!primary.has(m.id)).map(m=>{
    const l=localized.get(m.id)||{};
    return {id:m.id,name:l.name||m.name,city:l.city||m.city,country:l.country||m.country};
  });
}
export function getMuseumAtlasLink(id,lang="fr"){
  const language=["fr","en","ar"].includes(lang)?lang:"fr";
  const page=language==="fr"?"museums-atlas.html":"museums-atlas-"+language+".html";
  if(!id)return page;
  if(!Object.prototype.hasOwnProperty.call(FRENCH_ANCHORS,id))
    throw new Error("Unknown museum ID: "+id);
  const hash=language==="fr"?FRENCH_ANCHORS[id]:"museum-"+id;
  return page+"#"+hash;
}
