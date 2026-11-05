/* ARTDACI GEO landing · Public experiences only.
 * Google Earth, institutional Street View and atlas links stay with their owners.
 * No Google Cloud credential, panorama copying or custom Quest API is used.
 */
const params=new URLSearchParams(location.search);
const lang=['fr','en','ar'].includes(params.get('lang'))?params.get('lang'):'fr';
document.documentElement.lang=lang;
document.documentElement.dir=lang==='ar'?'rtl':'ltr';

const COPY={
fr:{
 skip:'Aller au contenu',navArtworks:'Œuvres',navMuseums:'Musées',
 eyebrow:'ARTDACI GEO · ART ET GÉOGRAPHIE',
 heroTitle:"L'art a aussi une géographie.",
 heroLead:"Où se trouvent les chefs-d'œuvre ? À quoi ressemblent les musées qui les accueillent ? Passez d'une peinture à un lieu réel, d'un panorama à une exploration du monde.",
 heroArtworks:"Partir d'une œuvre",heroMuseums:'Explorer les musées',
 countArtworks:'œuvres à retrouver',countMuseums:"musées dans l'atlas",countExperiences:'Street View · Google Earth · Atlas',
 siteNote:"Ici, vous explorez des lieux réels : Street View permet de regarder autour de soi en 360°, Google Earth de situer les musées sur le globe. Toutes les vues ne montrent pas les tableaux dans leur salle.",
 artworksKicker:'01 · LES ŒUVRES',artworksTitle:'Commencez par un tableau.',
 artworksIntro:"Ces quatre œuvres disposent de points de départ panoramiques fournis pour leurs musées. Vous pouvez explorer la vue, puis poursuivre vers l'ensemble des 24 œuvres.",
 featuredKind:'Panorama fourni',museumPanoramaKind:"Vue de l'étage du musée",
 pearlTitle:'La Jeune Fille à la perle',delftTitle:'Vue de Delft',milkmaidTitle:'La Laitière',goghTitle:'Autoportrait (1889)',
 pearlMuseum:'Mauritshuis · La Haye',milkmaidMuseum:'Rijksmuseum · Amsterdam',goghMuseum:"Musée d'Orsay · Paris",
 viewPanorama:'Ouvrir le panorama',artworksAllTitle:'Et les 20 autres œuvres ?',
 artworksAllBody:'Consultez le catalogue complet : panoramas, visites institutionnelles et vues de proximité, avec leur statut clairement indiqué.',
 artworksAllAction:'Explorer les 24 œuvres',
 museumsKicker:'02 · LES MUSÉES',museumsTitle:"Comprenez les lieux qui abritent l'art.",
 museumsIntro:"Deux approches complémentaires : parcourir le monde sur une carte et un globe, ou découvrir l'histoire et l'architecture des musées à travers leurs photographies.",
 earthOverline:'GÉOGRAPHIE · GOOGLE EARTH',earthTitle:'17 musées sur le globe.',
 earthBody:"Situez les musées, parcourez les régions et les itinéraires culturels. L'Earth Explorer ouvre Google Earth et propose des fichiers KML enrichis.",
 earthAction:'Ouvrir Earth Explorer',kmlAction:"Télécharger l'atlas KML (17 musées)",
 atlasOverline:'ARCHITECTURE · HISTOIRE · PHOTOGRAPHIES',atlasMark:'MUSÉES',
 atlasTitle:"Entrez dans l'histoire des musées.",
 atlasBody:"Découvrez leurs bâtiments, leurs collections, des photographies sourcées et les œuvres ARTDACI qui leur sont liées, sans multiplier les mêmes liens cartographiques.",
 atlasAction:"Voir l'atlas photographique",directoryAction:'Parcourir les fiches des musées',
 transparencyKicker:'À SAVOIR',transparencyTitle:'Un lieu réel, pas nécessairement la salle du tableau.',
 transparencyBody:"Les liens Street View peuvent mener à une salle, à un espace voisin ou aux abords du musée. L'emplacement des œuvres et leur accrochage évoluent. Les images restent hébergées par leurs fournisseurs et sont accompagnées de leurs propres crédits.",
 footerCaption:"De l'œuvre au lieu · Art beyond the frame.",footerReturn:'Retour à ARTDACI',
 fallback:'Si la vue panoramique n’est plus disponible, consultez la fiche de l’œuvre dans le catalogue GEO.',
 pageTitle:'ARTDACI GEO — Des œuvres aux musées, autour du monde.'
},
en:{
 skip:'Skip to content',navArtworks:'Artworks',navMuseums:'Museums',
 eyebrow:'ARTDACI GEO · ART AND GEOGRAPHY',
 heroTitle:'Art has a geography, too.',
 heroLead:'Where are the masterpieces? What do the museums that house them look like? Follow a painting to a real place, from a 360° panorama to an exploration of the globe.',
 heroArtworks:'Start with an artwork',heroMuseums:'Explore museums',
 countArtworks:'artworks to discover',countMuseums:'museums in the atlas',countExperiences:'Street View · Google Earth · Atlas',
 siteNote:'Explore real places: Street View lets you look around in 360°, while Google Earth helps locate museums on the globe. Not every panorama shows the painting in its gallery.',
 artworksKicker:'01 · ARTWORKS',artworksTitle:'Start with a painting.',
 artworksIntro:'These four artworks have supplied panoramic starting points for their museums. Explore the view, then continue to the full catalog of 24 artworks.',
 featuredKind:'Supplied panorama',museumPanoramaKind:'Museum floor panorama',
 pearlTitle:'Girl with a Pearl Earring',delftTitle:'View of Delft',milkmaidTitle:'The Milkmaid',goghTitle:'Self-Portrait (1889)',
 pearlMuseum:'Mauritshuis · The Hague',milkmaidMuseum:'Rijksmuseum · Amsterdam',goghMuseum:'Musée d’Orsay · Paris',
 viewPanorama:'Open panorama',artworksAllTitle:'And the other 20 artworks?',
 artworksAllBody:'Browse the full catalog: panoramas, institutional tours and nearby views, with each entry clearly labeled.',
 artworksAllAction:'Explore all 24 artworks',
 museumsKicker:'02 · MUSEUMS',museumsTitle:'Discover the places behind the art.',
 museumsIntro:'Two complementary paths: travel across a map and globe, or explore the history and architecture of museums through sourced photographs.',
 earthOverline:'GEOGRAPHY · GOOGLE EARTH',earthTitle:'17 museums on the globe.',
 earthBody:'Locate museums and explore regions and cultural routes. Earth Explorer opens Google Earth and provides enriched KML files.',
 earthAction:'Open Earth Explorer',kmlAction:'Download the 17-museum KML atlas',
 atlasOverline:'ARCHITECTURE · HISTORY · PHOTOGRAPHS',atlasMark:'MUSEUMS',
 atlasTitle:'Discover the stories of museums.',
 atlasBody:'Explore their buildings, collections, sourced photographs and ARTDACI artwork connections without duplicating the same map links.',
 atlasAction:'Explore the photographic atlas',directoryAction:'Browse museum profiles',
 transparencyKicker:'GOOD TO KNOW',transparencyTitle:'A real place, not always the painting’s gallery.',
 transparencyBody:'Street View may lead to an exhibition room, an adjacent space or the museum surroundings. Displays change. Images remain hosted by their providers, with their own attribution.',
 footerCaption:'From artwork to place · Art beyond the frame.',footerReturn:'Back to ARTDACI',
 fallback:'If a panorama is unavailable, browse the artwork entry in the GEO catalog.',
 pageTitle:'ARTDACI GEO — Artworks and museums across the globe.'
},
ar:{
 skip:'انتقل إلى المحتوى',navArtworks:'الأعمال الفنية',navMuseums:'المتاحف',
 eyebrow:'ARTDACI GEO · الفن والجغرافيا',
 heroTitle:'للفن جغرافيته أيضاً.',
 heroLead:'أين توجد الروائع الفنية؟ وكيف تبدو المتاحف التي تحتضنها؟ انتقل من لوحة إلى مكان حقيقي، ومن مشهد بانورامي بزاوية ٣٦٠ درجة إلى استكشاف العالم.',
 heroArtworks:'ابدأ بعمل فني',heroMuseums:'استكشف المتاحف',
 countArtworks:'عملاً فنياً للاكتشاف',countMuseums:'متحفاً في الأطلس',countExperiences:'ستريت فيو · جوجل إيرث · الأطلس',
 siteNote:'استكشف أماكن حقيقية: يتيح ستريت فيو النظر حولك بزاوية ٣٦٠ درجة، ويساعد جوجل إيرث على تحديد مواقع المتاحف على الكرة الأرضية. ليست كل المشاهد داخل قاعة اللوحة.',
 artworksKicker:'٠١ · الأعمال الفنية',artworksTitle:'ابدأ من لوحة فنية.',
 artworksIntro:'تتوفر لهذه الأعمال الأربعة نقاط انطلاق بانورامية مرتبطة بمتاحفها. استكشف المشهد ثم تابع إلى فهرس الأعمال الفنية الأربعة والعشرين.',
 featuredKind:'مشهد بانورامي متاح',museumPanoramaKind:'مشهد بانورامي لطابق المتحف',
 pearlTitle:'الفتاة ذات القرط اللؤلؤي',delftTitle:'منظر دلفت',milkmaidTitle:'خادمة الحليب',goghTitle:'صورة ذاتية (١٨٨٩)',
 pearlMuseum:'موريتشويس · لاهاي',milkmaidMuseum:'متحف ريكز · أمستردام',goghMuseum:'متحف أورسيه · باريس',
 viewPanorama:'افتح المشهد البانورامي',artworksAllTitle:'وماذا عن الأعمال العشرين الأخرى؟',
 artworksAllBody:'تصفح الفهرس الكامل: مناظر بانورامية وجولات مؤسسية ومشاهد قريبة، مع توضيح طبيعة كل رابط.',
 artworksAllAction:'استكشف الأعمال الـ٢٤',
 museumsKicker:'٠٢ · المتاحف',museumsTitle:'اكتشف الأماكن التي تحتضن الفن.',
 museumsIntro:'طريقتان متكاملتان: التجول على الخريطة والكرة الأرضية، أو التعرف إلى تاريخ المتاحف وعمارتها عبر صور موثقة.',
 earthOverline:'الجغرافيا · جوجل إيرث',earthTitle:'١٧ متحفاً على الكرة الأرضية.',
 earthBody:'حدد مواقع المتاحف واستكشف المناطق والمسارات الثقافية. يفتح Earth Explorer جوجل إيرث ويقدم ملفات KML غنية بالمعلومات.',
 earthAction:'فتح Earth Explorer',kmlAction:'تنزيل أطلس KML للمتاحف الـ١٧',
 atlasOverline:'العمارة · التاريخ · الصور',atlasMark:'متاحف',
 atlasTitle:'اكتشف قصص المتاحف.',
 atlasBody:'تعرف إلى المباني والمجموعات والصور موثقة المصادر والروابط بأعمال ARTDACI دون تكرار الروابط الجغرافية.',
 atlasAction:'استكشف الأطلس المصور',directoryAction:'تصفح ملفات المتاحف',
 transparencyKicker:'معلومة مهمة',transparencyTitle:'مكان حقيقي، وليس بالضرورة قاعة اللوحة.',
 transparencyBody:'قد يؤدي ستريت فيو إلى قاعة أو مكان مجاور أو المنطقة المحيطة بالمتحف. تتغير أماكن عرض الأعمال بمرور الوقت. تبقى الصور لدى الجهات التي توفرها مع بيانات حقوقها.',
 footerCaption:'من العمل الفني إلى المكان · فن يتجاوز الإطار.',footerReturn:'العودة إلى ARTDACI',
 fallback:'إذا لم يعد المشهد متاحاً، اطلع على صفحة العمل في فهرس GEO.',
 pageTitle:'ARTDACI GEO — من الأعمال الفنية إلى المتاحف حول العالم.'
}
};
const t=COPY[lang],$=id=>document.getElementById(id);
document.title=t.pageTitle;
function localText(){
 for(const node of document.querySelectorAll('[data-copy]')){
  const value=t[node.dataset.copy];
  if(!value)continue;
  const arrow=node.querySelector('[aria-hidden="true"]');
  node.textContent=value;
  if(arrow){
   const span=document.createElement('span');
   span.setAttribute('aria-hidden','true');
   span.textContent=node.dataset.copy==='kmlAction'?'↓':'↗';
   node.append(' ',span);
  }
 }
 document.querySelector('.skip-link').textContent=t.skip;
 for(const node of document.querySelectorAll('.art-picture')){
  const id=node.dataset.featureImage,labels={
   'vermeer-girl-with-a-pearl-earring':t.pearlTitle,
   'view-of-delft':t.delftTitle,
   'vermeer-milkmaid':t.milkmaidTitle,
   'van-gogh':t.goghTitle
  };
  node.setAttribute('aria-label',labels[id]+' — '+t.viewPanorama);
  node.querySelector('img').alt=labels[id];
 }
 for(const node of document.querySelectorAll('[data-lang]')){
  const query=new URLSearchParams(location.search);
  query.set('lang',node.dataset.lang);
  node.href='index.html?'+query.toString()+location.hash;
  if(node.dataset.lang===lang)node.setAttribute('aria-current','page');
  else node.removeAttribute('aria-current');
 }
 const home=lang==='en'?'../index.html':lang==='ar'?'../index-ar.html':'../index-fr.html';
 $('geo-home-brand').href=home;
 $('geo-home-brand').setAttribute('aria-label',t.footerReturn);
 $('geo-footer-home').href=home;
 document.querySelector('.primary-navigation').setAttribute('aria-label',lang==='fr'?'Explorer ARTDACI GEO':lang==='ar'?'التنقل في ARTDACI GEO':'Explore ARTDACI GEO');
 document.querySelector('.language-navigation').setAttribute('aria-label',lang==='fr'?'Choisir la langue':lang==='ar'?'اختر اللغة':'Choose language');
 for(const link of document.querySelectorAll('[data-target]')){
  const path=link.dataset.target;
  if(path==='../museums-atlas.html'){
   link.href=lang==='fr'?'../museums-atlas.html':lang==='ar'?'../museums-atlas-ar.html':'../museums-atlas-en.html';
  }else{
   link.href=path+'?lang='+encodeURIComponent(lang);
  }
 }
 for(const link of document.querySelectorAll('[data-featured-panorama],[data-feature-image]')){
  const id=link.dataset.featuredPanorama||link.dataset.featureImage;
  link.href='streetview-360.html?lang='+encodeURIComponent(lang)+'#artwork-'+encodeURIComponent(id);
 }
}

