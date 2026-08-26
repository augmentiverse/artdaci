const MANIFEST_URLS = [
  "content/paintings/mona-lisa.json?v=2",
  "content/paintings/lady-with-an-ermine.json?v=1",
  "content/paintings/vermeer-girl-with-a-pearl-earring.json?v=2",
  "content/paintings/view-of-delft.json?v=1",
  "content/paintings/van-gogh.json?v=2",
  "content/paintings/van-gogh-bedroom.json?v=2",
  "content/paintings/monet-impression-sunrise.json?v=3",
  "content/paintings/pont-d-argenteuil.json?v=1",
  "content/paintings/additional-16.json?v=1"
];
const MUSEUM_MANIFEST_URLS = ["louvre", "mauritshuis", "czartoryski", "orsay", "van-gogh-museum"]
  .map((slug) => `content/museums/${slug}.json?v=1`);

const BEDROOM_VR_WORLD_URL = "https://marble.worldlabs.ai/worldvr/48b7eb17-56e4-4873-a253-fa13ed516fae";
const LEONARDO_STUDIO_VR_WORLD_URL = "https://marble.worldlabs.ai/worldvr/862ab5f6-8608-469c-a840-8cb10f3859ae";
const LEONARDO_ENRICHED_STUDIO_URL = "https://marble.worldlabs.ai/project/c7853f32-4025-4d66-a536-54bb9db6162d";

const LEONARDO_TRIBUTE = {
  en: {
    pages: [
      {
        eyebrow: "INTRODUCING ARTDACI",
        title: "A PRINTED BOOK. A LIVING MUSEUM.",
        subtitle: "Art, knowledge, and immersive discovery",
        body: "ARTDACI is more than a collection of extraordinary paintings. It is an invitation to rediscover the world’s artistic heritage through the tools of the twenty-first century while honouring the genius of the Renaissance. Every printed page stands on its own as a space for reading and close observation, then becomes a gateway to deeper exploration. Artificial Intelligence, Augmented Reality, Virtual Reality, interactive 3D experiences, immersive storytelling, sound, video, and spatial computing allow masterpieces to be experienced as well as observed. These technologies are not presented as spectacle alone, but as instruments for curiosity, learning, accessibility, and creativity: ways to explore knowledge, enter history, and encounter art from new points of view."
      },
      {
        eyebrow: "TO LEONARDO DA VINCI",
        title: "A MIND THAT CHANGED TIME",
        subtitle: "Some change their era. A very few change the future.",
        body: "More than five centuries after Leonardo da Vinci’s remarkable life, his paintings still captivate millions, his notebooks inspire artists, scientists, and engineers, and his insatiable curiosity remains a model for anyone who seeks to understand and create. Leonardo never accepted the limits of his time. He looked beyond the visible, questioned the accepted, and imagined what others believed impossible. He united art and science not as separate disciplines, but as expressions of the same pursuit of truth through observation, imagination, and making. He never knew virtual reality, augmented reality, 3D modelling, or spatial computing in their modern forms; nevertheless, his studies of optics, perspective, anatomy, movement, machines, and space make him an intellectual precursor to the curiosity that animates immersive media."
      },
      {
        eyebrow: "THE QUESTION CONTINUES",
        title: "WHAT ELSE CAN WE DISCOVER?",
        subtitle: "A dedication from ARTDACI",
        body: "If Leonardo were among us today, one can imagine his fascination with these possibilities. He might walk through virtual reconstructions of his workshops, examine the human body layer by layer in three dimensions, simulate the flight of his visionary machines, and explore paintings from every angle. ARTDACI does not seek to modernise Leonardo’s art; it seeks to continue his way of thinking. It celebrates the belief that technology reaches its highest purpose when it deepens human understanding, enriches culture, and awakens imagination. May every reader feel the wonder that guided Leonardo throughout his life. May every masterpiece become a doorway to discovery, and every innovation remind us that progress begins with curiosity. To Leonardo—whose genius transcended centuries, whose imagination knew no boundaries, and whose legacy continues to inspire humanity—this book is respectfully and gratefully dedicated. Your works belong to history. Your ideas belong to the future. Your spirit belongs to us all."
      }
    ]
  },
  fr: {
    pages: [
      {
        eyebrow: "PRÉSENTATION D’ARTDACI",
        title: "UN LIVRE IMPRIMÉ. UN MUSÉE VIVANT.",
        subtitle: "Art, connaissance et découverte immersive",
        body: "ARTDACI est bien davantage qu’une collection de peintures extraordinaires. C’est une invitation à redécouvrir le patrimoine artistique mondial avec les outils du XXIe siècle, tout en honorant le génie de la Renaissance. Chaque page imprimée constitue un espace autonome de lecture et d’observation, puis devient une porte vers une exploration plus profonde. Intelligence artificielle, réalité augmentée, réalité virtuelle, expériences 3D interactives, récits immersifs, son, vidéo et informatique spatiale permettent d’expérimenter les chefs-d’œuvre autant que de les contempler. Ces technologies ne sont pas de simples effets spectaculaires : elles deviennent des instruments de curiosité, d’apprentissage, d’accessibilité et de créativité."
      },
      {
        eyebrow: "À LÉONARD DE VINCI",
        title: "UN ESPRIT QUI A CHANGÉ LE TEMPS",
        subtitle: "Certains transforment leur époque. Très peu transforment l’avenir.",
        body: "Plus de cinq siècles après la vie remarquable de Léonard de Vinci, ses peintures captivent toujours des millions de personnes, ses carnets inspirent artistes, scientifiques et ingénieurs, et son insatiable curiosité demeure un modèle. Léonard n’acceptait pas les limites de son temps. Il regardait au-delà du visible, questionnait les certitudes et imaginait ce que d’autres croyaient impossible. Il unissait l’art et la science comme deux expressions d’une même recherche de vérité par l’observation, l’imagination et la création. Il n’a connu ni la VR, ni l’AR, ni la modélisation 3D ou l’informatique spatiale sous leurs formes modernes. Pourtant, ses recherches sur l’optique, la perspective, l’anatomie, le mouvement, les machines et l’espace en font un précurseur intellectuel de la curiosité qui anime les médias immersifs."
      },
      {
        eyebrow: "LA QUESTION CONTINUE",
        title: "QUE POUVONS-NOUS ENCORE DÉCOUVRIR ?",
        subtitle: "Une dédicace d’ARTDACI",
        body: "Si Léonard était parmi nous, on imagine sa fascination : il parcourrait des reconstitutions virtuelles de ses ateliers, examinerait le corps humain couche après couche en trois dimensions, simulerait le vol de ses machines et explorerait les tableaux sous tous leurs angles. ARTDACI ne cherche pas à moderniser son art, mais à prolonger sa manière de penser. La technologie atteint son but le plus élevé lorsqu’elle approfondit la compréhension humaine, enrichit la culture et éveille l’imagination. Puisse chaque lecteur ressentir l’émerveillement qui guida Léonard. Puisse chaque chef-d’œuvre devenir une porte vers la découverte, et chaque innovation nous rappeler que le progrès commence par la curiosité. À Léonard—dont le génie a traversé les siècles, dont l’imagination ne connaissait aucune frontière et dont l’héritage continue d’inspirer l’humanité—ce livre est respectueusement dédié. Vos œuvres appartiennent à l’histoire. Vos idées appartiennent à l’avenir. Votre esprit appartient à tous."
      }
    ]
  },
  ar: {
    pages: [
      {
        eyebrow: "تقديم ARTDACI",
        title: "كتاب مطبوع. متحف حي.",
        subtitle: "الفن والمعرفة والاكتشاف الغامر",
        body: "ARTDACI ليس مجرد مجموعة من اللوحات الاستثنائية، بل دعوة إلى إعادة اكتشاف التراث الفني العالمي بأدوات القرن الحادي والعشرين مع تكريم عبقرية عصر النهضة. تشكل كل صفحة مطبوعة مساحة مستقلة للقراءة والتأمل، ثم تتحول إلى بوابة لاستكشاف أعمق. يتيح الذكاء الاصطناعي والواقع المعزز والواقع الافتراضي والتجارب التفاعلية ثلاثية الأبعاد والسرد الغامر والصوت والفيديو والحوسبة المكانية اختبار روائع الفن إلى جانب تأملها. ولا تقدم هذه التقنيات لمجرد الإبهار، بل بوصفها أدوات للفضول والتعلم والإتاحة والإبداع، ووسائل لدخول التاريخ ورؤية الفن من زوايا جديدة."
      },
      {
        eyebrow: "إلى ليوناردو دافنشي",
        title: "عقل غيّر الزمن",
        subtitle: "بعض الناس يغيرون عصرهم، وقلة نادرة تغير المستقبل.",
        body: "بعد أكثر من خمسة قرون على حياة ليوناردو دافنشي المدهشة، ما زالت لوحاته تأسر الملايين، وما زالت دفاتره تلهم الفنانين والعلماء والمهندسين، ولا يزال فضوله الذي لا يشبع نموذجاً لكل من يسعى إلى الفهم والإبداع. لم يقبل ليوناردو حدود عصره؛ نظر إلى ما وراء المرئي، وشكك في المسلّمات، وتخيل ما اعتبره الآخرون مستحيلاً. وجمع بين الفن والعلم باعتبارهما تعبيرين عن بحث واحد عن الحقيقة بالملاحظة والخيال والصنع. لم يعرف الواقع الافتراضي أو المعزز أو النمذجة ثلاثية الأبعاد أو الحوسبة المكانية بصورها الحديثة، لكن أبحاثه في البصريات والمنظور والتشريح والحركة والآلات والفضاء تجعله سلفاً فكرياً للفضول الذي يحرك الوسائط الغامرة."
      },
      {
        eyebrow: "السؤال مستمر",
        title: "ماذا يمكننا أن نكتشف أيضاً؟",
        subtitle: "إهداء من ARTDACI",
        body: "لو كان ليوناردو بيننا اليوم، لتخيلناه مفتوناً بهذه الإمكانات؛ يتجول في نماذج افتراضية لمحترفه، ويفحص جسم الإنسان طبقة بعد طبقة في ثلاثة أبعاد، ويحاكي طيران آلاته، ويستكشف اللوحات من جميع الزوايا. لا يسعى ARTDACI إلى تحديث فن ليوناردو، بل إلى مواصلة طريقته في التفكير. فالتكنولوجيا تبلغ أسمى غاياتها عندما تعمق الفهم الإنساني وتثري الثقافة وتوقظ الخيال. لعل كل قارئ يشعر بالدهشة التي قادت ليوناردو طوال حياته، ولعل كل تحفة تصبح باباً إلى الاكتشاف، وكل ابتكار يذكرنا بأن التقدم يبدأ بالفضول. إلى ليوناردو، الذي تجاوزت عبقريته القرون ولم يعرف خياله حدوداً وما زال إرثه يلهم الإنسانية، يُهدى هذا الكتاب بكل احترام وامتنان. أعمالك ملك للتاريخ. أفكارك ملك للمستقبل. وروحك ملك لنا جميعاً."
      }
    ]
  }
};

