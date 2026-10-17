/**
 * Stable Book AR work IDs -> canonical ARTDACI Semantic artwork IDs.
 * These IDs must exist in content/semantics/artwork-concepts.json.
 * Never fall back to ld01 when an artwork has been selected.
 */
export const bookArSemanticIds=Object.freeze({
 leonardo:Object.freeze({"mona-lisa":"ld01",ermine:"ld02",ginevra:"ld03",ferronniere:"ld04"}),
 vermeer:Object.freeze({pearl:"ve01",milkmaid:"ve03",delft:"ve02",balance:"ve04"}),
 vangogh:Object.freeze({"self-portrait-1889":"vg01",bedroom:"vg02","starry-night":"vg03","cafe-terrace":"vg04"}),
 monet:Object.freeze({sunrise:"mo01",parasol:"mo02",poppies:"mo03","water-lilies":"mo04"})
});
export function semanticArtworkId(artistId,workId){
 return bookArSemanticIds[artistId]?.[workId]||null;
}
export function semanticWorkHref(artistId,workId,lang="fr"){
 const artwork=semanticArtworkId(artistId,workId);
 if(!artwork)return null;
 const params=new URLSearchParams({artwork,lang:["fr","en","ar"].includes(lang)?lang:"fr"});
 return "semantic/?"+params.toString();
}
