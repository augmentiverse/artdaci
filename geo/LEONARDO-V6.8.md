# ARTDACI GEO V6.8 — Leonardo guide 3D

État : V6.8-3 validée matériellement par l'utilisateur sur Meta Quest 3S.
Cette validation concerne les derniers ajustements des panneaux et du cercle.
Elle ne constitue pas une mesure de FPS ou de mémoire du casque.

## Validation matérielle V6.8-3 confirmée par l'utilisateur

- Leonardo correctement affiché, position et échelle satisfaisantes.
- Interaction avec les deux manettes et action « Voir La Joconde » fonctionnelles.
- Panneaux Leonardo et Mona Lisa compacts, suffisamment transparents ; modèle visible.
- Cercle réduit à un tiers de son diamètre initial ; zone invisible de ciblage
  inchangée et ciblage confortable.
- Locomotion, rotation 360° et téléportation préservées.

Le comportement validé est figé sans nouvelle fonctionnalité. Les champs de
statut provisoires du JSON de placement sont conservés pour ne pas retoucher
la configuration testée ; le présent document consigne la validation acquise.
Les coordonnées restent des choix de conception, pas des relevés du Louvre.

## Base et périmètre

- Base exacte : tag annoté artdaci-geo-v6.7, commit 5bf970b0b3bba365303fdaca843be32c702e159d.
- Branche : feature/artdaci-geo-v6.8-leonardo.
- Worktree : C:\Users\nimdo\.codex\worktrees\artdaci-geo-v68-leonardo\artdaci.
- Le worktree était propre à la création. Aucun des 26 fichiers expérimentaux de l'ancien worktree n'a été transféré.
- Livraison autorisée : un commit V6.8 et un tag annoté artdaci-geo-v6.8,
  poussés uniquement sur leur branche et référence respectives. Aucun merge,
  déploiement, changement de manifeste canonique ou de R2.
- Salle V5 inchangée : 1 687 700 octets, SHA-256 59359407aa1ab092c30932bed3e79fcf60f993fc534c8197835943c79e00efac.
- La configuration V5, room-navigation.mjs, room-poi.mjs et les tests V6.7 sont inchangés.

## Modèle existant audité

Chemin réutilisé directement :
assets/artists/leonardo-da-vinci/reimagined/models/davinci-standing-c.glb

- 3 107 640 octets (3,11 Mo décimaux), sans copie ou modification du média.
- SHA-256 : 528034c1a7a2cd1d6a3b86ca4cbe250fa9eca95ab793d866630cb59240b8b18f.
- Un mesh, une primitive, un matériau PBR double face.
- 323 944 sommets ; 600 574 triangles.
- Compression géométrique KHR_draco_mesh_compression ; textures EXT_texture_webp.
- Quatre textures embarquées : base color 4096×4096 (1 055 420 octets),
  normal 4096×4096 (132 922 octets), emissive 2048×2048 (7 570 octets),
  metallic/roughness 2048×2048 (83 714 octets).
- Pas de squelette ni d'animation intégrée.
- Bounding box source : min [-0.366951, -0.950155, -0.324748],
  max [0.362655, 0.948406, 0.322037].
- Dimensions source : environ 0,730 × 1,899 × 0,647 unités, axe Y vertical.
- Face vers +Z confirmée visuellement dans le navigateur ; rotation proposée 0.
  La rotation PI utilisée dans l'autre galerie montrait ici le dos du personnage.
- Le recentrage des pieds est appliqué au nœud chargé en mémoire uniquement.
- Compatibilité technique vérifiée avec les GLTFLoader/DRACOLoader existants et
  WebP dans le navigateur local. Affichage et interactions Quest V6.8-3
  validés par l'utilisateur ; aucune mesure chiffrée de performance Quest.

## POI et placement proposé

Le POI character est défini séparément dans data/leonardo-guide.json, avec
artistId leonardo-da-vinci et roomId louvre-salle-des-etats.
Il ne change pas le POI Mona Lisa ni le GLB de la salle.

