# Audit global des pages et médias ARTDACI

Date : 28 août 2026
Périmètre : dépôt local `artdaci`, branche `main`, après mise en production du prototype R2 `ld01`.

## 1. Résultat de la mise en production ld01

- Commit créé et poussé : `a0e62d5 feat: load Mona Lisa media from R2 manifest`.
- Branche et remote : `main` vers `origin/main`.
- Déploiement : production Vercel active sur `https://artdaci.com`.
- Pages vérifiées :
  - `https://artdaci.com/print-target.html`
  - `https://artdaci.com/print-target-fr.html`
- Nouveau script servi : `https://artdaci.com/scripts/artwork-media-manifest.js`.
- Manifeste chargé : `https://media.artdaci.com/artworks/ld01/manifest.json`.
- Image chargée dans les deux emplacements de chaque page : `https://media.artdaci.com/artworks/ld01/images/main.png`, 1448 × 1086.
- Journaux navigateur : aucune erreur ni aucun avertissement.
- Médias `available: false` : aucun chemin audio, vidéo, modèle ou cible AR injecté dans le DOM.
- En-têtes publics : réponses `200`, `Server: Vercel`.

Le compte Vercel connecté à Codex ne retourne aucun projet. L’identifiant de déploiement, la durée du build et les logs internes ne sont donc pas accessibles depuis cette connexion. La mise en production a été confirmée par les fichiers servis, les en-têtes Vercel et le test navigateur complet des pages publiques.

## 2. Livrables de l’audit

- `ARTDACI-inventaire-medias-2026-08-28.csv` : 364 lignes, une par média web.
- `ARTDACI-inventaire-pages-2026-08-28.csv` : 27 pages HTML.
- `ARTDACI-inventaire-localisation-2026-08-28.csv` : 179 lignes de sources ou médias portant un signal linguistique.

Les CSV sont encodés en UTF-8 et utilisent le point-virgule comme séparateur. L’inventaire média contient les colonnes demandées : pages, artiste, œuvre, langue, chemin local, catégorie, format, taille, utilisation actuelle, fichiers sources, statut, groupe de doublon, référence cassée, identifiant proposé, portée, cible R2 et SHA-256.

## 3. Méthode et limites

L’analyse combine :

1. l’énumération physique de tous les médias sous `assets/` ;
2. le calcul SHA-256 pour les doublons binaires ;
3. la recherche des références exactes dans HTML, JSON, JavaScript, CSS et Markdown ;
4. l’association des manifests aux pages dynamiques qui les consomment ;
5. des règles de rapprochement par artiste, œuvre, slug et nom de fichier ;
6. la génération d’une cible R2 sans déplacer ni supprimer le fichier local.

Le statut `inutilise-probable` signifie qu’aucune référence textuelle exacte n’a été trouvée. Il ne suffit pas à autoriser une suppression : certains chemins peuvent être construits dynamiquement, utilisés uniquement dans des documents imprimés, ou conservés comme source de production. Chaque candidat devra être confirmé par un test d’exécution et une décision éditoriale.

Les 13 documents Word/PDF représentent environ 533,8 Mio. Ils constituent un corpus éditorial séparé et ne sont pas comptés dans les 364 médias web. Plusieurs DOCX sont des versions de travail non suivies par Git et peuvent contenir leurs propres copies incorporées d’images ; leur déduplication demande un audit documentaire distinct avant toute action.

## 4. Vue d’ensemble du dépôt

Le dépôt contient 27 pages HTML et 364 médias web, pour 1 769 113 597 octets, soit environ 1,65 Gio.

| Catégorie | Nombre | Taille approximative |
|---|---:|---:|
| Images | 230 | 448,6 Mio |
| Audios | 49 | 272,0 Mio |
| Vidéos | 20 | 152,2 Mio |
| Modèles 3D | 55 | 806,8 Mio |
| Cibles AR MindAR | 10 | 7,5 Mio |
| **Total** | **364** | **1,65 Gio** |