const BOOK_IMAGE_GALLERIES = {
  "mona-lisa": [
    "assets/artists/leonardo-da-vinci/artworks/mona-lisa/images/mona-lisa-out-of-frame.png",
    "assets/artists/leonardo-da-vinci/artworks/mona-lisa/images/davinci-monalisa.png",
    "assets/artists/leonardo-da-vinci/artworks/mona-lisa/images/monalisa-t.png"
  ],
  "van-gogh": [
    "assets/artists/vincent-van-gogh/artworks/self-portrait/images/van-gogh-out-of-frame.png",
    "assets/artists/vincent-van-gogh/artworks/self-portrait/images/van-gogh-in-bedroom-standing.png",
    "assets/artists/vincent-van-gogh/artworks/self-portrait/images/van-gogh-portrait.jpg"
  ],
  "van-gogh-bedroom": [
    "assets/artists/vincent-van-gogh/artworks/the-bedroom/images/bed-van-gogh.jpeg",
    "assets/artists/vincent-van-gogh/artworks/the-bedroom/images/van-gogh-bedroom-t.png"
  ],
  "vermeer-girl-with-a-pearl-earring": [
    "assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/images/girl-with-a-pearl-earring-standing.jpg",
    "assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/images/vermeer-girl-with-a-pearl-earring-sitting.png",
    "assets/artists/johannes-vermeer/artworks/girl-with-a-pearl-earring/images/vermeer-girl-with-a-pearl-earring-room.png"
  ],
  "monet-impression-sunrise": [
    "assets/artists/claude-monet/collection/impression-sunrise-monet.webp",
    "assets/artists/claude-monet/collection/water-lilies-monet.webp",
    "assets/artists/claude-monet/collection/the-japanese-bridge-monet.webp"
  ],
  "lady-with-an-ermine": ["assets/artists/leonardo-da-vinci/collection/the-lady-with-an-ermine-davinci.webp"],
  "view-of-delft": ["assets/artists/johannes-vermeer/collection/view-of-delft-vermeer.webp"],
  "pont-d-argenteuil": ["assets/artists/claude-monet/collection/le-pont-d-argenteuil-monet.webp"]
};

const BOOK_SECTION_COPY = {
  en: {
    story: "STORY & CONTEXT",
    looking: "LOOK CLOSER",
    technique: "MATERIALS & DISCOVERIES",
    legacy: "MEANING & LEGACY",
    notice: "DETAILS TO REMEMBER"
  },
  fr: {
    story: "HISTOIRE ET CONTEXTE",
    looking: "REGARDER DE PLUS PRÈS",
    technique: "MATIÈRES ET DÉCOUVERTES",
    legacy: "SENS ET HÉRITAGE",
    notice: "DÉTAILS À RETENIR"
  },
  ar: {
    story: "القصة والسياق",
    looking: "نظرة أقرب",
    technique: "المواد والاكتشافات",
    legacy: "المعنى والإرث",
    notice: "تفاصيل جديرة بالتذكر"
  }
};

const PEOPLE_BEHIND_PAINTERS = {
  "van-gogh": {
    image: "assets/artists/vincent-van-gogh/supporters/images/vincent-van-gogh-jo-van-gogh-bonger.png",
    manifest: { slug: "van-gogh-jo" },
    en: {
      eyebrow: "THE PEOPLE BEHIND THE PAINTER",
      title: "JO VAN GOGH-BONGER",
      subtitle: "The strategist who built Vincent's legacy",
      body: "After Vincent died in 1890 and Theo in 1891, Jo inherited hundreds of works and the brothers' correspondence. Through carefully chosen sales, loans, exhibitions, and relationships with critics and collectors, she created sustained public interest without dispersing the collection. Her 1905 Stedelijk Museum exhibition presented 472 works; in 1914 she published Vincent's letters to Theo in three volumes. Her patient work was decisive in transforming a little-understood legacy into international recognition. Scan the image to see the available 3D model and hear a musical introduction followed by the English narration."
    },
    fr: {
      eyebrow: "LES PERSONNES DERRIÈRE LE PEINTRE",
      title: "JO VAN GOGH-BONGER",
      subtitle: "La stratège qui construisit l'héritage de Vincent",
      body: "Après la mort de Vincent en 1890 puis celle de Theo en 1891, Jo hérite de centaines d'œuvres et de la correspondance des deux frères. Par des ventes choisies, des prêts, des expositions et ses liens avec critiques et collectionneurs, elle suscite durablement l'intérêt sans disperser la collection. Son exposition de 1905 au Stedelijk Museum réunit 472 œuvres ; en 1914, elle publie en trois volumes les lettres de Vincent à Theo. Son travail patient fut décisif pour la reconnaissance internationale de Van Gogh. Scannez l'image pour voir le modèle 3D disponible, puis écouter l'introduction musicale et la narration française."
    },
    ar: {
      eyebrow: "الأشخاص وراء الفنان",
      title: "جو فان غوخ-بونغر",
      subtitle: "الاستراتيجية التي بنت إرث فنسنت",
      body: "بعد وفاة فنسنت سنة 1890 ثم ثيو سنة 1891، ورثت جو مئات الأعمال ومراسلات الأخوين. ومن خلال المبيعات المدروسة والإعارات والمعارض وعلاقاتها بالنقاد والجامعين، بنت اهتماماً دائماً من دون تفكيك المجموعة. عرض معرضها في متحف ستيديليك سنة 1905 ما مجموعه 472 عملاً، ونشرت سنة 1914 رسائل فنسنت إلى ثيو في ثلاثة مجلدات. كان عملها الصبور حاسماً في بناء شهرة فان غوخ العالمية. امسح الصورة لعرض النموذج الثلاثي الأبعاد المتاح وسماع مقدمة موسيقية تتبعها الرواية العربية."
    }
  }
};

