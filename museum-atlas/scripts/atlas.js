(()=>{'use strict';
const root=document.body.dataset.root||'./';
const locale=(()=>{const x=new URLSearchParams(window.location.search).get('lang');return ['fr','en','ar'].includes(x)?x:'fr';})();
const rtl=locale==='ar';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const absolute=url=>/^https:\/\//.test(String(url||''))?url:'#';
const external=(href,label)=>'<a href="'+esc(absolute(href))+'" target="_blank" rel="noopener noreferrer">'+esc(label)+' <span aria-hidden="true">↗</span></a>';
const museumHref=m=>root+'musees/'+encodeURIComponent(m.id)+'.html';
const cardPhoto=m=>'<img loading="lazy" decoding="async" src="'+esc(m.hero.url)+'" alt="Vue extérieure du '+esc(m.name)+'">';
function safeImage(img,images,index=0){
 img.onerror=()=>{if(index+1<images.length){img.onerror=null;img.src=images[index+1].url;safeImage(img,images,index+1);}
 else{const fallback=document.createElement('a');fallback.className='photo-error';fallback.textContent='Voir la photographie sur Wikimedia Commons ↗';fallback.href=images[0].page;fallback.target='_blank';fallback.rel='noopener noreferrer';img.replaceWith(fallback);}};
}
async function load(){
 const url=root+'data/museums.json';
 const response=await fetch(url);
 if(!response.ok)throw Error('Catalogue des musées indisponible (HTTP '+response.status+')');
 const db=await response.json();
 if(!Array.isArray(db.museums)||db.museums.length!==17||new Set(db.museums.map(m=>m.id)).size!==17)throw Error('Catalogue invalide');
 if(locale==='fr'){
  if(document.body.dataset.page==='index')renderIndex(db.museums);
  else renderDetail(db.museums,document.body.dataset.slug);
 } else {
  const translationResponse=await fetch(root+'data/'+locale+'.json');
  if(!translationResponse.ok)throw Error('Translation data HTTP '+translationResponse.status);
  const tr=await translationResponse.json();
  const photosResponse=await fetch(root+'data/photographic-gallery.json');
  if(!photosResponse.ok)throw Error('Photographic collection unavailable');
  const photoData=await photosResponse.json();
  if(tr.museums?.length!==17||photoData.photos?.length!==17)throw Error('Missing translations or photographs');
  const local=db.museums.map((museum,index)=>{
   const t=tr.museums.find(x=>x.id===museum.id);
   const photos=photoData.photos.find(x=>x.id===museum.id);
   if(!t||!photos||t.timeline.length!==4||t.researchTopics.length!==3||photos.photos.length<3)throw Error('Incomplete museum translation '+museum.id);
   return {...museum,...t,hero:{url:photos.hero.src,page:photos.hero.file},gallery:photos.photos.map(p=>({url:p.src,page:p.file})),timeline:museum.timeline.map((event,i)=>({...event,title:t.timeline[i]}))};
  });
  document.documentElement.lang=locale;document.documentElement.dir=rtl?'rtl':'ltr';document.body.dir=rtl?'rtl':'ltr';
  if(document.body.dataset.page==='index')renderIndexTranslated(local);
  else renderDetailTranslated(local,document.body.dataset.slug);
 }
}
function prepareFrenchHeader(){
  const header=document.querySelector('.site-header');
  if(!header||header.querySelector('.locale-nav'))return;
  const slug=document.body.dataset.slug;
  const localizedHref=(lng)=>document.body.dataset.page==='detail'?(root+'musees/'+encodeURIComponent(slug)+'.html'+(lng==='fr'?'':'?lang='+lng)):(root+'index.html'+(lng==='fr'?'':'?lang='+lng));
  const nav=document.createElement('nav');nav.className='locale-nav';nav.setAttribute('aria-label','Choix de langue');
  nav.innerHTML=['fr','en','ar'].map(lng=>'<a href="'+esc(localizedHref(lng))+'" lang="'+lng+'" hreflang="'+lng+'" '+(lng==='fr'?'aria-current="page"':'')+'>'+(lng==='ar'?'العربية':lng.toUpperCase())+'</a>').join('');
  header.append(nav);
}
function renderIndex(museums){
 prepareFrenchHeader();
 const search=$('atlas-search'),country=$('atlas-country');
 for(const name of [...new Set(museums.map(m=>m.country))].sort((a,b)=>a.localeCompare(b,'fr'))){
  const option=document.createElement('option');option.value=name;option.textContent=name;country.append(option);
 }
 function renderCards(container,list){
   container.innerHTML=list.map(m=>{
    const i=museums.indexOf(m)+1;
    return '<article class="museum-card"><div class="card-photo"><a href="'+esc(museumHref(m))+'" aria-label="Ouvrir la fiche du '+esc(m.name)+'">'+cardPhoto(m)+'</a><span class="tile-number">'+String(i).padStart(2,'0')+'</span></div>'+
    '<div class="card-body"><div class="card-location">'+esc(m.city+' · '+m.country)+'</div><h4>'+esc(m.name)+'</h4><p>'+esc(m.signature)+'</p><a class="card-link" href="'+esc(museumHref(m))+'">Découvrir la fiche complète <span aria-hidden="true">↗</span></a></div></article>';
   }).join('');
   container.querySelectorAll('img').forEach((img,i)=>safeImage(img,list[i].gallery));
 }
 function apply(){
   const needle=search.value.trim().toLocaleLowerCase('fr'),target=country.value;
   const items=museums.filter(m=>(!target||m.country===target) && (!needle||[m.name,m.city,m.country,m.signature,m.theme,...m.types,m.history,m.collections].join(' ').toLocaleLowerCase('fr').includes(needle)));
   const a=items.filter(m=>museums.indexOf(m)<6),b=items.filter(m=>museums.indexOf(m)>=6);
   $('featured-block').hidden=a.length===0;$('additional-block').hidden=b.length===0;$('no-results').hidden=items.length>0;
   $('search-count').textContent=items.length+' musée'+(items.length>1?'s':'')+' affiché'+(items.length>1?'s':'')+' sur 17';
   renderCards($('featured-grid'),a);renderCards($('additional-grid'),b);
 }
 search.addEventListener('input',apply);country.addEventListener('change',apply);apply();
}
function renderDetail(museums,slug){
 prepareFrenchHeader();
 const m=museums.find(x=>x.id===slug),host=$('detail-app');
 if(!m){host.innerHTML='<section class="section"><h1>Musée introuvable</h1><p>Cette fiche ne figure pas dans le catalogue ARTDACI.</p><a href="'+esc(root+'index.html')+'">Retour à l’atlas</a></section>';return;}
 document.title=m.name+' | ARTDACI — Atlas du patrimoine muséal';
 const description=document.querySelector('meta[name="description"]');if(description)description.content='Fiche du '+m.name+' : histoire, architecture, collections, conservation, photographies et ressources documentaires.';
 const pos=museums.indexOf(m),immersive=pos<6;
 const sections=[
  ['histoire','Histoire et identité',m.history],
  ['architecture','Architecture et muséographie',m.architecture],
  ['collections','Collections et chefs-d’œuvre',m.collections],
  ['education','Médiation et pistes pédagogiques',m.education],
  ['numerique','Collections numériques et recherche',m.digital],
  ['visite','Préparer sa visite',m.visit]
 ];
 const titles=sections.map(s=>'<a href="#'+s[0]+'">'+esc(s[1])+'</a>').join('')+'<a href="#chronologie">Chronologie</a><a href="#analyses">Dossiers d’analyse</a><a href="#conservation">Conservation</a><a href="#archives-num">Ressources numériques</a><a href="#sources">Sources et ressources</a><a href="#photographies">Galerie photographique</a>';
 const content=sections.map(([id,title,body])=>'<section class="article-section" id="'+id+'"><h2>'+esc(title)+'</h2><p>'+esc(body)+'</p></section>').join('');
 const extended=(Array.isArray(m.timeline)&&Array.isArray(m.researchTopics))?[
  '<section class="article-section atlas-extended" id="chronologie"><div class="eyebrow">REPÈRES HISTORIQUES</div><h2>Chronologie du musée</h2><ol class="museum-timeline">'+m.timeline.map(x=>'<li><time>'+esc(x.date)+'</time><span>'+esc(x.title)+'</span></li>').join('')+'</ol></section>',
  '<section class="article-section atlas-extended" id="analyses"><div class="eyebrow">POUR APPROFONDIR</div><h2>Trois éclairages sur l’institution</h2><div class="research-topic-grid">'+m.researchTopics.map((x,i)=>'<article class="research-topic"><span class="topic-index">'+String(i+1).padStart(2,'0')+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.body)+'</p></article>').join('')+'</div></section>',
  '<section class="article-section atlas-extended" id="conservation"><div class="eyebrow">PATRIMOINE & SCIENCE</div><h2>Conservation, restauration et recherche</h2><p>'+esc(m.conservationDetail||'')+'</p></section>',
  '<section class="article-section atlas-extended" id="archives-num"><div class="eyebrow">DONNÉES & ACCÈS</div><h2>Archives numériques et conditions de réutilisation</h2><p>'+esc(m.digitalDetail||'')+'</p></section>'
 ].join(''):'';
 const sourceLinks=m.sources.map((s,i)=>'<li>'+external(s.url,String(i+1).padStart(2,'0')+' · '+s.name)+'</li>').join('');
 const preview=immersive?'<a class="secondary-cta" href="'+esc(root+'../museums.html?lang=fr&museum='+encodeURIComponent(m.id))+'">Explorer les expériences ARTDACI</a>':'<span class="secondary-cta" aria-label="Expériences immersives envisagées pour une future version">RA &amp; RV : futures extensions</span>';
 host.innerHTML='<nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="'+esc(root+'index.html')+'">Atlas des 17 musées</a><span aria-hidden="true">›</span><span>'+esc(m.name)+'</span></nav>'+
 '<section class="detail-hero"><div class="detail-intro"><span class="badge">'+(immersive?'Musée majeur · Expériences ARTDACI':'Musée associé · Atlas documentaire')+'</span><h1>'+esc(m.name)+'</h1><p class="place">'+esc(m.city+' · '+m.country)+'</p><p class="lead">'+esc(m.theme)+'. '+esc(m.history.slice(0,220))+'…</p><div class="hero-actions">'+external(m.sources[0].url,'Site institutionnel')+preview+'</div></div>'+
 '<figure class="detail-photo"><img id="hero-museum-photo" fetchpriority="high" decoding="async" src="'+esc(m.hero.url)+'" alt="Photographie réelle du '+esc(m.name)+' — façade et vue du musée"><figcaption class="credit">Photographie : Wikimedia Commons · '+external(m.hero.page,'Voir le fichier, son auteur et sa licence')+'</figcaption></figure></section>'+
 '<div class="detail-stats"><div class="detail-stat"><small>Ville et pays</small><strong>'+esc(m.city+' · '+m.country)+'</strong></div><div class="detail-stat"><small>Repère historique</small><strong>'+esc(m.opened)+'</strong></div><div class="detail-stat"><small>Architecture / lieu</small><strong>'+esc(m.architect)+'</strong></div></div>'+
 '<div class="detail-layout"><nav class="local-nav" aria-label="Sommaire de la fiche"><strong>DANS CETTE FICHE</strong>'+titles+'</nav>'+
 '<article class="detail-content"><div class="highlight"><strong>Connexion avec le livre augmenté ARTDACI</strong><p>'+esc(m.signature)+'</p></div>'+
 content+extended+
 '<section class="article-section" id="sources"><h2>Bibliographie, sources et ressources</h2><p>Consultez les ressources institutionnelles pour approfondir l’histoire, les collections, la conservation, les recherches et la programmation du musée.</p><ul class="resources">'+sourceLinks+'</ul><p class="research-note">Consultation et sélection documentaire : octobre 2026. Les informations évolutives (horaires, tarifs, disponibilité des œuvres) doivent être revérifiées auprès des institutions. Une œuvre conservée n’est pas nécessairement exposée au moment de la visite.</p></section>'+
 '<section class="article-section gallery-section" id="photographies"><div class="eyebrow">IMAGES RÉELLES · WIKIMEDIA COMMONS</div><h2>Galerie photographique</h2><p>Façades, espaces intérieurs et vues architecturales. Les photographies sont associées à leurs pages originales pour contrôler auteurs, licences et autres résolutions.</p><div class="photo-grid" id="photo-gallery"></div><p class="research-note">Les photographies sont hébergées sur Wikimedia Commons. Le droit de réutiliser un cliché doit être vérifié sur chaque page de fichier. Les droits photographiques ne sont pas automatiquement ceux des œuvres visibles sur la photographie.</p></section>'+
 '</article></div><nav class="detail-pagination" aria-label="Parcourir les musées"><a href="'+esc(museumHref(museums[(pos+16)%17]))+'">← '+esc(museums[(pos+16)%17].name)+'</a><a href="'+esc(museumHref(museums[(pos+1)%17]))+'">'+esc(museums[(pos+1)%17].name)+' →</a></nav>';
 const img=$('hero-museum-photo');safeImage(img,m.gallery);
 const grid=$('photo-gallery');
 for(let i=0;i<m.gallery.length;i++){
  const p=m.gallery[i],fig=document.createElement('figure');fig.className='photo-figure';
  const button=document.createElement('button');button.className='photo-button';button.type='button';button.setAttribute('aria-label','Agrandir la photographie '+(i+1)+' du '+m.name);
  const pic=document.createElement('img');pic.loading='lazy';pic.decoding='async';pic.src=p.url;pic.alt=(i===0?'Façade / vue principale':'Vue complémentaire')+' du '+m.name;safeImage(pic,m.gallery.slice(i).concat(m.gallery.slice(0,i)));
  button.append(pic);button.addEventListener('click',()=>openPhoto(p,m.name,i+1));
  const caption=document.createElement('figcaption');caption.append(document.createTextNode((i===0?'Vue principale':'Vue complémentaire '+i)+' · '));
  const link=document.createElement('a');link.href=p.page;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Source, auteur et licence ↗';caption.append(link);
  fig.append(button,caption);grid.append(fig);
 }
}
function openPhoto(photo,museum,number){
 let dialog=$('atlas-dialog');
 if(!dialog){dialog=document.createElement('dialog');dialog.className='photo-dialog';dialog.id='atlas-dialog';dialog.innerHTML='<div class="dialog-tools"><strong>ARTDACI · Photographie de musée</strong><button type="button" aria-label="Fermer la photographie">Fermer ×</button></div><img alt=""><p></p>';document.body.append(dialog);dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});}
 const img=dialog.querySelector('img');img.src=photo.url;img.alt='Photographie '+number+' — '+museum;
 const p=dialog.querySelector('p');p.replaceChildren(document.createTextNode('Source documentaire : '));
 const a=document.createElement('a');a.href=photo.page;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Wikimedia Commons · auteur, licence et haute définition ↗';p.append(a);
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
}

