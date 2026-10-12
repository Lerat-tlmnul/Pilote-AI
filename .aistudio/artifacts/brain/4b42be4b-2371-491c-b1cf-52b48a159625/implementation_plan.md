# Refonte Interface Mobile iOS Épurée (Pilote 1)

Ce plan détaille la transformation de l'interface mobile de Pilote 1 vers une esthétique système iOS authentique, sobre et sans surcharge visuelle. Il élimine les éléments parasites au profit d'une navigation Cupertino claire, d'un sélecteur de modèle fluide et d'une barre de saisie ergonomique.

## Décisions Clés & Retours Utilisateur

> [!IMPORTANT]
> - **Style Visuel Confirmé** : Esthétique système iOS (Cupertino pur, fonds neutres `#F2F2F7`, cartes blanches, séparateurs capillaires), et non un habillage de messagerie gadget ou de bulles saturées.
> - **Zéro Information Parasite** : Suppression des badges multicolores, des compteurs superflus, des puces clignotantes et des icônes encombrantes dans la barre supérieure.
> - **Modèles Autorisés** : Uniquement **Pilote 1 Flash** et **Pilote 1 Large** (Pilote 1 Mini reste définitivement retiré).
> - **Priorités Ergonomiques** : Header de navigation fluide avec menu contextuel iOS, barre de saisie tactile optimisée et fluidité des transitions sur écran tactile.

---

## 1. Vue d'Ensemble & Expérience Utilisateur

### Problème Actuel
Sur écran mobile (375px–430px), la barre supérieure regroupe jusqu'à 7 boutons distincts (historique, logo, sélecteur de modèle, géolocalisation, guide, tâches, nouveau chat), créant une surcharge cognitive et des risques d'erreurs de frappe. Les couleurs multiples (vert émeraude, ambre, violet, ciel) détournent l'attention de l'échange principal.

### Solution Apportée
1. **Header iOS Système Compact (Navigation Bar)** :
   - Côté gauche : Bouton menu/historique épuré et nom de l'application sobre.
   - Centre : Sélecteur de modèle iOS tactile (Pilote 1 Flash / Large) avec feuille d'action contextuelle native (*Action Sheet*) animée sans coupure.
   - Côté droit : Bouton nouveau fil discret et menu d'options regroupé `···` (permettant d'accéder aux tâches, à la position et au guide sans encombrer la barre).
2. **Barre de Saisie Mobile iOS Dédiée** :
   - Hauteur et marges tactiles respectant les standards Apple Human Interface Guidelines (zones de toucher $\ge 44\text{px}$).
   - Toggle « Réflexion » discret intégré avec interrupteur sobre (sans gradients criards).
   - Bouton d'envoi bleu iOS actif uniquement en présence de texte.
3. **Fluidité des Écrans & Retrait des Bruits Visuels** :
   - Fond de page neutre et calme, bulles et cartes d'action structurées avec séparateurs fins.
   - Suppression des pastilles arc-en-ciel au profit d'une typographie lisible et de contrastes soignés.

---

## 2. Design Visuel & Système Cupertino

### Palette & Tokens
- **Fond d'Écran Mobile** : `#F2F2F7` (gris système iOS doux et reposant).
- **Surfaces & Cartes** : Blanc pur `#FFFFFF` avec bordures capillaires `rgba(0,0,0,0.08)`.
- **Typographie** : Famille système San Francisco / Inter, hiérarchie stricte (Titres gras sobres, sous-titres en `slate-500`).
- **Accent Unique** : Bleu iOS `#007AFF` pour les actions principales actives.
- **Accompagnement Neutre** : `slate-900` pour le texte principal, `slate-600` pour les descriptions.

### Disposition & Thumb Zone
```
┌───────────────────────────────────────────────┐
│ [Menu]      Pilote 1 Flash ▾            [···] │  <- Header iOS épuré (3 zones nettes)
├───────────────────────────────────────────────┤
│                                               │
│   • Message utilisateur                       │  <- Zone de défilement libre
│   • Réponse Pilote 1 (pensée + texte)         │     (85% de l'écran visible)
│   • Cartes contextuelles (Maps / Actions)     │
│                                               │
├───────────────────────────────────────────────┤
│ [ + ] [ Message à Pilote 1... ] [🧠] [ ↑ ]   │  <- Barre d'entrée iOS ancrée
└───────────────────────────────────────────────┘
```

---

## 3. Architecture Technique des Composants

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│   - selectedModelId ('flash' | 'large')                │
│   - thinkingEnabled (boolean)                          │
│   - userLocation, googleUser, profile                  │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│        HeaderNav.tsx         │ │         ChatView.tsx         │
│ - Mobile iOS Header épuré    │ │ - Input Bar iOS ancrée       │
│ - Menu contextuel ActionSheet│ │ - Toggle Réflexion sobre     │
│ - Menu regroupé (Tâches/Lieu)│ │ - Cartes & Messages sobres   │
│ - Version Desktop préservée  │ │ - Accords déroulants fluides │
└──────────────────────────────┘ └──────────────────────────────┘
```

### Évolutions Détaillées par Composant

1. **`HeaderNav.tsx`** :
   - Refactorisation du bloc mobile (`md:hidden`) :
     - Remplacement de l'empilement de micro-boutons par 3 éléments nets : bouton Historique/Tiroir, sélecteur de modèle au centre (Pilote 1 Flash / Large), et bouton menu d'options `···`.
     - Intégration d'un menu d'action iOS contextuel pour le changement de modèle avec transition fluide et sélection tactile instantanée.
     - Déplacement de la géolocalisation, du guide et des tâches planifiées dans un sous-menu contextuel discret et accessible via `···`.
2. **`ChatView.tsx`** :
   - Repositionnement de la barre de saisie pour respecter la zone sûre du bas de l'écran mobile (`pb-safe`).
   - Remplacement des boutons et alertes colorées par des commandes unifiées aux dimensions tactiles standard ($44\text{px}$).
   - Simplification du mode « Réflexion » sous la forme d'un commutateur ou bouton sobre et lisible.
   - Amélioration de la disposition des messages pour éviter tout chevauchement lors du défilement.
3. **`src/index.css` & Thème** :
   - Vérification des marges de sécurité iOS (`pt-safe`, `pb-safe`, `env(safe-area-inset-bottom)`).
   - Élimination des débordements horizontaux sur smartphones étroits (375px).

---

## 4. Plan de Vérification & Recette

1. **Test d'Ergonomie Mobile (375px à 430px)** :
   - Vérifier l'ouverture et la sélection instantanée entre **Pilote 1 Flash** et **Pilote 1 Large** sur mobile.
   - S'assurer que le menu ne déborde pas et se referme au toucher extérieur.
   - Tester le menu d'options `···` pour accéder aux outils secondaires sans polluer l'écran.
2. **Test de la Barre de Saisie** :
   - Vérifier la réactivité du bouton Réflexion et du bouton d'envoi.
   - S'assurer que le défilement des messages reste visible au-dessus de la barre d'entrée.
3. **Compilations & Linting** :
   - Exécution de `lint_applet` (`tsc --noEmit`) et `compile_applet` (`vite build`).
