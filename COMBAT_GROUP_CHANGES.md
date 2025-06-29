# Modifications pour les Groupes de Combats

## Vue d'ensemble

Les modifications apportées permettent de gérer les combats avec loots et achats collés, ainsi que les groupes de combats multiples consécutifs. Ces éléments sont maintenant regroupés dans des étapes de type `combatGroup` au lieu d'être séparés en étapes individuelles.

## Nouveaux Types

### Types ajoutés dans `src/types/GuideTypes.ts`

1. **LootNote** - Note de loot collée à un combat

    ```typescript
    interface LootNote {
        type: "lootNote";
        items: string[];
        attachedImages?: string[];
    }
    ```

2. **PurchaseNote** - Note d'achat collée à un combat

    ```typescript
    interface PurchaseNote {
        type: "purchaseNote";
        items: string[];
        attachedImages?: string[];
    }
    ```

3. **CombatGroupStep** - Étape de groupe de combats
    ```typescript
    interface CombatGroupStep extends Step {
        type: "combatGroup";
        combats: Array<{
            type: "combat" | "boss";
            titre: string;
            turns: Turn[][];
            attachedImages?: string[];
        }>;
        lootNotes?: LootNote[];
        purchaseNotes?: PurchaseNote[];
        attachedImages?: string[];
    }
    ```

## Nouveau Parseur

### `src/parsers/CombatGroupParser.ts`

Nouveau parseur spécialisé pour gérer les groupes de combats avec :

-   Détection des combats multiples consécutifs
-   Gestion des loots collés aux combats
-   Gestion des achats collés aux combats
-   Support des images attachées

## Modifications du GuideParser

### `src/parsers/GuideParser.ts`

1. **Intégration du CombatGroupParser**

    - Ajout de l'instance `combatGroupParser`
    - Modification de la logique de parsing pour détecter les groupes de combats

2. **Nouvelles méthodes de détection**

    - `isLootCollatedToCombat()` - Vérifie si un loot est collé à un combat
    - `isPurchaseCollatedToCombat()` - Vérifie si un achat est collé à un combat

3. **Logique de parsing modifiée**
    - Les loots et achats isolés sont traités normalement
    - Les loots et achats collés aux combats sont intégrés dans des groupes de combats
    - Les combats multiples consécutifs sont regroupés

## Améliorations de la Détection

### Logique Améliorée pour les Groupes de Combats

La détection des groupes de combats a été améliorée pour gérer les cas complexes :

1. **Combats avec loots/achats collés** : Combat → Loot → Combat → Loot
2. **Combats multiples consécutifs** : Combat → Combat → Combat
3. **Combats multiples avec loots isolés** : Loot → Combat → Combat → Menu

### Exemple de Cas Complexe Résolu

**Avant** (structure séparée) :

```
📦 $333 Chroma sur la route  (étape loot isolée)
🛡️ 2 Demineur              (étape combat)
🛡️ 3 Demineur              (étape combat)
PICTO                       (étape menu)
```

**Après** (structure groupée) :

```
📦 $333 Chroma sur la route  (étape loot isolée - reste séparée)
🛡️ 2 Demineur              (groupe de combats)
🛡️ 3 Demineur              (même groupe)
PICTO                       (étape menu)
```

## Exemples de Transformation

### Avant (structure séparée)

```json
{
  "id": 3,
  "type": "combat",
  "titre": "🛡️ Lancelier",
  "turns": [...]
},
{
  "id": 4,
  "type": "loot",
  "titre": "Brûlures Critiques",
  "items": ["Brûlures Critiques"]
},
{
  "id": 5,
  "type": "combat",
  "titre": "🛡️ Portier",
  "turns": [...]
}
```

### Après (structure groupée)

```json
{
  "id": 3,
  "type": "combatGroup",
  "titre": "🛡️ Lancelier",
  "combats": [
    {
      "type": "combat",
      "titre": "🛡️ Lancelier",
      "turns": [...]
    },
    {
      "type": "combat",
      "titre": "🛡️ Portier",
      "turns": [...]
    }
  ],
  "lootNotes": [
    {
      "type": "lootNote",
      "items": ["Brûlures Critiques"]
    }
  ]
}
```

## Cas d'Usage Supportés

1. **Combats avec loots collés**

    - Combat → Loot → Combat → Loot
    - Combat → Loot → Loot → Combat

2. **Combats avec achats collés**

    - Combat → Achat → Combat
    - Combat → Achat → Loot → Combat

3. **Combats multiples consécutifs**

    - Combat → Combat → Combat
    - Combat → Combat → Loot → Combat

4. **Mélanges complexes**

    - Combat → Loot → Combat → Achat → Combat → Loot

5. **Loots isolés entre combats**
    - Loot → Combat → Combat → Menu
    - Combat → Loot → Combat → Combat

## Compatibilité

-   ✅ Compatible avec l'existant
-   ✅ Les loots et achats isolés restent des étapes séparées
-   ✅ Les combats simples sans loots/achats collés restent des étapes de combat normales
-   ✅ Support des images attachées maintenu
-   ✅ Structure JSON cohérente avec l'existant

## Tests

Le parsing a été testé avec succès sur le fichier `speedrun.txt` complet :

-   11 groupes de combats créés (vs 6 avant les améliorations)
-   Loots et achats correctement intégrés
-   Loots isolés correctement séparés
-   Structure JSON valide et cohérente

### Test Spécifique Validé

Test avec l'exemple problématique :

```
📦 $333 Chroma sur la route
🛡️ 2 Demineur
🛡️ 3 Demineur
```

**Résultat** :

-   Le loot reste une étape isolée (correct)
-   Les deux combats sont regroupés dans un `combatGroup`

## Prochaines Étapes

Pour le rendu, il faudra :

1. Modifier le `StepRenderer` pour gérer les étapes de type `combatGroup`
2. Afficher les combats multiples sur la même page
3. Rendre les notes de loot et d'achat de manière appropriée
4. Maintenir la navigation entre les étapes