const BOOK_FRENCH_TEXT = {
  "mona-lisa": {
    story: "Léonard commence ce portrait à Florence au début du XVIe siècle. Le modèle est généralement identifié comme Lisa Gherardini, épouse du marchand Francesco del Giocondo. Léonard conserva pourtant le tableau et continua probablement à le retravailler pendant plusieurs années. Cette lente élaboration transforme un portrait privé en une étude ambitieuse de la présence humaine, de la lumière et de la nature.",
    looking: "La pose de trois quarts remplace le profil rigide encore courant dans les portraits florentins. Les mains croisées forment une base stable, tandis que l’absence presque totale de bijoux concentre l’attention sur le visage, le geste et la présence psychologique. À l’arrière-plan, routes, eau et montagnes se dissolvent dans l’atmosphère. Le sourire paraît changer parce que ses transitions très douces sollicitent différemment la vision centrale et périphérique.",
    technique: "Le sfumato naît de fines couches transparentes qui atténuent contours et contrastes comme une légère fumée. L’imagerie scientifique révèle aussi des modifications des doigts, du voile et du paysage : Léonard construisait l’œuvre par observation et révision. Le vieillissement des vernis et des couches picturales a modifié certaines couleurs et certains contrastes. Peinte sur un panneau de peuplier devenu fragile, La Joconde est donc conservée avec prudence dans une vitrine à température et humidité contrôlées.",
    legacy: "La virtuosité de l’œuvre, la réputation de Léonard, le vol spectaculaire de 1911 et d’innombrables reproductions ont fait de La Joconde une icône mondiale. Elle a influencé le portrait psychologique et l’union de la figure avec le paysage, avant d’être réinterprétée par Marcel Duchamp, Andy Warhol et la culture populaire. Son pouvoir demeure pourtant dans de très petites décisions visuelles qui récompensent un regard lent."
  },
  "van-gogh": {
    story: "Van Gogh peint cet autoportrait à Paris en 1887, au moment où il découvre l’impressionnisme, le néo-impressionnisme et les nouvelles théories de la couleur. Faute d’argent pour payer régulièrement des modèles, il utilise son propre visage comme laboratoire. Chaque autoportrait lui permet d’étudier la ressemblance, l’expression et la manière dont une touche visible peut traduire un état intérieur.",
    looking: "La tête, légèrement tournée, se détache d’un fond bleu-vert parcouru de touches courtes. Les rouges et orangés de la barbe vibrent contre leurs couleurs complémentaires. Les coups de pinceau suivent le front, les pommettes, la barbe et la veste au lieu de disparaître dans un modelé académique. Le regard fixe stabilise cette surface agitée et donne au portrait sa tension psychologique.",
    technique: "Van Gogh construit les volumes avec la direction, l’épaisseur et la couleur des touches. Les marques serrées du visage décrivent sa structure, tandis que le fond forme une atmosphère mouvante. Les contrastes rouge-vert et orange-bleu témoignent de ses recherches parisiennes. Cette méthode prépare le langage plus libre et expressif qu’il développera ensuite à Arles et à Saint-Rémy.",
    legacy: "Van Gogh peint environ 35 à 36 autoportraits, presque tous entre 1886 et 1889, dont plus de vingt à Paris. Ensemble, ils forment un journal visuel : palette d’abord sombre, découverte des couleurs impressionnistes et néo-impressionnistes, affirmation de son identité de peintre, puis images plus tourmentées d’Arles et de Saint-Rémy. Ils ont montré aux expressionnistes que la vérité psychologique pouvait compter autant que la ressemblance physique."
  },
  "van-gogh-bedroom": {
    story: "Van Gogh peint sa chambre de la Maison jaune à Arles en octobre 1888, peu avant l’arrivée de Paul Gauguin. Il rêvait d’y créer un « atelier du Midi » réunissant des artistes. Cette pièce modeste représentait pour lui un premier foyer personnel et un refuge. Dans une lettre à son frère Theo, il explique que la couleur devait suggérer le repos et « reposer l’imagination ».",
    looking: "La chambre réelle était trapézoïdale, mais Van Gogh accentue encore ses angles. Le sol semble se relever et les meubles basculer vers le visiteur. Le lit jaune domine la droite, tandis que les chaises, la table, la fenêtre et les tableaux forment un rythme de rectangles. Les contours épais et les aplats inspirés des estampes japonaises rendent l’espace volontairement plus expressif que réaliste.",
    technique: "Van Gogh décrivait des murs violet pâle, un sol rouge fané, des meubles jaune chrome et une couverture écarlate. Des pigments rouges sensibles à la lumière ont disparu peu à peu : les murs paraissent aujourd’hui plus bleus et le sol moins rose. Les analyses ont aussi confirmé les dégâts d’eau de la première version et révélé des fragments de journal utilisés pour maintenir la peinture qui s’écaillait.",
    legacy: "Van Gogh réalisa trois versions authentiques : Amsterdam en 1888 (72,4 × 91,3 cm), Chicago en 1889 au format presque identique (73,6 × 92,3 cm), puis une réduction destinée à sa mère et à sa sœur, aujourd’hui à Paris (57,3 × 73,5 cm). Elles font évoluer une même image : chambre vécue dans la Maison jaune, chambre remémorée à Saint-Rémy, puis refuge privé communiqué à sa famille. Les portraits au mur, la touche et les rapports de couleur changent selon les versions."
  },
  "vermeer-girl-with-a-pearl-earring": {
    story: "Peinte à Delft vers 1665, l’œuvre est une tronie : une étude de caractère et de costume, non un portrait officiel destiné à identifier une personne. L’identité du modèle reste inconnue. Le turban imaginaire, la pose tournée et l’arrière-plan sombre détachent la jeune fille de la vie quotidienne et créent un instant suspendu.",
    looking: "Le corps se tourne dans une direction tandis que la tête revient vers nous. Le regard direct et les lèvres entrouvertes créent un instant suspendu. Vermeer ne dessine pas fermement le nez ni la « perle » : quelques reflets suffisent, et notre perception complète les formes absentes. La lumière relie les yeux, la bouche, la joue, le col et le bijou pour faire émerger une présence vivante de l’obscurité.",
    technique: "Vermeer emploie un outremer naturel coûteux, obtenu à partir de lapis-lazuli, pour le foulard bleu. Le fond était autrefois une surface vert sombre plus brillante, dont les pigments organiques ont pâli. L’étude scientifique de 2018 a utilisé microscope 3D, MA-XRF et imagerie infrarouge. Elle a révélé de minuscules cils et confirmé que la « perle » n’a ni contour complet ni crochet visible. Sa taille inhabituelle et son reflet évoquent peut-être du métal poli, du verre ou un bijou imaginé plutôt qu’une véritable perle.",
    legacy: "Acquise en 1881 pour seulement deux florins et trente centimes, l’œuvre entre au Mauritshuis en 1902. Sa simplicité, son silence narratif et son identité ouverte ont inspiré romans, cinéma, photographie et mode. Les théories sur une camera obscura restent possibles mais non prouvées : aucune preuve documentaire ou trace matérielle ne confirme l’emploi d’un appareil précis."
  },
  "monet-impression-sunrise": {
    story: "Monet peint l’avant-port du Havre depuis la fenêtre de l’hôtel de l’Amirauté, au petit matin, vers novembre 1872. Présentée en 1874 lors de la première exposition du groupe indépendant, la toile inspire au critique Louis Leroy le terme « impressionnistes ». Ce mot moqueur devient bientôt le nom d’une révolution artistique.",
    looking: "Les barques sombres conduisent le regard vers les mâts, grues et cheminées qui se dissolvent dans la brume. Le soleil orange légèrement décentré et son reflet vertical interrompu forment l’axe principal, équilibré par les touches horizontales de l’eau. Monet construit ainsi la profondeur avec la lumière, la vapeur et quelques silhouettes plutôt qu’avec une description détaillée.",
    technique: "Des touches rapides, minces et visibles préservent l’aspect fugitif de l’aube. Les gris bleutés dominent, tandis que l’orange complémentaire du soleil paraît vibrer. De près, eau et barques se décomposent en marques économes ; à distance, l’œil les rassemble en une scène convaincante. Les barques et le reflet, ajoutés vers la fin, conservent la vitesse de l’observation.",
    legacy: "Cette toile modeste d’environ 48 × 63 cm a contribué à donner son nom à l’impressionnisme et à déplacer l’ambition de la peinture : saisir une lumière et une perception momentanée pouvait compter davantage qu’une description achevée. Son port moderne associe beauté naturelle, industrie et mobilité. L’œuvre est aujourd’hui conservée au musée Marmottan Monet à Paris."
  }
};

const BOOK_ARABIC_TEXT = {
  "mona-lisa": {
    story: "بدأ ليوناردو هذا البورتريه في فلورنسا مطلع القرن السادس عشر. وتُعرَّف الجالسة عموماً بأنها ليزا غيرارديني، زوجة التاجر فرانشيسكو دل جوكوندو. لكنه احتفظ باللوحة وواصل على الأرجح تنقيحها سنوات. وحوّل هذا العمل البطيء صورةً خاصة إلى دراسة طموحة للحضور الإنساني والضوء والجو وتحولات الطبيعة.",
    looking: "تحل وضعية الثلاثة أرباع الطبيعية محل المقطع الجانبي الجامد الشائع في البورتريه الفلورنسي الأقدم. تمنح اليدان المتقاطعتان التكوين قاعدة ثابتة، ويُركّز الغياب شبه الكامل للمجوهرات الانتباه على الوجه والإيماءة والحضور النفسي. تتلاشى الطرق والمياه والجبال في العمق الجوي. وتبدو الابتسامة متغيرة لأن تدرجاتها الناعمة تُدرَك بصورة مختلفة في الرؤية المركزية والطرفية.",
    technique: "تتكون تقنية السفوماتو من طبقات شفافة بالغة الرقة تلطف الحواف والتباينات كالدخان. وتكشف الصور العلمية تعديلات في الأصابع والوشاح والوجه والمنظر الطبيعي، ما يبين أن ليوناردو طوّر العمل بالملاحظة والمراجعة المتكررتين. كما غيّر تقادم الورنيش وطبقات اللون بعض الألوان والتباينات. ولأن اللوحة منفذة على لوح حور أصبح هشاً، تُحفظ اليوم بحذر في متحف اللوفر داخل صندوق مضبوط الحرارة والرطوبة.",
    legacy: "حوّلت البراعة التقنية وسمعة ليوناردو والسرقة الشهيرة سنة 1911 والنسخ التي لا تحصى الموناليزا إلى أيقونة عالمية. أثرت في البورتريه النفسي وفي دمج الشخصية بالمنظر الطبيعي، ثم أعاد فنانون مثل مارسيل دوشان وآندي وارهول والثقافة الشعبية تفسيرها. ومع ذلك، تكمن قوتها الدائمة في قرارات بصرية هادئة تكافئ التأمل البطيء."
  },
  "van-gogh": {
    story: "رسم فان غوخ هذا البورتريه الذاتي في باريس سنة 1887، حين كان يستوعب الانطباعية والانطباعية الجديدة ونظريات اللون الحديثة. ولأنه نادراً ما استطاع دفع أجر عارض محترف، اتخذ من وجهه مختبراً عملياً. أتاحت له كل صورة ذاتية اختبار الشبه والتعبير والألوان المتكاملة وقدرة ضربات الفرشاة الظاهرة على نقل الحالة الداخلية.",
    looking: "يدور الرأس قليلاً أمام حقل أزرق مخضر من الضربات القصيرة. وتهتز درجات الأحمر والبرتقالي في اللحية قبالة ألوانها المتكاملة. وبدلاً من الاختفاء في تظليل أكاديمي ناعم، تتبع الضربات الجبهة والوجنتين واللحية والسترة والهواء المحيط. يثبّت النظر المباشر هذا السطح المضطرب ويمنح الصورة توترها النفسي.",
    technique: "يبني فان غوخ الشكل من اتجاه كل ضربة وسماكتها ولونها. تصف العلامات المتراصة بنية الوجه، بينما تتحول الخلفية إلى جو متحرك. وتعكس تباينات الأحمر والأخضر والبرتقالي والأزرق تجاربه الباريسية. ومهّدت هذه الطريقة للغة البصرية الأكثر حرية وتعبيراً التي طورها لاحقاً في آرل وسان ريمي.",
    legacy: "رسم فان غوخ نحو 35 إلى 36 بورتريهاً ذاتياً، معظمها بين 1886 و1889، وأكثر من عشرين منها في باريس. تشكل هذه الأعمال معاً يوميات بصرية تنتقل من الألوان الداكنة إلى تجارب الانطباعية والانطباعية الجديدة، ثم إلى تأكيد هويته كرسام والصور الأكثر اضطراباً وتأملاً في آرل وسان ريمي. وقد ألهمت الأجيال اللاحقة للبحث عن الصدق النفسي لا التشابه فقط."
  },
  "van-gogh-bedroom": {
    story: "رسم فان غوخ غرفته في البيت الأصفر بآرل في أكتوبر 1888، قبل وصول بول غوغان بقليل. وكان يأمل أن يؤسس هناك «مرسم الجنوب» المشترك بين الفنانين. مثّلت الغرفة المتواضعة أول بيت خاص به وملاذاً شخصياً. وشرح في رسالة إلى أخيه ثيو أن ألوانها ينبغي أن توحي بالراحة وأن «تريح الخيال».",
    looking: "كانت الغرفة الحقيقية شبه منحرفة، لكن فان غوخ شدّد زواياها غير المنتظمة. تبدو الأرضية صاعدة والأثاث مائلاً نحو المشاهد. يهيمن السرير الأصفر على الجانب الأيمن، فيما تصنع الكراسي والطاولة والنافذة والصور إيقاعاً من المستطيلات. وتجعل الخطوط السميكة والمساحات اللونية المسطحة، المستلهمة جزئياً من المطبوعات اليابانية، المكان تعبيرياً لا مطابقاً للمنظور البصري.",
    technique: "وصف فان غوخ جدراناً بنفسجية باهتة وأرضية حمراء خافتة وأثاثاً أصفر كرومياً وغطاءً قرمزياً. وبهتت الأصباغ الحمراء الحساسة للضوء تدريجياً، لذلك تبدو الجدران اليوم أكثر زرقة والأرضية أقل وردية. كما أكدت الدراسات التقنية تضرر النسخة الأولى بالماء، وكشفت أجزاء من صحيفة ثبّتها فان غوخ للمحافظة على الطلاء المتقشر.",
    legacy: "أنجز فان غوخ ثلاث نسخ أصلية: نسخة أمستردام سنة 1888 (72.4 × 91.3 سم)، ونسخة شيكاغو سنة 1889 بالحجم نفسه تقريباً (73.6 × 92.3 سم)، ثم نسخة أصغر لأمه وأخته محفوظة اليوم في باريس (57.3 × 73.5 سم). تمثل الأولى الغرفة التي عاش فيها، والثانية الغرفة التي استعادها من الذاكرة في سان ريمي، والثالثة صورة خاصة نقل بها تجربته إلى عائلته. كما تتغير الصور المعلقة واللمسات والعلاقات اللونية بين النسخ."
  },
  "vermeer-girl-with-a-pearl-earring": {
    story: "رُسمت هذه اللوحة في دلفت نحو سنة 1665، وهي «تروني»: دراسة لشخصية وملابس غير مألوفة، لا بورتريهاً رسمياً هدفه توثيق هوية شخص بعينه. ولا تزال هوية الجالسة مجهولة. ويُخرج العمام المتخيل ووضعية الالتفات والخلفية المظلمة الفتاة من الحياة الهولندية اليومية، ويصنع لحظة لقاء معلقة.",
    looking: "يدور الجسد في اتجاه بينما يعود الرأس نحو المشاهد، فينشأ لقاء مباشر ولحظة معلقة. لا يرسم فيرمير الأنف أو «اللؤلؤة» بحدود كاملة؛ تكفي لمعات قليلة ويكمل إدراكنا الأشكال الناقصة. يربط الضوء العينين والشفاه والخد والياقة والحلية ليجعل الشخصية تخرج حية من الظلام.",
    technique: "استخدم فيرمير الأزرق فوق البحري الطبيعي الثمين المصنوع من اللازورد في غطاء الرأس. وكانت الخلفية في الأصل خضراء داكنة وأكثر لمعاناً قبل أن تبهت أصباغها العضوية. واستخدم فحص سنة 2018 المجهر الثلاثي الأبعاد وتقنية MA-XRF والتصوير بالأشعة تحت الحمراء. فكشف رموشاً دقيقة وأكد أن «اللؤلؤة» بلا محيط كامل أو خطاف ظاهر. ويوحي حجمها غير المعتاد وانعكاسها بأنها قد تكون معدناً مصقولاً أو زجاجاً أو حُلية متخيلة لا لؤلؤة حقيقية.",
    legacy: "اشتُريت اللوحة سنة 1881 بفلورينين وثلاثين سنتاً فقط، ودخلت مجموعة موريتشهاوس سنة 1902. وقد ألهم اقتصادها البصري وصمتها السردي وهويتها المفتوحة الروايات والسينما والتصوير والأزياء. وتظل فرضيات استخدام الحجرة المظلمة ممكنة لكنها غير مثبتة، إذ لا تؤكد وثيقة أو علامة مادية استعمال فيرمير جهازاً بصرياً بعينه."
  },
  "monet-impression-sunrise": {
    story: "رسم مونيه الميناء الخارجي في لوهافر من غرفة في فندق الأميرالية عند الصباح الباكر، نحو نوفمبر 1872. وعندما عُرضت اللوحة سنة 1874 في أول معرض للمجموعة المستقلة، دفعت الناقد لويس لوروا إلى استعمال تسمية «الانطباعيين». فتحولت كلمة ساخرة إلى اسم ثورة فنية.",
    looking: "تقود القوارب الداكنة العين نحو الصواري والرافعات والمداخن الذائبة في الضباب. وتشكل الشمس البرتقالية المنحرفة قليلاً عن المركز وانعكاسها العمودي المتقطع المحور الرئيسي، وتوازنها الضربات الأفقية للماء. وهكذا يبني مونيه العمق بالضوء والبخار وبضع ظلال بدلاً من الوصف المفصل.",
    technique: "تحافظ الضربات الرقيقة والسريعة والظاهرة على المظهر العابر للفجر. تهيمن الدرجات الزرقاء الرمادية، فيما تبدو الشمس البرتقالية المكملة نابضة. من قرب، تتفكك المياه والقوارب إلى علامات مقتصدة؛ ومن بعيد، تجمعها العين في مشهد مقنع. وقد أضيفت القوارب والانعكاس قرب النهاية، فظلّت سرعة الملاحظة حاضرة على السطح.",
    legacy: "ساهمت هذه اللوحة المتواضعة، التي تبلغ نحو 48 × 63 سم، في منح الانطباعية اسمها وفي تغيير طموح الرسم: صار التقاط الضوء والإدراك اللحظي أهم من الوصف المصقول. ويجمع ميناؤها الحديث بين جمال الطبيعة والصناعة والحركة. وتُحفظ اللوحة اليوم في متحف مارموتان مونيه في باريس."
  }
};

