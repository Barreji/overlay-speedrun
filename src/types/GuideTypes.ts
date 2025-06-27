// ============================================================================
// TYPES PRINCIPAUX DU GUIDE
// ============================================================================

/**
 * Guide complet avec toutes les étapes
 */
export interface Guide {
    game: string;
    category: string;
    steps: Step[];
}

/**
 * Type d'étape possible dans le guide
 */
export type StepType = "combat" | "boss" | "loot" | "purchase" | "menu" | "note" | "act" | "chapter";

/**
 * Une étape du guide
 */
export interface Step {
    id: number;
    type: StepType;
    titre?: string;
    acte?: string;
    chapitre?: string;
    turns?: Turn[][];
    actions?: MenuAction[] | CombatAction[];
    menuOrder?: string[];
    content?: string;
}

// ============================================================================
// TYPES SPÉCIFIQUES POUR CHAQUE TYPE D'ÉTAPE
// ============================================================================

/**
 * Étape de menu
 */
export interface MenuStep extends Step {
    type: "menu";
    title: string;
    actions: MenuAction[];
    notes?: string[];
}

/**
 * Étape de note
 */
export interface NoteStep extends Step {
    type: "note";
    content: string;
}

/**
 * Étape d'acte
 */
export interface ActStep extends Step {
    type: "act";
    actNumber: number;
    title: string;
    description?: string;
}

/**
 * Étape de chapitre
 */
export interface ChapterStep extends Step {
    type: "chapter";
    chapterNumber: number;
    title: string;
    description?: string;
}

/**
 * Étape de loot
 */
export interface LootStep extends Step {
    type: "loot";
    character?: string;
    items: string[];
    location?: string;
}

/**
 * Étape d'achat
 */
export interface PurchaseStep extends Step {
    type: "purchase";
    character?: string;
    items: string[];
    shop?: string;
}

/**
 * Étape de combat
 */
export interface CombatStep extends Step {
    type: "combat";
    enemy?: string;
    actions: CombatAction[];
    strategy?: string;
}

/**
 * Étape de boss
 */
export interface BossStep extends Step {
    type: "boss";
    bossName?: string;
    actions: CombatAction[];
    strategy?: string;
    notes?: string[];
}

// ============================================================================
// TYPES POUR LES COMBATS
// ============================================================================

/**
 * Une action dans un tour de combat
 */
export interface Turn {
    action: string;
    character: string;
    fail?: boolean;
    isNote?: boolean;
}

/**
 * Une action de combat
 */
export interface CombatAction {
    character?: string;
    skill?: string;
    target?: string;
    notes?: string;
}

// ============================================================================
// TYPES POUR LES MENUS
// ============================================================================

/**
 * Type d'action de menu possible
 */
export type MenuActionType =
    | "arme"
    | "picto"
    | "lumina"
    | "up arme"
    | "up lumina"
    | "stat"
    | "sort"
    | "formation"
    | "note";

/**
 * Une action de menu
 */
export interface MenuAction {
    type: MenuActionType;
    action: string;
    character: string;
    text: string;
    isSelected?: boolean;
    subActions?: string[];
}

// ============================================================================
// TYPES POUR LES PERSONNAGES
// ============================================================================

/**
 * Code et nom d'un personnage
 */
export interface Character {
    code: string;
    name: string;
}

/**
 * Type pour les codes de personnages
 */
export type CharacterCode = "M" | "L" | "S" | "V" | "Mo";

// ============================================================================
// TYPES POUR L'INTERFACE UTILISATEUR
// ============================================================================

/**
 * Options d'affichage minimal
 */
export interface MinimalOptions {
    hideHeader: boolean;
    skipLoot: boolean;
    skipPurchase: boolean;
    skipNotes: boolean;
    fontSize: number; // Taille de police en pourcentage (100% = taille par défaut)
}

/**
 * Raccourcis clavier configurés
 */
export interface KeyBinds {
    prev: string;
    next: string;
    toggleOverlay: string;
    chapter: string;
    reset: string;
}

/**
 * Informations sur un chapitre
 */
export interface ChapterInfo {
    name: string;
    index: number;
}

// ============================================================================
// TYPES POUR LES RÉSULTATS ET ERREURS
// ============================================================================

/**
 * Résultat d'un parsing
 */
export interface ParseResult {
    success: boolean;
    guide?: Guide;
    error?: string;
}

/**
 * Résultat d'un chargement de fichier
 */
export interface LoadResult {
    success: boolean;
    guide?: Guide;
    error?: string;
}

/**
 * Type de notification
 */
export type NotificationType = "info" | "success" | "warning" | "error";

// ============================================================================
// TYPES POUR LES ÉVÉNEMENTS
// ============================================================================

/**
 * Événement de changement d'étape
 */
export interface StepChangeEvent {
    currentIndex: number;
    totalSteps: number;
    step: Step;
    direction?: string;
}

/**
 * Événement de changement de raccourci
 */
export interface BindChangeEvent {
    bindType: keyof KeyBinds;
    newKey: string;
}

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

/**
 * Fonction de groupement générique
 */
export type GroupByFunction<T> = (item: T) => string;

/**
 * Résultat d'un groupement
 */
export type GroupedResult<T> = { [key: string]: T[] };

/**
 * Fonction de rendu d'action générique
 */
export type ActionRenderer<T> = (action: T) => string;

// ============================================================================
// TYPES POUR LA CONFIGURATION
// ============================================================================

/**
 * Configuration par défaut
 */
export interface DefaultConfig {
    minimalOptions: MinimalOptions;
    keyBinds: KeyBinds;
    characterMap: Character[];
}

/**
 * Configuration sauvegardée
 */
export interface SavedConfig {
    minimalOptions?: Partial<MinimalOptions>;
    keyBinds?: Partial<KeyBinds>;
}
