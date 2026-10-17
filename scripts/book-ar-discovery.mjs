import {discovery, exploreCopy, local} from "./book-ar-enrichment.mjs";

/** Accessible browser panel for learning. It does not start/stop the camera. */
export function setupBookDiscovery(lang, onArtwork) {
 const $=id=>document.getElementById(id);
 const text=exploreCopy[lang]||exploreCopy.fr;
 const container=$("discovery"),toggle=$("discovery-toggle"),panel=$("discovery-panel");
 const title=$("discovery-name"),meta=$("discovery-meta"),current=$("discovery-current"),body=$("discovery-body");
 const tabs=[...container.querySelectorAll("[data-explore-tab]")];
 let activeArtist="intro",tab="about",currentArtwork=null;
 const paragraph=(value,cls)=>{
   const p=document.createElement("p");p.className=cls||"discovery-text";p.textContent=value;return p;
 };
 function setTab(name){
   if(!["about","works","fact"].includes(name))return;
   tab=name;
   for(const btn of tabs)btn.setAttribute("aria-pressed",String(btn.dataset.exploreTab===name));
   render();
 }
 function setOpen(open){
  panel.hidden=!open;
  toggle.setAttribute("aria-expanded",String(open));
  toggle.textContent=(open?"▾ ":"▸ ")+text.more;
 }
 function render(){
  const profile=discovery[activeArtist];
  body.replaceChildren();
  if(!profile){
   title.textContent=text.introTitle;
   meta.textContent="";
   current.textContent=text.scanHint;
   body.append(paragraph(text.introText));
   return;
  }
  title.textContent=local(profile.name||null,lang)||title.textContent;
  meta.textContent=profile.dates+" · "+local(profile.origin,lang);
  const artwork=profile.artworks.find(x=>x.id===currentArtwork);
  current.textContent=artwork?text.current+": "+local(artwork.title,lang):"";
  if(tab==="about"){
    body.append(paragraph(local(profile.bio,lang)));
    body.append(paragraph(text.hint,"discovery-hint"));
  }else if(tab==="fact"){
    body.append(paragraph(local(profile.fact,lang)));
    body.append(paragraph(local(profile.question,lang),"discovery-question"));
  }else{
    const grid=document.createElement("div");grid.className="discovery-gallery";
    for(const work of profile.artworks){
      const button=document.createElement("button");
      button.type="button";button.className="discovery-work";
      button.setAttribute("aria-pressed",String(work.id===currentArtwork));
      button.setAttribute("aria-label",text.view+": "+local(work.title,lang));
      button.dataset.workId=work.id;
      const photo=document.createElement("img");
      photo.src=work.image;photo.alt="";photo.loading="lazy";photo.decoding="async";
      const description=document.createElement("span");description.className="discovery-work-copy";
      const name=document.createElement("strong");name.textContent=local(work.title,lang);
      const date=document.createElement("span");date.textContent=lang==="en"?work.dateEn:work.date;
      const museum=document.createElement("small");museum.textContent=local(work.museum,lang);
      description.append(name,date,museum);button.append(photo,description);
      button.addEventListener("click",()=>{
        currentArtwork=work.id;
        render();
        onArtwork(work);
      });
      grid.append(button);
    }
    body.append(grid);
  }
 }
 function setArtist(id,artistName){
  activeArtist=Object.hasOwn(discovery,id)?id:"intro";
  const profile=discovery[activeArtist];
  if(profile){profile.name={fr:artistName,en:artistName,ar:artistName};}
  currentArtwork=profile?.artworks[0]?.id??null;
  for(const btn of tabs)btn.disabled=!profile;
  setOpen(!!profile);
  setTab("about");
  return profile?.artworks[0]??null;
 }
 toggle.addEventListener("click",()=>setOpen(panel.hidden));
 tabs.forEach(btn=>btn.addEventListener("click",()=>setTab(btn.dataset.exploreTab)));
 for(const btn of tabs){
   const labels={about:text.about,works:text.works,fact:text.fact};
   btn.textContent=labels[btn.dataset.exploreTab];
 }
 setArtist("intro");
 return {
  setArtist,
  narration(){
   const profile=discovery[activeArtist];
   if(!profile)return text.introText;
   const work=profile.artworks.find(w=>w.id===currentArtwork);
   const lead=(work?local(work.title,lang)+". "+(lang==="en"?work.dateEn:work.date)+". "+local(work.museum,lang)+". ":"");
   const content=tab==="fact"?local(profile.fact,lang):local(profile.bio,lang);
   return lead+content;
  },
  tab(){return tab;}
 };
}