const BOOK_ENGLISH_TEXT = {
  "mona-lisa": {
    story: "Leonardo began this portrait in Florence in the early sixteenth century. The sitter is generally identified as Lisa Gherardini, wife of the merchant Francesco del Giocondo. Leonardo nevertheless kept the painting and probably refined it over several years. That slow process transformed a private likeness into an ambitious study of human presence, light, atmosphere, and the changing forms of nature.",
    looking: "The natural three-quarter pose replaces the rigid profile common in earlier Florentine portraits. Folded hands create a stable base, while the near absence of jewellery concentrates attention on the face, gesture, and psychological presence. Behind her, roads, water, and mountains dissolve into atmospheric distance. The smile seems to shift because its soft tonal transitions register differently in central and peripheral vision.",
    technique: "Sfumato is built from extremely thin translucent layers that soften edges and contrasts like smoke. Scientific imaging also reveals changes to the fingers, veil, face, and landscape: Leonardo developed the work through repeated observation and revision. Ageing varnish and paint layers have altered some colours and contrasts. Painted on a fragile poplar panel, the Mona Lisa is therefore conserved cautiously in a temperature- and humidity-controlled case.",
    legacy: "Technical brilliance, Leonardo’s reputation, the spectacular 1911 theft, and endless reproduction turned the Mona Lisa into a global icon. It shaped psychological portraiture and the integration of figure and landscape, then became material for artists including Marcel Duchamp and Andy Warhol. Its lasting power, however, lies in many quiet visual decisions that reward slow looking."
  },
  "van-gogh": {
    story: "Van Gogh painted this self-portrait in Paris in 1887, while absorbing Impressionism, Neo-Impressionism, and modern colour theory. Because he could rarely afford professional models, he used his own face as a practical laboratory. Each self-portrait allowed him to test likeness, expression, complementary colour, and the ability of visible brushwork to communicate an inner state.",
    looking: "The head turns slightly against a blue-green field of short strokes. Reds and oranges in the beard vibrate against their complementary colours. Instead of disappearing into smooth academic modelling, the brushmarks follow the forehead, cheekbones, beard, jacket, and surrounding air. The fixed gaze steadies this restless surface and gives the portrait its psychological tension.",
    technique: "Van Gogh builds form through the direction, thickness, and colour of individual strokes. Closely packed marks describe the structure of the face while the background becomes a moving atmosphere. Red-green and orange-blue contrasts reflect his experiments in Paris. This method prepares the freer, more expressive visual language he would develop in Arles and Saint-Rémy.",
    legacy: "Van Gogh painted approximately 35–36 self-portraits, almost all between 1886 and 1889, including more than twenty in Paris. Together they form a visual diary: a darker early palette gives way to Impressionist and Neo-Impressionist colour, the assertion of his identity as a painter, and the more turbulent, introspective images of Arles and Saint-Rémy. They showed later Expressionists that psychological truth could matter as much as physical likeness."
  },
  "van-gogh-bedroom": {
    story: "Van Gogh painted his room in the Yellow House at Arles in October 1888, shortly before Paul Gauguin arrived. He hoped to create a shared “Studio of the South” there. The modest bedroom represented his first home of his own and a private refuge. In a letter to Theo, he explained that its colours should suggest rest and “repose the imagination.”",
    looking: "The real room was trapezoidal, but Van Gogh heightened its irregular angles. The floor appears to tilt upward and the furniture seems to fall toward the viewer. The yellow bed dominates the right side while chairs, table, window, and pictures create a rhythm of rectangles. Thick outlines and flat colour, inspired partly by Japanese prints, make the space expressive rather than optically correct.",
    technique: "Van Gogh described pale violet walls, a faded red floor, chrome-yellow furniture, and a scarlet blanket. Light-sensitive red pigments gradually faded, so the walls now look bluer and the floor less pink. Technical study also confirmed water damage to the first version and found fragments of newspaper that Van Gogh attached to hold flaking paint in place.",
    legacy: "Van Gogh made three authentic versions: Amsterdam in 1888 (72.4 × 91.3 cm), Chicago in 1889 at nearly the same scale (73.6 × 92.3 cm), and a smaller repetition for his mother and sister, now in Paris (57.3 × 73.5 cm). They transform one image from a bedroom experienced in the Yellow House, to a room remembered at Saint-Rémy, to a private refuge communicated to his family. The wall portraits, brushwork, and colour relationships also change between versions."
  },
  "vermeer-girl-with-a-pearl-earring": {
    story: "Painted in Delft around 1665, this work is a tronie—a study of character and unusual costume rather than a formal portrait intended to record one person’s identity. The sitter remains unknown. The imagined turban, turning pose, and dark background remove the girl from everyday Dutch life and create a suspended moment of encounter.",
    looking: "Her body turns one way while her head returns toward us, creating direct contact and a suspended moment. Vermeer gives neither the nose nor the ‘pearl’ a firm contour: a few highlights suffice, and perception completes the missing forms. Light connects eyes, lips, cheek, collar, and jewel, bringing a living presence out of darkness.",
    technique: "Vermeer used costly natural ultramarine made from lapis lazuli in the blue headscarf. The background was once a glossier deep green but its organic pigments faded. The 2018 examination used 3D microscopy, MA-XRF, and infrared imaging. It revealed tiny eyelashes and confirmed that the “pearl” has neither a complete contour nor a visible hook. Its unusual size and reflection may suggest polished metal, glass, or an imagined jewel rather than a real pearl.",
    legacy: "Bought in 1881 for only two guilders and thirty cents, the painting entered the Mauritshuis collection in 1902. Its visual economy, narrative silence, and open identity have inspired novels, film, photography, and fashion. Camera-obscura theories remain possible but unproven: no document or physical trace confirms that Vermeer used a particular optical device."
  },
  "monet-impression-sunrise": {
    story: "Monet painted the outer harbour of Le Havre from a room in the Hôtel de l’Amirauté in the early morning, around November 1872. Shown in 1874 at the independent group’s first exhibition, the canvas prompted critic Louis Leroy to use the label ‘Impressionists’. A term of ridicule became the name of an artistic revolution.",
    looking: "Dark boats lead the eye toward masts, cranes, and smokestacks dissolving into mist. The slightly off-centre orange sun and its vertical broken reflection form the main axis, balanced by the horizontal strokes of the water. Monet thus builds depth from light, vapour, and a few silhouettes rather than detailed description.",
    technique: "Thin, rapid, visible strokes preserve the fleeting appearance of dawn. Blue-greys dominate while the complementary orange sun seems to vibrate. Close up, water and boats separate into economical marks; from farther away, the eye assembles them into a convincing scene. The boats and reflection, added near the end, retain the speed of observation.",
    legacy: "This modest canvas of approximately 48 × 63 cm helped give Impressionism its name and changed what painting could seek to achieve: capturing light and momentary perception could matter more than polished description. Its modern harbour brings together natural beauty, industry, and movement. The painting is held by the Musée Marmottan Monet in Paris."
  }
};

