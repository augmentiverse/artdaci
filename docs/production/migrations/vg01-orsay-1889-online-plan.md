# VG01 — Basculement contrôlé vers l'Autoportrait du musée d'Orsay (1889)

**État : préparation en ligne — NON PUBLIÉ.** Branche `prepare/vg01-orsay-1889-online`, issue du `main` après fusion de la PR #17. Cette préparation n'altère ni le site de production, ni son manifeste `vg01`, ni les objets Cloudflare R2.

## Situation constatée au 18 octobre 2026

- La production Git est au commit `448fb3ea042969547ed2c9d09a37b030bdd735a3` (PR #17 fusionnée).
- `codex/vg01-orsay-1889` n'est **pas présente sur GitHub** à cette date : ses changements restent locaux et ne peuvent pas encore être intégrés ou comparés automatiquement.
- Le manifeste canonique actuel `content/media-manifests/artworks/vg01/manifest.json` indique déjà `artwork.date: "1889"`, mais `media.images.main` référence `images/main.jpg` (476 867 octets) et `media.models.portrait` référence `models/portrait.glb` (25 002 780 octets), issus de la configuration précédente.
- La Galerie VR contient encore des descriptions associées à **Paris, 1887** dans `scripts/gallery-vr.js`. Changer uniquement ces textes avant de remplacer le média produirait une attribution erronée.
- Trois nouveaux médias 1889 ont été produits localement, mais Work local signale leurs URL R2 en HTTP 404 et leur disponibilité non validée.

## Trois médias préparés (empreintes communiquées par Work local)

Le fichier `docs/production/migrations/vg01-orsay-1889-readiness.json` définit **des clés immuables provisoires**. Leur nom doit être comparé à la branche locale avant l'upload. Aucun objet publié ne doit être écrasé.

| Rôle | Clé R2 proposée (relative à `artworks/vg01/`) | Octets | SHA-256 |
| --- | --- | ---: | --- |
| images.main | `images/main-orsay-1889-v1.webp` | 267 520 | `65b10b377b341e2837768a2a1c748b53546e0e8e5ac72d2cfe994dbf486844fa` |
| models.portrait | `models/portrait-orsay-1889-v2.glb` | 3 198 048 | `1178d84ef3884c6b9585a80bb7e053cc8a359749f6816f5c2fc209e2dbb89126` |
| ar.target | `ar/target-orsay-1889-v1.mind` | 980 862 | `2cd573741ed98fab27e53bdffdfd17430a8c2dc65e3e32e210950e2f3bcabc1b` |

**Ces trois éléments sont explicitement `available: false`, `migrationStatus: planned` dans le document préparatoire.** Le document préparatoire n'est pas un manifeste média et n'est pas lu par les pages du site. Il ne doit pas être publié comme `artworks/vg01/manifest.json`.

## Vérification en ligne, sans identifiants Cloudflare

Après transfert R2, le contrôle est exécutable depuis un environnement Node 20+ :

```sh
node --test tests/vg01-orsay-readiness.test.mjs
node scripts/check-vg01-orsay-media.mjs
node scripts/check-vg01-orsay-media.mjs --remote
```

Le mode par défaut examine les clés, rôles, tailles, types MIME et SHA déclarés **sans accès réseau**. Le mode `--remote` effectue un GET de chaque objet R2 sous `https://media.artdaci.com/artworks/vg01/`, contrôle la réponse HTTP, le MIME, l'en-tête `Access-Control-Allow-Origin`, les octets et l'empreinte SHA-256 du flux téléchargé. **Il ne fait aucun upload, n'active aucun média et ne modifie jamais le manifeste**. Les contrôles doivent échouer tant que les ressources sont absentes ou incorrectes.

S'il existe une politique CORS plus restrictive (origines distinctes pour Preview et Production), tester également les navigateurs réels sur ces origines avant publication. La vérification automatisée inclut `Origin: https://artdaci.com`.

## Ordre d'intégration sans conflit

1. **Publier la branche locale** `codex/vg01-orsay-1889` sur GitHub, en laissant `main` intact. Vérifier son contenu, son commit et ses médias préparés. Ce document ne remplace pas ce travail.
2. **Comparer les deux branches** au `main` issu de PR #17 ; réconcilier précisément `index.html`, `index-fr.html`, `index-ar.html`, les CSS et les références de la galerie. Préserver les nouveaux portraits et le format naturel des quatre tableaux.
3. Vérifier ensemble toutes les pages : Book AR et Semantic, index, page imprimable, AR image tracking, Spatial, galerie et cinéma VR, Living Book, Masters Hub et pages musées, en FR/EN/AR. Ne pas mettre un média Chicago 1887 sous une étiquette Orsay 1889.
4. **Téléverser R2** sous les trois nouvelles clés versionnées, sans écrasement ; configurer les types MIME et la règle CORS ; faire passer **tous les contrôles distants**. Aucun identifiant R2 ne doit être copié dans les commits, messages ou logs.
5. Dans un seul lot cohérent, actualiser le **manifeste Git canonique** : utiliser les nouveaux chemins/tailles/empreintes, activer seulement les ressources vérifiées et retirer les anciens médias Chicago 1887 des consommateurs VG01. L'ancien audio et l'ancienne vidéo doivent être désactivés si leur attribution à l'œuvre 1889 n'est pas validée. Conserver les ressources non validées en quarantaine, sans supprimer les objets existants.
6. Valider schéma, catalogue, navigation FR/EN/AR, absence de mélanges 1887/1889 et disponibilité média en Preview. **Publier ensuite le manifeste sur R2** avec `Cache-Control: no-store`, après que sa source Git a été validée.
7. Fusionner vers `main` puis contrôler Vercel Production et tester physiquement smartphone/Quest (MindAR, modèles GLB et affichage WebXR). Prévoir un retour en arrière basé sur la version précédente du manifeste et du commit.

## Garde-fous

- Ne pas modifier les clés déjà publiées telles que `artworks/vg01/images/main.jpg` ou `artworks/vg01/models/portrait.glb`.
- Ne pas fusionner la branche préparatoire avant d'avoir repris le lot local. Le script de préparation constitue une aide de vérification, pas une migration autonome.
- Un échec du contrôle distant ou un média 404 **bloque** la promotion vers `available: true`.
- Les validations automatiques et la réussite Vercel ne remplacent pas les tests AR/VR réels.
