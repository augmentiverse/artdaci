/**
 * ARTDACI GEO · Street View 360° public edition.
 * Browser-only, no Google Cloud credentials, Maps Tiles API or copied panoramas.
 * Links open official provider experiences, where attribution and controls belong.
 */
const params=new URLSearchParams(location.search);
const lang=['fr','en','ar'].includes(params.get('lang'))?params.get('lang'):'fr';
document.documentElement.lang=lang;
document.documentElement.dir=lang==='ar'?'rtl':'ltr';
const labels={
 fr:{
  title:'Explorer les œuvres au-delà du cadre',lead:'24 œuvres, des musées du monde entier et plusieurs chemins pour découvrir leur environnement à 360°.',
  kicker:'ARTDACI GEO · STREET VIEW 360°',disclaimer:'Une vue panoramique proche d’un musée ne signifie pas que le tableau figure dans l’image. Les expositions peuvent changer et certains lieux ne disposent pas de Street View.',
  search:'Rechercher une œuvre, un artiste ou un musée',filters:'Filtrer les expériences',all:'Toutes les œuvres',
  direct:'Panorama orienté',tour:'Visite institutionnelle',nearby:'Exploration du musée',
  directNote:'Point de départ panoramique fourni pour cette œuvre ; accrochage actuel non certifié.',
  tourNote:'Visite institutionnelle disponible ; présence du tableau non vérifiée.',
  nearNote:'Emplacement approximatif du musée ; panorama à proximité non garanti.',
  visit:'Ouvrir le panorama du musée',maps:'Essayer Street View à proximité',mapsDirect:'Voir le panorama précis sur Google Maps',mapsMuseum:'Visiter le musée dans Google Street View',artwork:'Voir la fiche de l’œuvre',source:'Visite / source institutionnelle',
  tally:'œuvres affichées sur 24',noResults:'Aucune œuvre ne correspond à votre recherche.',
  helpTitle:'Deux façons de parcourir les musées',helpText:'Les liens institutionnels ouvrent les visites officielles. Les liens Street View ouvrent Google Maps près du musée : Google choisit le panorama le plus proche lorsqu’il en existe un.',
  quest:'Dans Meta Quest Browser, ouvrez les liens pour essayer l’affichage panoramique proposé par Google. Le suivi des mains personnalisé d’ARTDACI reste réservé à sa Preview de recherche.',
  open:'S’ouvre dans un nouvel onglet',credit:'Vues et photographies affichées sur les plateformes Google, avec leurs propres mentions et conditions. ARTDACI ne revendique pas ces images.',
  count:'24 œuvres · 6 panoramas directs fournis · 17 musées de l’atlas et une institution à Tokyo.',
  home:'Retour à ARTDACI GEO',gallery:'Catalogue des œuvres',goto:'Accéder aux œuvres',
  statusDirect:'Panorama lié à l’œuvre',statusTour:'Parcours du musée',statusNearby:'Recherche de proximité'
 },
 en:{
  title:'Discover art beyond the frame',lead:'24 artworks, museums around the world, and multiple ways to explore their surroundings in 360°.',
  kicker:'ARTDACI GEO · STREET VIEW 360°',disclaimer:'A panorama near a museum does not mean the artwork is shown. Exhibitions may change, and some locations have no Street View imagery.',
  search:'Search for an artwork, artist, or museum',filters:'Filter experiences',all:'All artworks',
  direct:'Oriented panorama',tour:'Institutional tour',nearby:'Museum exploration',
  directNote:'A panorama starting point was supplied for this artwork; current display not certified.',
  tourNote:'An institutional tour is available; the artwork itself has not been verified in the panorama.',
  nearNote:'Approximate museum location; nearby panorama availability is not guaranteed.',
  visit:'Open museum panorama',maps:'Try nearby Street View',mapsDirect:'Open exact Google Maps panorama',mapsMuseum:'Explore museum in Google Street View',artwork:'View artwork reference',source:'Institutional tour / source',
  tally:'artworks shown out of 24',noResults:'No artworks match your search.',
  helpTitle:'Two ways to explore museums',helpText:'Institutional links open official tours. Street View links open Google Maps near the museum; Google selects the nearest available panorama.',
  quest:'In Meta Quest Browser, open the links to try the panoramic view offered by Google. ARTDACI’s custom hand tracking remains in its research Preview.',
  open:'Opens in a new tab',credit:'Views and photos are displayed on Google platforms with their own notices and terms. ARTDACI does not claim ownership of the imagery.',
  count:'24 artworks · 6 supplied direct panoramas · 17 atlas museums plus one Tokyo institution.',
  home:'Back to ARTDACI GEO',gallery:'Artwork directory',goto:'Explore artworks',
  statusDirect:'Artwork-linked panorama',statusTour:'Museum tour',statusNearby:'Nearby search'
 },
 ar:{
  title:'اكتشف الفن خارج الإطار',lead:'٢٤ عملاً فنياً ومتاحف من أنحاء العالم وطرق متعددة لاستكشاف مواقعها بمناظر ٣٦٠ درجة.',
  kicker:'ARTDACI GEO · STREET VIEW 360°',disclaimer:'وجود منظر بانورامي بالقرب من المتحف لا يعني أن اللوحة ظاهرة فيه. قد تتغير أماكن العرض، ولا تتوفر صور Street View في جميع المواقع.',
  search:'ابحث عن لوحة أو فنان أو متحف',filters:'تصفية التجارب',all:'جميع الأعمال',
  direct:'منظر بانورامي موجه',tour:'جولة مؤسسية',nearby:'استكشاف المتحف',
  directNote:'تم توفير نقطة انطلاق بانورامية للعمل الفني، لكن موضع عرضه الحالي غير مؤكد.',
  tourNote:'تتوفر جولة رسمية؛ ظهور اللوحة فيها غير مؤكد.',
  nearNote:'موقع المتحف تقريبي، وقد لا يتوفر منظر بانورامي قريب.',
  visit:'فتح منظر المتحف',maps:'تجربة Street View القريب',mapsDirect:'فتح المشهد المحدد في خرائط جوجل',mapsMuseum:'استكشاف المتحف في ستريت فيو',artwork:'عرض صفحة العمل الفني',source:'الجولة أو المصدر الرسمي',
  tally:'عملاً معروضاً من أصل ٢٤',noResults:'لا توجد أعمال مطابقة.',
  helpTitle:'طريقتان لاستكشاف المتاحف',helpText:'تفتح الروابط المؤسسية الجولات الرسمية. وتفتح روابط Street View خرائط Google بالقرب من المتحف حيث يتم اختيار أقرب منظر متاح.',
  quest:'في متصفح Meta Quest يمكن تجربة العروض البانورامية التي توفرها Google. يظل التحكم المخصص باليدين في ARTDACI مقتصراً على معاينة البحث.',
  open:'يفتح في نافذة جديدة',credit:'تُعرض الصور على منصات Google وفق شروطها وإشعاراتها. لا تدّعي ARTDACI ملكية هذه الصور.',
  count:'٢٤ عملاً · ٦ روابط بانورامية مباشرة · ١٧ متحفاً في الأطلس ومؤسسة واحدة في طوكيو.',
  home:'العودة إلى ARTDACI GEO',gallery:'فهرس الأعمال',goto:'استكشف الأعمال',
  statusDirect:'منظر مرتبط بالعمل',statusTour:'جولة في المتحف',statusNearby:'بحث بالقرب من المتحف'
 }
};
const t=labels[lang];
const $=name=>document.getElementById(name);
for(const [id,key] of Object.entries({
 'page-kicker':'kicker','page-title':'title','page-lead':'lead','geo-disclaimer':'disclaimer',
 'artwork-heading':'gallery','catalog-count':'count','near-help-title':'helpTitle',
 'near-help':'helpText','quest-notice':'quest','provider-credit':'credit','geo-return':'home',
 'jump-link':'goto','search-label':'search','filter-label':'filters'
}))$(id).textContent=t[key];
$('q').placeholder=t.search;
const options=$('kind').options;
for(let i=0;i<options.length;i++)options[i].textContent=[t.all,t.direct,t.tour,t.nearby][i];
for(const a of document.querySelectorAll('[data-lang]')){
 const u=new URL(location.href);u.searchParams.set('lang',a.dataset.lang);
 a.href=u.pathname+u.search+u.hash;
 if(a.dataset.lang===lang)a.setAttribute('aria-current','page');
}
const frTitles={
 'water-lilies':'Les Nymphéas','japanese-bridge':'Le Bassin aux nymphéas',
 'woman-with-parasol':'La Femme à l’ombrelle','pont-d-argenteuil':'Le Pont d’Argenteuil',
 'poppies':'Les Coquelicots','monet-impression-sunrise':'Impression, soleil levant',
 'vermeer-astronomer':'L’Astronome','art-of-painting':'L’Art de la peinture',
 'vermeer-girl-with-a-pearl-earring':'La Jeune Fille à la perle',
 'woman-holding-balance':'La Femme à la balance','view-of-delft':'Vue de Delft',
 'vermeer-milkmaid':'La Laitière','mona-lisa':'La Joconde','last-supper':'La Cène',
 'belle-ferronniere':'La Belle Ferronnière','lady-with-an-ermine':'La Dame à l’hermine',
 'ginevra-de-benci':'Ginevra de’ Benci','annunciation':'L’Annonciation',
 'van-gogh':'Autoportrait (1889)','starry-night':'La Nuit étoilée',
 'van-gogh-bedroom':'La Chambre à coucher','cafe-terrace':'Terrasse du café le soir',
 'night-cafe':'Le Café de nuit','sunflowers':'Les Tournesols'
};
const displayTitle=item=>lang==='fr'?(frTitles[item.slug]||item.title):item.title;
function providerLink(value){
 if(typeof value!=='string')return null;
 try {
  const u=new URL(value);
  if(u.protocol==='https:'&&u.hostname==='artsandculture.google.com'&&
     /^\/(streetview|partner|search\/streetview)(\/|$)/.test(u.pathname))return u.href;
 }catch{}
 return null;
}
// Only accept direct panoramas on Google's official Maps domain. Museum
// locations are not misrepresented as views of a particular artwork.
function verifiedMapsUrl(value){
 if(typeof value!=='string')return null;
 try{
  const u=new URL(value);
  if(u.protocol==='https:'&&u.hostname==='www.google.com'&&
    u.pathname.startsWith('/maps/')&&/!1s[A-Za-z0-9_-]{8,}/.test(u.pathname))
    return u.href;
 }catch{}
 return null;
}
function artworkReference(value){
 if(typeof value!=='string')return null;
 try{
  const u=new URL(value);
  return u.protocol==='https:'&&u.hostname==='artsandculture.google.com'&&
    u.pathname.startsWith('/asset/')?u.href:null;
 }catch{return null}
}
function sourceKind(item){
 if(providerLink(item.exactPanoramaUrl))return 'direct';
 if(providerLink(item.sourceUrl)||providerLink(item.floorPanoramaUrl))return 'tour';
 return 'nearby';
}
function streetViewURL(lat,lng){
 const u=new URL('https://www.google.com/maps/@');
 u.searchParams.set('api','1');
 u.searchParams.set('map_action','pano');
 u.searchParams.set('viewpoint',lat+','+lng);
 return u.href;
}
function element(tag,cls,value){
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(value!==undefined)node.textContent=value;
 return node;
}
function outbound(url,text,className){
 const a=element('a',className,text);
 a.href=url;a.target='_blank';a.rel='noopener noreferrer';
 a.title=text+' · '+t.open;
 return a;
}
function buildItem(item,point){
 const kind=sourceKind(item),title=displayTitle(item);
 const article=element('article','geo-street-card');
 article.id='artwork-'+item.slug;
 const meta=element('div','card-topline');
 meta.append(element('span','artwork-artist',item.artist));
 meta.append(element('span','kind kind-'+kind,t['status'+kind[0].toUpperCase()+kind.slice(1)]));
 article.append(meta);
 article.append(element('h3','artwork-name',title));
 article.append(element('p','museum-name',item.museum+' · '+item.city));
 article.append(element('p','card-note',t[kind==='direct'?'directNote':kind==='tour'?'tourNote':'nearNote']));
 const actions=element('div','card-actions');
 const mapsArtwork=verifiedMapsUrl(item.googleMapsPanoramaUrl);
 const mapsMuseum=verifiedMapsUrl(item.museumGoogleMapsPanoramaUrl);
 const direct=providerLink(item.exactPanoramaUrl);
 // Prefer the user-supplied exact Google Maps viewpoint where available.
 if(mapsArtwork)actions.append(outbound(mapsArtwork,t.mapsDirect,'action action-primary'));
 if(direct)actions.append(outbound(direct,t.visit,mapsArtwork?'action action-secondary':'action action-primary'));
 // Museum panoramas are explicitly labeled as museum views, not painting views.
 if(mapsMuseum)actions.append(outbound(mapsMuseum,t.mapsMuseum,'action action-primary'));
 const museumTour=providerLink(item.floorPanoramaUrl)||providerLink(item.sourceUrl);
 if(museumTour&&museumTour!==direct)actions.append(outbound(museumTour,t.source,'action action-secondary'));
 const reference=artworkReference(item.artworkReferenceUrl);
 if(reference)actions.append(outbound(reference,t.artwork,'action action-secondary'));
 if(point&&!mapsArtwork&&!mapsMuseum){
   actions.append(outbound(streetViewURL(point.latitude,point.longitude),t.maps,direct?'action action-secondary':'action action-primary'));
 }
 article.append(actions);
 return article;
}
async function init(){
 const [viewsResponse,museumsResponse,associationsResponse]=await Promise.all([
  fetch('data/artwork-museum-views.json',{cache:'no-cache'}),
  fetch('data/museums.json',{cache:'no-cache'}),
  fetch('data/artwork-streetview-venues.json',{cache:'no-cache'})
 ]);
 if(!viewsResponse.ok||!museumsResponse.ok||!associationsResponse.ok)throw Error('ARTDACI GEO data unavailable');
 const [{items},{museums},{artworkToVenue,additionalVenues}]=await Promise.all([
  viewsResponse.json(),museumsResponse.json(),associationsResponse.json()
 ]);
 if(!Array.isArray(items)||items.length!==24||!Array.isArray(museums)||typeof artworkToVenue!=='object')
   throw Error('Invalid ARTDACI GEO catalog');
 const locations=new Map([...museums,...additionalVenues].map(x=>[x.id,x]));
 const works=items.map(item=>{
  const point=locations.get(artworkToVenue[item.slug]);
  const valid=point&&Number.isFinite(point.latitude)&&Number.isFinite(point.longitude)&&
   Math.abs(point.latitude)<=90&&Math.abs(point.longitude)<=180;
  return {item,point:valid?point:null,kind:sourceKind(item)};
 });
 works.sort((a,b)=>
  ['direct','tour','nearby'].indexOf(a.kind)-['direct','tour','nearby'].indexOf(b.kind)||
  a.item.artist.localeCompare(b.item.artist,lang)||
  displayTitle(a.item).localeCompare(displayTitle(b.item),lang));
 const group=$('cards'),q=$('q'),filter=$('kind');
 const render=()=>{
  const needle=q.value.trim().toLocaleLowerCase();
  const selected=filter.value;
  const matching=works.filter(x=>(selected==='all'||x.kind===selected)&&
   [displayTitle(x.item),x.item.title,x.item.artist,x.item.museum,x.item.city].join(' ').toLocaleLowerCase().includes(needle));
  group.replaceChildren();
  for(const x of matching)group.append(buildItem(x.item,x.point));
  $('results').textContent=matching.length+' '+t.tally;
  $('empty').hidden=matching.length!==0;
 };
 $('empty').textContent=t.noResults;
 q.addEventListener('input',render);
 filter.addEventListener('change',render);
 render();
}
init().catch(error=>{
 $('results').textContent=lang==='fr'?'Catalogue temporairement indisponible.':
  lang==='ar'?'الفهرس غير متاح مؤقتاً.':'Catalog temporarily unavailable.';
 console.warn('ARTDACI GEO public explorer:',error.message);
});
