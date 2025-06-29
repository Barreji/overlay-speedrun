import { ImageStep } from "../types/steps";

export class SimpleImageParser {
    /**
     * Parse une ligne d'image commençant par (IMG)
     * Exemples:
     * - "(IMG) Screenshot_1.png"
     * - "(IMG) (M) Screenshot_1.png"
     * - "(IMG) (V) Screenshot_1.png"
     */
    static parseImageLine(line: string): ImageStep {
        // Enlever le préfixe (IMG) et les espaces
        const content = line.replace("(IMG)", "").trim();

        // Détecter si il y a un tag de personnage
        const characterMatch = content.match(/^\(([MVLSMo])\)\s+(.+)$/);

        if (characterMatch) {
            const characterCode = characterMatch[1];
            const imagePath = characterMatch[2];
            const character = this.getCharacterName(characterCode);

            return new ImageStep(imagePath, character);
        } else {
            return new ImageStep(content, "");
        }
    }

    /**
     * Convertit le code de personnage en nom complet
     */
    private static getCharacterName(code: string): string {
        switch (code) {
            case "M":
                return "Maelle";
            case "V":
                return "Verso";
            case "L":
                return "Lune";
            case "S":
                return "Sciel";
            case "Mo":
                return "Monoco";
            default:
                return code;
        }
    }

    /**
     * Vérifie si une ligne est une ligne d'image
     */
    static isImageLine(line: string): boolean {
        return line.trim().startsWith("(IMG)");
    }
}
