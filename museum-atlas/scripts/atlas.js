(()=>{'use strict';
const root=document.body.dataset.root||'./';
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
 if(document.body.dataset.page==='index')renderIndex(db.museums);
 else renderDetail(db.museums,document.body.dataset.slug);
}
function renderIndex(museums){
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
 const m=museums.find(x=>x.id===slug),host=$('detail-app');
 if(!m){host.innerHTML='<section class="section"><h1>Musée introuvable</h1><p>Cette fiche ne figure pas dans le catalogue ARTDACI.</p><a href="'+esc(root+'index.html')+'">Retour à l’atlas</a></section>';return;}
 document.title=m.name+' | Atlas des 17 musées — ARTDACI';
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
 const titles=sections.map(s=>'<a href="#'+s[0]+'">'+esc(s[1])+'</a>').join('')+'<a href="#sources">Sources et ressources</a><a href="#photographies">Galerie photographique</a>';
 const content=sections.map(([id,title,body])=>'<section class="article-section" id="'+id+'"><h2>'+esc(title)+'</h2><p>'+esc(body)+'</p></section>').join('');
 const sourceLinks=m.sources.map((s,i)=>'<li>'+external(s.url,String(i+1).padStart(2,'0')+' · '+s.name)+'</li>').join('');
 const preview=immersive?'<a class="secondary-cta" href="'+esc(root+'../museums.html?lang=fr&museum='+encodeURIComponent(m.id))+'">Explorer les expériences ARTDACI</a>':'<span class="secondary-cta" aria-label="Expériences immersives envisagées pour une future version">RA &amp; RV : futures extensions</span>';
 host.innerHTML='<nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="'+esc(root+'index.html')+'">Atlas des 17 musées</a><span aria-hidden="true">›</span><span>'+esc(m.name)+'</span></nav>'+
 '<section class="detail-hero"><div class="detail-intro"><span class="badge">'+(immersive?'Musée majeur · Expériences ARTDACI':'Musée associé · Atlas documentaire')+'</span><h1>'+esc(m.name)+'</h1><p class="place">'+esc(m.city+' · '+m.country)+'</p><p class="lead">'+esc(m.theme)+'. '+esc(m.history.slice(0,220))+'…</p><div class="hero-actions">'+external(m.sources[0].url,'Site institutionnel')+preview+'</div></div>'+
 '<figure class="detail-photo"><img id="hero-museum-photo" fetchpriority="high" decoding="async" src="'+esc(m.hero.url)+'" alt="Photographie réelle du '+esc(m.name)+' — façade et vue du musée"><figcaption class="credit">Photographie : Wikimedia Commons · '+external(m.hero.page,'Voir le fichier, son auteur et sa licence')+'</figcaption></figure></section>'+
 '<div class="detail-stats"><div class="detail-stat"><small>Ville et pays</small><strong>'+esc(m.city+' · '+m.country)+'</strong></div><div class="detail-stat"><small>Repère historique</small><strong>'+esc(m.opened)+'</strong></div><div class="detail-stat"><small>Architecture / lieu</small><strong>'+esc(m.architect)+'</strong></div></div>'+
 '<div class="detail-layout"><nav class="local-nav" aria-label="Sommaire de la fiche"><strong>DANS CETTE FICHE</strong>'+titles+'</nav>'+
 '<article class="detail-content"><div class="highlight"><strong>Connexion avec le livre augmenté ARTDACI</strong><p>'+esc(m.signature)+'</p></div>'+
 content+
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
load().catch(error=>{console.error('ARTDACI Museum Atlas',error);const el=$('detail-app')||$('no-results');if(el){el.hidden=false;el.textContent='Le catalogue des musées est momentanément indisponible. Consultez la connexion réseau ou réessayez.';}});
})();