Position des pieds dans les coordonnées locales de conception :
X = -3,3 ; Y = 0,1 ; Z = -2,8 ; rotation Y = 0 radian ; scale = 0,94.
Hauteur apparente : environ 1,785 unité.
Point de vue du guide : X = -3,3 ; Z = 0,2 ; yaw = 0.
Ce sont des propositions visuelles, pas des mesures du Louvre.

Le personnage reste sur la gauche, hors de l'axe de Mona Lisa.
Il ne crée aucune collision supplémentaire. Une boîte invisible simple sert
uniquement au ciblage ; elle n'empêche pas la marche ou la téléportation.
Un disque de sélection couvre aussi le centre du repère cyan.
Le raycast ne parcourt jamais les 600 574 triangles du personnage.

## Fonctionnement

- Le repère et le bouton « Rencontrer Léonard » sont disponibles après la salle.
- Le GLB n'est demandé qu'à la sélection du guide ou à une demande explicite
  d'aperçu dans le mode QA. Pas de téléchargement anticipé.
- Une seule promesse de chargement et un seul modèle sont conservés par visite.
  Les sélections répétées réutilisent ce modèle.
- En cas d'échec, le panneau textuel et « Voir La Joconde » restent disponibles ;
  « Réessayer » permet une nouvelle tentative volontaire, sans boucle.
- La fermeture du panneau garde le personnage dans la salle. À la sortie de
  page, les ressources sont libérées ; un chargement terminé tardivement est
  également libéré.
- Deux lumières sans ombres accompagnent le personnage PBR. Les matériaux
  unlit de la salle V5 ne sont pas modifiés.
- Panneau FR/EN/AR, RTL arabe, présentation du personnage et rôle de guide.
- « Voir La Joconde » ferme le panneau du guide puis appelle openPoi() et
  approachPoi() de V6.7. Le panneau, l'audio et la destination Mona Lisa sont
  donc ceux déjà existants, y compris le déplacement XR validé.
- Le panneau 3D, son raycast, le curseur, la mise en évidence et les rayons sont
  partagés avec V6.7. Aucun second système de contrôleurs n'est ajouté.
- Les contrôleurs gauche et droit peuvent sélectionner le guide. La priorité
  panneau / Mona Lisa existante reste conservée avant le guide et le sol.
- Le code de locomotion, des sticks et de rotation 360° reste inchangé.

## Audio

Le dépôt contient les récits des œuvres de Léonard, notamment Mona Lisa, et
des morceaux musicaux sous supporters/music : A Study in Grace,
Sous le sceau royal et Davinci-François — منك المداد.
Ces ressources ne sont pas identifiées comme une narration de guide.
V6.8 n'utilise donc aucun audio Leonardo. Les champs FR/EN/AR restent null.
L'audio Mona Lisa n'est joué que depuis son propre POI.

## Réglage local

URL : http://localhost:8768/geo/room.html?lang=fr&guideQA=1

Le module QA n'est activé que pour localhost, 127.0.0.1 ou ::1, sur demande
explicite du paramètre guideQA=1. Il n'est pas lié depuis la navigation publique.
Les champs X/Y/Z, rotation Y en degrés et scale modifient uniquement l'aperçu
après « Appliquer à l'aperçu ». « Copier le JSON » exporte la proposition.
Ni fichier ni stockage du navigateur n'est écrit ; recharger restaure les
valeurs initiales. Régler en 2D, puis entrer en VR dans la même page.

## Mesures locales du 30 septembre 2026

- Chargement du guide, transfert local + décodage + préparation : 639 ms dans
  un essai et 968 ms dans un autre. Ce ne sont pas des mesures Quest.
- Modèles GLB présents : 1 avant sélection (salle), 2 après (salle + Leonardo).
- À la même vue générale desktop, compteurs Three.js :
  triangles 9 058 → 609 632 ; appels de rendu 32 → 33 ;
  géométries 32 → 33 ; textures 4 → 8.
