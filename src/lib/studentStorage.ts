import { RevisionSheet, RevisionBlock } from '../types';

const STORAGE_KEY = 'pilote_student_sheets_v1';

export const INITIAL_REVISION_SHEETS: RevisionSheet[] = [
  {
    id: 'sheet-info-algo-1',
    title: 'Arbres Binaires & Algorithmes de Parcours',
    subject: 'Informatique & Algorithmique',
    description: 'Notions clés, implémentation Python & C++, complexités temporelles et flashcards d\'examen.',
    sourceType: 'mixed',
    tags: ['Algorithmique', 'Python', 'Structures de Données', 'Examen'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    blocks: [
      {
        id: 'block-1',
        type: 'markdown',
        title: '1. Notions Fondamentales',
        content: `### Propriétés d'un Arbre Binaire de Recherche (ABR)
Un **Arbre Binaire de Recherche** (BST) est un arbre binaire où pour chaque nœud $N$ :
- Tous les nœuds du sous-arbre gauche ont une clé **strictement inférieure** à la clé de $N$.
- Tous les nœuds du sous-arbre droit ont une clé **strictement supérieure** à la clé de $N$.

#### Complexités asymptotiques :
| Opération | Cas Moyen | Pire Cas (Arbre dégénéré) | Arbre AVL / Rouge-Noir |
| :--- | :--- | :--- | :--- |
| **Recherche** | $\\mathcal{O}(\\log n)$ | $\\mathcal{O}(n)$ | $\\mathcal{O}(\\log n)$ |
| **Insertion** | $\\mathcal{O}(\\log n)$ | $\\mathcal{O}(n)$ | $\\mathcal{O}(\\log n)$ |
| **Suppression** | $\\mathcal{O}(\\log n)$ | $\\mathcal{O}(n)$ | $\\mathcal{O}(\\log n)$ |
`,
      },
      {
        id: 'block-2',
        type: 'code',
        title: '2. Implémentation du Parcours Infixe (In-order)',
        language: 'python',
        content: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder_traversal(root: TreeNode) -> list[int]:
    """Parcourt l'ABR de façon infixe (gauche -> racine -> droite).
    Renvoie les éléments triés par ordre croissant."""
    result = []
    
    def traverse(node):
        if not node:
            return
        traverse(node.left)
        result.append(node.val)
        traverse(node.right)
        
    traverse(root)
    return result

# Exemple d'utilisation
#       4
#      / \\
#     2   5
#    / \\
#   1   3
root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(5))
print(inorder_traversal(root)) # Affiche : [1, 2, 3, 4, 5]`,
      },
      {
        id: 'block-3',
        type: 'text',
        title: '3. Mes Notes Personnelles & Remarques',
        content: `⚠️ Attention au piège classique de l'examen partiel :
Toujours préciser si l'arbre autorise ou non les clés dupliquées ! Dans la plupart des sujets de concours, on suppose les clés distinctes.
Penser à vérifier la condition d'arrêt sur node is None avant de déréférencer les pointeurs gauche et droite.
Pour l'optimisation mémoire : le parcours itératif avec une pile évite le débordement de pile (Stack Overflow) si la profondeur est grande.`,
      },
      {
        id: 'block-4',
        type: 'flashcards',
        title: '4. Flashcards de Mémorisation Active',
        content: '',
        flashcards: [
          {
            id: 'fc-1',
            question: 'Quel est l\'ordre de visite d\'un parcours infixe (In-Order) ?',
            answer: 'Sous-arbre gauche ➔ Nœud courant (Racine) ➔ Sous-arbre droit. Dans un ABR, cela donne les éléments triés !',
            hint: 'Pense au tri croissant',
            mastered: true,
          },
          {
            id: 'fc-2',
            question: 'Quelle est la hauteur maximale d\'un arbre binaire à n nœuds ?',
            answer: 'La hauteur maximale est n (cas d\'un arbre filiforme / liste chaînée).',
            hint: 'Pire cas dégénéré',
            mastered: false,
          },
          {
            id: 'fc-3',
            question: 'Pourquoi préfère-t-on un arbre AVL ou Rouge-Noir à un BST simple ?',
            answer: 'Ils s\'auto-équilibrent par des rotations, garantissant une hauteur en O(log n) même dans le pire des cas.',
            mastered: false,
          },
        ],
      },
      {
        id: 'block-5',
        type: 'quiz',
        title: '5. Auto-Évaluation Rapide (QCM)',
        content: '',
        quiz: [
          {
            id: 'qz-1',
            question: 'Dans un arbre binaire complet de hauteur h (la racine étant à h=0), combien de nœuds contient-il au maximum ?',
            options: ['2^h - 1', '2^(h+1) - 1', '2 * h', 'h^2'],
            correctIndex: 1,
            explanation: 'Un arbre complet parfait de hauteur h compte 1 + 2 + 4 + ... + 2^h = 2^(h+1) - 1 nœuds.',
          },
          {
            id: 'qz-2',
            question: 'Quelle structure de données est naturellement utilisée pour un parcours en largeur (BFS) ?',
            options: ['Une Pile (Stack LIFO)', 'Une File (Queue FIFO)', 'Une table de hachage', 'Un tas binaire'],
            correctIndex: 1,
            explanation: 'Le BFS visite niveau par niveau, ce qui nécessite une file FIFO (First In, First Out).',
          },
        ],
      },
    ],
  },
  {
    id: 'sheet-math-analyse-1',
    title: 'Développements Limités & Équivalents Utiles',
    subject: 'Mathématiques & Analyse',
    description: 'Formules au voisinage de 0, règles de calcul, pièges sur les sommes et produits.',
    sourceType: 'text',
    tags: ['Analyse', 'Calcul Différentiel', 'Prépa / Licence'],
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 2,
    blocks: [
      {
        id: 'block-math-1',
        type: 'markdown',
        title: 'Formules Clés au Voisinage de 0',
        content: `### Formules Usuelles à l'ordre 3 en $x \\to 0$ :
- **Exponentielle** :
  $$e^x = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + o(x^3)$$
- **Sinus & Cosinus** :
  $$\\sin(x) = x - \\frac{x^3}{6} + o(x^3)$$
  $$\\cos(x) = 1 - \\frac{x^2}{2} + o(x^3)$$
- **Logarithme** :
  $$\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} + o(x^3)$$
- **Puissance $(1+x)^\\alpha$** :
  $$(1+x)^\\alpha = 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2} x^2 + o(x^2)$$
`,
      },
      {
        id: 'block-math-2',
        type: 'text',
        title: 'Règle d\'or pour les examens',
        content: `NE JAMAIS faire d'équivalents sur une somme !
Si f ~ g et h ~ k, on ne peut PAS conclure que f + h ~ g + k (risque majeur d'annulation des termes prépondérants).
Pour une somme, passer impérativement par les Développements Limités avec les petits o(x^n).`,
      },
    ],
  },
];

