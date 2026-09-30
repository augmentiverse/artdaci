# ARTDACI GEO V6.9 — transition Louvre / Salle des États

État : V6.9 validée matériellement sur Meta Quest 3S par l'utilisateur.
Base exacte : artdaci-geo-v6.8, 2ff3609894499de0a77d165642e7402566108377.
Branche : feature/artdaci-geo-v6.9-louvre-transition.
Périmètre : aucun merge, déploiement, changement R2, média ou manifeste canonique.

## Architecture

- remote.html conserve le viewer model-viewer et les anciens récits/liens VR.
  Son nouveau bouton « Entrer dans le musée » ouvre room.html après un fondu.
- model-viewer ne propose pas ici de session immersive-vr. Le lien « Vue
  extérieure en VR » ouvre donc louvre-xr.html, une vue d'ensemble Three.js
  dédiée, avec les GLTFLoader/DRACOLoader déjà présents. Le musée est présenté
  comme une maquette, sans modifier sa géométrie ni inventer une porte réelle.
- Le bouton narratif 3D est indépendant du modèle. Les contrôleurs gauche et
  droit utilisent un raycast Three.js, controllerRayScale de V6.8, un curseur
  au point d'impact et une surbrillance. Les rayons s'arrêtent sur le bouton.
- Le bouton extérieur mesure 0,75 × 0,117 m (moitié de la largeur et hauteur
  initiales), placé vers le bas et à droite de la vue initiale. Il ne masque
  plus le centre du Louvre. Sa zone de raycast correspond à sa surface visible.
- Stick gauche : marche horizontale dans la direction du regard, bornée devant
  le modèle affiché ; stick droit : rotation par pas de 45°, tête libre à 360°.
  Ces commandes extérieures ont été validées sur Quest ; elles ne changent pas
  celles de la salle.
- Le retour 3D se trouve à gauche du point d'arrivée de la salle. On peut le
  retrouver par « Vue générale » en 2D ou en revenant dans la zone d'entrée en
  VR. Le lien HTML « Retour au Louvre » reste disponible même si le GLB échoue.
- La destination du retour est bornée à remote.html ou louvre-xr.html. Le
  paramètre from est conservé lors d'un changement de langue dans la salle.
- Arrivée : preset V5 existant x=0, z=13, yaw=0. Aucune arrivée forcée devant
  Mona Lisa. Leonardo et les œuvres ne sont pas chargés à l'avance.

## Transition et ressources

1. Vérification HEAD de la page de destination (timeout 6 s), sans GLB préchargé.
2. Mémorisation de la vue extérieure 2D dans sessionStorage, si disponible.
3. Fondu stationnaire de 220 ms ; navigation après 260 ms. En VR, une sphère
   noire autour du regard produit le fondu dans les deux yeux.
4. Fin explicite de la session XR. Si elle échoue, pas de libération ni de
   navigation : la visite courante reste disponible pour réessayer.
5. Libération avant navigation : animation, observateur, modèles, matériaux,
   textures, contrôles de passage, décodeur et renderer Three.js. Le viewer
   model-viewer est détaché, son src supprimé et son cache ramené à zéro.
6. Nouvelle page et chargement de la scène suivante. La restauration BFCache
   recharge la page pour ne pas réutiliser un renderer déjà libéré.

Un verrou empêche les doubles activations. Aucune redirection automatique au
chargement : pas de boucle aller-retour. Une seule scène lourde est chargée par
document ; la salle compte son GLB puis éventuellement Leonardo à la demande.
Les ressources GPU sont libérées via leurs API, mais leur récupération mémoire
effective reste à mesurer sur le casque. Les pages voisines ouvertes dans
d'autres onglets ne sont pas contrôlées par cette stratégie.

La session immersive ne survit pas au changement de document. Après chaque
passage, l'utilisateur doit choisir « Entrer en VR » sur la nouvelle page.
Un message le précise si le passage a été déclenché en VR. Aucun redémarrage
automatique hors geste utilisateur n'est tenté.

## Modèles et fallback

