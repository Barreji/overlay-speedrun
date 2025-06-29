import { MenuActionType, StepType } from "../types/GuideTypes";
import { CharacterUtils } from "./CharacterUtils";

/**
 * Classe utilitaire pour détecter et parser les différents types de lignes
 */
export class LineParser {
    /**
     * Regex pour détecter les lignes de menu
     */
    private static readonly MENU_REGEX = /(ARME|PICTO|LUMINA|UP ARME|UP LUMINA|STAT|SORT|FORMATION)/;

    /**
     * Regex pour détecter les notes
     */
    private static readonly NOTE_REGEX = /^\(A\)/;

    /**
     * Regex pour détecter les images
     */
    private static readonly IMAGE_REGEX = /^\(IMG\)/;

    /**
     * Regex pour détecter les images avec marqueur de personnage
     */
    private static readonly IMAGE_WITH_CHAR_REGEX = /^\(IMG\)\s*\(([MLSV]o?)\)/;

    /**
     * Regex pour détecter les actes
     */
    private static readonly ACT_REGEX = /Act/;

    /**
     * Emojis et symboles pour les différents types d'étapes
     */
    private static readonly STEP_EMOJIS = {
        LOOT: "📦",
        PURCHASE: "💰",
        COMBAT: "🛡️",
        BOSS: "🎯",
    };

    /**
     * Préfixe pour les chapitres
     */
    private static readonly CHAPTER_PREFIX = "T:";

    // ============================================================================
    // DÉTECTION DES TYPES DE LIGNES
    // ============================================================================

    /**
     * Vérifie si une ligne est une ligne de menu
     * @param line - La ligne à vérifier
     * @returns true si c'est une ligne de menu
     */
    public static isMenuLine(line: string): boolean {
        return this.MENU_REGEX.test(line);
    }

    /**
     * Vérifie si une ligne est une note
     * @param line - La ligne à vérifier
     * @returns true si c'est une note
     */
    public static isNote(line: string): boolean {
        return this.NOTE_REGEX.test(line);
    }

    /**
     * Vérifie si une ligne est un acte
     * @param line - La ligne à vérifier
     * @returns true si c'est un acte
     */
    public static isActLine(line: string): boolean {
        return this.ACT_REGEX.test(line);
    }

    /**
     * Vérifie si une ligne est un chapitre
     * @param line - La ligne à vérifier
     * @returns true si c'est un chapitre
     */
    public static isChapterLine(line: string): boolean {
        return line.startsWith(this.CHAPTER_PREFIX);
    }

    /**
     * Vérifie si une ligne est un loot
     * @param line - La ligne à vérifier
     * @returns true si c'est un loot
     */
    public static isLootLine(line: string): boolean {
        return line.startsWith(this.STEP_EMOJIS.LOOT);
    }

    /**
     * Vérifie si une ligne est un achat
     * @param line - La ligne à vérifier
     * @returns true si c'est un achat
     */
    public static isPurchaseLine(line: string): boolean {
        return line.startsWith(this.STEP_EMOJIS.PURCHASE);
    }

    /**
     * Vérifie si une ligne est un combat
     * @param line - La ligne à vérifier
     * @returns true si c'est un combat
     */
    public static isCombatLine(line: string): boolean {
        return line.startsWith(this.STEP_EMOJIS.COMBAT);
    }

    /**
     * Vérifie si une ligne est un boss
     * @param line - La ligne à vérifier
     * @returns true si c'est un boss
     */
    public static isBossLine(line: string): boolean {
        return line.startsWith(this.STEP_EMOJIS.BOSS);
    }

    /**
     * Vérifie si une ligne est une image
     * @param line - La ligne à vérifier
     * @returns true si c'est une image
     */
    public static isImageLine(line: string): boolean {
        return this.IMAGE_REGEX.test(line);
    }