Formats principaux : 196 PNG, 55 GLB, 40 MP3, 25 WEBP, 20 MP4, 10 MIND, 9 M4A, 5 JPG, 2 SVG, 1 JPEG et 1 AVIF.

### Utilisation et intégrité

| Statut exclusif | Nombre | Interprétation |
|---|---:|---|
| Référencé | 266 | Une ou plusieurs références textuelles détectées |
| Inutilisé probable | 79 | Aucun consommateur textuel détecté ; validation manuelle requise |
| Doublon binaire | 19 | Fichier appartenant à l’un des neuf groupes SHA-256 identiques |
| Référence cassée | 0 | Aucun chemin local exécutable manquant |

Le contrôle de références du dépôt et l’audit concordent : aucune référence locale cassée n’est détectée dans les pages ou scripts actuels.

### Poids des médias probablement inutilisés

- 9 modèles 3D : environ 313,6 Mio.
- 62 images : environ 165,3 Mio.
- 8 audios : environ 13,3 Mio.

Principaux candidats à examiner, sans suppression à ce stade :

- `assets/environments/gallery/models/museums/louvre_pyramids.glb` — 74,10 Mio ;
- `assets/artists/groups/models/DaVici_Monet_vanGogh_Vermeer.glb` — 72,74 Mio ;
- `assets/artists/groups/models/DaVici_Monet_vanGogh_Vermeer_supporters.glb` — 71,45 Mio ;
- `assets/environments/gallery/models/museums/Louvre-complet_c.glb` — 26,94 Mio ;
- `assets/environments/gallery/models/museums/Louvre-full_c.glb` — 26,32 Mio.

## 5. Inventaire des pages

Les 27 pages se répartissent ainsi :

- entrées de collection : `index.html`, `index-fr.html`, `index-ar.html` ;
- expériences AR : `ar.html`, `space.html`, `camera-test.html`, `compile-target.html` ;
- expériences VR et immersives : `vr.html`, `gallery-vr.html`, `cinema-vr.html`, `book-3d.html`, `atlas.html` ;
- pages imprimables et catalogue : 15 fichiers `print-*.html`.

Les pages les plus dépendantes du catalogue média sont :

- `gallery-vr.html` : environ 220 médias directs ou hérités ;
- `book-3d.html` : environ 79 ;
- les trois index : environ 69 à 72 chacun ;
- `ar.html`, `space.html`, `vr.html` et `print-ar.html` : environ 66 chacun.

Le CSV des pages précise pour chacune la langue déclarée, le titre, le rôle, les scripts chargés, le nombre de médias directs ou hérités et les références cassées.

## 6. Langues et localisation

Parmi les médias :

- 44 variantes anglaises détectées ;
- 44 variantes françaises ;
- 42 variantes arabes ;
- 234 médias neutres ou dont la langue ne peut pas être déterminée de façon fiable par le nom.

L’inventaire de localisation recense 130 variantes média explicitement linguistiques et 49 sources contenant des marqueurs `fr`, `en` ou `ar` : 18 sources trilingues, 17 bilingues et 14 monolingues explicites.

Points à normaliser :

- les langues sont parfois portées par le nom (`-fr`, `-en`, `-ar`), parfois seulement par la clé JSON ;
- plusieurs fichiers arabes utilisent directement des caractères arabes dans leur nom ;
- des noms français contiennent accents, apostrophes typographiques et espaces ;
- le contenu anglais est souvent le contenu racine du manifest, sans clé `en`, tandis que `fr` et `ar` se trouvent dans `localizations`.

Recommandation : utiliser dans R2 un dossier de langue stable (`audio/fr/`, `audio/en/`, `audio/ar/`) et conserver le titre humain Unicode dans le manifest, mais normaliser les clés de stockage avec des slugs ASCII lorsque cela ne nuit pas à la traçabilité.

## 7. Nomenclature proposée des 32 œuvres