const LOCAL={
en:{title:'ARTDACI — Museum Heritage Atlas',home:'Home',explorer:'Museum Explorer',photo:'Photographic Atlas',back:'Back to photographic atlas',research:'Research museum atlas',timeline:'Museum chronology',topic:'Three research perspectives',conservation:'Conservation, restoration and research',digital:'Digital archives and reuse conditions',sources:'References and resources',photos:'Photographic gallery',photosInfo:'Authentic views of the building and spaces, linked to their source files for attribution and licence information.',credit:'Image source and licence',opening:'Historical landmark',location:'Location',architect:'Architecture and site',sections:['History and identity','Architecture and museum spaces','Collections and masterpieces','Education and learning','Digital collections and research','Plan your visit'],focus:'ARTDACI artwork connection',official:'Official institution website',immersive:'Explore ARTDACI immersive experiences',future:'AR and VR experiences may be added later',photoBadge:'Museum photograph',museum:'Museum',related:'Research dossier',previous:'Previous',next:'Next',notice:'Museum holdings and displays can change. Confirm hours, tickets, artwork locations and photo licences on the linked official sources.',galleryNote:'Photographs are hosted on Wikimedia Commons. Check source pages for author, image dimensions and licence.',notFound:'Museum not found',loading:'The museum catalogue could not be loaded.',close:'Close',detail:'Detailed museum dossier',site:'ARTDACI Museum Heritage Atlas',researchHeading:'Museum heritage: 17 institutions',indexLead:'Discover 17 museums through architecture, history, collections and research. Their heritage connects original artworks with ARTDACI immersive art education.'},
ar:{title:'ARTDACI — أطلس التراث المتحفي',home:'الرئيسية',explorer:'مستكشف المتاحف',photo:'الأطلس المصوّر',back:'العودة إلى الأطلس المصوّر',research:'أطلس المتاحف البحثي',timeline:'التسلسل الزمني للمتحف',topic:'ثلاث زوايا بحثية',conservation:'الحفظ والترميم والبحث',digital:'الأرشيف الرقمي وشروط إعادة الاستخدام',sources:'المراجع والمصادر',photos:'معرض الصور الفوتوغرافية',photosInfo:'صور حقيقية للمبنى والقاعات مرتبطة بملفاتها الأصلية للتحقق من اسم المصور والترخيص.',credit:'مصدر الصورة والترخيص',opening:'تاريخ المؤسسة',location:'الموقع',architect:'العمارة والمبنى',sections:['التاريخ والهوية','العمارة ومساحات العرض','المجموعات والتحف الفنية','التعليم والتعلم','المجموعات الرقمية والبحث','التحضير للزيارة'],focus:'العمل المرتبط بمشروع ARTDACI',official:'الموقع الرسمي للمؤسسة',immersive:'استكشف تجارب ARTDACI الغامرة',future:'يمكن إضافة تجارب الواقع المعزز والافتراضي لاحقًا',photoBadge:'صورة حقيقية للمتحف',museum:'المتحف',related:'الملف البحثي',previous:'السابق',next:'التالي',notice:'قد تتغير مواقع عرض الأعمال ومواعيد الزيارة. تحقق من التذاكر وحقوق الصور والمعلومات الحديثة لدى المؤسسات الرسمية.',galleryNote:'تستضاف الصور في ويكيميديا كومنز. راجع الملفات الأصلية لمعرفة المصور وأبعاد الصورة وترخيصها.',notFound:'المتحف غير موجود',loading:'تعذر تحميل فهرس المتاحف.',close:'إغلاق',detail:'الملف المتحفي المفصل',site:'أطلس التراث المتحفي ARTDACI',researchHeading:'التراث المتحفي: 17 مؤسسة',indexLead:'اكتشف 17 متحفًا عبر العمارة والتاريخ والمجموعات والبحث العلمي، مع ربط الأعمال الأصلية بالتعليم الفني الغامر في ARTDACI.'}
};
const pageDetail=m=>root+'musees/'+encodeURIComponent(m.id)+'.html?lang='+locale;
function prepareTranslatedHeader(){
const U=LOCAL[locale];
const anchor=document.querySelector('.brand');if(anchor){anchor.href=(document.body.dataset.page==='detail'?'../../':'../')+'index.html?lang='+locale;const small=anchor.querySelector('small');if(small)small.textContent=U.site;}
const header=document.querySelector('.header-nav');if(header)header.innerHTML='<a href="'+esc(root+'../museums.html?lang='+locale)+'">'+esc(U.explorer)+'</a><a href="'+esc(root+'../museums-atlas-'+locale+'.html')+'">'+esc(U.photo)+'</a>';
const footer=document.querySelector('.site-footer');if(footer)footer.innerHTML='<span>© ARTDACI · 2026</span><span>'+esc(U.galleryNote)+'</span><a href="'+esc(root+'../museums-atlas-'+locale+'.html')+'">'+esc(U.photo)+' ↗</a>';
const switcher=document.createElement('nav');switcher.className='locale-nav';switcher.setAttribute('aria-label','Languages');
const id=document.body.dataset.slug;const url=lang=>document.body.dataset.page==='index'?'index.html'+(lang==='fr'?'':'?lang='+lang):'musees/'+encodeURIComponent(id)+'.html'+(lang==='fr'?'':'?lang='+lang);
switcher.innerHTML=['fr','en','ar'].map(lang=>'<a href="'+esc(root+url(lang))+'" hreflang="'+lang+'" lang="'+lang+'" '+(lang===locale?'aria-current="page"':'')+'>'+(lang==='ar'?'العربية':lang.toUpperCase())+'</a>').join('');
document.querySelector('.site-header')?.append(switcher);
}
function renderDetailTranslated(museums,slug){
const U=LOCAL[locale],m=museums.find(x=>x.id===slug),host=$('detail-app');
prepareTranslatedHeader();
if(!m){host.textContent=U.notFound;return;}
document.title=m.name+' | '+U.title;
const meta=document.querySelector('meta[name=description]');if(meta)meta.content=m.name+' — '+m.theme;
const index=museums.indexOf(m),immersive=index<6;
const parts=[
 ['history',U.sections[0],m.history],['architecture',U.sections[1],m.architecture],
 ['collections',U.sections[2],m.collections],['education',U.sections[3],m.education],
 ['digital',U.sections[4],m.digital],['visit',U.sections[5],m.visit]
];
const nav=parts.map(([id,title])=>'<a href="#'+id+'">'+esc(title)+'</a>').join('')+
['timeline','research','preservation','digitization','sources','gallery'].map((id,i)=>'<a href="#'+id+'">'+esc([U.timeline,U.topic,U.conservation,U.digital,U.sources,U.photos][i])+'</a>').join('');
const sources=m.sources.map((s,i)=>'<li>'+external(s.url,(i+1)+' · '+(new URL(s.url).hostname.replace('www.','')) )+'</li>').join('');
const photoPage=root+'../museums-atlas-'+locale+'.html#museum-'+m.id;
host.innerHTML='<nav class="breadcrumb"><a href="'+esc(photoPage)+'">'+esc(U.back)+'</a> / <span>'+esc(m.name)+'</span></nav>'+
'<section class="detail-hero"><div class="detail-intro"><span class="badge">'+esc(immersive?U.immersive:U.future)+'</span><h1>'+esc(m.name)+'</h1><p class="place">'+esc(m.city+' · '+m.country)+'</p><p class="lead">'+esc(m.theme)+'. '+esc(m.history.slice(0,245))+'</p><div class="hero-actions">'+external(m.sources[0].url,U.official)+'<a class="secondary-cta" href="'+esc(photoPage)+'">'+esc(U.back)+'</a>'+(immersive?'<a class="secondary-cta" href="'+esc(root+'../museums.html?lang='+locale)+'">'+esc(U.immersive)+'</a>':'')+'</div></div>'+
'<figure class="detail-photo"><img id="hero-museum-photo" fetchpriority="high" decoding="async" src="'+esc(m.hero.url)+'" alt="'+esc(U.photoBadge+' — '+m.name)+'"><figcaption class="credit">'+external(m.hero.page,U.credit)+'</figcaption></figure></section>'+
'<div class="detail-stats"><div class="detail-stat"><small>'+esc(U.location)+'</small><strong>'+esc(m.city+' · '+m.country)+'</strong></div><div class="detail-stat"><small>'+esc(U.opening)+'</small><strong>'+esc(m.opened)+'</strong></div><div class="detail-stat"><small>'+esc(U.architect)+'</small><strong>'+esc(m.architect)+'</strong></div></div>'+
'<div class="detail-layout"><nav class="local-nav" aria-label="Contents"><strong>'+esc(U.related)+'</strong>'+nav+'</nav><article class="detail-content">'+
'<div class="highlight"><strong>'+esc(U.focus)+'</strong><p>'+esc(m.signature)+'</p></div>'+
parts.map(([id,title,text])=>'<section class="article-section" id="'+id+'"><h2>'+esc(title)+'</h2><p>'+esc(text)+'</p></section>').join('')+
'<section class="article-section atlas-extended" id="timeline"><h2>'+esc(U.timeline)+'</h2><ol class="museum-timeline">'+m.timeline.map(x=>'<li><time>'+esc(x.date)+'</time><span>'+esc(x.title)+'</span></li>').join('')+'</ol></section>'+
'<section class="article-section atlas-extended" id="research"><h2>'+esc(U.topic)+'</h2><div class="research-topic-grid">'+m.researchTopics.map((x,i)=>'<article class="research-topic"><span class="topic-index">'+String(i+1).padStart(2,'0')+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.body)+'</p></article>').join('')+'</div></section>'+
'<section class="article-section" id="preservation"><h2>'+esc(U.conservation)+'</h2><p>'+esc(m.conservationDetail)+'</p></section>'+
'<section class="article-section" id="digitization"><h2>'+esc(U.digital)+'</h2><p>'+esc(m.digital)+'</p></section>'+
'<section class="article-section" id="sources"><h2>'+esc(U.sources)+'</h2><ul class="resources">'+sources+'</ul><p class="research-note">'+esc(U.notice)+'</p></section>'+
'<section class="article-section gallery-section" id="gallery"><h2>'+esc(U.photos)+'</h2><p>'+esc(U.photosInfo)+'</p><div class="photo-grid" id="photo-gallery"></div><p class="research-note">'+esc(U.galleryNote)+'</p></section>'+
'</article></div>'+
'<nav class="detail-pagination"><a href="'+esc(pageDetail(museums[(index+16)%17]))+'">'+esc(U.previous)+' · '+esc(museums[(index+16)%17].name)+'</a><a href="'+esc(pageDetail(museums[(index+1)%17]))+'">'+esc(museums[(index+1)%17].name)+' · '+esc(U.next)+'</a></nav>';
safeImage($('hero-museum-photo'),m.gallery);
const grid=$('photo-gallery');
for(let i=0;i<m.gallery.length;i++){
const p=m.gallery[i],fig=document.createElement('figure');fig.className='photo-figure';
const link=document.createElement('a');link.href=p.page;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',U.credit+' '+(i+1));
const im=document.createElement('img');im.loading='lazy';im.src=p.url;im.alt=U.photoBadge+' '+(i+1)+' — '+m.name;safeImage(im,m.gallery.slice(i).concat(m.gallery.slice(0,i)));link.append(im);
const caption=document.createElement('figcaption');caption.append(document.createTextNode(U.photoBadge+' '+(i+1)+' · '));const cl=document.createElement('a');cl.href=p.page;cl.rel='noopener noreferrer';cl.target='_blank';cl.textContent=U.credit+' ↗';caption.append(cl);fig.append(link,caption);grid.append(fig);
}
}
function renderIndexTranslated(museums){
const U=LOCAL[locale];prepareTranslatedHeader();document.title=U.title;
const indexCopy=locale==='ar'?{
 heroCta:'استكشف المتاحف السبعة عشر',methodCta:'منهج التوثيق',
 stats:['مؤسسة','بلدان','مرجعًا مصورًا','رابطًا توثيقيًا'],
 sectionTitle:'استكشف المؤسسات',sectionLead:'لكل متحف ملف بحثي مستقل ومعرض صور موثق',
 featuredTitle:'المتاحف الستة الغامرة',featuredText:'تتيح هذه المؤسسات الستة بالفعل روابط إلى تجارب ARTDACI الغامرة',
 extraTitle:'أحد عشر متحفًا إضافيًا',extraText:'ملفات وثائقية وصور حقيقية؛ وستُطوّر التجارب الغامرة مستقبلًا',
 methodTitle:'منهجية توثيقية قابلة للتحقق',methodItems:[['مصادر مؤسسية','تعتمد المعلومات على مواقع المتاحف وفهارسها ووثائقها التاريخية.'],['صور فوتوغرافية حقيقية','ترتبط الصور بملفات ويكيميديا كومنز للتحقق من الأسماء والتراخيص.'],['الأعمال ومواقع حفظها','تشير صلات ARTDACI إلى أعمال أو نسخ تملكها المؤسسات، وقد يتغير عرضها.'],['تجارب غامرة مستقبلية','تقتصر تجارب الواقع المعزز والافتراضي المتاحة حاليًا على المتاحف الستة الرئيسية.']],
 searchLabel:'ابحث عن متحف أو مدينة أو فنان أو مجموعة',searchPlaceholder:'مثال: فيرمير، أمستردام، الانطباعية',allCountries:'كل البلدان',nothing:'لا يوجد متحف مطابق'
}:{
 heroCta:'Explore all 17 museums',methodCta:'Read our methodology',
 stats:['institutions','countries','photographic references','research links'],
 sectionTitle:'Explore the institutions',sectionLead:'Each museum has a dedicated research dossier and a documented photographic gallery',
 featuredTitle:'Six immersive museums',featuredText:'These institutions already connect to ARTDACI AR and VR experiences',
 extraTitle:'Eleven additional museums',extraText:'Research dossiers and authentic photographs; immersive experiences may follow later',
 methodTitle:'Documented, evolving, verifiable research',methodItems:[['Institutional sources','Information comes from official museum websites, collections catalogues and historical documentation.'],['Authentic photographs','Photographs link to Wikimedia Commons files with author information and licences.'],['Artworks and locations','ARTDACI connects to works or specific versions held by museums; display can change.'],['Future immersive access','Existing AR and VR experiences remain limited to the six principal museums.']],
 searchLabel:'Search for a museum, city, artist or collection',searchPlaceholder:'e.g. Vermeer, Amsterdam, Impressionism',allCountries:'All countries',nothing:'No museum matches your search'
};
function setText(selector,value){const n=document.querySelector(selector);if(n)n.textContent=value;}
setText('.index-hero .eyebrow','ARTDACI / '+U.research+' · 2026');
const buttons=document.querySelectorAll('.index-hero .hero-actions a');if(buttons[0])buttons[0].textContent=indexCopy.heroCta+' ↗';if(buttons[1])buttons[1].textContent=indexCopy.methodCta;
document.querySelectorAll('.index-stats span').forEach((node,i)=>{const count=[17,7,51,66][i];if(count!==undefined)node.textContent=count+' '+indexCopy.stats[i]});
setText('.section-head h2',indexCopy.sectionTitle);setText('.section-head p',indexCopy.sectionLead);
setText('#featured-block .group-heading h3',indexCopy.featuredTitle);setText('#featured-block .group-heading p',indexCopy.featuredText);
setText('#additional-block .group-heading h3',indexCopy.extraTitle);setText('#additional-block .group-heading p',indexCopy.extraText);
setText('.methodology h2',indexCopy.methodTitle);
document.querySelectorAll('.method-grid article').forEach((node,i)=>{const block=indexCopy.methodItems[i];if(!block)return;const heading=node.querySelector('h3'),p=node.querySelector('p');if(heading)heading.textContent=block[0];if(p)p.textContent=block[1];});
setText('label[for=atlas-search]',indexCopy.searchLabel);setText('#no-results',indexCopy.nothing);
const h=document.querySelector('.index-hero h1');if(h)h.textContent=U.researchHeading;
const subtitle=document.querySelector('.index-hero>p');if(subtitle)subtitle.textContent=U.indexLead;
const search=$('atlas-search'),country=$('atlas-country');if(!search||!country)return;
const label=document.querySelector('label[for=atlas-search]');if(label)label.textContent=U.explorer;
search.placeholder=indexCopy.searchPlaceholder;country.innerHTML='<option value="">'+esc(indexCopy.allCountries)+'</option>';
for(const c of [...new Set(museums.map(m=>m.country))]){const option=document.createElement('option');option.value=c;option.textContent=c;country.append(option)}
function rerender(){
const q=search.value.trim().toLocaleLowerCase(locale),c=country.value;
const filtered=museums.filter(m=>(!c||m.country===c)&&(!q||[m.name,m.city,m.country,m.theme,m.signature,m.history,m.collections].join(' ').toLocaleLowerCase(locale).includes(q)));
for(const [key,list] of [['featured-grid',filtered.filter(m=>museums.indexOf(m)<6)],['additional-grid',filtered.filter(m=>museums.indexOf(m)>=6)]]){
 $(key).innerHTML=list.map(m=>'<article class="museum-card"><div class="card-photo"><a href="'+esc(pageDetail(m))+'"><img loading="lazy" src="'+esc(m.hero.url)+'" alt="'+esc(U.photoBadge+' — '+m.name)+'"></a></div><div class="card-body"><div class="card-location">'+esc(m.city+' · '+m.country)+'</div><h4>'+esc(m.name)+'</h4><p>'+esc(m.signature)+'</p><a class="card-link" href="'+esc(pageDetail(m))+'">'+esc(U.detail)+' ↗</a></div></article>').join('');
}
$('featured-block').hidden=!filtered.some(m=>museums.indexOf(m)<6);
$('additional-block').hidden=!filtered.some(m=>museums.indexOf(m)>=6);
$('no-results').hidden=!!filtered.length;$('search-count').textContent=filtered.length+' / 17';
}
search.addEventListener('input',rerender);country.addEventListener('change',rerender);rerender();
}

load().catch(error=>{console.error('ARTDACI Museum Atlas',error);const el=$('detail-app')||$('no-results');if(el){el.hidden=false;el.textContent='Le catalogue des musées est momentanément indisponible. Consultez la connexion réseau ou réessayez.';}});
})();