    /**
     * Vérifie si une ligne est une image avec marqueur de personnage (image solo)
     * @param line - La ligne à vérifier
     * @returns true si c'est une image solo
     */
    public static isImageWithCharacter(line: string): boolean {
        return this.IMAGE_WITH_CHAR_REGEX.test(line);
    }

    /**
     * Vérifie si une ligne est un combat ou un boss
     * @param line - La ligne à vérifier
     * @returns true si c'est un combat ou un boss
     */
    public static isCombatOrBossLine(line: string): boolean {
        return this.isCombatLine(line) || this.isBossLine(line);
    }

    /**
     * Vérifie si une ligne contient un marqueur de personnage
     * @param line - La ligne à vérifier
     * @returns true si la ligne contient un marqueur de personnage
     */
    public static isCharacterMark(line: string): boolean {
        return CharacterUtils.isCharacterMark(line);
    }

    // ============================================================================
    // EXTRACTION DE CONTENU
    // ============================================================================

    /**
     * Extrait le type de menu depuis une ligne
     * @param line - La ligne de menu
     * @returns Le type de menu ou une chaîne vide
     */
    public static getMenuType(line: string): string {
        const match = line.match(this.MENU_REGEX);
        return match ? match[1] : "";
    }

    /**
     * Extrait le contenu d'une note
     * @param line - La ligne de note
     * @returns Le contenu de la note sans le préfixe (A)
     */
    public static extractNote(line: string): string {
        return line.replace(this.NOTE_REGEX, "").trim();
    }

    /**
     * Extrait le contenu d'un chapitre
     * @param line - La ligne de chapitre
     * @returns Le contenu du chapitre sans le préfixe T:
     */
    public static extractChapter(line: string): string {
        return line.substring(this.CHAPTER_PREFIX.length).trim();
    }

    /**
     * Extrait le contenu d'un loot
     * @param line - La ligne de loot
     * @returns Le contenu du loot sans l'emoji
     */
    public static extractLootContent(line: string): string {
        return line.substring(this.STEP_EMOJIS.LOOT.length).trim().replace(/^\W+/g, "").trim();
    }

    /**
     * Extrait le contenu d'un achat
     * @param line - La ligne d'achat
     * @returns Le contenu de l'achat sans l'emoji
     */
    public static extractPurchaseContent(line: string): string {
        return line.substring(this.STEP_EMOJIS.PURCHASE.length).trim().replace(/^\W+/g, "").trim();
    }

    /**
     * Extrait le chemin de l'image depuis une ligne d'image
     * @param line - La ligne d'image
     * @returns Le chemin de l'image sans le préfixe (IMG)
     */
    public static extractImagePath(line: string): string {
        return line.replace(this.IMAGE_REGEX, "").trim();
    }

    /**
     * Extrait le marqueur de personnage depuis une ligne d'image
     * @param line - La ligne d'image
     * @returns Le marqueur de personnage ou null
     */
    public static extractImageCharacter(line: string): string | null {
        const match = line.match(this.IMAGE_WITH_CHAR_REGEX);
        return match ? match[1] : null;
    }

    /**
     * Extrait le titre de l'image depuis une ligne d'image avec personnage
     * @param line - La ligne d'image
     * @returns Le titre de l'image ou null
     */
    public static extractImageTitle(line: string): string | null {
        const match = line.match(this.IMAGE_WITH_CHAR_REGEX);
        if (!match) return null;

        // Extraire le reste de la ligne après le marqueur de personnage
        const afterChar = line.substring(match[0].length).trim();
        return afterChar || null;
    }

    // ============================================================================
    // DÉTECTION DE TYPE D'ÉTAPE
    // ============================================================================

    /**
     * Détermine le type d'étape basé sur le contenu de la ligne
     * @param line - La ligne à analyser
     * @returns Le type d'étape ou null si non reconnu
     */
    public static getStepType(line: string): StepType | null {
        if (this.isCombatLine(line)) return "combat";
        if (this.isBossLine(line)) return "boss";
        if (this.isLootLine(line)) return "loot";
        if (this.isPurchaseLine(line)) return "purchase";
        if (this.isMenuLine(line)) return "menu";
        if (this.isNote(line)) return "note";
        if (this.isImageLine(line)) return "image";
        return null;
    }

