# Changelog

## 🚀 Version 1.0.3

### ✨ **Nouveautés**

**🖼️ Gestion complète des images**

-   Support des images attachées à tous les types d'étapes (combats, menus, loots, achats)
-   Format : `(IMG) Screenshot_1.png` après n'importe quelle étape
-   Images avec marqueurs de personnage : `(IMG) (M) Screenshot_1.png` pour créer des étapes d'images séparées
-   Paramètres de taille d'image dans les options de l'overlay
-   Les images s'affichent automatiquement dans l'interface avec la bonne taille

### 🐛 **Corrections**

-   Correction du parsing des images attachées aux loots et achats
-   Amélioration de la détection des images même après des lignes vides
-   Cohérence dans le traitement des images à travers tous les types d'étapes

### 🎯 **Exemples d'utilisation**

```txt
📦 Brûlures Critiques
(IMG) Screenshot_1.png

💰 Attaque fragilisante
(IMG) Screenshot_1.png

🛡️ Maelle
(V) Attack > PARRY
(IMG) Screenshot_1.png
```

---

## 🚀 Version 1.0.2

### ✨ **Nouveautés**

**⌨️ Raccourcis clavier améliorés**

-   Les raccourcis fonctionnent maintenant même quand vous êtes dans le jeu
-   Plus besoin que l'overlay soit en focus pour utiliser les raccourcis
-   Compatible avec le sprint (SHIFT) du jeu - vous pouvez maintenant appuyer sur F2 en sprintant !

### 🐛 **Corrections**

**⌨️ Problème de raccourcis résolu**

-   Avant : Les raccourcis ne marchaient que si l'overlay était en focus
-   Maintenant : Les raccourcis marchent partout, même dans le jeu
-   Support des combinaisons avec SHIFT, CTRL, ALT

**🎨 Problème de rendu des formations résolu**

-   Avant : Tous les noms de personnages dans les formations avaient la même couleur
-   Maintenant : Chaque nom a sa propre couleur selon son marqueur (M, L, S, V, Mo)
-   Correction du parsing des formations pour traiter chaque action séparément

### 🎯 **Raccourcis disponibles**

-   **F1** : Étape précédente
-   **F2** : Étape suivante
-   **F3** : Afficher/masquer l'overlay
-   **F4** : Menu des chapitres
-   **F5** : Retour au début

_Tous ces raccourcis fonctionnent maintenant même en maintenant SHIFT pour courir dans le jeu !_

---

**💡 Note** : Cette version résout deux problèmes majeurs : les raccourcis fonctionnent maintenant même dans le jeu, et les formations affichent correctement les couleurs de chaque personnage !

---

## 🚀 Version 1.0.1

### 🐛 **Corrections**

-   Suppression des références à F6 dans la documentation (raccourci inexistant)
-   Amélioration de la stabilité de l'overlay
-   Correction des problèmes d'affichage des menus d'options

### 📚 **Documentation**

-   Mise à jour du README.md
-   Correction des raccourcis clavier mentionnés
-   Amélioration de la documentation du format des guides

---

## 🚀 Version 1.0.0

### ✨ **Fonctionnalités initiales**

-   Overlay de guide de speedrun pour Clair Obscur
-   Navigation entre les étapes (F1, F2, F3, F4, F5)
-   Support des différents types d'étapes (combats, loot, achats, menus, notes)
-   Personnalisation de la taille de police
-   Masquage d'éléments spécifiques
-   Gestion des guides au format JSON
-   Convertisseur TXT vers JSON
-   Interface utilisateur intuitive

## [Prochaine version] - 2024-06-09

### Ajouts & Corrections

-   Ajout d'une scrollbar stylisée sombre et arrondie sur le contenu des étapes (#step-content)
-   Correction du scroll pour les étapes longues : le contenu des étapes est désormais toujours accessible via une scrollbar interne
-   Vérification et correction des styles CSS pour que tous les parents de #step-content laissent passer le scroll (pas de overflow bloquant)
-   Amélioration de l'intégration visuelle de la scrollbar pour correspondre au thème sombre de l'overlay
