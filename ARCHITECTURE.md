# Architecture TypeScript - Speedrun Clair Obscur Guide

## Vue d'ensemble

Ce projet a été migré de JavaScript vers TypeScript avec une architecture modulaire et typée. L'ancien code JavaScript se trouve dans le dossier `backup_js/`.

## Structure des fichiers

### Point d'entrée

-   `src/main.ts` - Process principal Electron
-   `src/renderer.ts` - Point d'entrée du renderer process
-   `src/convert-guide.ts` - Convertisseur de guide (remplace convert-guide.js)

### Types partagés

-   `src/types/GuideTypes.ts` - Toutes les interfaces et types TypeScript

### Utilitaires

-   `src/utils/CharacterUtils.ts` - Utilitaires pour les personnages
-   `src/utils/LineParser.ts` - Parseur de lignes et détection de types

### Parseurs spécialisés

-   `src/parsers/GuideParser.ts` - Orchestrateur principal des parseurs
-   `src/parsers/MenuParser.ts` - Parseur des menus et actions
-   `src/parsers/CombatParser.ts` - Parseur des combats et boss
-   `src/parsers/LootParser.ts` - Parseur des loots
-   `src/parsers/PurchaseParser.ts` - Parseur des achats
-   `src/parsers/NoteParser.ts` - Parseur des notes

### Renderer (Interface utilisateur)

-   `src/renderer/UIManager.ts` - Gestion de l'interface utilisateur
-   `src/renderer/StepRenderer.ts` - Rendu des étapes du guide
-   `src/renderer/FileManager.ts` - Gestion des fichiers
-   `src/renderer/KeyBindManager.ts` - Gestion des raccourcis clavier

## Configuration TypeScript

### tsconfig.json

Configuration unique pour tout le projet TypeScript, compilant vers CommonJS pour la compatibilité avec Electron.

## Scripts npm

```bash
# Compilation
npm run build:main        # Compile le main process
npm run build:renderer-bundle # Bundle le renderer process
npm run build:converter   # Compile le convertisseur
npm run build            # Compile tout

# Développement
npm run watch:main       # Watch mode pour le main
npm run watch:renderer-bundle # Watch mode pour le renderer bundle
npm run dev             # Mode développement complet

# Convertisseur
npm run convert         # Convertit speedrun.txt en JSON
npm run convert:help    # Affiche l'aide du convertisseur

# Build final
npm run build-exe       # Crée l'exécutable
npm run build:release   # Prépare le dossier Release
```

## Migration des fonctionnalités

### Convert-guide.js → TypeScript

✅ **Fonctions de parsing** :

-   `isMenuLine()` → `LineParser.isMenuLine()`
-   `getMenuType()` → `LineParser.getMenuType()`
-   `isNote()` → `LineParser.isNote()`
-   `extractNote()` → `LineParser.extractNote()`
-   `isCharacterMark()` → `CharacterUtils.isCharacterMark()`
-   `extractCharacter()` → `CharacterUtils.extractCharacter()`
-   `cleanAction()` → `CharacterUtils.cleanAction()`

✅ **Logique de parsing** :

-   Parsing des actes → `GuideParser`
-   Parsing des chapitres → `GuideParser`
-   Parsing des loots → `LootParser`
-   Parsing des achats → `PurchaseParser`
-   Parsing des menus → `MenuParser`
-   Parsing des combats → `CombatParser`
-   Parsing des notes → `NoteParser`

### Renderer.js → TypeScript

✅ **Gestion des étapes** :

-   `nextStep()` → `UIManager.nextStep()`
-   `previousStep()` → `UIManager.previousStep()`
-   `jumpToStep()` → `UIManager.jumpToStep()`

✅ **Rendu des étapes** :

-   `renderStepContent()` → `StepRenderer.renderStep()`
-   `renderCombatStep()` → `StepRenderer.renderCombatStep()`
-   `renderLootStep()` → `StepRenderer.renderLootStep()`
-   `renderPurchaseStep()` → `StepRenderer.renderPurchaseStep()`
-   `renderMenuStep()` → `StepRenderer.renderMenuStep()`
-   `renderNoteStep()` → `StepRenderer.renderNoteStep()`

✅ **Gestion des raccourcis** :

-   `loadBinds()` → `KeyBindManager.loadBinds()`
-   `saveBinds()` → `KeyBindManager.saveBinds()`

✅ **Gestion des fichiers** :

-   `loadGuideOnStart()` → `FileManager.loadGuide()`
-   `createGuideFromTxt()` → `FileManager.createGuideFromTxt()`
-   `loadGuideFromFile()` → `FileManager.loadGuideFromFile()`

## Avantages de la migration

1. **Type Safety** : Tous les types sont strictement définis
2. **Modularité** : Code organisé en modules spécialisés
3. **Maintenabilité** : Architecture claire et documentée
4. **Extensibilité** : Facile d'ajouter de nouvelles fonctionnalités
5. **Réutilisabilité** : Utilitaires partagés entre modules
6. **IDE Support** : Autocomplétion et détection d'erreurs

## Utilisation

### Convertisseur

```bash
# Convertir le guide par défaut
npm run convert

# Convertir un fichier spécifique
npm run build:converter
node dist/convert-guide.js mon-guide.txt

# Convertir avec fichier de sortie personnalisé
node dist/convert-guide.js mon-guide.txt sortie.json
```

### Application

```bash
# Développement
npm run dev

# Build et lancement
npm start

# Créer l'exécutable
npm run build-exe
```
