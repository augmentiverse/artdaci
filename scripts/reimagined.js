(() => {
  "use strict";

  const texts = {
    en: {
      skip: "Skip to the exhibition", navGallery: "The gallery", navCollection: "The films", navBook: "The Magical Book", navHome: "ARTDACI home", heroKicker: "✦ ART BEYOND THE FRAME", heroText: "Four masters step beyond their canvases through imagined encounters, still images and film.", heroImageAlt: "Leonardo painting Mona Lisa in an imagined Renaissance studio", heroImageCaption: "Leonardo’s studio — imagined beyond the canvas", exploreGallery: "ENTER THE IMAGE GALLERY", experience: "OPEN THE MAGICAL BOOK", featuredFilmBadge: "✦ FEATURED FILM", featuredFilmSummary: "Leonardo da Vinci, Vermeer, Van Gogh and Monet search for a mysterious Grail: the ARTDACI book, which Leonardo presents as a new gateway to art.", featuredFilmTitle: "The Four Masters in Search of the ARTDACI Grail", featuredFilmAria: "The Four Masters searching for the ARTDACI Grail — an imagined film", featuredFilmPlay: "Play the featured film", featuredFilmError: "The featured film is temporarily unavailable.", featuredArtists: "Featured artists", imageAlbumLabel: "3D Photo Albums · Reimagined Encounters", galleryKicker: "THE IMAGINED ENCOUNTERS", galleryTitle: "Four masters. Stories beyond the frame", galleryDesc: "These contemporary images create poetic encounters around the artists and their works. They are artistic interpretations, not historical documents.", galleryArtists: "Artists in the image gallery",
      leonardoEra: "THE RENAISSANCE · REIMAGINED", leonardoStory: "The studio becomes a stage: Mona Lisa steps into the room, while Francis I meets the artist at the end of his journey.", leonardoCaption1: "Leonardo at work — an imagined studio", leonardoCaption2: "Leonardo and Francis I — imagined encounter", leonardoCaption3: "Mona Lisa — beyond the frame", leonardoAlt1: "Leonardo painting Mona Lisa in an imagined Renaissance studio", leonardoAlt2: "Leonardo da Vinci speaking with Francis I in an imagined royal room", leonardoAlt3: "Mona Lisa stepping out of her frame", openLeonardo1: "Enlarge Leonardo at work", openLeonardo2: "Enlarge Leonardo and Francis I", openLeonardo3: "Enlarge Mona Lisa beyond the frame",
      vermeerEra: "DELFT LIGHT · REIMAGINED", vermeerStory: "Delft interiors open around the Girl with a Pearl Earring, Vermeer and the patrons associated with his carefully observed world.", vermeerCaption1: "The girl enters Vermeer’s room", vermeerCaption2: "Girl with a Pearl Earring — seated", vermeerCaption3: "Vermeer and his patrons — imagined presentation", vermeerAlt1: "Girl with a Pearl Earring standing in an imagined Delft interior", vermeerAlt2: "Girl with a Pearl Earring seated beside a table", vermeerAlt3: "Vermeer presenting a painting to Pieter van Ruijven and Maria de Knuijt", openVermeer1: "Enlarge the girl in Vermeer’s room", openVermeer2: "Enlarge the seated girl", openVermeer3: "Enlarge Vermeer and his patrons",
      vangoghEra: "A LEGACY IN COLOUR · REIMAGINED", vangoghStory: "An imagined studio portrait brings Vincent together with Jo van Gogh-Bonger, whose work later helped introduce his art to the world.", vangoghCaption1: "Vincent and Jo — imagined studio portrait", vangoghCaption2: "The artist and the keeper of his legacy", vangoghAlt1: "Vincent van Gogh and Jo van Gogh-Bonger standing in an imagined studio", vangoghAlt2: "Close imagined portrait of Vincent van Gogh and Jo van Gogh-Bonger", openVangogh1: "Enlarge Vincent and Jo in the studio", openVangogh2: "Enlarge the portrait of Vincent and Jo",
      monetEra: "IMPRESSIONISM · REIMAGINED", monetStory: "Monet and the art dealer Paul Durand-Ruel meet within rooms shaped by the paintings their collaboration helped bring to new audiences.", monetCaption1: "Monet and Durand-Ruel — the gallery", monetCaption2: "Monet and Durand-Ruel — imagined portrait", monetAlt1: "Claude Monet and Paul Durand-Ruel in an imagined gallery of water lilies", monetAlt2: "Claude Monet and Paul Durand-Ruel in an imagined office portrait", openMonet1: "Enlarge Monet and Durand-Ruel in the gallery", openMonet2: "Enlarge the portrait of Monet and Durand-Ruel",
      togetherNav: "Together", groupKicker: "BEYOND TIME · TOGETHER", groupTitle: "The four masters, in one imagined world.", groupStory: "These collective portraits bring Leonardo, Monet, Van Gogh and Vermeer together across centuries, places and artistic movements.", groupCaption1: "Four masters and the people who carried their stories", groupCaption2: "Four painters — one imagined studio", groupCaption3: "A portrait beyond chronology", groupCaption4: "A journey through the places of their stories", groupCaption5: "The four masters — collective study", groupAlt1: "Leonardo, Monet, Van Gogh and Vermeer gathered with people connected to their stories", groupAlt2: "Leonardo, Monet, Van Gogh and Vermeer standing in an imagined shared studio", groupAlt3: "Close collective portrait of Leonardo, Monet, Van Gogh and Vermeer", groupAlt4: "The four painters placed before landmarks connected to their artistic stories", groupAlt5: "Cutout portrait of Leonardo, Monet, Van Gogh and Vermeer", openGroup1: "Enlarge the four masters with their circle", openGroup2: "Enlarge the four painters standing", openGroup3: "Enlarge the collective portrait", openGroup4: "Enlarge the journey through their places", openGroup5: "Enlarge the four-master study",
      sectionKicker: "VR CINEMA · ON SCREEN", sectionTitle: "The films of ARTDACI Cinema.", sectionDesc: "Discover the 12 films from VR Cinema and a new featured film. Watch them here without a headset: imagined encounters, Mona Lisa in motion, and stories of artists and their patrons.", cinemaNote: "Artistic interpretations, not historical footage.", cinemaVisit: "Enter the VR cinema ↗", cinemaPlaylist: "Explore the films", cinemaPlaylistLabel: "Cinema film playlist", cinemaFilterLabel: "Film categories", cinemaAll: "All films", cinemaTogether: "Four artists", cinemaLeonardo: "Leonardo & Mona Lisa", cinemaEncounters: "Encounters", cinemaCount: "films", cinemaError: "This film is temporarily unavailable on this device. You can also try the VR cinema.", cinemaPlay: "Play", outroKicker: "FROM IMAGINATION TO EXPLORATION", outroTitle: "Beyond the frame, into the world of art.", outroBook: "The Magical Book ↗", outro3d: "Explore in 3D ↗", outroMuseum: "Explore the museums ↗", disclaimer: "ARTDACI Reimagined is an artistic and educational reinterpretation. It is not an official museum reproduction or a historical reconstruction.", closeImage: "Close image"
    },
    fr: {
      skip: "Aller à l’exposition", navGallery: "La galerie", navCollection: "Les films", navBook: "Le livre magique", navHome: "Accueil ARTDACI", heroKicker: "✦ L’ART AU-DELÀ DU CADRE", heroText: "Quatre maîtres sortent de leurs tableaux à travers des rencontres imaginées, des images et des films.", heroImageAlt: "Léonard peignant la Joconde dans un atelier Renaissance imaginé", heroImageCaption: "L’atelier de Léonard — imaginé au-delà de la toile", exploreGallery: "ENTRER DANS LA GALERIE D’IMAGES", experience: "OUVRIR LE LIVRE MAGIQUE", featuredFilmBadge: "✦ FILM À LA UNE", featuredFilmSummary: "Léonard de Vinci, Vermeer, Van Gogh et Monet partent à la recherche d’un Graal mystérieux : le livre ARTDACI, que Léonard leur présente comme une nouvelle porte vers l’art.", featuredFilmTitle: "Les quatre maîtres à la recherche du Graal d’ARTDACI", featuredFilmAria: "Les quatre maîtres à la recherche du Graal d’ARTDACI — film réimaginé", featuredFilmPlay: "Lire le film à la une", featuredFilmError: "Le film à la une est temporairement indisponible.", featuredArtists: "Artistes présentés", imageAlbumLabel: "Albums photo 3D · Rencontres réimaginées", galleryKicker: "LES RENCONTRES IMAGINÉES", galleryTitle: "Quatre maîtres. Des histoires au-delà du cadre", galleryDesc: "Ces images contemporaines créent des rencontres poétiques autour des artistes et de leurs œuvres. Ce sont des interprétations artistiques, et non des documents historiques.", galleryArtists: "Artistes de la galerie d’images",
      leonardoEra: "LA RENAISSANCE · RÉIMAGINÉE", leonardoStory: "L’atelier devient une scène : la Joconde entre dans la pièce, tandis que François Ier rencontre l’artiste à la fin de son voyage.", leonardoCaption1: "Léonard au travail — un atelier imaginé", leonardoCaption2: "Léonard et François Ier — rencontre imaginée", leonardoCaption3: "La Joconde — au-delà du cadre", leonardoAlt1: "Léonard peignant la Joconde dans un atelier Renaissance imaginé", leonardoAlt2: "Léonard de Vinci parlant avec François Ier dans une salle royale imaginée", leonardoAlt3: "La Joconde sortant de son cadre", openLeonardo1: "Agrandir Léonard au travail", openLeonardo2: "Agrandir Léonard et François Ier", openLeonardo3: "Agrandir la Joconde au-delà du cadre",
      vermeerEra: "LA LUMIÈRE DE DELFT · RÉIMAGINÉE", vermeerStory: "Les intérieurs de Delft s’ouvrent autour de la Jeune Fille à la perle, de Vermeer et des mécènes associés à son univers d’observation.", vermeerCaption1: "La jeune fille entre dans la chambre de Vermeer", vermeerCaption2: "La Jeune Fille à la perle — assise", vermeerCaption3: "Vermeer et ses mécènes — présentation imaginée", vermeerAlt1: "La Jeune Fille à la perle debout dans un intérieur de Delft imaginé", vermeerAlt2: "La Jeune Fille à la perle assise près d’une table", vermeerAlt3: "Vermeer présentant un tableau à Pieter van Ruijven et Maria de Knuijt", openVermeer1: "Agrandir la jeune fille dans la chambre de Vermeer", openVermeer2: "Agrandir la jeune fille assise", openVermeer3: "Agrandir Vermeer et ses mécènes",
      vangoghEra: "UN HÉRITAGE EN COULEUR · RÉIMAGINÉ", vangoghStory: "Un portrait d’atelier imaginé réunit Vincent et Jo van Gogh-Bonger, dont le travail contribua plus tard à faire connaître son art dans le monde.", vangoghCaption1: "Vincent et Jo — portrait d’atelier imaginé", vangoghCaption2: "L’artiste et la gardienne de son héritage", vangoghAlt1: "Vincent van Gogh et Jo van Gogh-Bonger debout dans un atelier imaginé", vangoghAlt2: "Portrait rapproché imaginé de Vincent van Gogh et Jo van Gogh-Bonger", openVangogh1: "Agrandir Vincent et Jo dans l’atelier", openVangogh2: "Agrandir le portrait de Vincent et Jo",
      monetEra: "L’IMPRESSIONNISME · RÉIMAGINÉ", monetStory: "Monet et le marchand d’art Paul Durand-Ruel se retrouvent dans des espaces façonnés par les tableaux que leur collaboration a contribué à faire connaître.", monetCaption1: "Monet et Durand-Ruel — la galerie", monetCaption2: "Monet et Durand-Ruel — portrait imaginé", monetAlt1: "Claude Monet et Paul Durand-Ruel dans une galerie de nymphéas imaginée", monetAlt2: "Claude Monet et Paul Durand-Ruel dans un portrait de bureau imaginé", openMonet1: "Agrandir Monet et Durand-Ruel dans la galerie", openMonet2: "Agrandir le portrait de Monet et Durand-Ruel",
      togetherNav: "Ensemble", groupKicker: "AU-DELÀ DU TEMPS · ENSEMBLE", groupTitle: "Les quatre maîtres, dans un même monde imaginé.", groupStory: "Ces portraits collectifs réunissent Léonard, Monet, Van Gogh et Vermeer par-delà les siècles, les lieux et les mouvements artistiques.", groupCaption1: "Quatre maîtres et ceux qui ont porté leurs histoires", groupCaption2: "Quatre peintres — un atelier imaginé", groupCaption3: "Un portrait au-delà de la chronologie", groupCaption4: "Un voyage à travers les lieux de leurs histoires", groupCaption5: "Les quatre maîtres — étude collective", groupAlt1: "Léonard, Monet, Van Gogh et Vermeer réunis avec des personnes liées à leurs histoires", groupAlt2: "Léonard, Monet, Van Gogh et Vermeer debout dans un atelier commun imaginé", groupAlt3: "Portrait collectif rapproché de Léonard, Monet, Van Gogh et Vermeer", groupAlt4: "Les quatre peintres devant des monuments liés à leurs histoires artistiques", groupAlt5: "Portrait détouré de Léonard, Monet, Van Gogh et Vermeer", openGroup1: "Agrandir les quatre maîtres et leur entourage", openGroup2: "Agrandir les quatre peintres debout", openGroup3: "Agrandir le portrait collectif", openGroup4: "Agrandir le voyage à travers leurs lieux", openGroup5: "Agrandir l’étude des quatre maîtres",
      sectionKicker: "CINÉMA VR · EN ACCÈS DIRECT", sectionTitle: "Les films du Cinéma ARTDACI.", sectionDesc: "Retrouvez les 12 films du Cinéma VR et un nouveau film à la une ; visionnez-les ici, même sans casque : rencontres imaginées, Joconde animée et histoires des artistes et de leurs mécènes.", cinemaNote: "Des interprétations artistiques, pas des archives historiques.", cinemaVisit: "Entrer dans le Cinéma VR ↗", cinemaPlaylist: "Choisir un film", cinemaPlaylistLabel: "Liste des films du cinéma", cinemaFilterLabel: "Catégories de films", cinemaAll: "Tous les films", cinemaTogether: "Quatre artistes", cinemaLeonardo: "Léonard & la Joconde", cinemaEncounters: "Rencontres", cinemaCount: "films", cinemaError: "Cette vidéo n’est pas disponible sur cet appareil. Vous pouvez aussi essayer le Cinéma VR.", cinemaPlay: "Lire", outroKicker: "DE L’IMAGINAIRE À L’EXPLORATION", outroTitle: "Au-delà du cadre, explorer le monde de l’art.", outroBook: "Le livre magique ↗", outro3d: "Explorer en 3D ↗", outroMuseum: "Explorer les musées ↗", disclaimer: "ARTDACI Reimagined est une réinterprétation artistique et pédagogique. Il ne s’agit ni d’une reproduction officielle d’un musée ni d’une reconstitution historique.", closeImage: "Fermer l’image"
    },
    ar: {
      skip: "الانتقال إلى المعرض", navGallery: "معرض الصور", navCollection: "الأفلام", navBook: "الكتاب السحري", navHome: "الصفحة الرئيسية", heroKicker: "✦ الفن أبعد من الإطار", heroText: "أربعة من كبار الفنانين يتجاوزون لوحاتهم عبر لقاءات متخيلة وصور وأفلام.", heroImageAlt: "ليوناردو يرسم الموناليزا في مرسم متخيل من عصر النهضة", heroImageCaption: "مرسم ليوناردو — خيال يتجاوز اللوحة", exploreGallery: "ادخل معرض الصور", experience: "افتح الكتاب السحري", featuredFilmBadge: "✦ فيلم مميز", featuredFilmSummary: "ينطلق ليوناردو دافنشي وفيرمير وفان غوخ ومونيه بحثًا عن كنز غامض يتبيّن أنه كتاب ARTDACI، الذي يقدّمه ليوناردو بوصفه بوابة جديدة إلى الفن.", featuredFilmTitle: "الأساتذة الأربعة يبحثون عن كأس ARTDACI المقدسة", featuredFilmAria: "فيلم متخيّل عن بحث الأساتذة الأربعة عن كتاب ARTDACI", featuredFilmPlay: "تشغيل الفيلم المميز", featuredFilmError: "الفيلم المميز غير متاح مؤقتاً.", featuredArtists: "الفنانون المشاركون", imageAlbumLabel: "ألبومات صور ثلاثية الأبعاد · لقاءات متخيّلة", galleryKicker: "لقاءات متخيلة", galleryTitle: "أربعة أساتذة. حكايات تتجاوز إطار اللوحة", galleryDesc: "تُجسّد هذه الصور المعاصرة لقاءات شاعرية حول الفنانين وأعمالهم، وهي تأويلات فنية وليست وثائق تاريخية.", galleryArtists: "فنانو معرض الصور",
      leonardoEra: "عصر النهضة · برؤية جديدة", leonardoStory: "يتحول المرسم إلى مسرح: تدخل الموناليزا الغرفة، ويلتقي فرانسوا الأول بالفنان في أواخر رحلته.", leonardoCaption1: "ليوناردو يعمل — مرسم متخيل", leonardoCaption2: "ليوناردو وفرنسوا الأول — لقاء متخيل", leonardoCaption3: "الموناليزا — خارج الإطار", leonardoAlt1: "ليوناردو يرسم الموناليزا في مرسم متخيل من عصر النهضة", leonardoAlt2: "ليوناردو دافنشي يتحدث مع فرانسوا الأول في قاعة ملكية متخيلة", leonardoAlt3: "الموناليزا تخرج من إطارها", openLeonardo1: "تكبير صورة ليوناردو أثناء العمل", openLeonardo2: "تكبير صورة ليوناردو وفرنسوا الأول", openLeonardo3: "تكبير صورة الموناليزا خارج الإطار",
      vermeerEra: "ضوء دلفت · برؤية جديدة", vermeerStory: "تنفتح بيوت دلفت حول الفتاة ذات القرط اللؤلؤي وفيرمير والرعاة المرتبطين بعالمه الدقيق الملاحظة.", vermeerCaption1: "الفتاة تدخل غرفة فيرمير", vermeerCaption2: "الفتاة ذات القرط اللؤلؤي — جالسة", vermeerCaption3: "فيرمير ورعاته — عرض متخيل", vermeerAlt1: "الفتاة ذات القرط اللؤلؤي واقفة في بيت متخيل في دلفت", vermeerAlt2: "الفتاة ذات القرط اللؤلؤي جالسة قرب طاولة", vermeerAlt3: "فيرمير يعرض لوحة على بيتر فان راوفن وماريا دي كنايت", openVermeer1: "تكبير صورة الفتاة في غرفة فيرمير", openVermeer2: "تكبير صورة الفتاة الجالسة", openVermeer3: "تكبير صورة فيرمير ورعاته",
      vangoghEra: "إرث من الألوان · برؤية جديدة", vangoghStory: "تجمع صورة متخيلة في المرسم بين فنسنت وجو فان غوخ-بونغر التي ساعد عملها لاحقاً في تعريف العالم بفنه.", vangoghCaption1: "فنسنت وجو — صورة متخيلة في المرسم", vangoghCaption2: "الفنان وحافظة إرثه", vangoghAlt1: "فنسنت فان غوخ وجو فان غوخ-بونغر واقفان في مرسم متخيل", vangoghAlt2: "صورة متخيلة مقربة لفنسنت فان غوخ وجو فان غوخ-بونغر", openVangogh1: "تكبير صورة فنسنت وجو في المرسم", openVangogh2: "تكبير صورة فنسنت وجو",
      monetEra: "الانطباعية · برؤية جديدة", monetStory: "يلتقي مونيه وتاجر الفن بول دوران-رويل في فضاءات صنعتها اللوحات التي ساهم تعاونهما في تقديمها إلى جمهور جديد.", monetCaption1: "مونيه ودوران-رويل — المعرض", monetCaption2: "مونيه ودوران-رويل — صورة متخيلة", monetAlt1: "كلود مونيه وبول دوران-رويل في معرض متخيل لزنابق الماء", monetAlt2: "كلود مونيه وبول دوران-رويل في صورة مكتبية متخيلة", openMonet1: "تكبير صورة مونيه ودوران-رويل في المعرض", openMonet2: "تكبير صورة مونيه ودوران-رويل",
      togetherNav: "معاً", groupKicker: "ما وراء الزمن · معاً", groupTitle: "الأساتذة الأربعة في عالم متخيل واحد.", groupStory: "تجمع هذه الصور الجماعية ليوناردو ومونيه وفان غوخ وفيرمير عبر القرون والأماكن والحركات الفنية.", groupCaption1: "أربعة أساتذة ومن حملوا حكاياتهم", groupCaption2: "أربعة رسامين — مرسم واحد متخيل", groupCaption3: "صورة تتجاوز التسلسل الزمني", groupCaption4: "رحلة عبر أماكن حكاياتهم", groupCaption5: "الأساتذة الأربعة — دراسة جماعية", groupAlt1: "ليوناردو ومونيه وفان غوخ وفيرمير مع أشخاص مرتبطين بحكاياتهم", groupAlt2: "ليوناردو ومونيه وفان غوخ وفيرمير واقفون في مرسم مشترك متخيل", groupAlt3: "صورة جماعية مقربة لليوناردو ومونيه وفان غوخ وفيرمير", groupAlt4: "الرسامون الأربعة أمام معالم مرتبطة بحكاياتهم الفنية", groupAlt5: "صورة مفرغة لليوناردو ومونيه وفان غوخ وفيرمير", openGroup1: "تكبير صورة الأساتذة الأربعة ومن حولهم", openGroup2: "تكبير صورة الرسامين الأربعة واقفين", openGroup3: "تكبير الصورة الجماعية", openGroup4: "تكبير رحلة أماكنهم", openGroup5: "تكبير دراسة الأساتذة الأربعة",
      sectionKicker: "سينما الواقع الافتراضي · مشاهدة مباشرة", sectionTitle: "أفلام سينما ARTDACI.", sectionDesc: "شاهد الأفلام الاثني عشر من سينما الواقع الافتراضي وفيلمًا جديدًا مميزًا، حتى من دون نظارة: لقاءات متخيّلة، والموناليزا المتحركة، وحكايات الفنانين وداعميهم.", cinemaNote: "أعمال فنية متخيلة وليست لقطات تاريخية.", cinemaVisit: "الدخول إلى سينما الواقع الافتراضي ↗", cinemaPlaylist: "اختر فيلماً", cinemaPlaylistLabel: "قائمة أفلام السينما", cinemaFilterLabel: "فئات الأفلام", cinemaAll: "جميع الأفلام", cinemaTogether: "أربعة فنانين", cinemaLeonardo: "ليوناردو والموناليزا", cinemaEncounters: "لقاءات", cinemaCount: "فيلماً", cinemaError: "هذا الفيديو غير متاح على هذا الجهاز حالياً. يمكنك تجربته أيضاً في سينما الواقع الافتراضي.", cinemaPlay: "تشغيل", outroKicker: "من الخيال إلى الاستكشاف", outroTitle: "ما وراء الإطار، اكتشف عالم الفن.", outroBook: "الكتاب السحري ↗", outro3d: "استكشف الأبعاد الثلاثية ↗", outroMuseum: "استكشف المتاحف ↗", disclaimer: "ARTDACI Reimagined تجربة فنية وتعليمية وليست نسخة رسمية من متحف أو إعادة بناء تاريخية.", closeImage: "إغلاق الصورة"
    }
  };

  const qs = new URLSearchParams(location.search);
  const lang = ["en", "fr", "ar"].includes(qs.get("lang")) ? qs.get("lang") : "en";
  const copy = texts[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = lang === "fr" ? "ARTDACI Reimagined — L’art au-delà du cadre" : lang === "ar" ? "ARTDACI Reimagined — الفن أبعد من الإطار" : "ARTDACI Reimagined — Art Beyond the Frame";

  document.querySelectorAll("[data-l10n]").forEach((element) => {
    if (copy[element.dataset.l10n]) element.textContent = copy[element.dataset.l10n];
  });
  document.querySelectorAll("[data-l10n-alt]").forEach((element) => {
    if (copy[element.dataset.l10nAlt]) element.alt = copy[element.dataset.l10nAlt];
  });
  document.querySelectorAll("[data-l10n-aria]").forEach((element) => {
    if (copy[element.dataset.l10nAria]) element.setAttribute("aria-label", copy[element.dataset.l10nAria]);
  });
  document.querySelectorAll("[data-language]").forEach((element) => {
    if (element.dataset.language === lang) element.setAttribute("aria-current", "page");
  });

  const home = lang === "fr" ? "index-fr.html" : lang === "ar" ? "index-ar.html" : "index.html";
  const links = {
    "r-home": home, "r-back": home, "r-cinema-link": `cinema-vr.html?lang=${lang}`, "r-book-nav": `alive.html?lang=${lang}`, "r-magic": `alive.html?lang=${lang}`, "r-to-book": `alive.html?lang=${lang}`, "r-to-3d": `3d/?lang=${lang}`, "r-to-museums": `museums.html?lang=${lang}`,
    "r-mona": lang === "fr" ? "print-target-fr.html" : lang === "ar" ? "print-ar.html?painting=mona-lisa" : "print-target.html",
    "r-mona-still": lang === "fr" ? "print-target-fr.html" : lang === "ar" ? "print-ar.html?painting=mona-lisa" : "print-target.html",
    "r-vermeer": lang === "fr" ? "print-vermeer-girl-with-a-pearl-earring-fr.html" : lang === "ar" ? "print-ar.html?painting=vermeer-girl-with-a-pearl-earring" : "print-vermeer-girl-with-a-pearl-earring.html",
    "r-vermeer-still": lang === "fr" ? "print-vermeer-girl-with-a-pearl-earring-fr.html" : lang === "ar" ? "print-ar.html?painting=vermeer-girl-with-a-pearl-earring" : "print-vermeer-girl-with-a-pearl-earring.html",
    "r-vangogh": lang === "fr" ? "print-van-gogh-fr.html" : lang === "ar" ? "print-ar.html?painting=van-gogh" : "print-van-gogh.html",
    "r-vangogh-still": lang === "fr" ? "print-van-gogh-fr.html" : lang === "ar" ? "print-ar.html?painting=van-gogh" : "print-van-gogh.html",
    "r-monet": lang === "fr" ? "print-monet-impression-sunrise-fr.html" : lang === "ar" ? "print-ar.html?painting=monet-impression-sunrise" : "print-monet-impression-sunrise.html",
    "r-monet-still": lang === "fr" ? "print-monet-impression-sunrise-fr.html" : lang === "ar" ? "print-ar.html?painting=monet-impression-sunrise" : "print-monet-impression-sunrise.html"
  };
  Object.entries(links).forEach(([id, url]) => {
    const element = document.getElementById(id);
    if (element) element.href = url;
  });



  const featuredVideo = document.getElementById("r-featured-video");
  const featuredPlay = document.getElementById("r-featured-play");
  const featuredError = document.getElementById("r-featured-error");
  if (featuredVideo && featuredPlay) {
    featuredPlay.addEventListener("click", () => {
      featuredVideo.play().then(() => {
        featuredError.hidden = true;
      }).catch(() => {
        featuredError.hidden = false;
      });
    });
    featuredVideo.addEventListener("play", () => {
      featuredPlay.hidden = true;
      featuredError.hidden = true;
    });
    featuredVideo.addEventListener("ended", () => {
      featuredPlay.hidden = false;
    });
    featuredVideo.addEventListener("error", () => {
      featuredPlay.hidden = true;
      featuredError.hidden = false;
    });
    featuredVideo.addEventListener("loadedmetadata", () => {
      featuredError.hidden = true;
    });
  }

  // The 12 VR cinema films appear in the playlist; Graal is featured separately above.
  // in scripts/gallery-vr.js. Keep the paths and order aligned with the VR cinema.
  const cinemaFilms = [
  {
    "id": "four-painters-intro",
    "group": "together",
    "title": {
      "en": "Four Painters — Intro",
      "fr": "Quatre peintres — Présentation",
      "ar": "الرسامون الأربعة — تقديم"
    },
    "src": "assets/shared/four-painters/introduction.mp4",
    "poster": "https://media.artdaci.com/shared/images/groups/reimagined/four-masters-portrait.png"
  },
  {
    "id": "four-painters-selfie-ii",
    "group": "together",
    "title": {
      "en": "Four Painters — Selfie II",
      "fr": "Quatre peintres — Selfie II",
      "ar": "الرسامون الأربعة — سيلفي II"
    },
    "src": "assets/shared/groups/audio-video/dvvm-n-selfy.mp4",
    "poster": "https://media.artdaci.com/shared/images/groups/reimagined/four-masters-standing.png"
  },
  {
    "id": "four-painters-selfie",
    "group": "together",
    "title": {
      "en": "Four Painters — Selfie",
      "fr": "Quatre peintres — Selfie",
      "ar": "الرسامون الأربعة — سيلفي"
    },
    "src": "assets/shared/groups/audio-video/dvvm-selfy.mp4",
    "poster": "https://media.artdaci.com/shared/images/groups/reimagined/four-masters-standing.png"
  },
  {
    "id": "leonardo-paris",
    "group": "leonardo",
    "title": {
      "en": "Leonardo & Mona Lisa — Paris",
      "fr": "Léonard & La Joconde — Paris",
      "ar": "ليوناردو والموناليزا — باريس"
    },
    "src": "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/davinci-monalisa-paris.mp4",
    "poster": "https://media.artdaci.com/shared/images/artists/reimagined/mona-lisa-beyond-the-frame.webp"
  },
  {
    "id": "painting-mona-lisa",
    "group": "leonardo",
    "title": {
      "en": "Painting Mona Lisa",
      "fr": "Peindre La Joconde",
      "ar": "رسم الموناليزا"
    },
    "src": "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/davinci-painting-monalisa.mp4",
    "poster": "https://media.artdaci.com/shared/images/artists/reimagined/leonardo-painting-mona-lisa.webp"
  },
  {
    "id": "mona-lisa-reimagined",
    "group": "leonardo",
    "title": {
      "en": "Mona Lisa Reimagined",
      "fr": "Joconde réimaginée",
      "ar": "الموناليزا المتخيلة"
    },
    "src": "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/mona-lisa-video.mp4",
    "poster": "https://media.artdaci.com/shared/images/artists/reimagined/mona-lisa-beyond-the-frame.webp"
  },
  {
    "id": "leonardo-vision-ii",
    "group": "leonardo",
    "title": {
      "en": "Leonardo’s Vision II",
      "fr": "Vision de Léonard II",
      "ar": "رؤية ليوناردو II"
    },
    "src": "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/dv2.mp4",
    "poster": "https://media.artdaci.com/shared/images/artists/reimagined/leonardo-painting-mona-lisa.webp"
  },
  {
    "id": "mona-lisa-in-motion",
    "group": "leonardo",
    "title": {
      "en": "Mona Lisa in Motion",
      "fr": "Joconde en mouvement",
      "ar": "الموناليزا تتحرك"
    },
    "src": "assets/artists/leonardo-da-vinci/artworks/mona-lisa/media/m2vmg.mp4",
    "poster": "https://media.artdaci.com/shared/images/artists/reimagined/mona-lisa-beyond-the-frame.webp"
  },
  {
    "id": "leonardo-francis",
    "group": "encounters",
    "title": {
      "en": "Leonardo da Vinci — Leonardo Thanks King Francis I",
      "fr": "Léonard de Vinci — Léonard remercie le roi François Ier",
      "ar": "ليوناردو دافنشي — ليوناردو يشكر الملك فرانسوا الأول"
    },
    "src": "assets/artists/leonardo-da-vinci/supporters/video/leonardo-da-vinci-thanking-king-202608151400.mp4",
    "poster": "https://media.artdaci.com/shared/images/artists/reimagined/leonardo-francis-i.webp"
  },
  {
    "id": "vincent-theo-jo",
    "group": "encounters",
    "title": {
      "en": "Vincent van Gogh — Vincent, Theo and Jo — Last Words",
      "fr": "Vincent van Gogh — Vincent, Theo et Jo — dernières paroles",
      "ar": "فنسنت فان غوخ — فنسنت وثيو وجو — الكلمات الأخيرة"
    },
    "src": "assets/artists/vincent-van-gogh/supporters/video/vincent-theo-jo-last-words.mp4",
    "poster": "https://media.artdaci.com/shared/images/artists/reimagined/van-gogh-and-jo-bonger-portrait.webp"
  },
  {
    "id": "vermeer-thanks",
    "group": "encounters",
    "title": {
      "en": "Johannes Vermeer — Vermeer Thanks Pieter and Maria",
      "fr": "Johannes Vermeer — Vermeer remercie Pieter et Maria",
      "ar": "يوهانس فيرمير — فيرمير يشكر بيتر وماريا"
    },
    "src": "assets/artists/johannes-vermeer/supporters/video/animating-vermeer-thanking-patrons-pieter-van-ruijven-maria-de-knuijt.mp4",
    "poster": "https://media.artdaci.com/shared/images/artists/reimagined/vermeer-with-pieter-and-maria.webp"
  },
  {
    "id": "vermeer-patrons",
    "group": "encounters",
    "title": {
      "en": "Johannes Vermeer — Vermeer and His Patrons",
      "fr": "Johannes Vermeer — Vermeer et ses mécènes",
      "ar": "يوهانس فيرمير — فيرمير ورعاته"
    },
    "src": "assets/artists/johannes-vermeer/supporters/video/vermeer-thanking-pieter-an-maria-for-support.mp4",
    "poster": "https://media.artdaci.com/shared/images/artists/reimagined/vermeer-with-pieter-and-maria.webp"
  }
];
  const cinemaPlayer = document.getElementById("r-cinema-player");
  const cinemaList = document.getElementById("r-cinema-list");
  const cinemaTitle = document.getElementById("r-cinema-film-title");
  const cinemaCategory = document.getElementById("r-cinema-category");
  const cinemaCount = document.getElementById("r-cinema-count");
  const cinemaFeedback = document.getElementById("r-cinema-feedback");
  const cinemaFeature = document.querySelector(".r-cinema-feature");
  const cinemaFilters = [...document.querySelectorAll("[data-cinema-filter]")];
  const filmGroups = {
    together: copy.cinemaTogether,
    leonardo: copy.cinemaLeonardo,
    encounters: copy.cinemaEncounters
  };
  let activeCinemaFilm = "";
  let activeCinemaFilter = "all";

  function showCinemaFilm(film, shouldPlay = false) {
    if (!film || !cinemaPlayer) return;
    const changed = activeCinemaFilm !== film.id;
    activeCinemaFilm = film.id;
    cinemaTitle.textContent = film.title[lang] || film.title.en;
    cinemaCategory.textContent = filmGroups[film.group];
    cinemaFeedback.hidden = true;
    if (changed) {
      cinemaPlayer.pause();
      cinemaPlayer.poster = film.poster;
      cinemaPlayer.src = film.src;
      cinemaPlayer.setAttribute("aria-label", film.title[lang] || film.title.en);
      cinemaPlayer.load();
    }
    cinemaList.querySelectorAll("[data-film-id]").forEach((button) => {
      const selected = button.dataset.filmId === film.id;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    if (shouldPlay) cinemaPlayer.play().catch(() => {});
  }

  function renderCinemaFilms() {
    const shown = cinemaFilms.filter((film) => activeCinemaFilter === "all" || film.group === activeCinemaFilter);
    cinemaList.replaceChildren();
    cinemaCount.textContent = `${shown.length} ${copy.cinemaCount}`;
    shown.forEach((film) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "r-cinema-item";
      button.dataset.filmId = film.id;
      button.setAttribute("aria-pressed", String(film.id === activeCinemaFilm));
      if (film.id === activeCinemaFilm) button.classList.add("is-selected");
      const image = document.createElement("img");
      image.src = film.poster;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      const information = document.createElement("span");
      information.className = "r-cinema-item-details";
      const kind = document.createElement("span");
      kind.className = "r-cinema-item-kind";
      kind.textContent = filmGroups[film.group];
      const title = document.createElement("strong");
      title.textContent = film.title[lang] || film.title.en;
      information.append(kind, title);
      const icon = document.createElement("span");
      icon.className = "r-cinema-play-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "▶";
      button.setAttribute("aria-label", `${copy.cinemaPlay} — ${title.textContent}`);
      button.append(image, information, icon);
      button.addEventListener("click", () => {
        showCinemaFilm(film, true);
        if (window.matchMedia("(max-width: 950px)").matches) {
          cinemaFeature.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        }
      });
      cinemaList.append(button);
    });
  }

  cinemaPlayer.addEventListener("error", () => {
    cinemaFeedback.textContent = copy.cinemaError;
    cinemaFeedback.hidden = false;
  });
  cinemaPlayer.addEventListener("loadedmetadata", () => {
    cinemaFeedback.hidden = true;
  });
  cinemaFilters.forEach((button) => button.addEventListener("click", () => {
    activeCinemaFilter = button.dataset.cinemaFilter;
    cinemaFilters.forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle("is-active", selected);
      filter.setAttribute("aria-pressed", String(selected));
    });
    const shown = cinemaFilms.filter((film) => activeCinemaFilter === "all" || film.group === activeCinemaFilter);
    if (!shown.some((film) => film.id === activeCinemaFilm)) showCinemaFilm(shown[0]);
    renderCinemaFilms();
  }));
  showCinemaFilm(cinemaFilms[0]);
  renderCinemaFilms();

  const movies = [...document.querySelectorAll("video")];
  movies.forEach((video) => video.addEventListener("play", () => movies.forEach((other) => {
    if (other !== video) other.pause();
  })));

  const lightbox = document.getElementById("r-lightbox");
  const lightboxImage = document.getElementById("r-lightbox-image");
  const lightboxCaption = document.getElementById("r-lightbox-caption");
  document.querySelectorAll(".r-still-open").forEach((button) => button.addEventListener("click", () => {
    const image = button.querySelector("img");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = copy[button.dataset.captionKey] || "";
    lightbox.showModal();
  }));
  document.querySelector(".r-lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("close", () => {
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
  });
  (function initThreeDimensionalPhotoAlbums() {
  const translations = {
    en: { guide:"Turn the 3D photo albums with the arrows or a swipe. Click any photo to see it full-size.", tag:"3D PHOTO ALBUM", page:"PHOTO", prev:"Previous photo", next:"Next photo", zoom:"Enlarge photo", choose:"Enlarge thumbnail", together:"The Four Masters" },
    fr: { guide:"Tournez les albums photo 3D à l’aide des flèches ou d’un glissement. Cliquez sur une image pour l’agrandir.", tag:"ALBUM PHOTO 3D", page:"PHOTO", prev:"Photo précédente", next:"Photo suivante", zoom:"Agrandir la photo", choose:"Agrandir la miniature", together:"Les quatre maîtres" },
    ar: { guide:"قلّب صفحات ألبومات الصور ثلاثية الأبعاد باستخدام الأسهم أو السحب. انقر على الصورة لتكبيرها.", tag:"ألبوم صور ثلاثي الأبعاد", page:"الصورة", prev:"الصورة السابقة", next:"الصورة التالية", zoom:"تكبير الصورة", choose:"تكبير الصورة المصغّرة", together:"الأساتذة الأربعة" }
  };
  const words = translations[lang];
  const guide = document.querySelector("[data-album-guide]");
  if (guide) guide.textContent=words.guide;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const albums = Array.from(document.querySelectorAll(".r-photo-album"));
  albums.forEach((album) => {
    const source = album.querySelector(".r-album-source");
    const ui = album.querySelector(".r-album-ui");
    if (!source || !ui) return;
    const photos = Array.from(source.querySelectorAll(".r-still")).map((figure) => {
      const button = figure.querySelector(".r-still-open");
      const image = button?.querySelector("img");
      if (!image || !button) return null;
      const caption = copy[button.dataset.captionKey] || figure.querySelector("figcaption")?.textContent?.trim() || "";
      const alt = copy[image.dataset.l10nAlt] || image.alt || caption;
      return { src:image.getAttribute("src"), alt, caption };
    }).filter((photo) => photo?.src);
    if (!photos.length) return;

    const albumName = album.dataset.album === "together" ? words.together : (album.dataset.albumName || "ARTDACI");
    const ordinal = album.closest("article")?.querySelector(".r-story-number")?.textContent?.trim() || "05";
    ui.innerHTML = `
      <div class="r-album-topline"><span class="r-album-top-label"></span><span class="r-album-counter" role="status" aria-live="polite"></span></div>
      <div class="r-album-viewport">
        <div class="r-album-book" tabindex="0">
          <div class="r-album-left">
            <div class="r-album-cover-ornament">✦</div>
            <div class="r-album-cover-label">ARTDACI <span>REIMAGINED</span></div>
            <div class="r-album-cover-number"></div>
            <strong class="r-album-cover-title"></strong>
            <span class="r-album-cover-foil"></span>
          </div>
          <div class="r-album-right">
            <button class="r-album-photo" type="button"><img alt="" loading="lazy" decoding="async"><span class="r-album-photo-caption"></span><span class="r-album-enlarge" aria-hidden="true">⤢</span></button>
          </div>
          <div class="r-album-spine" aria-hidden="true"></div>
          <div class="r-album-flip-sheet" aria-hidden="true" hidden>
            <div class="r-album-flip-front"><img alt=""><span></span></div>
            <div class="r-album-flip-back"><span>ARTDACI</span><small>REIMAGINED</small></div>
          </div>
        </div>
      </div>
      <div class="r-album-bottom">
        <div class="r-album-controls">
          <button class="r-album-prev" type="button"><span aria-hidden="true">←</span><span class="r-album-prev-text"></span></button>
          <button class="r-album-next" type="button"><span class="r-album-next-text"></span><span aria-hidden="true">→</span></button>
        </div>
        <div class="r-album-thumbs" role="group"></div>
      </div>`;
    ui.querySelector(".r-album-top-label").textContent=words.tag;
    ui.querySelector(".r-album-cover-title").textContent=albumName;
    ui.querySelector(".r-album-cover-number").textContent=ordinal;
    // Reuse the actual localized text, title and original-artwork link within the left page.
    // If scripts do not run, the source header stays outside the book as a readable fallback.
    const originalHeader = album.closest("article")?.querySelector(".r-story-copy, .r-group-copy");
    if (originalHeader) {
      const leftPage = ui.querySelector(".r-album-left");
      leftPage.querySelector(".r-album-cover-title")?.remove();
      leftPage.querySelector(".r-album-cover-number")?.remove();
      leftPage.querySelector(".r-album-cover-ornament")?.remove();
      leftPage.querySelector(".r-album-cover-foil")?.remove();
      leftPage.append(originalHeader);
    }
    const book=ui.querySelector(".r-album-book");
    const photoButton=ui.querySelector(".r-album-photo");
    const photoImage=photoButton.querySelector("img");
    const photoCaption=ui.querySelector(".r-album-photo-caption");
    const counter=ui.querySelector(".r-album-counter");
    const turnPage=ui.querySelector(".r-album-flip-sheet");
    const flipImage=turnPage.querySelector(".r-album-flip-front img");
    const flipCaption=turnPage.querySelector(".r-album-flip-front span");
    const thumbs=ui.querySelector(".r-album-thumbs");
    const prev=ui.querySelector(".r-album-prev");
    const next=ui.querySelector(".r-album-next");
    prev.querySelector(".r-album-prev-text").textContent=words.prev;
    next.querySelector(".r-album-next-text").textContent=words.next;
    prev.setAttribute("aria-label",words.prev);
    next.setAttribute("aria-label",words.next);
    book.setAttribute("aria-label",`${words.tag} · ${albumName}`);
    let index=0, busy=false, swipeClickGuard=0, start=null;
    const thumbButtons=photos.map((photo,i)=>{
      const button=document.createElement("button");
      button.type="button";
      button.className="r-album-thumb";
      button.setAttribute("aria-label",`${words.choose} ${i+1}/${photos.length} : ${photo.caption}`);
      button.setAttribute("aria-pressed","false");
      const image=document.createElement("img");
      image.src=photo.src;
      image.alt="";
      image.loading="lazy";
      image.decoding="async";
      button.append(image);
      thumbs.append(button);
      button.addEventListener("click",()=>{
        if(busy)return;
        index=i;
        showPhoto(index);
        lightboxImage.src=photo.src;
        lightboxImage.alt=photo.alt;
        lightboxCaption.textContent=photo.caption;
        lightbox.showModal();
      });
      return button;
    });
    function showPhoto(i) {
      const photo=photos[i];
      photoImage.src=photo.src;
      photoImage.alt=photo.alt;
      photoCaption.textContent=photo.caption;
      counter.textContent=`${words.page} ${i+1} / ${photos.length}`;
      photoButton.setAttribute("aria-label",`${words.zoom} : ${photo.caption}`);
      thumbButtons.forEach((button,n)=>{
        button.classList.toggle("is-current",n===i);
        button.setAttribute("aria-pressed",String(n===i));
      });
    }
    function turnTo(target) {
      if (busy || target===index) return;
      const newIndex=(target+photos.length)%photos.length;
      const forward = (newIndex===0 && index===photos.length-1) || (newIndex>index && !(newIndex===photos.length-1&&index===0));
      if(reducedMotion){index=newIndex;showPhoto(index);return;}
      busy=true;
      flipImage.src=(forward?photos[index]:photos[newIndex]).src;
      flipCaption.textContent=(forward?photos[index]:photos[newIndex]).caption;
      if(forward){index=newIndex;showPhoto(index);}
      turnPage.hidden=false;
      book.classList.remove("is-turning-next","is-turning-prev");
      void turnPage.offsetWidth;
      book.classList.add(forward?"is-turning-next":"is-turning-prev");
      window.setTimeout(()=>{
        if(!forward){index=newIndex;showPhoto(index);}
        book.classList.remove("is-turning-next","is-turning-prev");
        turnPage.hidden=true;
        busy=false;
      },640);
    }
    prev.addEventListener("click",()=>turnTo((index-1+photos.length)%photos.length));
    next.addEventListener("click",()=>turnTo((index+1)%photos.length));
    photoButton.addEventListener("click",()=>{
      if(Date.now()<swipeClickGuard || busy)return;
      const photo=photos[index];
      lightboxImage.src=photo.src;
      lightboxImage.alt=photo.alt;
      lightboxCaption.textContent=photo.caption;
      lightbox.showModal();
    });
    book.addEventListener("keydown",(event)=>{
      if(["ArrowRight","ArrowLeft","Home","End"].includes(event.key)){
        event.preventDefault();
        if(event.key==="Home") turnTo(0);
        else if(event.key==="End") turnTo(photos.length-1);
        else turnTo((index+(event.key==="ArrowRight"?1:-1)+photos.length)%photos.length);
      }
    });
    book.addEventListener("pointerdown",(event)=>{
      if(event.button!==0) return;
      start={x:event.clientX,y:event.clientY};
    });
    book.addEventListener("pointerup",(event)=>{
      if(!start)return;
      const dx=event.clientX-start.x,dy=event.clientY-start.y;
      start=null;
      if(Math.abs(dx)>44 && Math.abs(dx)>Math.abs(dy)*1.25) {
        swipeClickGuard=Date.now()+450;
        turnTo((index+(dx<0?1:-1)+photos.length)%photos.length);
      }
    });
    book.addEventListener("pointercancel",()=>{start=null;});
    showPhoto(0);
    prev.disabled=next.disabled=photos.length<=1;
    thumbs.hidden=photos.length<=1;
    ui.hidden=false;
    source.hidden=true;
    album.classList.add("is-ready");
  });
})();

})();
