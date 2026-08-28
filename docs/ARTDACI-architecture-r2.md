# Architecture média Cloudflare R2 d’ARTDACI

## Statut et périmètre

Ce document décrit la fondation technique de la migration des médias ARTDACI vers Cloudflare R2. Il ne déclenche aucun transfert, ne retire aucun fichier local et ne connecte pas encore `ve01` aux pages du site.

Le dépôt Git est la source de vérité des catalogues et manifestes. R2 contient uniquement les copies publiées et les objets média. Le domaine public est `https://media.artdaci.com`.

## Arborescence hybride

Les ressources propres à une œuvre sont rangées sous son identifiant :

```text
artworks/{id}/
  manifest.json
  images/
  audio/{lang}/
  videos/
  models/
  ar/
```

Les ressources sans œuvre propriétaire unique sont rangées sous `shared/`, tout en conservant leur famille média :

```text
shared/
  images/{domaine-fonctionnel}/
  audio/{domaine-fonctionnel}/{lang}/
  videos/{domaine-fonctionnel}/
  models/{domaine-fonctionnel}/
  ar/{domaine-fonctionnel}/
```

Les domaines fonctionnels peuvent être `artists/`, `museums/`, `environments/`, `groups/`, `music/`, `books/` ou `app/`. Il n’existe pas de catégorie `media.shared` dans un manifeste. Une ressource partagée reste sous `media.images`, `media.audio`, `media.videos`, `media.models` ou `media.ar` et porte `scope: "shared"`.

## Sources canoniques dans Git

```text
content/media-manifests/
  catalog.json
  schema/artwork-media-manifest.schema.json
  artworks/{id}/manifest.json
```

- `catalog.json` fixe les 24 œuvres actives et les 8 identifiants réservés.
- Le schéma JSON commun porte la version `2.0`.
- Chaque manifeste validé dans Git peut ensuite être publié à l’emplacement `artworks/{id}/manifest.json` dans R2.
- Les fichiers éditoriaux riches de `content/paintings/` restent indépendants des manifestes média.
- Un manifeste R2 ne doit jamais être modifié directement sans mise à jour préalable de sa source Git.

## Résolution des médias

Chaque manifeste définit deux bases :

```json
{
  "mediaBaseUrl": "https://media.artdaci.com/artworks/ve01/",
  "sharedMediaBaseUrl": "https://media.artdaci.com/shared/"
}
```

La résolution dépend uniquement de `scope` :

- `scope: "artwork"` utilise `mediaBaseUrl` ;
- `scope: "shared"` utilise `sharedMediaBaseUrl`.

Le `path` reste relatif à cette base. Les chemins absolus, les antislashs, les protocoles intégrés et les segments `..` sont interdits.

Le chargeur doit vérifier `available === true` avant de lire la base, de construire une URL ou d’affecter un attribut `src`/`href`. Une entrée absente, invalide ou marquée `available: false` conserve le repli local déjà présent dans la page.

## Familles et langues

Les cinq familles autorisées sont :

- `images` : œuvres, posters, variantes visuelles et images de QR codes ;
- `audio` : guides et ambiances, regroupés par langue ;
- `videos` : animations et séquences ;
- `models` : modèles GLB et variantes ;
- `ar` : cibles MindAR et ressources propres à l’expérience AR.

Les clés de langue suivent BCP 47 en minuscules (`en`, `fr`, `ar`, puis au besoin `fr-ca`, etc.). Pour une page donnée, le résolveur essaie la langue complète, puis sa langue principale, puis `defaultLanguage`. Si une variante explicitement demandée existe mais est indisponible, elle n’est jamais remplacée silencieusement par une autre langue.

## Nommage et immutabilité

- clés en minuscules ASCII et `kebab-case` ;
- extensions en minuscules ;
- aucun espace, accent, antislash ou nom temporaire tel que `final-v2-new` ;
- noms fondés sur le rôle (`main`, `guide`, `animation`, `target`) ;
- première publication sous une clé stable et documentée ;
- toute modification binaire ultérieure crée une nouvelle clé versionnée ou suffixée par un hash, par exemple `main--sha256-a1b2c3d4.webp` ;
- une clé déjà servie avec une longue durée de cache n’est jamais écrasée.

Les objets média versionnés peuvent recevoir une longue durée de cache et le marqueur `immutable`. Les manifestes JSON restent sans cache longue durée pendant la migration : en-tête recommandé `Cache-Control: no-store` ou, si l’infrastructure exige une revalidation, `Cache-Control: no-cache, must-revalidate`. Le chargeur utilise aussi une requête `cache: "no-store"`. Son cache de promesse est limité à la durée de vie de la page et ne constitue pas un cache HTTP persistant.

## QR codes

Une image de QR code peut être publiée sous `artworks/{id}/images/qr/...`. Le contenu encodé doit toujours être une route stable du site, par exemple :

```text
https://artdaci.com/a/ve01
https://artdaci.com/ar.html?painting=vermeer-girl-with-a-pearl-earring
```

Un QR code ne doit jamais encoder directement une URL `media.artdaci.com`. La destination publique reste ainsi stable même si une clé R2, un format ou un fournisseur change.

## Quarantaine et doublons

Les 79 médias `inutilise-probable` et les 19 fichiers des 9 groupes de doublons sont gelés : aucun transfert et aucune suppression. Lorsqu’une entrée doit être documentée dans un manifeste de préparation, elle porte `migrationStatus: "quarantined-unused"` ou `migrationStatus: "quarantined-duplicate"` et obligatoirement `available: false`.

Une future déduplication exige d’abord le choix d’un propriétaire sémantique, le remplacement de tous les consommateurs, une validation locale et en production, puis une décision séparée. Elle ne fait pas partie de la présente fondation.

## Publication future

Une publication de lot devra suivre cet ordre :

1. validation du catalogue, du schéma et des manifestes ;
2. calcul de la taille, du type MIME et du SHA-256 de chaque objet ;
3. refus des fichiers en quarantaine ou appartenant à un groupe de doublons non arbitré ;
4. transfert sous une nouvelle clé, sans écrasement ;
5. contrôle distant du contenu et des métadonnées ;
6. passage de l’entrée concernée à `available: true` dans Git ;
7. publication du manifeste avec cache désactivé pendant la migration ;
8. tests navigateur CORS, réseau et interface avant toute suppression locale.

## Second pilote

`ve01`, La Jeune Fille à la perle, est le second pilote retenu. Son manifeste source décrit image, audio anglais et français, vidéo, modèles 3D et cible AR. Toutes ces entrées restent `available: false` tant que les objets correspondants n’ont pas été publiés et vérifiés. Le pilote n’est pas encore relié à ses pages.
