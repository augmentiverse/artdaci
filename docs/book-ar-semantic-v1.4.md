# ARTDACI Book AR → Semantic : navigation par œuvre (V1.4)

## Diagnostic et correction
Le bouton **Graphe sémantique** de Book AR pointait vers `semantic/?lang=...` sans `artwork`. L'interface Semantic choisissait alors `ld01` (La Joconde) par défaut.

Book AR construit désormais le lien à partir du tableau actuellement sélectionné, au clic sur le bouton d'un peintre **et** à chaque changement d'œuvre via la mini-galerie. Les liens conservent FR/EN/AR : `semantic/?artwork=<ID>&lang=<fr|en|ar>`.

## Identifiants
| Book AR | Semantic | Tableau |
| --- | --- | --- |
| Leonardo · mona-lisa | ld01 | La Joconde |
| Leonardo · ermine | ld02 | La Dame à l'hermine |
| Leonardo · ginevra | ld03 | Ginevra de' Benci |
| Leonardo · ferronniere | ld04 | La Belle Ferronnière |
| Vermeer · pearl | ve01 | La Jeune Fille à la perle |
| Vermeer · milkmaid | ve03 | La Laitière |
| Vermeer · delft | ve02 | Vue de Delft |
| Vermeer · balance | ve04 | La Femme à la balance |
| Van Gogh · self-portrait-1889 | vg01 | Autoportrait (1889) |
| Van Gogh · bedroom | vg02 | La Chambre |
| Van Gogh · starry-night | vg03 | La Nuit étoilée |
| Van Gogh · cafe-terrace | vg04 | Terrasse du café le soir |
| Monet · sunrise | mo01 | Impression, soleil levant |
| Monet · parasol | mo02 | Femme à l'ombrelle |
| Monet · poppies | mo03 | Les Coquelicots |
| Monet · water-lilies | mo04 | Les Nymphéas (série) |

Ces identifiants sont centralisés dans `scripts/book-ar-semantic.mjs`.

## Couverture du graphe
Les quatre profils initiaux `ld01`, `ve01`, `vg01`, `mo01` ont été préservés sans altérer leurs ressources IIIF, entités, iconographies et relations existantes.

Douze profils sémantiques **éditoriaux provisoires** ont été ajoutés à `content/semantics/artwork-concepts.json`. Chacun possède une image issue d'ARTDACI, des métadonnées FR/EN/AR et dix assertions pondérées utilisant les **50 concepts déjà définis**. Il s'agit de graphes de concepts fonctionnels, pas de nouveaux corpus IIIF annotés ou de données muséales officiellement vérifiées. Les pondérations et certaines métadonnées doivent faire l'objet d'une révision scientifique avant publication.

Le sélecteur Semantic peut maintenant présenter 16 œuvres ; il est affiché comme un ruban horizontal défilant pour conserver la visibilité du graphe, en particulier sur mobile.

## Validation
- `node --test tests/book-ar-semantic.test.mjs`
- `node --test tests/book-ar.test.mjs tests/book-ar-discovery.test.mjs tests/book-ar-panel.test.mjs`
- `node tests/semantic/validate-semantic.mjs`
- Vérifier manuellement en Preview : choisir chaque peintre, puis une œuvre, cliquer sur Graphe sémantique, vérifier **titre, illustration, identifiant URL et concepts centraux** ; effectuer le test pour FR, EN et AR.
- Exemples : `semantic/?artwork=ve02&lang=fr` pour Vue de Delft ; `semantic/?artwork=vg03&lang=fr` pour La Nuit étoilée ; `semantic/?artwork=mo04&lang=ar` pour Les Nymphéas.

**La PR #16 doit rester ouverte jusqu'aux tests sur la Preview. Pas de fusion ni de déploiement sur artdaci.com sans validation.**
