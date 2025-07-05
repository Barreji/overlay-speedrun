# PLAN D'ACTION - REFACTORISATION COMPLÈTE

## OBJECTIF
Refactoriser complètement les 6 fichiers principaux pour utiliser correctement la classe `Guide.ts` et toutes ses sous-classes dans `types/steps/`, en respectant l'architecture orientée objet et en séparant clairement les responsabilités.

## ANALYSE DE L'ÉTAT ACTUEL

### Problèmes identifiés :
1. **Duplication de types** : `GuideTypes.ts` contient des interfaces qui dupliquent les classes de `types/steps/`
2. **Mélange des formats** : Le code utilise à la fois l'ancien format (steps array) et le nouveau format (actionGroups)
3. **Responsabilités mal séparées** : Les classes font trop de choses à la fois
4. **Incohérence des données** : Les types ne correspondent pas aux classes réelles
5. **Méthodes manquantes** : `FileManager` n'a pas toutes les méthodes appelées par `UIManager`

## PLAN DE REFACTORISATION

### PHASE 1 : NETTOYAGE DES TYPES ET UNIFICATION

#### 1.1 Refactoriser `src/types/GuideTypes.ts`
- **Supprimer** toutes les interfaces qui dupliquent les classes de `types/steps/`
- **Garder uniquement** :
  - `Options` (configuration UI)
  - `KeyBinds` (raccourcis clavier)
  - `ChapterInfo` (info pour menu chapitres)
  - `LoadResult`, `ParseResult` (résultats d'opérations)
  - `NotificationType` (types de notifications)
  - `StepChangeEvent`, `BindChangeEvent` (événements)
  - `CharacterCode` et `Character` (personnages)
- **Renommer** le fichier en `src/types/UITypes.ts` pour clarifier son rôle

#### 1.2 Mettre à jour `src/types/steps/index.ts`
- **Exporter** toutes les classes de steps
- **Ajouter** des types utilitaires pour la navigation
- **Créer** des types pour les résultats de rendu

#### 1.3 Créer `src/types/GuideManager.ts`
- **Définir** les interfaces pour la gestion des guides
- **Types** pour la navigation entre steps
- **Types** pour les opérations de sauvegarde/chargement

### PHASE 2 : REFACTORISATION DU MAIN PROCESS

#### 2.1 Refactoriser `src/main.ts`
**Responsabilités exclusives :**
- Initialisation de l'application Electron
- Gestion des raccourcis globaux (`globalShortcut`)
- Maintien de la fenêtre au premier plan
- Gestion des dialogues de sélection de fichiers
- Communication IPC avec le renderer

**Changements :**
- **Supprimer** toute la logique de gestion des guides (déplacée vers `GuideManager`)
- **Simplifier** les handlers IPC pour déléguer au `GuideManager`
- **Garder** uniquement la gestion des raccourcis globaux et de la fenêtre
- **Ajouter** un `GuideManager` pour gérer les guides côté main

#### 2.2 Créer `src/main/GuideManager.ts`
**Responsabilités :**
- Chargement/sauvegarde des guides depuis les fichiers
- Conversion entre formats (legacy → nouveau)
- Gestion de l'état du guide actuel
- Navigation entre les steps
- Communication avec le renderer via IPC

### PHASE 3 : REFACTORISATION DU RENDERER PROCESS

#### 3.1 Refactoriser `src/renderer.ts`
**Responsabilités exclusives :**
- Point d'entrée du renderer
- Initialisation de l'`UIManager`
- Configuration des listeners IPC globaux
- Nettoyage à la fermeture

**Changements :**
- **Simplifier** drastiquement (max 30 lignes)
- **Déléguer** toute la logique à `UIManager`
- **Garder** uniquement l'initialisation et le nettoyage

#### 3.2 Refactoriser `src/renderer/UIManager.ts`
**Responsabilités :**
- Gestion globale de l'interface utilisateur
- Coordination entre les différents managers
- Gestion des événements UI (clics, menus, etc.)
- Mise à jour de l'affichage
- Gestion des options d'affichage

**Changements :**
- **Supprimer** toute la logique de rendu (déplacée vers `StepRenderer`)
- **Supprimer** la logique de gestion des guides (déplacée vers `FileManager`)
- **Supprimer** la logique des raccourcis (déplacée vers `KeyBindManager`)
- **Se concentrer** sur la coordination et l'UI
- **Utiliser** les classes `Guide` et `ActionGroupStep` pour la navigation

#### 3.3 Refactoriser `src/renderer/StepRenderer.ts`
**Responsabilités :**
- Rendu de chaque type de step possible
- Gestion des options d'affichage (taille police, images, etc.)
- Génération du HTML pour chaque step
- Support des options minimalistes (skip loot, notes, etc.)

**Changements :**
- **Utiliser** les classes de `types/steps/` au lieu des interfaces
- **Créer** des méthodes de rendu pour chaque classe de step
- **Supprimer** la logique de navigation (déplacée vers `UIManager`)
- **Se concentrer** uniquement sur le rendu HTML

#### 3.4 Refactoriser `src/renderer/FileManager.ts`
**Responsabilités :**
- Chargement des guides depuis les fichiers
- Sauvegarde des configurations dans localStorage
- Gestion des conversions de format
- Communication avec le main process pour les opérations de fichiers

**Changements :**
- **Ajouter** les méthodes manquantes (`closeApp`, `getCurrentStep`, `jumpToStep`, etc.)
- **Utiliser** les classes `Guide` et `ActionGroupStep`
- **Gérer** la conversion entre formats legacy et nouveau
- **Simplifier** la gestion des options et raccourcis

#### 3.5 Refactoriser `src/renderer/KeyBindManager.ts`
**Responsabilités :**
- Gestion des raccourcis clavier
- Configuration des raccourcis
- Exécution des actions correspondantes
- Communication avec le main process pour les raccourcis globaux

**Changements :**
- **Supprimer** la logique de navigation (déplacée vers `UIManager`)
- **Se concentrer** uniquement sur la gestion des raccourcis
- **Utiliser** les événements pour communiquer avec `UIManager`
- **Simplifier** la logique de configuration

### PHASE 4 : NOUVELLES CLASSES ET UTILITAIRES

#### 4.1 Créer `src/renderer/GuideNavigator.ts`
**Responsabilités :**
- Navigation entre les steps d'un guide
- Gestion des skips selon les options
- Calcul des indices et positions
- Gestion des transitions entre steps

#### 4.2 Créer `src/renderer/OptionsManager.ts`
**Responsabilités :**
- Gestion des options d'affichage
- Sauvegarde/chargement des options
- Application des options au rendu
- Validation des options

#### 4.3 Créer `src/utils/GuideConverter.ts`
**Responsabilités :**
- Conversion entre format legacy (steps array) et nouveau format (actionGroups)
- Migration des guides existants
- Validation des données de guide

### PHASE 5 : MISE À JOUR DES IMPORTS ET DÉPENDANCES

#### 5.1 Mettre à jour tous les imports
- **Remplacer** les imports de `GuideTypes.ts` par les classes de `types/steps/`
- **Ajouter** les nouveaux imports pour les managers
- **Nettoyer** les imports inutilisés

#### 5.2 Mettre à jour les types dans les composants
- **Utiliser** les classes au lieu des interfaces
- **Adapter** les méthodes pour utiliser les classes
- **Mettre à jour** les signatures de méthodes

### PHASE 6 : TESTS ET VALIDATION

#### 6.1 Tests de navigation
- Vérifier que la navigation fonctionne avec les nouvelles classes
- Tester les skips selon les options
- Valider les transitions entre steps

#### 6.2 Tests de rendu
- Vérifier que chaque type de step se rend correctement
- Tester les options d'affichage
- Valider les options minimalistes

#### 6.3 Tests de persistance
- Vérifier le chargement/sauvegarde des guides
- Tester la conversion de format
- Valider la persistance des options

## ORDRE D'EXÉCUTION RECOMMANDÉ

1. **Phase 1** : Nettoyer les types et unifier les interfaces
2. **Phase 4** : Créer les nouvelles classes utilitaires
3. **Phase 2** : Refactoriser le main process
4. **Phase 3** : Refactoriser le renderer process
5. **Phase 5** : Mettre à jour les imports
6. **Phase 6** : Tests et validation

## AVANTAGES DE CETTE REFACTORISATION

1. **Architecture claire** : Chaque classe a une responsabilité unique
2. **Réutilisabilité** : Les classes de steps peuvent être utilisées partout
3. **Maintenabilité** : Code plus facile à maintenir et étendre
4. **Cohérence** : Utilisation cohérente des types dans tout le projet
5. **Performance** : Moins de duplication et de conversion de données
6. **Évolutivité** : Facile d'ajouter de nouveaux types de steps

## RISQUES ET MITIGATIONS

1. **Risque** : Casser la fonctionnalité existante
   **Mitigation** : Tests approfondis à chaque étape

2. **Risque** : Complexité temporaire pendant la transition
   **Mitigation** : Migration progressive, garder l'ancien code fonctionnel

3. **Risque** : Incompatibilité avec les guides existants
   **Mitigation** : Créer des convertisseurs robustes

## ESTIMATION DU TEMPS

- **Phase 1** : 2-3 heures
- **Phase 2** : 3-4 heures  
- **Phase 3** : 6-8 heures
- **Phase 4** : 2-3 heures
- **Phase 5** : 1-2 heures
- **Phase 6** : 2-3 heures

**Total estimé** : 16-23 heures de développement 