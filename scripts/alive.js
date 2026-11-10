(() => {
  "use strict";
  const translations = {
    en: {
      title:"ARTDACI — Art Comes Alive · The Gallery Reimagined",skip:"Skip to experience",home:"Back to ARTDACI",
      kicker:"AN ARTDACI IMMERSIVE ENCOUNTER",headline:"ART COMES ALIVE",subheadline:"THE GALLERY REIMAGINED",
      intro:"Open the book. Watch a masterpiece move beyond the printed page.",stageReady:"A masterpiece awaits inside.",
      open:"OPEN THE BOOK",skipAnimation:"Skip animation",replay:"Watch again",
      reveal:"Some masterpieces deserve to step beyond their frames.",
      revealDescription:"The encounter is an artistic interpretation. The painting, its history and its digital models are yours to explore.",
      meet:"MEET THE MONA LISA",place:"PLACE HER IN MY SPACE",
      deviceNote:"Spatial AR requires a compatible device and browser. The 3D preview can still be explored without AR.",
      dialogueKicker:"LOOK CLOSER · ASK THE ARTWORK",dialogueTitle:"Every detail has a story.",
      dialogueIntro:"Choose a question to explore the painting. These are ARTDACI's educational explanations, not words spoken by the historical sitter.",
      qSmile:"Why are you smiling?",qPainter:"Who painted you?",qBackground:"What is hidden in the background?",
      qRoom:"Can I see you in my room?",answerLabel:"ARTDACI · ARTWORK INSIGHT",
      answerDefaultTitle:"Start with a question.",
      answerDefault:"Look at the smile, the hands and the mysterious landscape. What do you notice first?",
      learnMore:"Explore the artwork",footer:"ARTDACI · Art beyond the frame. The printed book and the digital collection can be explored independently.",
      gallery:"EXPLORE ARTDACI REIMAGINED",livingBook:"Explore the interactive Living Book",
      playing:"The book is open. The Mona Lisa is emerging.",complete:"The Mona Lisa has emerged. Continue to artwork discovery, spatial AR or close looking.",
      noVideo:"The video is unavailable. You can still explore the artwork and its 3D experience.",
      questions:{
        smile:{title:"The smile and the sfumato",text:"Leonardo softened the transition between light and shadow around the mouth. As your attention shifts, the smile can seem to change. That visual effect is part of what makes the portrait so compelling."},
        painter:{title:"Leonardo da Vinci",text:"Leonardo da Vinci painted the Mona Lisa in the early sixteenth century, probably beginning around 1503 and continuing to refine it later. His attention to anatomy, optics and observation shaped the portrait."},
        background:{title:"An imagined landscape",text:"Look for the winding road, water, bridge and distant mountains. The scenery is not an established map of one real place: Leonardo brought together observations of nature in an atmospheric landscape."},
        room:{title:"From the gallery into your space",text:"ARTDACI has a 3D viewer for the Mona Lisa with an AR placement option on compatible devices. You can open the model on a computer too; spatial AR depends on device and browser support.",link:"space"}
      }
    },
    fr: {
      title:"ARTDACI — L’art prend vie · La galerie réinventée",skip:"Aller à l’expérience",home:"Retour à ARTDACI",
      kicker:"UNE RENCONTRE IMMERSIVE ARTDACI",headline:"L’ART PREND VIE",subheadline:"LA GALERIE RÉINVENTÉE",
      intro:"Ouvrez le livre. Regardez un chef-d’œuvre franchir les limites de la page imprimée.",stageReady:"Un chef-d’œuvre attend entre les pages.",
      open:"OUVRIR LE LIVRE",skipAnimation:"Passer l’animation",replay:"Revoir l’animation",
      reveal:"Certains chefs-d’œuvre méritent de sortir de leur cadre.",
      revealDescription:"Cette rencontre est une interprétation artistique. Découvrez l’œuvre, son histoire et ses modèles numériques.",
      meet:"RENCONTRER LA JOCONDE",place:"LA PLACER DANS MON ESPACE",
      deviceNote:"La réalité augmentée spatiale nécessite un appareil et un navigateur compatibles. La prévisualisation 3D reste accessible sans AR.",
      dialogueKicker:"REGARDER DE PLUS PRÈS · INTERROGER L’ŒUVRE",dialogueTitle:"Chaque détail raconte une histoire.",
      dialogueIntro:"Choisissez une question. Les réponses sont des explications pédagogiques d’ARTDACI, et non des paroles attribuées au modèle historique.",
      qSmile:"Pourquoi ce sourire ?",qPainter:"Qui vous a peinte ?",qBackground:"Que cache le paysage ?",qRoom:"Puis-je vous voir chez moi ?",
      answerLabel:"ARTDACI · ÉCLAIRAGE SUR L’ŒUVRE",answerDefaultTitle:"Commencez par une question.",
      answerDefault:"Observez le sourire, les mains et le paysage mystérieux. Que remarquez-vous en premier ?",
      learnMore:"Explorer l’œuvre",footer:"ARTDACI · L’art au-delà du cadre. Le livre imprimé et la collection numérique se découvrent indépendamment.",
      gallery:"DÉCOUVRIR ARTDACI REIMAGINED",livingBook:"Découvrir le Livre vivant interactif",
      playing:"Le livre s’ouvre. La Joconde émerge de ses pages.",complete:"La Joconde est apparue. Explorez son histoire, la réalité augmentée ou ses détails.",
      noVideo:"La vidéo est indisponible. L’œuvre et son expérience 3D restent accessibles.",
      questions:{
        smile:{title:"Le sourire et le sfumato",text:"Léonard a adouci les passages entre lumière et ombre autour de la bouche. Selon l’endroit où se porte le regard, le sourire semble changer. Cet effet contribue à la présence singulière du portrait."},
        painter:{title:"Léonard de Vinci",text:"Léonard de Vinci a peint La Joconde au début du XVIe siècle, probablement à partir de 1503, avec des retouches ultérieures. Ses recherches en anatomie, en optique et en observation ont nourri ce portrait."},
        background:{title:"Un paysage imaginé",text:"Observez le chemin sinueux, l’eau, le pont et les montagnes lointaines. Ce décor n’est pas la carte attestée d’un lieu unique : Léonard y a réuni des observations de la nature dans une atmosphère singulière."},
        room:{title:"Du musée à votre espace",text:"ARTDACI propose une visionneuse 3D de La Joconde avec une fonction de placement en AR sur les appareils compatibles. La prévisualisation 3D fonctionne également sur ordinateur ; l’AR spatiale dépend de l’appareil et du navigateur.",link:"space"}
      }
    },
    ar: {
      title:"ARTDACI — الفن ينبض بالحياة · معرض برؤية جديدة",skip:"تجاوز إلى التجربة",home:"العودة إلى ARTDACI",
      kicker:"تجربة فنية غامرة من ARTDACI",headline:"الفن ينبض بالحياة",subheadline:"المعرض برؤية جديدة",
      intro:"افتح الكتاب وشاهد لوحة فنية تتجاوز حدود الصفحة المطبوعة.",stageReady:"تحفة فنية تنتظر بين الصفحات.",
      open:"افتح الكتاب",skipAnimation:"تجاوز الحركة",replay:"شاهد مرة أخرى",
      reveal:"بعض الروائع تستحق أن تتجاوز إطاراتها.",
      revealDescription:"هذه تجربة تخيّلية فنية. اكتشف اللوحة وتاريخها ونماذجها الرقمية.",
      meet:"تعرّف إلى الموناليزا",place:"ضعها في مساحتي",
      deviceNote:"يتطلب الواقع المعزز المكاني جهازًا ومتصفحًا متوافقين. ويمكن استكشاف النموذج ثلاثي الأبعاد دون الواقع المعزز.",
      dialogueKicker:"تأمّل عن قرب · اسأل عن اللوحة",dialogueTitle:"كل تفصيل يحكي قصة.",
      dialogueIntro:"اختر سؤالًا لاستكشاف اللوحة. الإجابات تفسيرات تعليمية من ARTDACI وليست كلمات منسوبة إلى الشخصية المصوَّرة.",
      qSmile:"ما سر ابتسامتك؟",qPainter:"من رسمك؟",qBackground:"ما الذي يظهر في الخلفية؟",qRoom:"هل يمكنني رؤيتك في غرفتي؟",
      answerLabel:"ARTDACI · تأملات فنية",answerDefaultTitle:"ابدأ بسؤال.",
      answerDefault:"تأمّل الابتسامة واليدين والمشهد الطبيعي الغامض. ما أول تفصيل يجذب انتباهك؟",
      learnMore:"استكشف اللوحة",footer:"ARTDACI · الفن أبعد من الإطار. يمكن استكشاف الكتاب المطبوع والمجموعة الرقمية بصورة مستقلة.",
      gallery:"اكتشف ARTDACI REIMAGINED",livingBook:"استكشف الكتاب الحي التفاعلي",
      playing:"يُفتح الكتاب وتنبثق الموناليزا من صفحاته.",complete:"ظهرت الموناليزا. تابع استكشاف تاريخ اللوحة أو تجربة الواقع المعزز أو تفاصيلها.",
      noVideo:"تعذّر تشغيل الفيديو، لكن يمكنك استكشاف اللوحة وتجربتها ثلاثية الأبعاد.",
      questions:{
        smile:{title:"الابتسامة وتقنية السفوماتو",text:"خفّف ليوناردو الحدود بين الضوء والظل حول الفم. ومع تغيّر موضع تركيز النظر، قد تبدو الابتسامة مختلفة. وهذا التأثير البصري من أسباب جاذبية اللوحة."},
        painter:{title:"ليوناردو دا فينشي",text:"رسم ليوناردو دا فينشي الموناليزا في أوائل القرن السادس عشر، ويُرجّح أنه بدأها نحو عام 1503 ثم واصل تنقيحها. وقد أثّرت دراساته للتشريح والبصريات والملاحظة في تكوينها."},
        background:{title:"مشهد طبيعي متخيَّل",text:"تأمّل الطريق المتعرج والماء والجسر والجبال البعيدة. لا يمثّل هذا المشهد خريطة مؤكدة لمكان واحد، بل جمع فيه ليوناردو مشاهدات من الطبيعة ضمن أفق ضبابي."},
        room:{title:"من المعرض إلى مساحتك",text:"يوفر ARTDACI عارضًا ثلاثي الأبعاد للموناليزا مع خيار وضع النموذج في المكان بالواقع المعزز على الأجهزة المتوافقة. ويمكن مشاهدة النموذج على الحاسوب أيضًا؛ أما الواقع المعزز المكاني فيعتمد على الجهاز والمتصفح.",link:"space"}
      }
    }
  };
  const params=new URLSearchParams(window.location.search);
  const lang=["en","fr","ar"].includes(params.get("lang"))?params.get("lang"):"en";
  const copy=translations[lang];
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  document.title=copy.title;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const text=copy[el.dataset.i18n];
    if(typeof text==="string")el.textContent=text;
  });
  document.querySelectorAll("[data-lang]").forEach(link=>{
    if(link.dataset.lang===lang)link.setAttribute("aria-current","page");
    else link.removeAttribute("aria-current");
  });
  const home=lang==="fr"?"index-fr.html":lang==="ar"?"index-ar.html":"index.html";
  const print=lang==="fr"?"print-target-fr.html":lang==="ar"?"print-ar.html?painting=mona-lisa":"print-target.html";
  const space=`space.html?painting=mona-lisa&lang=${lang}`;
  document.getElementById("home-logo").href=home;
  document.getElementById("back-home").href=home;
  document.getElementById("meet-link").href=print;
  document.getElementById("space-link").href=space;
  document.getElementById("reimagined-link").href=`reimagined.html?lang=${lang}`;
  document.getElementById("living-book").href=`book-3d.html?lang=${lang}`;

  const stage=document.getElementById("alive-stage");
  const video=document.getElementById("mona-video");
  const still=document.getElementById("alive-still");
  const openBtn=document.getElementById("open-book");
  const skipBtn=document.getElementById("skip-animation");
  const replayBtn=document.getElementById("replay-animation");
  const reveal=document.getElementById("alive-reveal");
  const dialogue=document.getElementById("alive-dialogue");
  const status=document.getElementById("alive-status");
  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let isFinished=false;
  let playbackAttempt=0;
  function complete(fallback=false,announcement=copy.complete){
    if(isFinished)return;
    isFinished=true;
    stage.dataset.state="complete";
    stage.dataset.fallback=fallback?"true":"false";
    still.hidden=!fallback;
    if(fallback){video.pause();video.style.opacity="0";}
    openBtn.hidden=true;skipBtn.hidden=true;replayBtn.hidden=false;
    reveal.hidden=false;dialogue.hidden=false;status.textContent=announcement;
  }
  async function playSequence(){
    const attempt=++playbackAttempt;
    isFinished=false;
    video.pause();
    stage.dataset.state="opening";
    stage.dataset.fallback="false";
    video.style.opacity="";
    still.hidden=true;reveal.hidden=true;dialogue.hidden=true;
    openBtn.hidden=true;skipBtn.hidden=false;replayBtn.hidden=true;
    status.textContent=copy.playing;
    if(reducedMotion){complete(true);return;}
    try{
      video.currentTime=0;
      const started=video.play();
      if(started&&typeof started.then==="function")await started;
      if(attempt!==playbackAttempt||isFinished)return;
      window.setTimeout(()=>{
        if(attempt===playbackAttempt&&!isFinished&&stage.dataset.state==="opening")stage.dataset.state="playing";
      },650);
    }catch(error){
      if(attempt===playbackAttempt)complete(true,copy.noVideo);
    }
  }
  function skipSequence(){
    ++playbackAttempt;
    if(isFinished)return;
    const canSeek=Number.isFinite(video.duration)&&video.duration>0&&video.readyState>=1;
    if(canSeek){
      try{
        video.addEventListener("seeked",()=>complete(false),{once:true});
        video.currentTime=Math.max(0,video.duration-.08);
        video.pause();
        window.setTimeout(()=>{if(!isFinished)complete(false);},800);
      }catch(error){complete(true);}
    }else complete(true);
  }
  openBtn.addEventListener("click",playSequence);
  skipBtn.addEventListener("click",skipSequence);
  replayBtn.addEventListener("click",playSequence);
  video.addEventListener("ended",()=>complete(false));
  video.addEventListener("error",()=>{if(!isFinished&&stage.dataset.state!=="ready")complete(true,copy.noVideo);});
  const answerTitle=document.getElementById("answer-title");
  const answerText=document.getElementById("answer-text");
  const answerLink=document.getElementById("answer-link");
  const questions=[...document.querySelectorAll("[data-question]")];
  questions.forEach(button=>button.addEventListener("click",()=>{
    const answer=copy.questions[button.dataset.question];
    if(!answer)return;
    questions.forEach(other=>other.setAttribute("aria-pressed",String(other===button)));
    answerTitle.textContent=answer.title;
    answerText.textContent=answer.text;
    answerLink.hidden=false;
    answerLink.href=answer.link==="space"?space:print;
    answerLink.firstElementChild.textContent=answer.link==="space"?copy.place:copy.learnMore;
  }));
})();