const params = new URLSearchParams(location.search);
const lang = ["en", "fr", "ar"].includes(params.get("lang")) ? params.get("lang") : "en";
const book = document.getElementById("book");
const sheetsRoot = document.getElementById("book-sheets");
const previousButton = document.getElementById("book-prev");
const nextButton = document.getElementById("book-next");
const progress = document.getElementById("book-progress");
const dialog = document.getElementById("book-experience");
const experienceTitle = document.getElementById("experience-title");
const experienceKicker = document.getElementById("experience-kicker");
const experienceBody = document.getElementById("experience-body");
const closeExperienceButton = document.getElementById("experience-close");
const zoomButton = document.getElementById("book-zoom");

let currentLeaf = 0;
let sheets = [];
let pageDefinitions = [];
let dragStartX = null;
const activePointers = new Map();
let pinchStartDistance = null;
let pinchHandled = false;
let suppressPageClick = false;

init();

async function init() {
  applyLanguage();
  const responses = await Promise.all([...MANIFEST_URLS, ...MUSEUM_MANIFEST_URLS].map((url) => fetch(url)));
  if (responses.some((response) => !response.ok)) throw new Error("Book content is unavailable.");
  const allManifests = await Promise.all(responses.map((response) => response.json()));
  const paintings = allManifests.slice(0, MANIFEST_URLS.length).flat().sort((a, b) => a.bookOrder - b.bookOrder);
  pageDefinitions = buildPageDefinitions(paintings, allManifests.slice(MANIFEST_URLS.length));
  await buildBook(pageDefinitions);
  bindControls();
  updateBook();
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelector(".book-back").href = lang === "ar" ? "index-ar.html" : lang === "fr" ? "index-fr.html" : "index.html";
  document.querySelector(".book-back").textContent = lang === "ar" ? "العودة إلى المجموعة" : lang === "fr" ? "Retour à la collection" : "Back to collection";
  document.querySelector(".book-toolbar p").textContent = lang === "ar" ? "كتاب فني تفاعلي" : lang === "fr" ? "Livre d’art interactif" : "Interactive art book";
  document.querySelector(".book-toolbar h1").textContent = lang === "ar" ? "الكتاب الحي" : lang === "fr" ? "Le Livre Vivant" : "The Living Book";
  document.querySelector(".book-hint").textContent = lang === "ar"
    ? "انقر على الصفحة أو اسحبها أو اقرصها لقلبها. اختر علامة مضيئة لفتح المحتوى الغامر."
    : lang === "fr"
      ? "Cliquez sur une page, balayez ou pincez pour la tourner. Sélectionnez un repère lumineux pour le contenu immersif."
      : "Click a page, swipe, or pinch to turn it. Select a glowing hotspot for immersive content.";
  previousButton.textContent = lang === "ar" ? "→ السابق" : lang === "fr" ? "← Précédent" : "← Previous";
  nextButton.textContent = lang === "ar" ? "التالي ←" : lang === "fr" ? "Suivant →" : "Next →";
  closeExperienceButton.textContent = lang === "ar" ? "العودة إلى الكتاب ✕" : lang === "fr" ? "Retour au livre ✕" : "Return to book ✕";
  zoomButton.textContent = lang === "ar" ? "A+ تكبير" : lang === "fr" ? "A+ Agrandir" : "A+ Enlarge";
}

function buildPageDefinitions(manifests, museums = []) {
  const sectionCopy = BOOK_SECTION_COPY[lang];
  const tribute = LEONARDO_TRIBUTE[lang] || LEONARDO_TRIBUTE.en;
  const openingPages = tribute.pages.map((tributePage, index) => ({
    kind: "tribute",
    ...tributePage,
    image: index < 2 ? "assets/artists/leonardo-da-vinci/artworks/mona-lisa/images/davinci-monalisa.png" : undefined,
    hotspots: index === 0
      ? [
          { label: "VR+", x: 82, y: 24, type: "studio", url: LEONARDO_STUDIO_VR_WORLD_URL },
          { label: "VR++", x: 82, y: 38, type: "studioEnriched", url: LEONARDO_ENRICHED_STUDIO_URL }
        ]
      : []
  }));
  const pages = [
    {
      kind: "cover",
      eyebrow: "ARTDACI",
      title: lang === "ar" ? "روائع فنية حية" : lang === "fr" ? "CHEFS-D’ŒUVRE VIVANTS" : "MASTERPIECES ALIVE",
      subtitle: lang === "ar" ? "كتاب مطبوع، ومتحف مكاني." : lang === "fr" ? "Un livre imprimé. Un musée spatial." : "A printed book. A spatial museum."
    },
    ...openingPages,
    {
      kind: "intro",
      eyebrow: lang === "ar" ? "طريقة الاستكشاف" : lang === "fr" ? "MODE D’EMPLOI" : "HOW TO EXPLORE",
      title: lang === "ar" ? "اقرأ. اختر. ادخل." : lang === "fr" ? "Lisez. Touchez. Entrez." : "Read. Select. Enter.",
      body: lang === "ar"
        ? "اقلب الصفحات كما في كتاب حقيقي. تفتح العلامات المضيئة نماذج ثلاثية الأبعاد وسرداً صوتياً ورسوم حركة ومشاهد غامرة، ثم تعيدك إلى الصفحة نفسها."
        : lang === "fr"
          ? "Tournez les pages comme dans un livre réel. Les repères lumineux ouvrent des objets 3D, des narrations, des animations et des scènes immersives. Fermez l’expérience pour revenir exactement à la page quittée."
          : "Turn pages as you would in a real book. Glowing markers open 3D objects, narration, animation, and immersive scenes. Close an experience to return to the exact page you left."
    }
  ];

  manifests.forEach((manifest, index) => {
    const title = localizedTitle(manifest);
    const audio = getAudio(manifest);
    const videos = manifest.media?.videos || [];
    const texts = getBookTexts(manifest);
    const galleryImages = BOOK_IMAGE_GALLERIES[manifest.slug] || [];
    const hasImmersiveAssets = Boolean((manifest.ar?.primaryModel || manifest.media?.model) && (manifest.ar?.compiledTarget || manifest.print?.compiledMindTarget));
    pages.push({
      kind: "artwork",
      eyebrow: `${String(index + 1).padStart(2, "0")} · ${sectionCopy.story}`,
      title,
      subtitle: `${manifest.artist?.name || ""} · ${manifest.date || ""}`,
      image: manifest.media?.image || manifest.print?.imageTargetSource,
      body: texts.story,
      manifest,
      hotspots: hasImmersiveAssets
        ? [
            { label: "3D", x: 83, y: 23, type: "space" },
            { label: "♪", x: 83, y: 35, type: "audio", audio },
            { label: "AR", x: 83, y: 47, type: "ar" },
            ...(videos[0] ? [{ label: "▶", x: 83, y: 59, type: "video", video: videos[0] }] : [])
          ]
        : [
            { label: "\u266a", x: 83, y: 23, type: "audio", audio },
            { label: "VR", x: 83, y: 38, type: "gallery" }
          ]
    });
    // The sixteen collection additions are complete catalogue pages rather
    // than four-page multimedia chapters. Keeping one illustrated page per
    // work makes all 24 paintings reachable on phones without allocating
    // more than one hundred large canvas textures at once.
    if (manifest.bookOrder > 8) return;
    pages.push({
      kind: "analysis",
      eyebrow: sectionCopy.looking,
      title,
      image: manifest.media?.image || manifest.print?.imageTargetSource,
      galleryImages,
      body: texts.looking,
      manifest,
      hotspots: [
        ...(hasImmersiveAssets ? [{ label: "VR", x: 82, y: 24, type: manifest.slug === "van-gogh-bedroom" ? "world" : "vr" }] : []),
        { label: "◉", x: 82, y: 38, type: "gallery" },
        ...(manifest.slug === "mona-lisa"
          ? [
              { label: "VR+", x: 82, y: 52, type: "studio", url: LEONARDO_STUDIO_VR_WORLD_URL },
              { label: "VR++", x: 82, y: 66, type: "studioEnriched", url: LEONARDO_ENRICHED_STUDIO_URL }
            ]
          : [])
      ]
    });
    pages.push({
      kind: "technique",
      eyebrow: sectionCopy.technique,
      title,
      image: galleryImages[1] || manifest.media?.image || manifest.print?.imageTargetSource,
      body: texts.technique,
      manifest,
      hotspots: hasImmersiveAssets ? [
        ...(videos[0] ? [{ label: "▶", x: 82, y: 25, type: "video", video: videos[0] }] : []),
        { label: "AR", x: 82, y: 39, type: "ar" }
      ] : [{ label: "VR", x: 82, y: 25, type: "gallery" }]
    });
    pages.push({
      kind: "legacy",
      eyebrow: sectionCopy.legacy,
      title,
      image: galleryImages[2] || galleryImages[0] || manifest.media?.image,
      body: texts.legacy,
      facts: lang === "ar" ? [] : (manifest.texts?.interestingFacts || []).slice(0, 3),
      manifest,
      hotspots: hasImmersiveAssets ? [
        { label: "3D", x: 82, y: 24, type: "space" },
        { label: "♪", x: 82, y: 38, type: "audio", audio },
        ...(videos[1] ? [{ label: "▶", x: 82, y: 52, type: "video", video: videos[1] }] : [])
      ] : [
        { label: "\u266a", x: 82, y: 24, type: "audio", audio },
        { label: "VR", x: 82, y: 39, type: "gallery" }
      ]
    });

    const supporter = PEOPLE_BEHIND_PAINTERS[manifest.slug];
    if (supporter) {
      const copy = supporter[lang] || supporter.en;
      pages.push({
        kind: "supporter",
        eyebrow: copy.eyebrow,
        title: copy.title,
        subtitle: copy.subtitle,
        image: supporter.image,
        body: copy.body,
        manifest: supporter.manifest,
        hotspots: [{ label: "AR", x: 83, y: 26, type: "ar" }]
      });
    }
  });

  const museumCopy = lang === "fr"
    ? { eyebrow: "LES CINQ MUSÉES", subtitle: "Image AR et modèle 3D disponibles", body: "Scannez l’image correspondante du livre pour faire apparaître le musée en AR, ou placez son modèle 3D dans votre espace." }
    : lang === "ar"
      ? { eyebrow: "المتاحف الخمسة", subtitle: "صورة واقع معزز ونموذج ثلاثي الأبعاد", body: "امسح صورة المتحف في الكتاب لإظهاره بالواقع المعزز، أو ضع نموذجه الثلاثي الأبعاد في مساحتك." }
      : { eyebrow: "THE FIVE MUSEUMS", subtitle: "Image AR and 3D model available", body: "Scan the matching museum image in the printed book to reveal it in AR, or place its 3D model in your space." };
  museums.forEach((museum) => {
    const localized = museum.localizations?.[lang] || {};
    pages.push({
      kind: "museum",
      eyebrow: museumCopy.eyebrow,
      title: localized.title || museum.title,
      subtitle: museumCopy.subtitle,
      image: museum.media?.image,
      body: `${localized.texts?.artisticAnalysis || museum.texts?.artisticAnalysis || ""} ${museumCopy.body}`,
      manifest: museum,
      hotspots: [
        { label: "AR", x: 83, y: 25, type: "museumAr" },
        { label: "3D", x: 83, y: 39, type: "museumSpace" },
        { label: "VR", x: 83, y: 53, type: "museumVr" }
      ]
    });
  });

  pages.push({
    kind: "back",
    eyebrow: "ARTDACI",
    title: lang === "ar" ? "تابع الاستكشاف" : lang === "fr" ? "CONTINUEZ L’EXPLORATION" : "KEEP EXPLORING",
    subtitle: lang === "ar" ? "تستمر المجموعة داخل معرض الواقع الافتراضي." : lang === "fr" ? "La collection continue dans la galerie VR." : "The collection continues inside the VR Gallery."
  });
  if (pages.length % 2) pages.push({ kind: "blank", title: "" });
  return pages;
}

