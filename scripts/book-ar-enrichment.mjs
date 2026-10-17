/** ARTDACI Book AR 1.2. Curated interpretation; content is static and works offline once loaded. */
const tr=(fr,en,ar)=>({fr,en,ar});
export const exploreCopy={
  fr:{about:"Le peintre",works:"Œuvres",fact:"Le saviez-vous ?",hint:"Touchez une œuvre pour la voir apparaître en AR.",introTitle:"Un livre, quatre regards",introText:"Choisissez un peintre pour découvrir sa vie, explorer quatre œuvres et apprendre un détail marquant. Le tableau sélectionné flotte au-dessus de la couverture.",years:"Période",where:"Conservation",view:"Afficher cette œuvre en AR",see:"Œuvre choisie",current:"Image AR",more:"Explorer davantage",narrate:"Écouter le contenu",return:"Revenir à l'accueil AR",open:"Ouvrir le guide",scanHint:"Gardez la couverture dans le champ de la caméra.",workSelection:"Œuvre sélectionnée",museum:"Musée",century:"siècle"},
  en:{about:"The artist",works:"Artworks",fact:"Did you know?",hint:"Tap an artwork to display it in AR.",introTitle:"One book, four perspectives",introText:"Choose a painter to discover their life, explore four artworks and uncover a surprising fact. Your selection floats over the cover.",years:"Period",where:"Collection",view:"Show this artwork in AR",see:"Selected artwork",current:"AR image",more:"Explore further",narrate:"Listen to content",return:"Back to AR introduction",open:"Open guide",scanHint:"Keep the cover in the camera's view.",workSelection:"Artwork selected",museum:"Museum",century:"century"},
  ar:{about:"الفنان",works:"الأعمال الفنية",fact:"هل تعلم؟",hint:"اضغط على لوحة لعرضها بالواقع المعزز.",introTitle:"كتاب واحد وأربع رؤى",introText:"اختر رسامًا لتتعرف إلى حياته وأربعة من أعماله ومعلومة لافتة عنه. ستظهر اللوحة المختارة فوق الغلاف.",years:"الفترة",where:"المجموعة",view:"اعرض اللوحة بالواقع المعزز",see:"العمل المختار",current:"الصورة المعززة",more:"استكشف المزيد",narrate:"استمع إلى المحتوى",return:"العودة إلى المقدمة",open:"افتح الدليل",scanHint:"أبقِ الغلاف ظاهرًا أمام الكاميرا.",workSelection:"تم اختيار اللوحة",museum:"المتحف",century:"قرن"}
};
export const discovery={
 leonardo:{
  dates:"1452–1519",
  origin:tr("Italie · Renaissance","Italy · Renaissance","إيطاليا · عصر النهضة"),
  bio:tr(
   "Peintre, dessinateur et inventeur, Léonard de Vinci étudie le mouvement, l'anatomie et la lumière. Ses portraits associent observation minutieuse et expressions difficiles à saisir.",
   "Painter, draughtsman and inventor, Leonardo studied motion, anatomy and light. His portraits blend close observation with elusive expressions.",
   "كان ليوناردو رسامًا ومبتكرًا وباحثًا في الحركة والتشريح والضوء. وتمزج لوحاته بين الملاحظة الدقيقة والتعابير الغامضة."),
  fact:tr(
   "Léonard utilisait le sfumato : des transitions très douces entre ombre et lumière, visibles notamment autour du visage de La Joconde.",
   "Leonardo used sfumato—very soft transitions between shadow and light—particularly around the face of the Mona Lisa.",
   "استخدم ليوناردو تقنية «سفوماتو» القائمة على انتقالات ناعمة جدًا بين الظل والنور، كما يظهر في وجه الموناليزا."),
  question:tr("Observez les contours du sourire : où s'arrête exactement l'ombre ?","Study the edges of the smile: where does the shadow really end?","تأمل حدود الابتسامة: أين ينتهي الظل تحديدًا؟"),
  artworks:[
   {id:"mona-lisa",title:tr("La Joconde","Mona Lisa","الموناليزا"),date:"vers 1503–1519",dateEn:"c. 1503–1519",image:"assets/artists/leonardo-da-vinci/collection/mana-lisa-davinci.webp",museum:tr("Musée du Louvre · Paris","Musée du Louvre · Paris","متحف اللوفر · باريس")},
   {id:"ermine",title:tr("La Dame à l'hermine","Lady with an Ermine","السيدة ذات القاقم"),date:"vers 1489–1490",dateEn:"c. 1489–1490",image:"assets/artists/leonardo-da-vinci/collection/the-lady-with-an-ermine-davinci.webp",museum:tr("Musée Czartoryski · Cracovie","Czartoryski Museum · Kraków","متحف تشارتوريسكي · كراكوف")},
   {id:"ginevra",title:tr("Ginevra de' Benci","Ginevra de' Benci","جينيفرا دي بينتشي"),date:"vers 1474–1478",dateEn:"c. 1474–1478",image:"assets/artists/leonardo-da-vinci/collection/ginevra-de-benci.webp",museum:tr("National Gallery of Art · Washington","National Gallery of Art · Washington","المعرض الوطني للفنون · واشنطن")},
   {id:"ferronniere",title:tr("La Belle Ferronnière","La Belle Ferronnière","لا بيل فيرونيير"),date:"vers 1490–1497",dateEn:"c. 1490–1497",image:"assets/artists/leonardo-da-vinci/collection/la-belle-ferronnière-davinci.webp",museum:tr("Musée du Louvre · Paris","Musée du Louvre · Paris","متحف اللوفر · باريس")}
  ]},
 vermeer:{
  dates:"1632–1675",
  origin:tr("Provinces-Unies · Baroque néerlandais","Dutch Republic · Dutch Golden Age","الجمهورية الهولندية · العصر الذهبي"),
  bio:tr(
   "Actif à Delft, Vermeer peint des intérieurs calmes, des gestes quotidiens et des effets de lumière remarquables. Chaque objet semble contribuer à une scène silencieuse.",
   "Working in Delft, Vermeer painted quiet interiors, everyday gestures and remarkable effects of light. Each object adds to the stillness of the scene.",
   "عمل فيرمير في مدينة دلفت ورسم مشاهد داخلية هادئة وتفاصيل الحياة اليومية وتأثيرات ضوئية مدهشة. ويشارك كل عنصر في صنع سكون المشهد."),
  fact:tr(
   "Dans Vue de Delft, Vermeer transforme un paysage urbain en étude subtile des nuages, des reflets et de la lumière.",
   "In View of Delft, Vermeer turns a cityscape into a subtle study of clouds, reflections and changing light.",
   "في «منظر دلفت»، حوّل فيرمير مشهد المدينة إلى دراسة دقيقة للسحب والانعكاسات والضوء المتغير."),
  question:tr("Quels objets de La Laitière guident votre regard vers le geste principal ?","Which objects in The Milkmaid guide your eye toward her main gesture?","ما العناصر التي توجه نظرك إلى حركة اليد في لوحة «بائعة الحليب»؟"),
  artworks:[
   {id:"pearl",title:tr("La Jeune Fille à la perle","Girl with a Pearl Earring","الفتاة ذات القرط اللؤلؤي"),date:"vers 1665",dateEn:"c. 1665",image:"assets/artists/johannes-vermeer/collection/girl-with-a-pearl-earring-vermeer.webp",museum:tr("Mauritshuis · La Haye","Mauritshuis · The Hague","موريتشهاوس · لاهاي")},
   {id:"milkmaid",title:tr("La Laitière","The Milkmaid","بائعة الحليب"),date:"vers 1658–1660",dateEn:"c. 1658–1660",image:"assets/artists/johannes-vermeer/collection/the-milkmaid-vermeer.webp",museum:tr("Rijksmuseum · Amsterdam","Rijksmuseum · Amsterdam","متحف ريكز · أمستردام")},
   {id:"delft",title:tr("Vue de Delft","View of Delft","منظر دلفت"),date:"vers 1660–1661",dateEn:"c. 1660–1661",image:"assets/artists/johannes-vermeer/collection/view-of-delft-vermeer.webp",museum:tr("Mauritshuis · La Haye","Mauritshuis · The Hague","موريتشهاوس · لاهاي")},
   {id:"balance",title:tr("La Femme à la balance","Woman Holding a Balance","امرأة تحمل ميزانًا"),date:"vers 1662–1664",dateEn:"c. 1662–1664",image:"assets/artists/johannes-vermeer/collection/woman-holding-a-balance-vermeer.webp",museum:tr("National Gallery of Art · Washington","National Gallery of Art · Washington","المعرض الوطني للفنون · واشنطن")}
  ]},
 vangogh:{
  dates:"1853–1890",
  origin:tr("Pays-Bas · Postimpressionnisme","Netherlands · Post-Impressionism","هولندا · ما بعد الانطباعية"),
  bio:tr(
   "Van Gogh fait de la couleur et de la touche des moyens d'expression intenses. Il peint paysages, intérieurs et autoportraits avec une énergie qui transforme les sujets ordinaires.",
   "Van Gogh used colour and brushwork as powerful expressive tools. His landscapes, interiors and self-portraits transform ordinary subjects through their intensity.",
   "استخدم فان غوخ اللون وضربات الفرشاة وسيلتين قويتين للتعبير. وتحول مناظره وغرفه وصوره الذاتية الأشياء المألوفة إلى مشاهد شديدة التأثير."),
  fact:tr(
   "Van Gogh réalise de nombreux autoportraits, notamment faute de pouvoir payer des modèles. Celui présenté ici date de 1889 et est conservé au musée d'Orsay.",
   "Van Gogh painted numerous self-portraits, partly because he could not afford models. The one shown here dates to 1889 and is held by the Musée d'Orsay.",
   "رسم فان غوخ صورًا ذاتية عديدة، ومن أسباب ذلك عدم قدرته على دفع أجور النماذج. تعود الصورة المعروضة هنا إلى عام 1889 وهي محفوظة في متحف أورسي."),
  question:tr("Comparez les lignes du ciel de La Nuit étoilée à celles de La Chambre.","Compare the swirling sky in The Starry Night with the straight lines of The Bedroom.","قارن الخطوط الدوامية في سماء «ليلة النجوم» بخطوط «غرفة النوم»."),
  artworks:[
   {id:"self-portrait-1889",title:tr("Autoportrait (1889)","Self-Portrait (1889)","بورتريه ذاتي (1889)"),date:"1889",dateEn:"1889",image:"assets/artists/vincent-van-gogh/collection/autoportrait-vangogh.webp",museum:tr("Musée d'Orsay · Paris","Musée d'Orsay · Paris","متحف أورسي · باريس")},
   {id:"bedroom",title:tr("La Chambre","The Bedroom","غرفة النوم"),date:"1888",dateEn:"1888",image:"assets/artists/vincent-van-gogh/collection/the-bedroom-vangogh.webp",museum:tr("Van Gogh Museum · Amsterdam","Van Gogh Museum · Amsterdam","متحف فان غوخ · أمستردام")},
   {id:"starry-night",title:tr("La Nuit étoilée","The Starry Night","ليلة النجوم"),date:"1889",dateEn:"1889",image:"assets/artists/vincent-van-gogh/collection/the-starry-night-vangogh.webp",museum:tr("MoMA · New York","MoMA · New York","متحف الفن الحديث · نيويورك")},
   {id:"cafe-terrace",title:tr("Terrasse du café le soir","Café Terrace at Night","شرفة المقهى ليلًا"),date:"1888",dateEn:"1888",image:"assets/artists/vincent-van-gogh/collection/café-terrasse-at-night-vangogh.webp",museum:tr("Kröller-Müller Museum · Otterlo","Kröller-Müller Museum · Otterlo","متحف كرولر مولر · أوترلو")}
  ]},
 monet:{
  dates:"1840–1926",
  origin:tr("France · Impressionnisme","France · Impressionism","فرنسا · الانطباعية"),
  bio:tr(
   "Monet s'intéresse aux variations de lumière, aux reflets et aux couleurs changeantes. Peignant souvent en plein air, il revient sur les mêmes motifs à différents moments.",
   "Monet explored changing light, reflections and shifting colours. Often working outdoors, he returned to the same subjects in different conditions.",
   "اهتم مونيه بتحولات الضوء والانعكاسات والألوان المتغيرة. وكان يرسم كثيرًا في الهواء الطلق ويعود إلى الموضوع نفسه في أوقات وظروف مختلفة."),
  fact:tr(
   "Le titre Impression, soleil levant inspira en 1874 le nom du mouvement impressionniste, d'abord employé de façon moqueuse par un critique.",
   "The title Impression, Sunrise inspired the name of Impressionism in 1874, initially used mockingly by a critic.",
   "استُلهم اسم الحركة الانطباعية عام 1874 من عنوان لوحة «انطباع، شروق الشمس»، وقد استخدمه أحد النقاد على سبيل التهكم في البداية."),
  question:tr("Dans Impression, soleil levant, quelle couleur fait ressortir le soleil ?","In Impression, Sunrise, which colour makes the sun stand out?","في لوحة «انطباع، شروق الشمس»، ما اللون الذي يبرز الشمس؟"),
  artworks:[
   {id:"sunrise",title:tr("Impression, soleil levant","Impression, Sunrise","انطباع، شروق الشمس"),date:"1872",dateEn:"1872",image:"assets/artists/claude-monet/collection/impression-sunrise-monet.webp",museum:tr("Musée Marmottan Monet · Paris","Musée Marmottan Monet · Paris","متحف مارموتان مونيه · باريس")},
   {id:"parasol",title:tr("Femme à l'ombrelle","Woman with a Parasol","امرأة تحمل مظلة"),date:"1875",dateEn:"1875",image:"assets/artists/claude-monet/artworks/the-woman-with-a-parasol/images/woman-with-a-parasol.webp",museum:tr("National Gallery of Art · Washington","National Gallery of Art · Washington","المعرض الوطني للفنون · واشنطن")},
   {id:"poppies",title:tr("Les Coquelicots","Poppies","حقل الخشخاش"),date:"1873",dateEn:"1873",image:"assets/artists/claude-monet/collection/poppies-monet.webp",museum:tr("Musée d'Orsay · Paris","Musée d'Orsay · Paris","متحف أورسي · باريس")},
   {id:"water-lilies",title:tr("Les Nymphéas (série)","Water Lilies (series)","زنابق الماء (سلسلة)"),date:"vers 1897–1926",dateEn:"c. 1897–1926",image:"assets/artists/claude-monet/collection/water-lilies-monet.webp",museum:tr("Œuvres réparties entre plusieurs musées","Works in multiple collections","أعمال موزعة بين متاحف عدة")}
  ]}
};
export const local=(value,lang)=>value?.[lang]??value?.fr??"";
export const selectedArtwork=(artist,id)=>discovery[artist]?.artworks.find(w=>w.id===id)||null;
