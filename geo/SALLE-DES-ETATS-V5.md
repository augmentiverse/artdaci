# Salle des États — référence ARTDACI GEO V5

La V5 est la version de référence actuelle de la salle intérieure séparée du Louvre extérieur. Elle est accessible depuis `geo/remote.html` par « Entrer dans la Salle des États », puis directement sur `geo/room.html?lang=fr` (également `en` et `ar`). Le modèle est une **reconstruction visuelle ARTDACI inspirée de photographies**, et non un relevé ni une reproduction architecturale certifiée. Les dimensions, la corniche, la verrière, les détails des parois et le placement local de La Joconde sont des choix de conception non mesurés dans le musée ; ces coordonnées 3D ne sont pas des coordonnées Google Geospatial.

## Modèle figé

- Source V5 validée : `geo/assets/salle-des-etats-artdaci-v5-flat.glb` ; 1 687 700 octets ; SHA-256 `59359407aa1ab092c30932bed3e79fcf60f993fc534c8197835943c79e00efac`.
- Objet R2 versionné : `https://media.artdaci.com/geo/louvre/rooms/salle-des-etats-v5.glb`. Le téléchargement public reproduit exactement les octets du fichier local.
- GLB 2.0, générateur Blender 5.1.20 ; 27 maillages et 27 nœuds, 8 848 triangles, 4 matériaux et 3 textures JPEG intégrées (tissu bleu, parquet plan, image de La Joconde). Extension utilisée : `KHR_materials_unlit` ; aucune extension requise, aucune compression Draco/KTX2. Le poids téléchargé ne représente pas la mémoire GPU consommée.
- Bounding box géométrique locale Y-up : min `[-6.05000019, 0.10000000, -11]`, max `[6.05000019, 7.32499981, 17.79999924]`. Dimensions de conception : largeur 12,10 m, longueur 28,80 m, hauteur 7,325 m ; elles ne sont pas des mesures architecturales.
- Seule La Joconde (`ld01`) est exposée. Pas de cadres latéraux, statues, vitrines, socles ni barrières. Le parquet est une seule surface plane sans relief ; le plafond et sa verrière sont une interprétation visuelle.

Le GLB V5 est versionné dans Git **à la demande de l'utilisateur**, pour garantir un secours déployable si R2 devient inaccessible. Les textures nécessaires sont intégrées au GLB ; aucun PNG séparé n'est requis à l'exécution. Les fichiers locaux de fabrication et sources originales n'ont pas été modifiés par cette intégration.

## Chargement et repli

`geo/data/salle-des-etats.json` centralise la version, les deux URL, la taille, le SHA-256, le statut et la validation matérielle. `room-viewer.js` tente d'abord la V5 R2 ; si le réseau, CORS, le décodage ou la vérification du nœud `ld01` échoue, il essaie **une fois** le même GLB V5 local. Une défaillance des deux sources affiche un message et « Réessayer », sans boucle ni passage à V4. L'attribut `data-model-source` sur `#room-stage` indique `r2` ou `local` pour le diagnostic.

La politique CORS R2 préexistante autorise notamment `https://artdaci.com`, `https://www.artdaci.com`, `https://artdaci.vercel.app`, `https://augmentiverse.github.io` et les ports locaux 8765, mais pas 8766. Ainsi, un test local sur 8766 exerce normalement le repli ; utiliser une origine autorisée telle que `http://127.0.0.1:8765` pour tester le chargement R2 direct. Cette intégration ne modifie pas la politique CORS du bucket. L'objet versionné est servi en `model/gltf-binary` avec `Cache-Control: public, max-age=31536000, immutable` et prend en charge les requêtes Range.

## Validation et limites

L'utilisateur a validé la V5 sur **Meta Quest 3S** le 30 septembre 2026 : qualité visuelle, plafond, perception d'un parquet horizontal et navigation VR. Les tests automatisés couvrent le chargement/repli, les langues FR/EN/AR, les dimensions et la géométrie, la locomotion, la rotation 360° et les poses XR simulées. Ils ne remplacent pas un nouvel essai matériel du chemin R2 : un test Quest Browser après cette intégration reste recommandé. Aucun benchmark de RAM, FPS ou temps de chargement réseau Quest n'est revendiqué ici.

La V4 historique reste localement dans `geo/assets/salle-des-etats-artdaci-v4-reference.glb` (SHA-256 `632feb936e409790165b5e0fff26e3bf3f456e8bbddb5c843f93412bbe2758fc`) et n'est pas utilisée comme repli. Les sources externes et les anciens modèles demeurent inchangés et exclus du commit V5.