- Les textures source représentent environ 160 Mio si décompressées en RGBA8,
  ou 213 Mio avec une chaîne de mipmaps complète. Les buffers géométriques
  déclarés représentent environ 16,76 Mio. Estimations théoriques uniquement :
  elles n'incluent pas tous les buffers temporaires et ne mesurent pas la
  mémoire réelle du casque.
- La géométrie dense et les textures 4K restent le risque de performance
  principal. Aucune recompression, simplification ou optimisation n'a été faite.
- Aucun chiffre FPS ou mémoire Quest n'est revendiqué.

## Vérifications

47 tests passent : les 35 tests GEO/Salle/V6.7 existants et 12 nouveaux tests.
Les nouveaux cas couvrent structure, langues, média inchangé, placement,
chargement unique différé, échec et libération tardive, ciblage simplifié,
panneau partagé, transition vers Mona Lisa, pointeur tactile et gestionnaires
des deux contrôleurs. Ils vérifient aussi le diamètre du cercle divisé par
trois et le ciblage des panneaux compacts décalés, après rotation de la tête.
Ces essais logiciels ne simulent pas un affichage ou un appareil WebXR réel.

Syntaxe JavaScript et git diff --check : valides.
Parcours desktop, sélection directe du personnage, fermeture, transition vers
Mona Lisa et retour : vérifiés dans le navigateur local.
FR/EN/AR à 390×844 : panneau dans la largeur, arabe RTL, actions d'au moins
44 px, panneau Leonardo placé sous les boutons. Le chemin tactile a aussi
été testé sur le gestionnaire pointerdown réel.
QA : modification d'aperçu, copie JSON et remise à zéro vérifiées.
Repli local du GLB V5 et de l'audio Mona Lisa observé.
Pas d'erreur JavaScript relevée. Seul 404 local : favicon.ico, préexistant.

Commande des tests :

    node --test --test-isolation=none tests/geo-poc.test.mjs tests/geo-room.test.mjs tests/geo-room-poi.test.mjs tests/geo-room-guide.test.mjs

## Procédure Quest 3S

Le serveur V6.8 utilise le port 8768 pour garder l'autre worktree indépendant.
Il a été démarré et le reverse USB a été préparé. S'il faut les relancer :

    & 'C:\Users\nimdo\anaconda3\python.exe' -m http.server 8768 --bind 127.0.0.1 --directory 'C:\Users\nimdo\.codex\worktrees\artdaci-geo-v68-leonardo\artdaci'
    & 'C:\Users\nimdo\AppData\Local\Android\Sdk\platform-tools\adb.exe' reverse tcp:8768 tcp:8768

1. Ouvrir http://localhost:8768/geo/room.html?lang=fr&check=v68-3 dans Quest Browser.
2. Choisir « Rencontrer Léonard », attendre son apparition, puis « Retour à la
   visite ». Cela place l'utilisateur près du guide et permet le premier
   décodage en 2D.
3. Entrer en VR. Sélectionner le personnage ou le repère cyan avec la manette
   gauche, puis fermer le panneau.
4. Répéter avec la manette droite. Vérifier l'arrêt du rayon sur le panneau,
   le bouton mis en évidence et l'activation à la gâchette.
5. Choisir « Voir La Joconde ». Vérifier l'arrivée confortable devant l'œuvre,
   son panneau existant, l'audio et « Retour à la salle ».
6. Tester stick gauche, stick droit, rotation complète et téléportation, puis
   sélectionner de nouveau Mona Lisa et Leonardo.
7. Vérifier taille, orientation, position et fluidité avec le guide visible.
   Tester aussi la première sélection directement en VR après rechargement.
8. Refaire le panneau en lang=en et lang=ar. Signaler tout ralentissement,
   gêne de lecture ou problème de ciblage.

La validation matérielle V6.8-3 ci-dessus a été confirmée par l'utilisateur.
La procédure est conservée pour de futures vérifications, sans prétendre
qu'un nouveau test matériel a été effectué lors du gel Git.