export function loadRevisionSheets(): RevisionSheet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REVISION_SHEETS));
      return INITIAL_REVISION_SHEETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_REVISION_SHEETS;
  } catch (err) {
    console.warn('Failed to load student revision sheets from localStorage', err);
    return INITIAL_REVISION_SHEETS;
  }
}

export function saveRevisionSheets(sheets: RevisionSheet[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
  } catch (err) {
    console.warn('Failed to save student revision sheets', err);
  }
}

export function saveSingleRevisionSheet(sheet: RevisionSheet): RevisionSheet[] {
  const current = loadRevisionSheets();
  const index = current.findIndex(s => s.id === sheet.id);
  let updated: RevisionSheet[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...sheet, updatedAt: Date.now() };
  } else {
    updated = [{ ...sheet, createdAt: Date.now(), updatedAt: Date.now() }, ...current];
  }
  saveRevisionSheets(updated);
  return updated;
}

export function deleteRevisionSheet(sheetId: string): RevisionSheet[] {
  const current = loadRevisionSheets();
  const updated = current.filter(s => s.id !== sheetId);
  saveRevisionSheets(updated);
  return updated;
}

/**
 * Creates a new blank revision sheet with default blocks
 */
export function createBlankRevisionSheet(title = 'Nouvelle Fiche de Révision', subject = 'Général'): RevisionSheet {
  return {
    id: `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    subject,
    description: 'Fiche créée avec des blocs modulaires.',
    sourceType: 'manual',
    tags: [subject],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    blocks: [
      {
        id: `blk-${Date.now()}-1`,
        type: 'markdown',
        title: 'Résumé du Cours & Notions Clés',
        content: `### Synthèse du Chapitre
Écrivez ici le résumé structuré de votre cours, définitions, théorèmes ou points à retenir.

- **Point clé 1** : Détail explicatif.
- **Point clé 2** : Éléments indispensables à retenir.
`,
      },
      {
        id: `blk-${Date.now()}-2`,
        type: 'text',
        title: 'Notes Libres & Astuces',
        content: `Espace d'écriture libre pour noter vos remarques, commentaires, questions à poser au professeur ou mnémotechniques.`,
      },
      {
        id: `blk-${Date.now()}-3`,
        type: 'code',
        title: 'Exemple Pratique / Code',
        language: 'python',
        content: `# Code d'exemple ou formule appliquée
def example_function():
    return "Appliquer la notion"`,
      },
    ],
  };
}
