# ARTDACI GEO V6.11.1 — parcours physique et collection

V6.11.1 sépare le parcours des œuvres actuellement exposées (La Joconde → L'Astronome) de la collection ARTDACI / Louvre non exposée (La Belle Ferronnière). Les autres œuvres sont explorées sous forme de fiches, images et récits audio, sans prétendre les placer dans la Salle des États. Aucune nouvelle salle 3D ni intégration Geospatial n'est créée. L'utilisateur a validé matériellement V6.11.1 sur un Meta Quest 3S réel.

## Base Git et isolation

Base exacte : tag `artdaci-geo-v6.10`, commit `3ac4460f1b0c1c18ebcb0386e02be8a2cabc5c98`, validé matériellement par l'utilisateur sur Quest 3S. Nouveau worktree initialement propre, sans fichiers expérimentaux hérités : `C:\Users\nimdo\.codex\worktrees\artdaci-geo-v611-art-trail\artdaci`. Branche : `feature/artdaci-geo-v6.11-louvre-art-trail`.

Les données, modules et styles V5 à V6.10 restent inchangés. Seuls `room.html` et l'adaptateur `room-viewer.js` sont modifiés parmi les fichiers suivis. Les modèles de la salle et de Leonardo, les manifests canoniques, les sources originales et les autres worktrees ne sont pas modifiés. Le figement V6.11.1 n'implique aucun merge, déploiement ni changement R2.

## Vérification officielle des œuvres

Statuts consultés le 2 octobre 2026, à recontrôler avant une future publication. L'appartenance à une collection n'est pas une preuve d'exposition. Les sources ci-dessous sont les notices complètes du Louvre, pas des informations déduites du catalogue ARTDACI.

| Œuvre | Identifiant ARTDACI | Collection et inventaire | Statut vérifié | Localisation actuelle vérifiée |
| --- | --- | --- | --- | --- |
| La Joconde, Leonardo da Vinci | `ld01` | Département des Peintures, Louvre, INV 779 | `on-display` | Salle 711, Denon, niveau 1 |
| La Belle Ferronnière, Leonardo da Vinci | `ld06` | Département des Peintures, Louvre, INV 778 | `not-currently-displayed` | Non exposée ; `museumLocation: null` |
| L'Astronome, Johannes Vermeer | `ve05` | Département des Peintures, Louvre, RF 1983 28 | `on-display` | Salle 837, Richelieu, niveau 2 |

Sources : [La Joconde](https://collections.louvre.fr/ark:/53355/cl010062370), [La Belle Ferronnière](https://collections.louvre.fr/ark:/53355/cl010062372), [L'Astronome](https://collections.louvre.fr/ark:/53355/cl010064324). La [présentation officielle de la Salle des États](https://www.louvre.fr/decouvrir/le-palais/de-la-joconde-aux-noces-de-cana) documente le marqueur de salle. Aucun emplacement historique de La Belle Ferronnière n'est présenté comme son emplacement actuel. L'Annonciation (`ld04`) est exclue du parcours.

## Données et architecture

`data/louvre-art-trail.json` contient trois œuvres et quatre marqueurs documentaires. Les champs `trailCategory`, `displayStatus`, `museumLocation` et `spatiallyVisitable` séparent les deux catégories sans conditions par œuvre dans le viewer :

- `museum-trail` : `ld01` La Joconde (salle 711, Denon, niveau 1), puis `ve05` L'Astronome (salle 837, Richelieu, niveau 2), tous deux exposés et physiquement visitables ;
- `collection` : `ld06` La Belle Ferronnière, non exposée, `museumLocation: null`, sans placement fictif ;
- `context` : Louvre, Salle des États, Leonardo et Vermeer, conservés comme données culturelles mais exclus de la progression physique.

Chaque entrée porte les contenus FR/EN/AR, ses actions et des sources officielles datées. Les œuvres portent aussi `artworkId`, `artistId`, `collection` et `inventory`.

Les quatre statuts sont distingués dans les traductions : `on-display`, `not-currently-displayed`, `collection-only`, `location-unverified`. Tous les blocs `spatial` restent `not-calibrated`, avec `x`, `y`, `z` à `null`. Ce sont des réservations pour de futures positions locales 3D, jamais des coordonnées géographiques. `museumLocation` ne déclenche pas de téléportation vers une nouvelle salle.

`scripts/art-trail.mjs` valide la configuration, gère la progression et résout l'audio par le résolveur canonique existant. `scripts/art-trail-ui.mjs` adapte cette logique au HTML et au panneau XR. `styles/art-trail.css` est limité à ce nouveau panneau. Son contenu défile indépendamment des actions sur smartphone.

L'adaptateur intercepte `CONTINUE_TRAIL` (parcours du musée) et `SHOW_WORKS` (collection) uniquement depuis l'état post-Joconde du guide. Il remplace leurs libellés dans les panneaux HTML et XR : « Continuer le parcours dans le Louvre » et « Découvrir mes autres œuvres au Louvre ». Le guide V6.10 conserve ses données, sa logique et tous ses autres états. La Joconde appelle l'exacte séquence existante `closeGuide(); openPoi(); approachPoi();`, sans nouvelle image, narration ou panneau Mona Lisa.

## Navigation et état de session

Chaque catégorie possède sa propre vue générale, sans deux grands panneaux simultanés. Elle propose commencer ou reprendre, retour à la salle et Louvre extérieur. Après La Joconde, la prochaine étape du parcours principal est L'Astronome. Précédent permet de revenir à La Joconde, puis à la vue générale ; suivant sur L'Astronome ouvre une fin explicite, sans retour automatique au début. La collection mène séparément de Leonardo à La Belle Ferronnière, puis retourne au guide. Le retour à Leonardo conserve son dialogue post-Joconde.

La clé `artdaci-geo-v611-louvre` dans `sessionStorage` conserve la catégorie, l'étape actuelle, les étapes consultées et la découverte de La Joconde, y compris entre les pages et les langues du même onglet. « Visité » signifie consulté dans ARTDACI, pas visité physiquement au musée. Les identifiants restaurés sont filtrés et une étape de la collection ne peut pas devenir la prochaine étape physique. Une session privée ou un stockage corrompu ne bloque pas le parcours ; l'état peut rester en mémoire. Aucun backend ni stockage permanent n'est ajouté.

Le retour à la salle ferme le parcours et reprend la vue générale sans recharger son GLB. Le retour extérieur réutilise le passage V6.9 : `remote.html` si la salle a été ouverte depuis Remote, `louvre-xr.html` si elle a été ouverte avec `from=louvre-xr`. La langue est conservée. Le passage termine la session XR et libère la scène avant le chargement extérieur ; la reprise de VR nécessite l'action explicite habituelle.

## Médias réutilisés

- La Joconde : interaction V6.7 et médias déjà résolus par son POI.
- Belle Ferronnière : `assets/artists/leonardo-da-vinci/collection/la-belle-ferronnière-davinci.webp`, 280 088 octets. Aucun GLB correspondant trouvé lors de l'audit.
- Astronome : `assets/artists/johannes-vermeer/collection/the-astronomer-vermeer.webp`, 165 752 octets.
- Métadonnées audio : manifests canoniques locaux `content/media-manifests/artworks/ld06/manifest.json` et `artworks/ve05/manifest.json`. Ils sont lus, pas modifiés. Les narrations publiées proviennent de `https://media.artdaci.com/artworks/{artworkId}/audio/{fr|en|ar}/overview.mp3`, dans la langue exacte.

Les six audios répondent HTTP 200 et `audio/mpeg` lors du contrôle. Tailles FR/EN/AR : Belle 1 615 548 / 1 649 820 / 1 858 800 octets ; Astronome 1 511 894 / 1 790 255 / 1 980 426 octets. Une image ou un audio indisponible affiche un message et laisse les retours utilisables, sans retry automatique en boucle ni narration inventée. Pas de copie de médias ni upload R2.

Le GLB existant `assets/artists/johannes-vermeer/profile/models/the-astronomer-vermeer-c2.glb` a été audité : 3 621 760 octets, un mesh, 28 402 triangles, quatre images, extension `EXT_texture_webp`. Le loader existant accepte cette extension ; son rendu n'a pas été validé dans V6.11. Le chemin est réservé dans les données avec `modelPolicy: audited-not-loaded`. Il n'est pas chargé : la fiche image/audio est pertinente pour cette phase sans nouvelle salle ni modèle lourd supplémentaire.

Les slugs canoniques et les anciens slugs des métadonnées divergent pour ces œuvres. Le viewer VR existant ne prend pas en charge ces deux tableaux ; des liens fabriqués vers `vr.html` seraient trompeurs. « Explorer dans ARTDACI » ouvre donc leur fiche GEO avec les médias ARTDACI existants, dans la même scène et la même session XR, pas une route non implémentée.

## Performance et contrôles navigateur

La configuration et le module d'interface sont chargés à la première ouverture du parcours et partagés entre les demandes concurrentes. L'image et le manifest audio d'une œuvre ne sont demandés qu'à l'ouverture de sa fiche. Le fichier audio n'est demandé qu'après « Écouter ». Aucune requête de GLB ne provient du parcours. Les réponses tardives sont ignorées après fermeture ou changement d'étape. Une requête de configuration est limitée à six secondes ; une requête de manifest à 4,5 secondes.

Observation desktop locale, avec certains fichiers déjà en cache : ouverture de la configuration et dessin en 13 ms ; ouverture complète de l'adaptateur, incluant l'import différé, mesurée ensuite à 33 ms puis 24 ms. Ces échantillons sont des observations navigateur PC, pas des mesures Quest ou un benchmark. Les diagnostics `data-art-trail-open-ms`, `data-art-trail-total-open-ms` et `data-art-trail-resources` permettent de relever d'autres échantillons. Une taille de transfert nulle peut signifier cache ou restriction des mesures interorigines, pas absence de média.

Les observations chiffrées de rendu, audio et performances ci-dessus concernent le contrôle V6.11 initial sur navigateur PC ; elles ne sont pas des mesures Quest. Les deux catégories et les interactions V6.11.1 ont ensuite été validées matériellement par l'utilisateur sur Meta Quest 3S.

Les ressources Art Trail contrôlées répondent 200 ou 304. Le serveur local signale `favicon.ico` absent, sans effet sur l'expérience. La copie locale V5 de la salle a aussi pris le relais du modèle distant pendant la QA. Sur le retour au viewer extérieur mobile, la base existante essaie le GLB expérimental local absent `Louvre-full-joint-mobile.glb` (404), puis la variante R2 `quest-webp` dont le chargement a échoué dans ce navigateur, avant de charger correctement le GLB original. Le contrôle HEAD direct du GLB `quest-webp` répond cependant 200 : l'objet n'est pas absent de R2 ; la cause de l'échec navigateur n'est pas établie ici. Ces fallbacks sont configurés dans la base V6.10 et ne sont pas modifiés par V6.11 ; leurs messages console sont conservés et signalés. Aucune mesure de FPS ou de mémoire Quest n'est revendiquée.

## Tests et invariants

Les tests GEO couvrent données, œuvres et sources officielles, absence d'Annonciation, catégories séparées, statuts et positions inconnues, langues, progression Mona Lisa → Astronome, reprise de session, les deux actions post-Joconde de Leonardo, audio canonique, fallback, panneau compact, raycast des vrais boutons, rayons/cursors et activation par les deux handlers de contrôleurs. La séquence Mona Lisa et les modules protégés V5 à V6.10 sont vérifiés contre le tag, avec normalisation Git des fins de ligne CRLF pour les fichiers texte. Les tests existants vérifient également les hashes des GLB protégés et la locomotion/rotation/téléportation.

Contrôle V6.11.1 du 2 octobre 2026 : 78/78 tests GEO réussis, syntaxe des 15 scripts GEO valide et `git diff --check` sans erreur. Le navigateur local a confirmé le parcours FR de Leonardo vers L'Astronome, la collection vers La Belle Ferronnière, les libellés EN, l'arabe RTL en 390 × 844 sans débordement horizontal, les images et le démarrage de l'audio arabe. Les ressources locales du parcours et de la fiche testée répondaient 200 ; aucune erreur ou alerte JavaScript n'a été relevée dans la console de ces parcours. La suite inclut un test de panne réseau simulée qui écrit volontairement un avertissement pendant l'exécution, sans échec.

Commande : `node --test --test-isolation=none tests/geo-*.test.mjs`. Vérification syntaxique des scripts GEO et `git diff --check` à exécuter avant toute décision de commit. Aucun test préexistant extérieur à GEO n'est corrigé.

## Validation Quest 3S effectuée par l'utilisateur

URL locale de QA : `http://127.0.0.1:8771/geo/room.html?lang=fr&from=louvre-xr&check=v6111-qa`. Le serveur ne publie rien sur Internet. La validation matérielle a été rapportée par l'utilisateur ; aucun nouvel essai sur casque n'est revendiqué lors du figement Git.

Pour reproduire le contrôle après connexion USB et autorisation du débogage, configurer `adb reverse tcp:8771 tcp:8771`, puis ouvrir dans Quest Browser `http://localhost:8771/geo/room.html?lang=fr&from=louvre-xr&check=v6111-qa`. L'accès `localhost` sur le casque nécessite cette redirection ; il ne pointe pas spontanément vers le PC.

1. Entrer dans la Salle des États.
2. Sélectionner Leonardo.
3. Choisir « Commencer la visite ».
4. Voir La Joconde.
5. Revenir à Leonardo.
6. Choisir « Continuer le parcours dans le Louvre ».
7. Vérifier que L'Astronome est proposé comme prochaine étape, puis ouvrir sa fiche, son image et son audio ; vérifier salle 837, Richelieu, niveau 2.
8. Revenir à Leonardo.
9. Choisir « Découvrir mes autres œuvres au Louvre ».
10. Ouvrir La Belle Ferronnière.
11. Vérifier « actuellement non exposée », sans salle inventée ; tester image/audio.
12. Revenir au guide, puis tester les retours à la salle et au Louvre extérieur et la conservation de la langue.
13. Tester les deux manettes : rayon arrêté au panneau, surbrillance et activation, sans téléportation involontaire.
14. Vérifier locomotion, rotation 360° et téléportation, puis EN et AR/RTL.

L'utilisateur a confirmé sur Meta Quest 3S le guide Leonardo, La Joconde et son retour, les deux branches distinctes, le statut exposé et la salle 837 de L'Astronome, le statut non exposé sans salle fictive de La Belle Ferronnière et l'absence de l'Annonciation. Il a également confirmé précédent/suivant, les retours au guide, à la Salle des États et au Louvre extérieur, les deux manettes, le raycast, la surbrillance, la locomotion, la rotation 360°, la téléportation et le confort des panneaux. Aucune mesure FPS ou mémoire Quest n'a été fournie.
