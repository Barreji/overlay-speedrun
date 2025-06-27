# Speedrun Clair Obscur - Guide Overlay

Une application Electron pour afficher des guides de speedrun en overlay pendant le jeu Clair Obscur.

## 🚀 Téléchargement

### 📦 **Version prête à l'emploi (Recommandée)**

-   [📥 Télécharger le dossier Release](https://github.com/Barreji/overlay-speedrun/releases/latest/download/Release.zip)
-   Contient l'exécutable et tous les fichiers nécessaires
-   Aucune installation requise, fonctionne immédiatement

### 🔧 **Code source**

-   [📥 Télécharger le code source](https://github.com/Barreji/overlay-speedrun/archive/refs/heads/main.zip)
-   Pour les développeurs qui veulent modifier l'application
-   Nécessite Node.js et npm pour compiler

## 🎮 Utilisation

### Raccourcis clavier

-   **F1** : Étape précédente
-   **F2** : Étape suivante
-   **F3** : Afficher/masquer l'overlay
-   **F4** : Menu des chapitres
-   **F5** : Retour au début

### Contrôles de l'interface

-   **Flèche ⬇** (dans l'en-tête) : Masquer l'en-tête principal
-   **Flèche ⬆** (dans le step-header) : Réafficher l'en-tête principal
-   **Clic sur l'en-tête** : Déplacer la fenêtre
-   **Clic sur le step-header** : Déplacer la fenêtre (même quand l'en-tête est masqué)

### Options disponibles

-   **Taille de police** : Ajustable de 50% à 200% avec une barre de progression
-   **Éléments à masquer** :
    -   Étapes de loot
    -   Étapes d'achat
    -   Notes isolées
-   **Personnalisation des raccourcis** : Modifiez les touches dans les options
-   **Gestion des guides** : Créer et charger des guides directement depuis l'interface

## 📝 Création de guides

### Format du fichier

L'application utilise un format simple pour créer des guides. Consultez la [documentation complète](DOCUMENTATION.md) pour tous les détails.

**En-tête obligatoire :**

```txt
Nom du Jeu
Catégorie de Speedrun

Act 0
T:Prologue
```

**Exemple d'étape :**

```txt
🛡️ Maelle
(V) Attack > PARRY > (V) Attack > DODGE > (V) Surcharge
(A) Si vous ratez un DODGE, 1 Shot

📦 Brûlures Critiques

ARME
(V) Lanceram
PICTO
(V) Brulures Critiques
```

### Création et chargement de guides

1. **Créer un guide depuis un fichier .txt :**

    - Utilisez le bouton "Créer un guide" dans les options (F6)
    - Sélectionnez votre fichier .txt
    - Le guide sera automatiquement converti et chargé

2. **Charger un guide .json existant :**

    - Utilisez le bouton "Charger un guide" dans les options (F6)
    - Sélectionnez votre fichier .json

3. **Conversion manuelle :**
    ```bash
    npm run build:converter
    node dist/convert-guide.js votre-fichier.txt votre-sortie.json
    ```

## 📋 Types d'étapes supportés

-   **🛡️ Combats** : Ennemis normaux
-   **🎯 Boss** : Combats de boss
-   **📦 Loot** : Objets trouvés
-   **💰 Achats** : Objets achetés
-   **📋 Menus** : Configurations d'équipement, stats, sorts
-   **📝 Notes** : Conseils et informations importantes

## 🛠️ Développement

### Prérequis

-   Node.js (version 14 ou supérieure)
-   npm

### Installation et lancement

1. **Installez les dépendances**

    ```bash
    npm install
    ```

2. **Lancez l'application**
    ```bash
    npm start
    ```

## 🔧 Scripts disponibles

-   `npm start` : Lance l'application en mode développement
-   `npm run build` : Compile le code TypeScript
-   `npm run build:main` : Compile le processus principal
-   `npm run build:renderer-bundle` : Bundle le processus renderer
-   `npm run build:converter` : Compile le convertisseur
-   `npm run convert` : Convertit speedrun.txt en JSON
-   `npm run build-exe` : Crée l'exécutable Windows
-   `npm run build:release` : Prépare le dossier Release

## 📄 Documentation

-   [Documentation du format](DOCUMENTATION.md) : Guide complet pour créer des fichiers .txt
-   [Guide d'exemple](exemple-guide.txt) : Exemple de guide pour un autre jeu

## 📁 Structure du projet

```
SpeedrunClairObscur/
├── src/                    # Code source TypeScript
│   ├── main.ts            # Processus principal Electron
│   ├── renderer.ts        # Point d'entrée du renderer
│   ├── convert-guide.ts   # Convertisseur TXT → JSON
│   ├── types/             # Types TypeScript partagés
│   │   └── GuideTypes.ts  # Interfaces et types
│   ├── utils/             # Utilitaires
│   │   ├── CharacterUtils.ts
│   │   └── LineParser.ts
│   ├── parsers/           # Parseurs spécialisés
│   │   ├── GuideParser.ts
│   │   ├── MenuParser.ts
│   │   ├── CombatParser.ts
│   │   ├── LootParser.ts
│   │   ├── PurchaseParser.ts
│   │   └── NoteParser.ts
│   └── renderer/          # Interface utilisateur
│       ├── UIManager.ts
│       ├── StepRenderer.ts
│       ├── FileManager.ts
│       ├── KeyBindManager.ts
│       └── types/
│           └── DOMTypes.ts
├── renderer/              # Interface utilisateur (HTML/CSS)
│   ├── index.html         # Page HTML
│   └── styles.css         # Styles CSS
├── Release/               # Version prête à l'emploi
│   ├── clair-obscur-guide-complete.json
│   ├── speedrun.txt
│   ├── exemple-guide.txt
│   ├── DOCUMENTATION.md
│   └── README.md
├── backup_js/             # Ancien code JavaScript (backup)
├── clair-obscur-guide-complete.json  # Guide principal
├── speedrun.txt           # Guide source
├── exemple-guide.txt      # Guide d'exemple
├── DOCUMENTATION.md       # Documentation du format
├── ARCHITECTURE.md        # Documentation de l'architecture
├── package.json           # Configuration npm
├── tsconfig.json          # Configuration TypeScript
└── build-release.js       # Script de préparation Release
```

---

**Note** : Cette application est conçue pour Clair Obscur mais peut être adaptée pour d'autres jeux en modifiant le format des guides.
