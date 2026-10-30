(()=>{'use strict';
const lang=document.documentElement.lang==='ar'?'ar':'en';const rtl=lang==='ar';
const $=id=>document.getElementById(id), escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const U=rtl?{
home:'الرئيسية',museums:'مستكشف المتاحف',heading:'أطلس التراث المتحفي',subtitle:'رحلة مصورة ووثائقية في 17 متحفًا عالميًا: تاريخ المباني والمجموعات والمصادر والذاكرة الثقافية',
photo:'الأطلس المصوّر',browse:'استكشف المؤسسات',search:'ابحث عن متحف أو مدينة أو موضوع',filter:'كل البلدان',about:'عن المتحف',history:'التاريخ والهوية',architecture:'العمارة وفضاءات العرض',collections:'المجموعات والأعمال البارزة',digital:'الأرشيف والمصادر الرقمية',education:'التعلم والبحث',details:'الملف البحثي المفصل',context:'اطّلع على التاريخ والعمارة والمجموعات والتسلسل الزمني والحفظ والمصادر',open:'اقرأ الملف المفصل',pictures:'معرض الصور الفوتوغرافية',picturesNote:'صور حقيقية للمباني والقاعات؛ راجع صفحة ويكيميديا كومنز لاسم المصور والترخيص',image:'صورة فوتوغرافية',source:'المصدر وحقوق الصورة',credits:'المصدر واسم المصور والترخيص',close:'إغلاق',all:'متحفًا معروضًا من أصل 17',none:'لم يتم العثور على متاحف مطابقة',license:'تخضع الصور لتراخيصها الأصلية في ويكيميديا كومنز؛ يُرجى التحقق من كل ملف قبل إعادة الاستخدام',work:'صلة بالمشروع',visits:'زيارات غامرة في المتاحف الستة الرئيسية فقط',museum:'متحف'
}:{
home:'Home',museums:'Museum Explorer',heading:'Museum Heritage Atlas',subtitle:'A photographic and documentary journey through 17 world museums: architecture, collections, institutional histories and cultural resources',
photo:'Photographic Atlas',browse:'Explore the institutions',search:'Search a museum, city or subject',filter:'All countries',about:'About the museum',history:'History and identity',architecture:'Architecture and galleries',collections:'Collections and highlights',digital:'Digital archives and sources',education:'Learning and research',details:'Detailed research dossier',context:'Read more about history, architecture, collections, timelines, conservation and scholarly sources',open:'Read the detailed dossier',pictures:'Photographic gallery',picturesNote:'Authentic views of buildings and galleries; view the Wikimedia Commons source for photographer credits and licence',image:'Photograph',source:'Image source and licence',credits:'Photographer and licence',close:'Close',all:'museums of 17',none:'No museums match your search',license:'All photographs retain their original Wikimedia Commons licences; check each file before reuse',work:'ARTDACI connection',visits:'Immersive visits remain available only for the six main museums',museum:'Museum'
};
const pageHref=(m)=>'museum-atlas/musees/'+encodeURIComponent(m.id)+'.html?lang='+lang;
const earthNav='<a href="earth-explorer.html?lang='+lang+'" class="earth-atlas-link">🌍 Google Earth ↗</a>';
const langNav='<nav class="locale-switch" aria-label="Languages"><a href="museums-atlas.html" lang="fr" hreflang="fr">FR</a><a href="museums-atlas-en.html" lang="en" hreflang="en" '+(!rtl?'aria-current="page"':'')+'>EN</a><a href="museums-atlas-ar.html" lang="ar" hreflang="ar" '+(rtl?'aria-current="page"':'')+'>العربية</a></nav>';
function fig(p,m,i){
const label=(i===0?U.photo+' — ':U.image+' '+(i+1)+' — ')+m.name;
return '<figure class="atlas-photo"><a href="'+escape(p.file)+'" target="_blank" rel="noopener noreferrer" class="image-link" aria-label="'+escape(U.credits+' '+m.name)+'"><img loading="lazy" decoding="async" src="'+escape(p.src)+'" alt="'+escape(label)+'"></a><figcaption>'+escape(label)+' · <a href="'+escape(p.file)+'" target="_blank" rel="noopener noreferrer">'+escape(U.credits)+' ↗</a></figcaption></figure>';
}
function article(m,photos,i){
const anchor='museum-'+m.id;
return '<article class="museum-section" id="'+anchor+'" data-search="'+escape([m.name,m.city,m.country,m.theme,m.collections,m.history].join(' ').toLocaleLowerCase(lang))+'" data-country="'+escape(m.country)+'"><div class="atlas-museum-hero"><div class="atlas-photo-main"><img loading="lazy" src="'+escape(photos.hero.src)+'" alt="'+escape(U.photo+' — '+m.name)+'" onerror="this.hidden=true"><a href="'+escape(photos.hero.file)+'" target="_blank" rel="noopener noreferrer">'+escape(U.credits)+' ↗</a></div><div class="atlas-museum-heading"><span class="museum-index">'+String(i+1).padStart(2,'0')+' / 17</span><h2>'+escape(m.name)+'</h2><p class="location">'+escape(m.city+' · '+m.country)+'</p><p>'+escape(m.theme)+'</p><p class="signature">'+escape(U.work+': '+m.signature)+'</p></div></div>'+
'<div class="detail-link-box"><div><strong>'+escape(U.details)+'</strong><p>'+escape(U.context)+'</p></div><a href="'+escape(pageHref(m))+'" class="detail-link">'+escape(U.open)+' ↗</a></div>'+
'<div class="atlas-text-grid"><section><h3>'+escape(U.history)+'</h3><p>'+escape(m.history)+'</p></section><section><h3>'+escape(U.architecture)+'</h3><p>'+escape(m.architecture)+'</p></section><section><h3>'+escape(U.collections)+'</h3><p>'+escape(m.collections)+'</p></section><section><h3>'+escape(U.digital)+'</h3><p>'+escape(m.digital)+'</p></section></div>'+
'<div class="album"><h3>'+escape(U.pictures)+'</h3><p>'+escape(U.picturesNote)+'</p><div class="album-grid">'+photos.photos.map((p,n)=>fig(p,m,n)).join('')+'</div></div></article>';
}
async function init(){
const paths=['museum-atlas/data/museums.json','museum-atlas/data/'+lang+'.json','museum-atlas/data/photographic-gallery.json'];
const responses=await Promise.all(paths.map(x=>fetch(x)));if(responses.some(x=>!x.ok))throw Error('Museum data unavailable');
const [base,translation,photos]=await Promise.all(responses.map(r=>r.json()));
if(base.museums.length!==17||translation.museums.length!==17||photos.photos.length!==17)throw Error('Missing museum profiles');
const m=base.museums.map((b,i)=>{const l=translation.museums.find(x=>x.id===b.id),ph=photos.photos.find(x=>x.id===b.id);if(!l||!ph)throw Error('Missing '+b.id);return {museum:{...b,...l},photo:ph};});
document.title='ARTDACI — '+U.heading;
$('photo-root').innerHTML='<header class="museum-atlas-header"><nav class="topbar"><a href="index-fr.html" class="logo">ARTDACI</a><a href="museums.html?lang='+lang+'">'+escape(U.museums)+'</a>'+earthNav+langNav+'</nav><div class="header-main"><span>ARTDACI · '+escape(U.photo)+'</span><h1>'+escape(U.heading)+'</h1><p>'+escape(U.subtitle)+'</p><div class="header-stats"><span>17 '+escape(U.museum)+'</span><span>68 Wikimedia Commons</span><span>7 '+(rtl?'بلدان':'countries')+'</span></div></div></header>'+
'<div class="atlas-controls"><label for="museum-search">'+escape(U.search)+'</label><div class="controls-line"><input type="search" id="museum-search" placeholder="'+escape(U.search)+'"><select id="country-filter"><option value="">'+escape(U.filter)+'</option></select><span id="count" aria-live="polite"></span></div></div>'+
'<div class="museum-index-list" id="museum-index-list"><h2>'+escape(U.browse)+'</h2><div class="index-grid">'+m.map((it,i)=>'<a href="#museum-'+escape(it.museum.id)+'">'+String(i+1).padStart(2,'0')+' · '+escape(it.museum.name)+'<small>'+escape(it.museum.city)+'</small></a>').join('')+'</div></div>'+
'<main class="all-museums" id="museum-sections">'+m.map((it,i)=>article(it.museum,it.photo,i)).join('')+'</main><footer class="atlas-footer">'+escape(U.visits)+'<p>'+escape(U.license)+'</p></footer>';
const select=$('country-filter');
for(const c of [...new Set(m.map(z=>z.museum.country))].sort((a,b)=>a.localeCompare(b,lang))){const o=document.createElement('option');o.value=c;o.textContent=c;select.append(o)}
const sections=[...document.querySelectorAll('.museum-section')];const input=$('museum-search');function search(){
const q=input.value.trim().toLocaleLowerCase(lang),c=select.value;let n=0;
for(const sec of sections){const yes=(!c||sec.dataset.country===c)&&(!q||sec.dataset.search.includes(q));sec.hidden=!yes;if(yes)n++;}
$('count').textContent=n+' '+U.all;
}
input.addEventListener('input',search);select.addEventListener('change',search);search();
}
init().catch(e=>{$('photo-root').textContent=rtl?'تعذر تحميل الأطلس المصور. تحقق من الاتصال.':'The photographic atlas could not be loaded. Check your connection.';console.error(e)});
})();