async function buildBook(pages) {
  const textures = await Promise.all(pages.map(createPageTexture));
  for (let index = 0; index < pages.length; index += 2) {
    const sheet = document.createElement("article");
    sheet.className = "sheet";
    sheet.style.zIndex = String(pages.length - index);

    const front = createPageSurface(pages[index], textures[index], "front");
    const back = createPageSurface(pages[index + 1], textures[index + 1], "back");
    sheet.append(front, back);
    sheetsRoot.appendChild(sheet);
    sheets.push(sheet);
  }
}

function createPageSurface(definition, texture, side) {
  const page = document.createElement("section");
  page.className = `page page-${side}`;
  page.dataset.kind = definition.kind || "";
  if (definition.manifest?.slug) page.dataset.painting = definition.manifest.slug;
  page.setAttribute("aria-label", definition.title || definition.eyebrow || "Book page");
  page.style.backgroundImage = `url("${texture}")`;
  (definition.hotspots || []).forEach((hotspot) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-hotspot";
    button.textContent = hotspot.label;
    // Keep controls on the outside edge of the visible page so they never
    // cover the printed text. A sheet back becomes the left-hand page.
    button.style.left = side === "front" ? "86%" : "14%";
    button.style.top = `${hotspot.y}%`;
    button.setAttribute("aria-label", `${hotspot.type}: ${definition.title}`);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openExperience(definition, hotspot);
    });
    page.appendChild(button);
  });
  page.addEventListener("click", (event) => {
    if (event.target.closest(".page-hotspot") || dialog.open) return;
    if (suppressPageClick) {
      suppressPageClick = false;
      return;
    }
    if (side === "front") nextPage();
    else previousPage();
  });
  return page;
}

async function createPageTexture(definition) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 2200;
  const context = canvas.getContext("2d");
  drawPaper(context, canvas, definition.kind);

  if (definition.kind === "analysis" && definition.galleryImages?.length) {
    const galleryImages = await Promise.all(definition.galleryImages.slice(0, 3).map(loadImage));
    drawImageGallery(context, galleryImages, 130, 350, 1340, 620);
  } else if (definition.image) {
    const image = await loadImage(definition.image);
    if (definition.kind === "artwork") {
      drawCoverImage(context, image, 120, 420, 1360, 760);
    } else {
      drawCoverImage(context, image, 130, 350, 1340, 620);
    }
  }

  drawPageCopy(context, canvas, definition);
  return canvas.toDataURL("image/jpeg", 0.94);
}

function drawImageGallery(context, images, x, y, width, height) {
  const gap = 24;
  const cellWidth = (width - gap * (images.length - 1)) / images.length;
  images.forEach((image, index) => {
    drawCoverImage(context, image, x + index * (cellWidth + gap), y, cellWidth, height);
  });
}

function drawPaper(context, canvas, kind) {
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  if (kind === "cover" || kind === "back") {
    gradient.addColorStop(0, "#762f35");
    gradient.addColorStop(1, "#2a1617");
  } else {
    gradient.addColorStop(0, "#f8f0df");
    gradient.addColorStop(1, "#e4d4bb");
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = kind === "cover" || kind === "back" ? "#d4ac66" : "#9b7448";
  context.lineWidth = 10;
  context.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);
}

function drawPageCopy(context, canvas, definition) {
  const dark = definition.kind === "cover" || definition.kind === "back";
  context.fillStyle = dark ? "#e4bd75" : "#8a303c";
  context.font = "800 38px Arial";
  context.letterSpacing = "4px";
  context.fillText(definition.eyebrow || "", 120, 170);
  context.letterSpacing = "0px";

  context.fillStyle = dark ? "#fff5df" : "#241c16";
  context.font = `700 ${dark ? 108 : 78}px Georgia`;
  const titleY = definition.image ? 280 : 620;
  drawWrappedText(context, definition.title || "", 120, titleY, 1360, dark ? 122 : 92, 4);

  if (definition.subtitle) {
    context.fillStyle = dark ? "#dfcaa6" : "#765b47";
    context.font = "600 42px Arial";
    drawWrappedText(context, definition.subtitle, 120, definition.image ? titleY + 82 : titleY + 285, 1320, 58, 3);
  }

  if (definition.body) {
    const bodyY = definition.kind === "artwork" ? 1280 : definition.image ? 1065 : 990;
    const bodyBottom = definition.facts?.length ? 1650 : 1990;
    context.fillStyle = "rgba(255, 250, 240, .66)";
    context.fillRect(105, bodyY - 52, 1390, bodyBottom - bodyY + 78);
    context.fillStyle = "#2e251e";
    drawTextInBox(context, definition.body, 130, bodyY, 1340, bodyBottom - bodyY, {
      fontFamily: "Georgia",
      maxFontSize: 42,
      minFontSize: 31,
      lineHeightRatio: 1.48
    });
  }

  if (definition.facts?.length) {
    context.fillStyle = "#7d2f3e";
    context.font = "700 34px Arial";
    context.fillText(BOOK_SECTION_COPY[lang].notice, 130, 1720);
    context.fillStyle = "#3f352c";
    context.font = "32px Georgia";
    definition.facts.forEach((fact, index) => {
      drawWrappedText(context, `• ${fact}`, 145, 1780 + index * 92, 1260, 42, 2);
    });
  }

  context.fillStyle = dark ? "#d6bd92" : "#765f4a";
  context.font = "30px Arial";
  context.fillText("ARTDACI · MASTERPIECES ALIVE", 120, canvas.height - 100);
}

