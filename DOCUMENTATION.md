# Documentation du format Speedrun.txt

Ce document explique comment formater un fichier `speedrun.txt` pour qu'il soit compatible avec le convertisseur `convert-guide.js` de l'application Speedrun Clair Obscur.

## En-tête du fichier

**Les deux premières lignes du fichier doivent contenir :**

1. **Ligne 1 :** Nom du jeu
2. **Ligne 2 :** Catégorie de speedrun
3. **Ligne 3 :** Ligne vide (obligatoire)

**Exemple :**

```
Clair Obscur
Any% Glitchless Expert

Act 0
T:Prologue
...
```

## Structure générale

Le fichier `speedrun.txt` est organisé en sections hiérarchiques :

-   **Actes** : Divisions principales du jeu (Act 0, Act I, Act II, etc.)
-   **Chapitres** : Sections à l'intérieur des actes (identifiés par `T:`)
-   **Étapes** : Actions spécifiques à effectuer

## Règles de base

### Sauts de ligne

-   Les lignes vides sont ignorées par le convertisseur
-   Chaque type d'étape doit être séparé par au moins une ligne vide
-   Les actions dans un combat/boss sont séparées par des sauts de ligne

### Encodage

-   Utilisez l'encodage UTF-8 pour supporter les emojis et caractères spéciaux
-   Les emojis sont utilisés pour identifier les types d'étapes

## Types d'étapes

### 1. Actes

**Format :** `Act [numéro]` ou `Act [nom]`

**Exemples :**

```
Act 0
Act I
Act II
```

### 2. Chapitres

**Format :** `T:[nom du chapitre]`

**Exemples :**

```
T:Prologue
T:Spring Meadows
T:Flying Waters
```

### 3. Combats normaux

**Format :** `🛡️ [nom de l'ennemi]`

**Exemples :**

```
🛡️ Maelle
🛡️ Lancelier
🛡️ 2 Lancelier(FS)
```

### 4. Boss

**Format :** `🎯 [nom du boss]`

**Exemples :**

```
🎯 Eveque
🎯 Goblu
🎯 Ultimate Sakapatate
```

### 5. Loot (objets trouvés)

**Format :** `📦 [description de l'objet]`

**Exemples :**

```
📦 Brûlures Critiques
📦 $360 Chroma
📦 Teinte Energie
```

**Loot groupé :** Plusieurs objets peuvent être listés consécutivement :

```
📦 $333 Chroma sur la route
📦 $790 Chroma premier drapeau
📦 Initiative
```

### 6. Achats

**Format :** `💰 [description de l'achat]`

**Exemples :**

```
💰 Attaque fragilisante
💰 Instant Critique, 2 Chroma Poli
```

### 7. Notes

**Format :** `(A) [contenu de la note]`

**Exemples :**

```
(A) Si vous ratez un DODGE, 1 Shot
(A) 1er PARRY crit ? Surcharge t2 + PARRY
```

### 8. Images attachées

**Format :** `(IMG) [nom du fichier image]`

Les images peuvent être attachées à différents types d'étapes pour fournir des références visuelles.

#### Images attachées aux étapes

**Format :** `(IMG) [nom du fichier image]` après n'importe quelle étape

**Exemples :**

```
🛡️ Maelle
(V) Attack > PARRY > (V) Attack > DODGE > (V) Surcharge
(IMG) Screenshot_1.png

📦 Brûlures Critiques
(IMG) Screenshot_1.png

💰 Attaque fragilisante
(IMG) Screenshot_1.png
```

#### Images dans les menus

Les images peuvent être attachées aux menus pour montrer les configurations :

```
ARME
(V) Lanceram
PICTO
(V) Brulures Critiques
(V) Energy mortelle II
(L) Insaisissable
(IMG) Screenshot_1.png
```

#### Images solo avec marqueurs de personnage

**Format :** `(IMG) (personnage) [nom du fichier image]`

Ces images créent des étapes d'images séparées (type `imageGroup`) et **doivent** avoir un marqueur de personnage.

**Exemples :**

```
(IMG) (M) Screenshot_1.png
(IMG) (V) Screenshot_1.png
(IMG) (L) Screenshot_1.png
(IMG) (S) Screenshot_1.png
```

**Important :** Les images solo sans marqueur de personnage ne sont pas reconnues. Utilisez toujours `(IMG) (M)`, `(IMG) (V)`, etc.

#### Règles importantes

-   **Images attachées** : `(IMG) Screenshot_1.png` - attachées à une étape existante
-   **Images solo** : `(IMG) (M) Screenshot_1.png` - créent une étape d'image séparée
-   **Séparation par lignes vides** : Les images attachées peuvent être séparées de l'étape par des lignes vides
-   **Images multiples** : Plusieurs images peuvent être attachées à une même étape
-   **Fichiers d'images** : Les images doivent être placées dans le dossier `screens/` de l'application
-   **Format supporté** : PNG, JPG, JPEG
-   **Nommage** : Utilisez des noms de fichiers cohérents (ex: `Screenshot_1.png`, `Screenshot_2.png`)