    /**
     * Vérifie si une ligne peut continuer un combat
     * @param line - La ligne à vérifier
     * @returns true si la ligne peut faire partie d'un combat
     */
    public static canContinueCombat(line: string): boolean {
        const trimmed = line.trim();
        if (!trimmed) return false;

        return (
            !this.isCombatLine(trimmed) &&
            !this.isBossLine(trimmed) &&
            !this.isLootLine(trimmed) &&
            !this.isPurchaseLine(trimmed) &&
            !this.isMenuLine(trimmed) &&
            !this.isActLine(trimmed) &&
            !this.isChapterLine(trimmed)
        );
    }

    // ============================================================================
    // VALIDATION ET UTILITAIRES
    // ============================================================================

    /**
     * Vérifie si une ligne est vide ou ne contient que des espaces
     * @param line - La ligne à vérifier
     * @returns true si la ligne est vide
     */
    public static isEmptyLine(line: string): boolean {
        return !line || line.trim() === "";
    }

    /**
     * Nettoie une ligne en supprimant les espaces en début et fin
     * @param line - La ligne à nettoyer
     * @returns La ligne nettoyée
     */
    public static cleanLine(line: string): string {
        return line.trim();
    }

    /**
     * Vérifie si un type de menu est valide
     * @param menuType - Le type de menu à vérifier
     * @returns true si le type est valide
     */
    public static isValidMenuType(menuType: string): menuType is MenuActionType {
        const validTypes: MenuActionType[] = [
            "arme",
            "picto",
            "lumina",
            "up arme",
            "up lumina",
            "stat",
            "sort",
            "formation",
            "note",
        ];
        return validTypes.includes(menuType.toLowerCase() as MenuActionType);
    }

    /**
     * Normalise un type de menu (convertit en minuscules)
     * @param menuType - Le type de menu à normaliser
     * @returns Le type normalisé
     */
    public static normalizeMenuType(menuType: string): MenuActionType {
        const normalized = menuType.toLowerCase();
        if (this.isValidMenuType(normalized)) {
            return normalized as MenuActionType;
        }
        throw new Error(`Type de menu invalide: ${menuType}`);
    }

    // ============================================================================
    // FONCTIONS DE PARSING SPÉCIALISÉES
    // ============================================================================

    /**
     * Parse une ligne d'action de menu
     * @param line - La ligne à parser
     * @param menuType - Le type de menu
     * @returns Array d'actions de menu
     */
    public static parseMenuActions(
        line: string,
        menuType: MenuActionType
    ): Array<{
        type: MenuActionType;
        action: string;
        character: string;
    }> {
        const parts = line
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);

        // Cas spécial pour les stats et sorts : tous héritent du premier personnage
        if ((menuType === "stat" || menuType === "sort") && parts.length > 1) {
            const firstChar = CharacterUtils.extractCharacter(parts[0]);
            return parts.map((action) => ({
                type: menuType,
                action: CharacterUtils.cleanAction(action),
                character: firstChar,
            }));
        }

        // Cas général : chaque action a son propre personnage
        return parts.map((action) => ({
            type: menuType,
            action: CharacterUtils.cleanAction(action),
            character: CharacterUtils.extractCharacter(action),
        }));
    }

    /**
     * Parse une ligne de tour de combat
     * @param line - La ligne à parser
     * @returns Array d'actions de combat
     */
    public static parseCombatActions(line: string): Array<{
        action: string;
        character: string;
        fail: boolean;
    }> {
        return line
            .split(">")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((action) => {
                const character = CharacterUtils.extractCharacter(action);
                const fail = CharacterUtils.hasFailMarker(action);

                return {
                    action: CharacterUtils.cleanAction(action),
                    character,
                    fail,
                };
            });
    }
}
