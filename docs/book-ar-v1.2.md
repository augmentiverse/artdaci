# ARTDACI Book AR V1.2 — Mini-musée augmenté
**Statut : Preview uniquement, PR #16. Ne pas fusionner avant les tests physiques.**

La caméra MindAR et le marqueur de couverture ne changent pas. L'enrichissement ajoute une galerie de **4 œuvres pour chacun des 4 peintres**, une fiche biographique, une observation (« Le saviez-vous ? »), une question pédagogique et un choix d'œuvre qui met à jour l'image **ancrée dans l'espace AR**.

## Contenus
- **Léonard de Vinci** (1452–1519) : La Joconde, La Dame à l'hermine, Ginevra de' Benci, La Belle Ferronnière. Explorer le sfumato et le visage.
- **Vermeer** (1632–1675) : La Jeune Fille à la perle, La Laitière, Vue de Delft, La Femme à la balance. Observer lumière et gestes quotidiens.
- **Vincent van Gogh** (1853–1890) : Autoportrait **1889** (musée d'Orsay), La Chambre, La Nuit étoilée, Terrasse du café le soir. Comparer les gestes et les lignes.
- **Claude Monet** (1840–1926) : Impression, soleil levant, Femme à l'ombrelle, Les Coquelicots, Les Nymphéas (série). Observer couleurs et variations lumineuses.

Chaque notice et titre dispose d'une version **FR, EN et AR**. Les images viennent exclusivement de `assets/artists/` présents dans le dépôt. Les dates approximatives sont indiquées comme telles ; les Nymphéas sont explicitement traités comme une série, et non comme un seul tableau affecté à un seul musée.

## Parcours sur téléphone
1. Ouvrir `book-ar.html?lang=fr` dans la Preview Vercel sur Android ou iOS (HTTPS).
2. Cliquer **Activer la caméra** et viser le recto portant le marqueur officiel.
3. Choisir un peintre : son nom et sa première œuvre apparaissent dans un cadre flottant avec quatre miniatures d'œuvres.
4. Ouvrir **Explorer davantage**, puis **Le peintre / Œuvres / Le saviez-vous ?** dans le panneau de consultation.
5. Dans **Œuvres**, toucher une autre peinture : son image remplace la précédente sur le panneau AR et son titre apparaît au-dessus. Le ratio portrait/paysage doit rester correct.
6. Actionner **Écouter** pour entendre le contenu actuellement sélectionné dans la langue d'interface si le moteur vocal de l'appareil dispose de cette voix ; sinon la restitution peut varier.
7. Tester les vidéos, le Hub des Maîtres, Semantic et le Livre vivant, puis les trois langues.

## Limites et validation
- Les miniatures ancrées ne sont pas des boutons tactiles 3D ; la **sélection se fait dans le panneau HTML** afin d'être fiable sur mobile.
- La lecture de vidéos dépend d'un geste de l'utilisateur, des permissions multimédia et du format disponible.
- Les textes sont synthétiques et destinés à l'initiation ; une revue éditoriale/muséale reste recommandée.
- Tester faible lumière, inclinaison, distances, perte et reprise du suivi, rotation portrait/paysage, accessibilité et scrolling du panneau.
- La Preview et les tests de code ne prouvent pas à eux seuls la compatibilité réelle Android/iOS.

Exécuter localement ou dans CI : `node --test tests/book-ar.test.mjs tests/book-ar-discovery.test.mjs`.

**Ne modifier ni `main` ni le marqueur officiel de couverture à cette étape.** La mise en production ne doit avoir lieu qu'après validation.

## V1.3 — Privilégier la visibilité du contenu AR

La sélection d'un peintre n'ouvre **plus automatiquement** la grande fiche. Un bandeau compact indique le peintre et l'œuvre courante, en permanence dans la barre des commandes. **Explorer davantage** reste disponible : une ouverture volontaire donne accès à la biographie, à la galerie et à l'anecdote. Choisir une œuvre dans la galerie referme la fiche pour montrer aussitôt le nouveau tableau flottant.

Sur smartphone, les boutons des peintres et les commandes se parcourent horizontalement. Le panneau de détails a sa propre zone de défilement et sa hauteur maximale est réduite pour préserver la vue caméra. Tous les médias et traductions FR/EN/AR de V1.2 restent disponibles.

### Non-régression à vérifier sur smartphone
1. Scanner la couverture et choisir chacun des quatre peintres : **le panneau doit rester fermé**.
2. Voir le nom du peintre et de l'œuvre dans le bandeau compact, sans masquer le tableau flottant.
3. Ouvrir volontairement **Explorer davantage**, consulter les trois rubriques ; les informations restent défilables.
4. Cliquer sur une nouvelle œuvre : le panneau se ferme et l'œuvre AR change correctement.
5. Faire glisser horizontalement les choix de peintres et de navigation ; tester les petits écrans et les langues FR/EN/AR.
6. Tester vidéo, narration et perte/reprise du suivi comme en V1.2. Ne pas fusionner avant validation visuelle.