Le catalogue de données actuel décrit 24 œuvres : six par artiste. Les identifiants 07 et 08 de chaque série doivent rester réservés tant que les huit œuvres complémentaires ne sont pas décidées éditorialement.

| ID | Artiste | Œuvre proposée | État |
|---|---|---|---|
| ld01 | Léonard de Vinci | La Joconde / Mona Lisa | prototype R2 en production |
| ld02 | Léonard de Vinci | La Dame à l’hermine | contenu local existant |
| ld03 | Léonard de Vinci | La Cène | contenu local existant |
| ld04 | Léonard de Vinci | L’Annonciation | contenu local existant |
| ld05 | Léonard de Vinci | Ginevra de’ Benci | contenu local existant |
| ld06 | Léonard de Vinci | La Belle Ferronnière | contenu local existant |
| ld07 | Léonard de Vinci | À définir | emplacement réservé |
| ld08 | Léonard de Vinci | À définir | emplacement réservé |
| ve01 | Johannes Vermeer | La Jeune Fille à la perle | contenu local existant |
| ve02 | Johannes Vermeer | Vue de Delft | contenu local existant |
| ve03 | Johannes Vermeer | La Laitière | contenu local existant |
| ve04 | Johannes Vermeer | L’Art de la peinture | contenu local existant |
| ve05 | Johannes Vermeer | L’Astronome | contenu local existant |
| ve06 | Johannes Vermeer | La Femme à la balance | contenu local existant |
| ve07 | Johannes Vermeer | À définir | emplacement réservé |
| ve08 | Johannes Vermeer | À définir | emplacement réservé |
| vg01 | Vincent van Gogh | Autoportrait | contenu local existant |
| vg02 | Vincent van Gogh | La Chambre à Arles | contenu local existant |
| vg03 | Vincent van Gogh | La Nuit étoilée | contenu local existant |
| vg04 | Vincent van Gogh | Les Tournesols | contenu local existant |
| vg05 | Vincent van Gogh | Terrasse du café le soir | contenu local existant |
| vg06 | Vincent van Gogh | Le Café de nuit | contenu local existant |
| vg07 | Vincent van Gogh | À définir | emplacement réservé |
| vg08 | Vincent van Gogh | À définir | emplacement réservé |
| mo01 | Claude Monet | Impression, soleil levant | contenu local existant |
| mo02 | Claude Monet | Le Pont d’Argenteuil | contenu local existant |
| mo03 | Claude Monet | Les Nymphéas | contenu local existant |
| mo04 | Claude Monet | Le Pont japonais | contenu local existant |
| mo05 | Claude Monet | Les Coquelicots | contenu local existant |
| mo06 | Claude Monet | La Femme à l’ombrelle | contenu local existant |
| mo07 | Claude Monet | À définir | emplacement réservé |
| mo08 | Claude Monet | À définir | emplacement réservé |

### Ressources transversales

138 médias sont rattachables à une œuvre précise. Les 226 autres sont transversaux à un artiste, un musée, une galerie, un groupe de peintres ou l’application elle-même :

- 134 ressources transversales à un artiste ou musée ;
- 92 ressources réellement partagées ou d’infrastructure.

Il serait incorrect de forcer les meubles de galerie, bâtiments de musée, musiques d’ambiance, groupes multi-artistes, icônes et modèles de livre dans un identifiant d’œuvre. Le chemin recommandé est `https://media.artdaci.com/shared/...`. Les montages couvrant plusieurs œuvres utilisent dans le CSV une plage, par exemple `ld01-ld06`, afin de rendre leur portée explicite.

## 8. Doublons binaires

Neuf groupes SHA-256 identiques regroupent 19 fichiers :

