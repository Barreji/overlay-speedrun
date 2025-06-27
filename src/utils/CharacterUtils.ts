import { Character, CharacterCode } from "../types/GuideTypes";

/**
 * Classe utilitaire pour la gestion des personnages et leurs couleurs
 */
export class CharacterUtils {
    /**
     * Mapping des codes de personnages vers leurs noms
     */
    private static readonly CHARACTER_MAP: Record<CharacterCode, string> = {
        M: "maelle",
        L: "lune",
        S: "sciel",
        V: "verso",
        Mo: "monoco",
    };

    /**
     * Mapping des noms de personnages vers leurs classes CSS
     */
    private static readonly COLOR_CLASS_MAP: Record<string, string> = {
        verso: "character-verso",
        maelle: "character-maelle",
        lune: "character-lune",
        sciel: "character-sciel",
        monoco: "character-monoco",
    };

    /**
     * Regex pour détecter les marqueurs de personnages dans le texte
     */
    private static readonly CHARACTER_REGEX = /\((M|L|S|V|Mo)\)/;

    /**
     * Regex pour détecter les marqueurs FAIL dans les actions
     */
    private static readonly FAIL_REGEX = /\(FAIL\)/;

    /**
     * Vérifie si une ligne contient un marqueur de personnage
     * @param line - La ligne à vérifier
     * @returns true si la ligne contient un marqueur de personnage
     */
    public static isCharacterMark(line: string): boolean {
        return this.CHARACTER_REGEX.test(line);
    }

    /**
     * Extrait le code du personnage depuis une action
     * @param action - L'action contenant potentiellement un marqueur de personnage
     * @returns Le code du personnage ou une chaîne vide si aucun personnage n'est trouvé
     */
    public static extractCharacterCode(action: string): CharacterCode | "" {
        const match = action.match(this.CHARACTER_REGEX);
        if (!match) return "";
        return match[1] as CharacterCode;
    }

    /**
     * Extrait le nom du personnage depuis une action
     * @param action - L'action contenant potentiellement un marqueur de personnage
     * @returns Le nom du personnage ou une chaîne vide si aucun personnage n'est trouvé
     */
    public static extractCharacter(action: string): string {
        const code = this.extractCharacterCode(action);
        if (!code) return "";
        return this.CHARACTER_MAP[code] || "";
    }

    /**
     * Nettoie une action en supprimant les marqueurs de personnage et FAIL
     * @param action - L'action à nettoyer
     * @returns L'action nettoyée
     */
    public static cleanAction(action: string): string {
        return action.replace(this.CHARACTER_REGEX, "").replace(this.FAIL_REGEX, "").trim();
    }

    /**
     * Obtient la classe CSS de couleur pour un personnage
     * @param character - Le nom du personnage
     * @returns La classe CSS correspondante ou une chaîne vide si aucun personnage
     */
    public static getCharacterColorClass(character: string): string {
        if (!character) return "";
        return this.COLOR_CLASS_MAP[(character || "").toLowerCase()] || "";
    }

    /**
     * Vérifie si une action contient un marqueur FAIL
     * @param action - L'action à vérifier
     * @returns true si l'action contient FAIL
     */
    public static hasFailMarker(action: string): boolean {
        return this.FAIL_REGEX.test(action);
    }

    /**
     * Obtient tous les personnages disponibles
     * @returns Array des personnages avec leurs codes et noms
     */
    public static getAllCharacters(): Character[] {
        return Object.entries(this.CHARACTER_MAP).map(([code, name]) => ({
            code,
            name,
        }));
    }

    /**
     * Obtient le nom d'un personnage par son code
     * @param code - Le code du personnage
     * @returns Le nom du personnage ou une chaîne vide si le code n'existe pas
     */
    public static getCharacterName(code: CharacterCode): string {
        return this.CHARACTER_MAP[code] || "";
    }

    /**
     * Obtient le code d'un personnage par son nom
     * @param name - Le nom du personnage
     * @returns Le code du personnage ou une chaîne vide si le nom n'existe pas
     */
    public static getCharacterCode(name: string): CharacterCode | "" {
        const normalizedName = name.toLowerCase();
        for (const [code, charName] of Object.entries(this.CHARACTER_MAP)) {
            if (charName.toLowerCase() === normalizedName) {
                return code as CharacterCode;
            }
        }
        return "";
    }

    /**
     * Vérifie si un nom de personnage est valide
     * @param name - Le nom à vérifier
     * @returns true si le nom correspond à un personnage valide
     */
    public static isValidCharacterName(name: string): boolean {
        return Object.values(this.CHARACTER_MAP).includes(name.toLowerCase());
    }

    /**
     * Vérifie si un code de personnage est valide
     * @param code - Le code à vérifier
     * @returns true si le code correspond à un personnage valide
     */
    public static isValidCharacterCode(code: string): code is CharacterCode {
        return code in this.CHARACTER_MAP;
    }

    /**
     * Formate une action avec la couleur du personnage pour l'affichage HTML
     * @param action - L'action à formater
     * @param character - Le nom du personnage
     * @param hasFail - Si l'action a échoué
     * @returns Le HTML formaté avec la classe de couleur
     */
    public static formatActionWithColor(action: string, character: string, hasFail: boolean = false): string {
        const colorClass = this.getCharacterColorClass(character);
        const failClass = hasFail ? "fail" : "";
        const classes = [colorClass, failClass].filter(Boolean).join(" ");

        return `<span class="${classes}">${action}</span>`;
    }

    /**
     * Formate une statistique avec la couleur du personnage et les valeurs max
     * @param action - L'action de statistique
     * @param character - Le nom du personnage
     * @returns Le HTML formaté pour une statistique
     */
    public static formatStatAction(action: string, character: string): string {
        const colorClass = this.getCharacterColorClass(character);
        const match = action.match(/(.+?)\(([^)]+)\)$/);

        if (match) {
            return `<span class="${colorClass}">${match[1].trim()} (<span class="stat-max">${match[2]}</span>)</span>`;
        }

        return `<span class="${colorClass}">${action}</span>`;
    }

    /**
     * Formate un texte avec les couleurs des personnages détectés
     * @param text - Le texte à formater
     * @returns Le HTML formaté avec les couleurs des personnages
     */
    public static formatWithColors(text: string): string {
        if (!text) return "";

        // Détecte les marqueurs de personnages et les remplace par du HTML coloré
        return text.replace(this.CHARACTER_REGEX, (match, code) => {
            const characterName = this.getCharacterName(code as CharacterCode);
            const colorClass = this.getCharacterColorClass(characterName);
            return `<span class="${colorClass}">${characterName}</span>`;
        });
    }
}
