import { Guide } from "./Guide";

// ============================================================================
// TYPES POUR L'INTERFACE UTILISATEUR
// ============================================================================

/**
 * Options d'affichage minimal
 */
export interface Options {
    hideHeader: boolean;
    skipLoot: boolean;
    skipPurchase: boolean;
    skipNotes: boolean;
    fontSize: number; // Taille de police en pourcentage (100% = taille par défaut)
    imageSize: number; // Taille des images en pourcentage (100% = taille par défaut)
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
 * Événement de changement d'étape
 */
export interface StepChangeEvent {
    currentIndex: number;
    totalSteps: number;
    step: any;
    direction: string;
}

export interface BindChangeEvent {
    bindType: keyof KeyBinds;
    newKey: string;
}

/**
 * Type de notification
 */
export type NotificationType = "info" | "success" | "warning" | "error";

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