1. image Paul Durand-Ruel dupliquée entre `claude-monet/reimagined` et `claude-monet/supporters` ;
2. QR audio anglais dupliqué entre `mona-lisa-audio-en.png` et `multimedia-audio-en.png` ;
3. image Vermeer assise dupliquée entre le dossier de l’œuvre et `shared/reimagined-gallery` ;
4. `davinci_monalisa.png` identique à `davinci/main.png` ;
5. Van Gogh debout dans la chambre dupliqué entre le dossier de l’œuvre et `shared/reimagined-gallery` ;
6. image Pieter van Ruijven dupliquée entre `reimagined` et `supporters` ;
7. trois GLB du Louvre identiques : `Louvre-d_c.glb`, `Louvre-f_c.glb`, `Louvre-pyramid_c.glb` ;
8. QR audio français dupliqué entre `mona-lisa-audio-fr.png` et `multimedia-audio-fr.png` ;
9. `louvre_face.png` identique à `louvre_faceeee.png`.

Le CSV contient le groupe `D001` à `D009`, les chemins, tailles et consommateurs. Aucune déduplication ne doit intervenir avant le remplacement des références et la validation des pages concernées.

## 9. Chemins R2 proposés

Pour une ressource liée à une œuvre :

```text
https://media.artdaci.com/artworks/{id}/images/{fichier}
https://media.artdaci.com/artworks/{id}/audio/{langue}/{fichier}
https://media.artdaci.com/artworks/{id}/videos/{fichier}
https://media.artdaci.com/artworks/{id}/models/{fichier}
https://media.artdaci.com/artworks/{id}/ar/{fichier}
```

Pour une ressource transverse :

```text
https://media.artdaci.com/shared/{chemin-fonctionnel}
```

L’inventaire ne produit aucune collision de chemin cible. Les propositions conservent actuellement le nom de fichier local pour assurer la traçabilité. Lors de chaque lot de migration, le nom final devra être revu pour adopter une convention ASCII, minuscule et stable, avec les noms éditoriaux Unicode conservés dans le manifest.

## 10. Évaluation de `artwork-media-manifest.js`

### Ce qui est déjà générique

- le script accepte n’importe quelle URL déclarée par `data-artwork-media-manifest` ;
- plusieurs racines peuvent être présentes sur une page ;
- `mediaBaseUrl` est combiné avec un chemin relatif par `new URL()` ;
- seuls les médias ayant exactement `available: true` sont acceptés ;
- seuls les protocoles HTTP et HTTPS sont autorisés ;
- l’échec réseau conserve les médias locaux de repli et n’interrompt pas la page.

### Limites pour 32 œuvres

Le script n’est pas encore suffisamment générique pour les 32 œuvres :

- il est codé uniquement pour `media.images.main` ;
- il remplace uniquement l’attribut `src` d’images portant `data-artwork-media="images.main"` ;
- il ne gère ni audio, ni vidéo, ni modèles 3D, ni cibles AR, ni sous-titres ;
- il ne sélectionne pas la langue à partir de `document.documentElement.lang` ;
- il ne gère pas les listes, variantes de modèles, posters, `srcset`, MIME types ou sources multiples ;
- il ne met pas en cache une promesse de manifest lorsque plusieurs composants demandent la même URL ;
- il ne valide pas `schemaVersion`, `id`, `slug` ou l’origine autorisée de `mediaBaseUrl` ;
- il ne publie pas d’état `loading`, `ready`, `unavailable` ou `error` exploitable par l’interface ;
- il ne masque pas ou ne désactive pas automatiquement un contrôle associé à un média indisponible ;
- les anciens manifests locaux utilisent un schéma différent (`media.image`, chaînes directes et tableaux sans enveloppe `available`).

### Adaptations proposées, sans implémentation

