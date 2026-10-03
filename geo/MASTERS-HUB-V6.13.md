# ARTDACI Masters Hub V6.13 — Shell

## Périmètre figé

La route `/geo/masters-hub.html` présente une **Galerie virtuelle ARTDACI**
fictive, indépendante de tout musée réel. Elle est proposée comme deuxième
expérience dans `/geo/`, sans changement du menu principal ni du Louvre GEO.

| Zone | Artiste | Œuvres canoniques |
| --- | --- | --- |
| Nord | Leonardo da Vinci | ld01 — Mona Lisa ; ld06 — La Belle Ferronnière ; ld02 — Lady with an Ermine |
| Est | Johannes Vermeer | ve01 — Girl with a Pearl Earring ; ve05 — The Astronomer ; ve02 — View of Delft |
| Sud | Vincent van Gogh | vg01 — Self-Portrait ; vg02 — The Bedroom ; vg03 — The Starry Night |
| Ouest | Claude Monet | mo01 — Impression, Sunrise ; mo03 — Water Lilies ; mo06 — Woman with a Parasol |

Les quatre guides sont seulement réservés dans `data/masters-hub.json`, avec
le statut `reserved` et la mention « Guide bientôt disponible ». Aucun guide
3D n'est actif ou chargé. Vermeer reste réservé par `artistId: "ve"` et
`guideId: "vermeer-guide"` ; son modèle source n'est pas copié ni intégré.

## Médias, langues et performance

- Salle procédurale légère ; douze représentations image existantes au démarrage.
- Aucun GLB de guide ou d'œuvre, aucune vidéo et aucun audio au démarrage.
- Chargement des miniatures par trois, textures d'affichage limitées à 768 pixels.
- Image détaillée et audio chargés uniquement à la demande ; ressources de détail
  libérées et audio arrêté lors de la fermeture ou du changement d'œuvre.
- Manifestes canoniques réutilisés sans modification ; repli local en cas
  d'échec du manifeste distant et images de secours existantes.
- Français, anglais et arabe ; interface et panneaux XR adaptés au RTL arabe.
- Audio proposé uniquement si l'overview de la langue exacte est disponible.
  **vg02 ne propose aucun audio arabe** ; aucun repli anglais silencieux.
- Actions limitées à À propos, Voir l'image, Écouter si disponible,
  Galerie musée ARTDACI si la route est vérifiée, et Retour.

## Validation matérielle utilisateur

Le **3 octobre 2026**, l'utilisateur a confirmé la validation de V6.13 sur un
**Meta Quest 3S réel** : ouverture, quatre zones lisibles, douze œuvres,
panneaux confortables, navigation, manettes gauche et droite, raycast,
surbrillance, locomotion, rotation 360° et téléportation fonctionnent.
Il confirme aussi FR/EN/AR et RTL, le cas vg02 sans audio arabe, l'absence de
guides 3D et de GLB d'œuvre au démarrage, ainsi que la préservation du Louvre GEO.

Cette validation matérielle est celle de l'utilisateur, non un test casque
automatiquement reproduit par l'agent. Aucune mesure FPS ou mémoire Quest
n'est revendiquée.

## Contrôles et suite

Les tests GEO couvrent le Louvre existant et le Shell : identités canoniques,
langues, médias de secours, audio exact-language, absence de chargeurs GLB,
navigation, sélection souris/tactile et interaction XR des deux contrôleurs.
Le résultat de référence avant figement est de 102 tests réussis sur 102.

Les identifiants de guides et la séparation configuration / logique / panneaux
préparent une évolution ultérieure. **V6.14 n'est pas commencée** : aucune
capacité 3D d'œuvre, AR, Space AR, VR spécifique, vidéo ou guide actif n'est
ajoutée dans ce figement. Toute intégration future requiert une nouvelle phase
autorisée et sa propre validation.
