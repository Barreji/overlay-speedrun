// ============================================================================
// TYPES POUR LES ÉLÉMENTS DOM (RENDERER SEULEMENT)
// ============================================================================

/**
 * Éléments DOM principaux de l'interface
 */
export interface DOMElements {
    gameName: HTMLElement | null;
    categoryName: HTMLElement | null;
    actLocation: HTMLElement | null;
    stepNumber: HTMLElement | null;
    stepContent: HTMLElement | null;
    stepTitle: HTMLElement | null;
    stepDisplay: HTMLElement | null;
    settingsBtn: HTMLElement | null;
    closeBtn: HTMLElement | null;
    optionsMenu: HTMLElement | null;
    chapterMenu: HTMLElement | null;
    chapterMenuBtn: HTMLElement | null;
    hideHeaderBtn: HTMLElement | null;
    showHeaderBtn: HTMLElement | null;
    resetBindsBtn: HTMLElement | null;
    closeOptionsBtn: HTMLElement | null;
}