function safePanorama(value){
 if(typeof value!=='string')return null;
 try{
  const url=new URL(value);
  if(url.protocol!=='https:')return null;
  if(url.hostname==='artsandculture.google.com'&&url.pathname.startsWith('/streetview/'))return url.href;
  if(url.hostname==='www.google.com'&&url.pathname.startsWith('/maps/')&&/!1s[A-Za-z0-9_-]{8,}/.test(url.pathname))return url.href;
 }catch{}
 return null;
}
async function linkPanoramas(){
 // The public GEO catalog is the single source of truth for provider URLs.
 // On failure, the four cards still link to their corresponding public GEO entries.
 try{
  const response=await fetch('data/artwork-museum-views.json',{cache:'no-cache'});
  if(!response.ok)throw Error('GEO collection unavailable');
  const data=await response.json();
  if(!Array.isArray(data.items))throw Error('Invalid artwork list');
  const works=new Map(data.items.map(item=>[item.slug,item]));
  for(const link of document.querySelectorAll('[data-featured-panorama],[data-feature-image]')){
   const id=link.dataset.featuredPanorama||link.dataset.featureImage;
   const item=works.get(id);
   const target=safePanorama(item?.googleMapsPanoramaUrl)||safePanorama(item?.exactPanoramaUrl);
   if(!target)continue;
   link.href=target;
   link.target='_blank';
   link.rel='noopener noreferrer';
   link.title=t.viewPanorama+' · '+(item.museum||id);
  }
 }catch(error){
  console.warn('ARTDACI GEO panorama links: retaining safe catalog fallbacks.',error?.message||'Unavailable');
 }
}
localText();
linkPanoramas();