La vue extérieure WebXR utilise la variante publiée quest-webp (7 690 072 octets)
puis l'original local (29 683 184 octets). La révision Three.js du dépôt n'a pas
de KTX2Loader séparé : aucune nouvelle dépendance ni conversion n'est ajoutée.
Le viewer model-viewer historique conserve sa sélection adaptative existante.
La salle garde exactement son fallback R2 vers V5 local (1 687 700 octets).
En cas d'échec des deux sources : message et bouton Réessayer existants, avec
Retour au Louvre en dehors du masque de chargement. Pas de retour automatique.

## Vérifications locales

- 58 tests GEO : 47 existants conservés et 11 tests de transition.
- Routes, FR/EN/AR, état, stockage indisponible, double activation, échecs,
  ciblage gauche/droit, ordre de libération et coexistence V6.7/V6.8 couverts.
- Les modules room-navigation, room-poi, room-guide et room-xr-panel, le CSS
  de la salle, les données V5/Leonardo et les médias restent inchangés.
- Navigateur : parcours desktop, 390 × 844 EN et AR/RTL sans débordement,
  ouverture Leonardo puis Mona Lisa, entrée/retour dans les deux viewers.
- Mesures d'essais locaux (pas des garanties ni des mesures Quest) :
  remote → salle 973 ms ; extérieur WebXR en mode 2D → salle 657 ms ;
  salle → remote 7 487 ms ; salle → extérieur WebXR en mode 2D 7 776 ms.
  Décodage/chargement extérieur original observé : environ 7,4–7,9 s.
- Le navigateur de test n'atteint pas les médias R2 ; les originaux locaux ont
  pris le relais. Le model-viewer historique journalise ces erreurs réseau,
  ainsi qu'un 404 pour Louvre-full-joint-mobile.glb expérimental absent.
  Favicon également absent. Aucune exception JavaScript non gérée ni erreur
  WebGL nouvelle observée dans les parcours effectués.
- Pas de chiffre FPS, de mémoire ni de temps de transition Quest revendiqué.

## Validation matérielle Quest 3S

L'utilisateur a confirmé sur Meta Quest 3S : transition Louvre extérieur vers
Salle des États avec fondu confortable et arrivée correcte ; retour au Louvre ;
Leonardo V6.8, Mona Lisa V6.7 et audio fonctionnels ; locomotion, rotation 360°
et téléportation préservées ; interactions avec les manettes gauche et droite ;
parcours répété sans problème notable et conservation de la langue. Ce test
matériel n'a pas été refait lors de la préparation du commit. Aucune mesure
Quest de FPS ou de mémoire n'est revendiquée.

## Procédure de revérification Quest

Serveur local indépendant : port 8769, worktree artdaci-geo-v69-transition.

1. Ouvrir http://localhost:8769/geo/remote.html?lang=fr dans Quest Browser.
2. « Entrer dans le musée » : vérifier le fondu, l'arrivée en vue générale et
   le retour. C'est le parcours 2D ; les anciens liens galerie restent distincts.
3. « Vue extérieure en VR », attendre le Louvre, puis « Entrer en VR ».
4. Vérifier que le bouton « Entrer dans le musée » est petit, bas et sur le
   côté, puis marcher au stick gauche et tourner au stick droit pour regarder
   tout le modèle. Vérifier que l'on ne traverse pas le Louvre.
5. Viser le bouton narratif avec la manette gauche :
   curseur, surbrillance, rayon arrêté, activation. Le changement finit la VR.
6. Attendre la salle puis « Entrer en VR ». Vérifier l'arrivée, locomotion,
   sticks, rotation 360°, téléportation, Leonardo, panneaux et Mona Lisa/audio.
7. Dans la zone d'entrée, viser « Retour au Louvre » à gauche. Vérifier le
   fondu puis relancer la VR sur la vue extérieure rechargée.
8. Répéter entrée et retour avec la manette droite, puis plusieurs cycles.
9. Refaire le parcours en EN et AR : langue, RTL et destination du retour.
10. Signaler écran noir persistant, erreur de session, gêne ou ralentissement.

Cette procédure reste disponible pour une future revérification ; la validation
matérielle V6.9 ci-dessus a été communiquée par l'utilisateur.