## Menus et configurations

### Types de menus reconnus

-   `ARME` : Équipement d'armes
-   `PICTO` : Pictogrammes/compétences
-   `LUMINA` : Configurations Lumina
-   `UP ARME` : Amélioration d'armes
-   `UP LUMINA` : Amélioration Lumina
-   `STAT` : Statistiques des personnages
-   `SORT` : Sorts et compétences
-   `FORMATION` : Formation d'équipe

### Format des actions de menu

**Format :** `(personnage) [action]`

**Personnages reconnus :**

-   `(M)` : Maelle
-   `(L)` : Lune
-   `(S)` : Sciel
-   `(V)` : Verso
-   `(Mo)` : Monoco

**Exemples :**

```
ARME
(V) Lanceram
PICTO
(V) Brulures Critiques
(V) Energy mortelle II
(L) Insaisissable
```

### Actions multiples sur une ligne

Vous pouvez séparer plusieurs actions par des virgules :

```
STAT
(V) +9 Force (9)
(L) +8 Force (8), +1 Agi (1)
```

### Menus groupés

Plusieurs types de menus peuvent être groupés ensemble :

```
ARME
(V) Lanceram
PICTO
(V) Brulures Critiques
(V) Energy mortelle II
(L) Insaisissable
LUMINA
(L) +Brûlures critiques
(L) +Energie Mortelle II
```

## Combats et tours

### Format des tours

Chaque ligne représente un tour de combat. Les actions sont séparées par `>` :

```
(V) Attack > PARRY > (V) Attack > DODGE > (V) Surcharge
```

### Actions avec échec

Ajoutez `(FAIL)` après une action qui peut échouer :

```
(L) Immo (FAIL) > (V) Surpui > (M) Foulée(Fail)
```

### Notes dans les combats

Les notes peuvent être insérées dans les combats :

```
(A) Si Verso ou Sciel Focus
(V) Tranchée Berserk
```

## Règles spéciales

### Formation d'équipe

**Format :** `(personnage) +/-[nom]`

**Exemples :**

```
FORMATION
(M) -Maelle, (S) +Sciel
(L) -Lune, (V) -Verso, (Mo) +Monoco, (S) -Sciel
```

### Statistiques avec totaux

Les statistiques peuvent inclure des totaux entre parenthèses :

```
STAT
(V) +9 Force (9)
(L) +8 Force (8), +1 Agi (1)
```

### Sorts avec positions

Les sorts peuvent inclure des positions entre parenthèses :

```
SORT
(L) Danse Foudroyante (Bas Gauche)
(S) Lame Spectrale, Intervention (Haut Gauche)
```

## Exemple complet

```txt
Act 0
T:Prologue

🛡️ Maelle
(V) Attack > PARRY > (V) Attack > DODGE > (V) Surcharge
(A) Si vous ratez un DODGE, 1 Shot
(IMG) Screenshot_1.png

Act I
T:Spring Meadows

🛡️ Lancelier
(V) Weak Spot > (V) Attack > PARRY

📦 Brûlures Critiques
(IMG) Screenshot_1.png

📦 $360 Chroma
📦 Teinte Energie

ARME
(V) Lanceram
PICTO
(V) Brulures Critiques
(V) Energy mortelle II
(L) Insaisissable
(IMG) Screenshot_1.png

💰 Attaque fragilisante
(IMG) Screenshot_1.png

🎯 Eveque
(L) Shoot (last WS) > (L) Immolation > (V) Surpuissant
(A) Il faut 1/2 PARRY au début
```

## Conseils de formatage

1. **Cohérence** : Utilisez toujours les mêmes emojis et symboles
2. **Espacement** : Laissez des lignes vides entre les sections pour la lisibilité
3. **Ordre** : Respectez l'ordre logique du speedrun
4. **Clarté** : Utilisez des descriptions claires et concises
5. **Personnages** : Utilisez toujours les codes de personnages `(M)`, `(L)`, `(S)`, `(V)`, `(Mo)`

## Conversion

Pour convertir votre fichier `speedrun.txt` en JSON :

1. Placez votre fichier `speedrun.txt` dans le même dossier que `convert-guide.js`
2. Exécutez : `node convert-guide.js`
3. Le fichier `clair-obscur-guide-complete.json` sera généré

## Dépannage

### Erreurs courantes

-   **Caractères non reconnus** : Vérifiez l'encodage UTF-8
-   **Actions non parsées** : Vérifiez la syntaxe des personnages `(M)`, `(L)`, etc.
-   **Menus non groupés** : Assurez-vous qu'il n'y a pas de ligne vide entre les menus
-   **Tours de combat incorrects** : Vérifiez la séparation par `>` et les codes de personnages

### Validation

Le convertisseur affichera le nombre d'étapes créées. Si ce nombre semble incorrect, vérifiez :

-   Les emojis utilisés
-   La structure des menus
-   Les codes de personnages
-   Les séparateurs (`>`, `,`)