1. Introduire un résolveur générique de clé, par exemple `images.main`, `audio.fr`, `videos.main`, `models.main` ou `ar.target`.
2. Ajouter un adaptateur par type d’élément : `img/src`, `audio/src`, `video/src`, `source/src/type`, `model-viewer/src`, `a/href`, `poster` et `srcset`.
3. Sélectionner la langue depuis la page, avec une politique de repli explicite et configurable.
4. Interdire toute création de requête tant que `available !== true` ; pour les médias lourds, ne charger qu’à l’action utilisateur ou avec `preload="none"`.
5. Valider `schemaVersion`, l’identifiant attendu et une liste d’origines média autorisées.
6. Mettre en cache les requêtes de manifest par URL et accepter un `AbortSignal` ou un délai maximal.
7. Exposer des événements `artwork-media:ready`, `artwork-media:unavailable` et `artwork-media:error`.
8. Permettre au HTML de déclarer l’état de repli : conserver, masquer ou désactiver le composant.
9. Ajouter des tests unitaires du résolveur et des tests navigateur pour chaque type de média et chaque valeur de `available`.
10. Choisir une stratégie de schéma : migrer tous les manifests vers le schéma R2 1.0 est préférable ; un adaptateur temporaire peut normaliser les anciens JSON pendant la transition.

## 11. Plan de migration proposé

### Phase 0 — gouvernance

- figer la matrice des 24 œuvres existantes et décider ultérieurement des huit emplacements 07–08 ;
- figer le schéma de manifest R2, les conventions de langue, les slugs et les noms de clés ;
- définir clairement la zone `shared/` pour les médias sans propriétaire unique ;
- conserver les fichiers locaux comme repli pendant toute la migration.

### Phase 1 — standardisation du chargeur

- concevoir les adaptations listées ci-dessus ;
- ajouter une suite de tests couvrant image, audio, vidéo, modèle et cible AR ;
- déployer sans encore migrer de nouvel actif, puis vérifier la non-régression ld01.

### Phase 2 — lots pilotes

- migrer une deuxième œuvre simple par artiste : `ld02`, `ve01`, `vg01`, `mo01` ;
- commencer par l’image principale et le manifest avec tous les autres médias à `available: false` ;
- activer ensuite un type de média à la fois, langue par langue ;
- contrôler CORS, cache, poids, MIME, rendu local et production.

### Phase 3 — 24 œuvres existantes

- traiter par séries : ld01–ld06, ve01–ve06, vg01–vg06, mo01–mo06 ;
- migrer dans l’ordre : images, audios, vidéos, modèles, cibles AR ;
- mettre à jour les pages et manifests sans retirer les fichiers locaux ;
- tracer chaque actif par SHA-256 et URL R2 dans l’inventaire.

### Phase 4 — médias partagés

- déplacer logiquement les musées, décors, meubles, groupes, musiques et ressources de livre vers `shared/` ;
- remplacer les doublons par une seule URL canonique après validation des consommateurs ;
- vérifier particulièrement `gallery-vr.html`, qui concentre le plus de dépendances.

### Phase 5 — qualification des fichiers inutilisés

- tester les 79 candidats sur toutes les pages et modes ;
- distinguer source éditoriale, archive, média dormant et déchet réel ;
- ne proposer une suppression qu’après au moins deux versions de production stables et une sauvegarde vérifiée.

### Phase 6 — extension à 32 œuvres

- choisir les œuvres ld07–ld08, ve07–ve08, vg07–vg08 et mo07–mo08 ;
- créer données éditoriales, pages, médias et manifests selon le schéma déjà validé ;
- ne pas réutiliser arbitrairement ces identifiants pour les ressources transversales.

## 12. Décisions recommandées avant la prochaine implémentation

1. Valider la matrice d’identifiants proposée et le maintien en réserve des huit emplacements.
2. Valider l’existence d’un espace R2 `shared/` distinct des œuvres.
3. Choisir si les chemins R2 doivent préserver les noms actuels ou être normalisés dès le premier upload.
4. Valider la stratégie unique de manifest R2 1.0 plutôt qu’une coexistence durable de deux schémas.
5. Choisir le prochain lot pilote parmi `ld02`, `ve01`, `vg01` et `mo01`.

Aucun média n’a été déplacé ou supprimé pendant cet audit.