function drawTextInBox(context, message, x, y, width, height, options = {}) {
  const family = options.fontFamily || "Georgia";
  const maxSize = options.maxFontSize || 42;
  const minSize = options.minFontSize || 30;
  const ratio = options.lineHeightRatio || 1.45;
  for (let size = maxSize; size >= minSize; size -= 1) {
    context.font = `${size}px ${family}`;
    const lines = wrapTextLines(context, message, width);
    const lineHeight = size * ratio;
    if (lines.length * lineHeight <= height) {
      lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
      return;
    }
  }
  context.font = `${minSize}px ${family}`;
  const lineHeight = minSize * ratio;
  const maxLines = Math.max(1, Math.floor(height / lineHeight));
  const lines = wrapTextLines(context, message, width).slice(0, maxLines);
  if (lines.length === maxLines) lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:]?$/, "")}…`;
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}

function wrapTextLines(context, message, maxWidth) {
  const words = String(message).split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (line && context.measureText(testLine).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function drawCoverImage(context, image, x, y, width, height) {
  const imageAspect = image.width / image.height;
  const targetAspect = width / height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;
  if (imageAspect > targetAspect) {
    sourceWidth = image.height * targetAspect;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetAspect;
    sourceY = (image.height - sourceHeight) / 2;
  }
  context.save();
  context.shadowColor = "rgba(39,24,13,.45)";
  context.shadowBlur = 32;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  context.restore();
  context.strokeStyle = "#9e7748";
  context.lineWidth = 12;
  context.strokeRect(x, y, width, height);
}

function drawWrappedText(context, message, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(message).split(/\s+/);
  let line = "";
  let lineNumber = 0;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, y + lineNumber * lineHeight);
      line = word;
      lineNumber += 1;
      if (lineNumber >= maxLines) return;
    } else {
      line = testLine;
    }
  }
  if (lineNumber < maxLines) context.fillText(line, x, y + lineNumber * lineHeight);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => {
      console.warn(`Book image unavailable: ${src}`);
      const fallback = document.createElement("canvas");
      fallback.width = 1200;
      fallback.height = 800;
      const context = fallback.getContext("2d");
      context.fillStyle = "#d8c6a7";
      context.fillRect(0, 0, fallback.width, fallback.height);
      context.fillStyle = "#6f5842";
      context.font = "56px Georgia";
      context.textAlign = "center";
      context.fillText("ARTDACI", fallback.width / 2, fallback.height / 2);
      resolve(fallback);
    };
    image.src = src;
  });
}

function localizedTitle(manifest) {
  if (lang === "ar") return {
    "mona-lisa": "الموناليزا",
    "van-gogh": "بورتريه ذاتي",
    "van-gogh-bedroom": "غرفة النوم",
    "vermeer-girl-with-a-pearl-earring": "الفتاة ذات القرط اللؤلؤي",
    "monet-impression-sunrise": "انطباع، شروق الشمس"
    ,"lady-with-an-ermine": "السيدة ذات القاقم", "view-of-delft": "منظر دلفت", "pont-d-argenteuil": "جسر أرجنتوي"
  }[manifest.slug] || manifest.title;
  if (lang !== "fr") return manifest.title;
  return {
    "mona-lisa": "La Joconde",
    "van-gogh": "Autoportrait",
    "van-gogh-bedroom": "La Chambre",
    "vermeer-girl-with-a-pearl-earring": "La Jeune Fille à la perle",
    "monet-impression-sunrise": "Impression, soleil levant"
    ,"lady-with-an-ermine": "La Dame à l’hermine", "view-of-delft": "Vue de Delft", "pont-d-argenteuil": "Le Pont d’Argenteuil"
  }[manifest.slug] || manifest.title;
}

function getAudio(manifest) {
  const list = manifest.media?.audioOverviews || [];
  const mediaLang = lang;
  return list.find((item) => item.lang === mediaLang) || list.find((item) => item.lang === "fr") || list.find((item) => item.lang === "en") || list[0];
}

const ADDED_BOOK_TEXTS = {
  fr: {
    "lady-with-an-ermine": {
      story: "Peinte vers 1489–1491 à la cour de Milan, l’œuvre représente Cecilia Gallerani, femme lettrée liée à Ludovic Sforza. Léonard transforme le portrait de cour en étude vivante du mouvement et de la présence.",
      looking: "Cecilia tourne le buste comme si quelqu’un venait d’entrer. L’hermine accompagne ce mouvement. La main allongée, l’animal attentif et la lumière dirigée relient les deux corps dans un même instant.",
      technique: "Les transitions douces donnent volume au visage, à la main et au pelage. Les examens techniques ont révélé des reprises : Léonard a construit l’image par observation, correction et expérimentation.",
      legacy: "L’hermine peut évoquer la pureté, la modération, le nom de Cecilia et les emblèmes de Ludovic Sforza. Conservée au Musée des Princes Czartoryski à Cracovie, l’œuvre a renouvelé le portrait psychologique de la Renaissance."
    },
    "view-of-delft": {
      story: "Vers 1660–1661, Vermeer observe Delft depuis le sud et transforme une vue urbaine familière en méditation sur la lumière, le climat et l’identité civique.",
      looking: "Le ciel occupe la majeure partie de la toile. Les nuages font alterner ombre et lumière sur les quais, tandis que la tour éclairée de la Nieuwe Kerk devient le foyer du regard.",
      technique: "Bandes horizontales, perspective, distance tonale et netteté sélective créent l’espace. De petites touches lumineuses suggèrent l’eau, la maçonnerie et l’humidité de l’air sans tout décrire.",
      legacy: "À la fois portrait de ville et paysage construit, Vue de Delft est l’une des œuvres majeures du Mauritshuis et du Siècle d’or néerlandais."
    },
    "pont-d-argenteuil": {
      story: "Monet peint Le Pont d’Argenteuil en 1874, dans une banlieue où se rencontrent loisirs, navigation, industrie et modernité des infrastructures.",
      looking: "Le pont impose une forte horizontale, contrariée par les mâts, les voiles et les reflets. L’eau ouverte conduit l’œil vers les arches et la lumière du lointain.",
      technique: "Bleus, verts, blancs et accents chauds sont posés en touches visibles. La couleur fragmentée laisse l’œil recomposer l’éclat mouvant de l’eau et de l’atmosphère.",
      legacy: "Conservé au Musée d’Orsay, ce paysage est un jalon de l’impressionnisme et une vision essentielle de la vie moderne autour de Paris."
    }
  },
  ar: {
    "lady-with-an-ermine": { "story": "رسم ليوناردو هذه اللوحة نحو 1489–1491 في بلاط ميلانو، وتمثل سيسيليا غالراني.", "looking": "تلتفت سيسيليا والقاقم معاً كأن شخصاً دخل الغرفة للتو، فتبدو الصورة لحظة حية.", "technique": "تكشف الانتقالات الناعمة والمراجعات التقنية طريقة ليوناردو القائمة على الملاحظة والتجريب.", "legacy": "أصبحت اللوحة، المحفوظة في متحف أمراء تشارتوريسكي، نموذجاً للبورتريه النفسي في عصر النهضة." },
    "view-of-delft": { "story": "رسم فيرمير دلفت نحو 1660–1661 وحوّل المشهد الحضري إلى دراسة للضوء والطقس.", "looking": "تملأ السماء معظم اللوحة، وتتبادل السحب الضوء والظل فوق الواجهة المائية.", "technique": "تجمع اللوحة المنظور والمسافات اللونية واللمسات المضيئة لبناء فضاء مقنع.", "legacy": "تعد منظر دلفت من أهم مناظر العصر الذهبي الهولندي ومن كنوز موريتشهاوس." },
    "pont-d-argenteuil": { "story": "رسم مونيه جسر أرجنتوي سنة 1874 حيث التقت الحداثة والترفيه على نهر السين.", "looking": "يوازن الخط الأفقي للجسر صواري القوارب وانعكاساتها المتحركة.", "technique": "تعيد العين تركيب الضوء من ضربات زرقاء وخضراء وبيضاء ولمسات دافئة ظاهرة.", "legacy": "اللوحة المحفوظة في متحف أورسيه علامة بارزة في الانطباعية وتصوير الحياة الحديثة." }
  }
};

function getBookTexts(manifest) {
  if (ADDED_BOOK_TEXTS[lang]?.[manifest.slug]) return ADDED_BOOK_TEXTS[lang][manifest.slug];
  if (lang === "ar" && BOOK_ARABIC_TEXT[manifest.slug]) return BOOK_ARABIC_TEXT[manifest.slug];
  if (lang === "fr" && BOOK_FRENCH_TEXT[manifest.slug]) return BOOK_FRENCH_TEXT[manifest.slug];
  if (BOOK_ENGLISH_TEXT[manifest.slug]) return BOOK_ENGLISH_TEXT[manifest.slug];
  const texts = manifest.texts || {};
  const techniqueBySlug = {
    "mona-lisa": [texts.sfumatoStudy, texts.scientificAnalysis, texts.conservationHistory],
    "van-gogh": [texts.palette, texts.perspectiveTechnique],
    "van-gogh-bedroom": [texts.palette, texts.perspectiveTechnique],
    "vermeer-girl-with-a-pearl-earring": [texts.palette, texts.perspectiveTechnique]
  };
  return {
    story: [texts.historicalContext, texts.artistBiography].filter(Boolean).join(" "),
    looking: [texts.artisticAnalysis, texts.composition].filter(Boolean).join(" "),
    technique: (techniqueBySlug[manifest.slug] || [texts.palette, texts.perspectiveTechnique]).filter(Boolean).join(" "),
    legacy: [texts.culturalSignificance, texts.influence, texts.curatorInsight].filter(Boolean).join(" ")
  };
}

function bindControls() {
  previousButton.addEventListener("click", previousPage);
  nextButton.addEventListener("click", nextPage);
  zoomButton.addEventListener("click", () => {
    const zoomed = book.classList.toggle("zoomed");
    zoomButton.setAttribute("aria-pressed", String(zoomed));
    zoomButton.textContent = zoomed
      ? (lang === "ar" ? "A− تصغير" : lang === "fr" ? "A− Réduire" : "A− Reduce")
      : (lang === "ar" ? "A+ تكبير" : lang === "fr" ? "A+ Agrandir" : "A+ Enlarge");
  });
  closeExperienceButton.addEventListener("click", closeExperience);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeExperience();
  });
  addEventListener("keydown", (event) => {
    if (dialog.open) return;
    if (event.key === "ArrowRight") nextPage();
    if (event.key === "ArrowLeft") previousPage();
  });
  book.addEventListener("pointerdown", (event) => {
    dragStartX = event.clientX;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size === 2) {
      pinchStartDistance = getPointerDistance();
      pinchHandled = false;
    }
  });
  book.addEventListener("pointermove", (event) => {
    if (!activePointers.has(event.pointerId)) return;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size !== 2 || pinchHandled || pinchStartDistance === null) return;
    const change = getPointerDistance() - pinchStartDistance;
    if (change < -70) {
      pinchHandled = true;
      markPageClickSuppressed();
      nextPage();
    } else if (change > 70) {
      pinchHandled = true;
      markPageClickSuppressed();
      previousPage();
    }
  });
  book.addEventListener("pointerup", (event) => {
    const wasPinching = pinchStartDistance !== null;
    activePointers.delete(event.pointerId);
    if (activePointers.size < 2) pinchStartDistance = null;
    if (wasPinching) {
      dragStartX = null;
      return;
    }
    if (dragStartX === null) return;
    const delta = event.clientX - dragStartX;
    dragStartX = null;
    if (delta < -55) {
      markPageClickSuppressed();
      nextPage();
    }
    if (delta > 55) {
      markPageClickSuppressed();
      previousPage();
    }
  });
  book.addEventListener("pointercancel", (event) => {
    activePointers.delete(event.pointerId);
    if (activePointers.size < 2) pinchStartDistance = null;
    dragStartX = null;
  });
}

function getPointerDistance() {
  const points = [...activePointers.values()];
  if (points.length < 2) return 0;
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function markPageClickSuppressed() {
  suppressPageClick = true;
  setTimeout(() => { suppressPageClick = false; }, 400);
}

function nextPage() {
  if (currentLeaf >= sheets.length) return;
  currentLeaf += 1;
  updateBook();
}

function previousPage() {
  if (currentLeaf <= 0) return;
  currentLeaf -= 1;
  updateBook();
}

function updateBook() {
  sheets.forEach((sheet, index) => {
    const turned = index < currentLeaf;
    sheet.classList.toggle("turned", turned);
    sheet.style.zIndex = turned ? String(index + 1) : String(sheets.length - index + 5);

    const front = sheet.querySelector(".page-front");
    const back = sheet.querySelector(".page-back");
    const frontIsVisible = index === currentLeaf;
    const backIsVisible = index === currentLeaf - 1;
    if (front) {
      front.style.pointerEvents = frontIsVisible ? "auto" : "none";
      front.setAttribute("aria-hidden", String(!frontIsVisible));
      front.querySelectorAll(".page-hotspot").forEach((button) => {
        button.tabIndex = frontIsVisible ? 0 : -1;
      });
    }
    if (back) {
      back.style.pointerEvents = backIsVisible ? "auto" : "none";
      back.setAttribute("aria-hidden", String(!backIsVisible));
      back.querySelectorAll(".page-hotspot").forEach((button) => {
        button.tabIndex = backIsVisible ? 0 : -1;
      });
    }
  });
  previousButton.disabled = currentLeaf === 0;
  nextButton.disabled = currentLeaf === sheets.length;
  const visiblePage = Math.min(currentLeaf * 2, pageDefinitions.length - 1);
  progress.textContent = currentLeaf === 0
    ? (lang === "ar" ? "الغلاف" : lang === "fr" ? "Couverture" : "Cover")
    : `${lang === "ar" ? "الصفحات" : "Pages"} ${visiblePage}–${Math.min(visiblePage + 1, pageDefinitions.length)}`;
}

function openExperience(definition, hotspot) {
  const manifest = definition.manifest;
  experienceTitle.textContent = definition.title;
  experienceKicker.textContent = {
    audio: lang === "ar" ? "سرد صوتي" : lang === "fr" ? "Narration audio" : "Audio narration",
    video: lang === "ar" ? "مشهد متحرك معاد تخيله" : lang === "fr" ? "Scène réimaginée en mouvement" : "Reimagined scene in motion",
    space: lang === "ar" ? "نموذج ثلاثي الأبعاد تفاعلي" : lang === "fr" ? "Objet 3D interactif" : "Interactive 3D object",
    ar: lang === "ar" ? "واقع معزز" : lang === "fr" ? "Réalité augmentée" : "Augmented reality",
    vr: lang === "ar" ? "مشهد واقع افتراضي" : lang === "fr" ? "Scène VR" : "VR scene",
    world: lang === "ar" ? "عالم افتراضي" : lang === "fr" ? "Monde VR" : "VR world",
    studio: lang === "ar" ? "محترف ليوناردو الافتراضي" : lang === "fr" ? "Atelier de Léonard en VR" : "Leonardo’s Studio in VR",
    studioEnriched: lang === "ar" ? "محترف ليوناردو المطوّر" : lang === "fr" ? "Atelier enrichi de Léonard" : "Leonardo’s Enriched Studio",
    gallery: lang === "ar" ? "معرض غامر" : lang === "fr" ? "Galerie immersive" : "Immersive gallery"
  }[hotspot.type] || "Immersive layer";

  if (hotspot.type === "audio" && hotspot.audio?.src) {
    experienceBody.innerHTML = `<div class="experience-audio"><audio controls autoplay src="${hotspot.audio.src}"></audio></div>`;
  } else if (hotspot.type === "video" && hotspot.video?.src) {
    const companionAudioSrc = lang === "ar" && hotspot.video.audioSrcAr
      ? hotspot.video.audioSrcAr
      : lang === "fr" && hotspot.video.audioSrcFr
        ? hotspot.video.audioSrcFr
        : hotspot.video.audioSrc;
    const companionAudio = companionAudioSrc
      ? `<audio data-video-sound preload="auto" src="${companionAudioSrc}"></audio>`
      : "";
    experienceBody.innerHTML = `
      <div class="experience-video">
        <video controls autoplay playsinline ${companionAudioSrc ? "muted" : ""} src="${hotspot.video.src}"></video>
        ${companionAudio}
        <div class="experience-video-controls">
          <button type="button" data-video-action="toggle">${lang === "ar" ? "إيقاف مؤقت" : "Pause"}</button>
          <button type="button" data-video-action="mute">${lang === "ar" ? "كتم الصوت" : lang === "fr" ? "Couper le son" : "Mute sound"}</button>
        </div>
        <p>${hotspot.video.description || ""}</p>
      </div>
    `;
    bindBookVideoControls();
  } else if (hotspot.type === "world") {
    experienceBody.innerHTML = `
      <div class="experience-world">
        <p>${lang === "ar"
          ? "استكشف غرفة نوم فان غوخ كعالم واقع افتراضي غامر."
          : lang === "fr"
            ? "Explorez la chambre de Van Gogh comme un monde VR immersif."
            : "Explore Van Gogh’s Bedroom as an immersive VR world."}</p>
        <a href="${BEDROOM_VR_WORLD_URL}">
          ${lang === "ar" ? "فتح عالم غرفة النوم الافتراضي" : lang === "fr" ? "Ouvrir le monde VR de La Chambre" : "Open The Bedroom VR World"}
        </a>
        <small>${lang === "ar"
          ? "سيفتح عالم الواقع الافتراضي مباشرة في هذه النافذة."
          : lang === "fr"
            ? "Le monde VR s’ouvrira directement dans cette fenêtre."
            : "The VR world will open directly in this window."}</small>
      </div>
    `;
  } else if (hotspot.type === "studio" || hotspot.type === "studioEnriched") {
    const enriched = hotspot.type === "studioEnriched";
    experienceBody.innerHTML = `
      <div class="experience-world">
        <p>${lang === "ar"
          ? (enriched ? "ادخل النسخة المطوّرة من محترف ليوناردو دافنشي واستكشف محتواها الغامر." : "ادخل محترف ليوناردو دافنشي واستكشف عالمه بالواقع الافتراضي.")
          : lang === "fr"
            ? (enriched ? "Entrez dans la version enrichie de l’atelier de Léonard de Vinci." : "Entrez dans l’atelier de Léonard de Vinci et découvrez son univers en VR.")
            : (enriched ? "Enter the enriched version of Leonardo da Vinci’s studio." : "Enter Leonardo da Vinci’s studio and explore his world in VR.")}</p>
        <a href="${hotspot.url || LEONARDO_STUDIO_VR_WORLD_URL}">
          ${lang === "ar"
            ? (enriched ? "فتح محترف ليوناردو المطوّر" : "فتح محترف ليوناردو بالواقع الافتراضي")
            : lang === "fr"
              ? (enriched ? "Ouvrir l’atelier enrichi de Léonard" : "Ouvrir l’atelier de Léonard en VR")
              : (enriched ? "Open Leonardo’s Enriched Studio" : "Open Leonardo’s Studio in VR")}
        </a>
        <small>${lang === "ar"
          ? "سيفتح عالم الواقع الافتراضي مباشرة في هذه النافذة."
          : lang === "fr"
            ? "Le monde VR s’ouvrira directement dans cette fenêtre."
            : "The VR world will open directly in this window."}</small>
      </div>
    `;
  } else {
    const url = getExperienceUrl(manifest, hotspot.type);
    experienceBody.innerHTML = `<iframe title="${experienceTitle.textContent}" src="${url}" allow="autoplay; fullscreen; xr-spatial-tracking; camera"></iframe>`;
  }
  dialog.showModal();
}

function bindBookVideoControls() {
  const player = experienceBody.querySelector("video");
  const sound = experienceBody.querySelector("[data-video-sound]");
  const toggle = experienceBody.querySelector('[data-video-action="toggle"]');
  const mute = experienceBody.querySelector('[data-video-action="mute"]');
  if (!player || !toggle || !mute) return;

  let companionMuted = false;
  const syncSound = () => {
    if (!sound) return;
    const expectedTime = sound.duration
      ? player.currentTime % sound.duration
      : player.currentTime;
    if (Math.abs(sound.currentTime - expectedTime) > 0.35) {
      sound.currentTime = expectedTime;
    }
  };
  const playSound = () => {
    if (!sound || companionMuted || player.paused) return;
    syncSound();
    sound.play().catch(() => {});
  };

  if (sound) {
    player.volume = 0;
    player.addEventListener("timeupdate", syncSound);
    player.addEventListener("play", playSound);
    player.addEventListener("pause", () => sound.pause());
    playSound();
  }

  const update = () => {
    toggle.textContent = player.paused
      ? (lang === "ar" ? "تشغيل الفيديو" : lang === "fr" ? "Lire la vidéo" : "Play video")
      : (lang === "ar" ? "إيقاف مؤقت" : "Pause");
    mute.textContent = (sound ? companionMuted : player.muted)
      ? (lang === "ar" ? "تشغيل الصوت" : lang === "fr" ? "Activer le son" : "Unmute sound")
      : (lang === "ar" ? "كتم الصوت" : lang === "fr" ? "Couper le son" : "Mute sound");
  };
  toggle.addEventListener("click", () => {
    if (player.paused) player.play().catch(() => {});
    else player.pause();
    update();
  });
  mute.addEventListener("click", () => {
    if (sound) {
      companionMuted = !companionMuted;
      sound.muted = companionMuted;
      if (companionMuted) sound.pause();
      else playSound();
    } else {
      player.muted = !player.muted;
    }
    update();
  });
  player.addEventListener("play", update);
  player.addEventListener("pause", update);
  update();
}

function getExperienceUrl(manifest, type) {
  const slug = encodeURIComponent(manifest.slug);
  if (type === "space") return `space.html?painting=${slug}&lang=${lang}`;
  if (type === "museumSpace") return `space.html?museum=${slug}&lang=${lang}`;
  if (type === "museumAr") return `ar.html?museum=${slug}&lang=${lang}`;
  if (type === "museumVr") return `gallery-vr.html?lang=${lang}&room=museums&museum=${slug}`;
  if (type === "ar") return `ar.html?painting=${slug}&lang=${lang}`;
  if (type === "vr") return `vr.html?painting=${slug}&lang=${lang}`;
  if (type === "gallery") {
    const artist = manifest.slug === "monet-impression-sunrise" ? "monet" : "";
    return `gallery-vr.html?lang=${lang}${artist ? `&artist=${artist}` : ""}`;
  }
  if (type === "world") return BEDROOM_VR_WORLD_URL;
  return `space.html?painting=${slug}&lang=${lang}`;
}

function closeExperience() {
  experienceBody.innerHTML = "";
  dialog.close();
}
