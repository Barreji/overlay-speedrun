import { MenuStep, MenuType } from "../types/steps/MenuStep";
import {
    FormationStep,
    ImageStep,
    LuminaStep,
    PictoStep,
    SortStep,
    StatStep,
    UpArmeStep,
    UpLuminaStep,
} from "../types/steps/ItemStep";
import { ActionGroupStep } from "../types/steps/ActionGroupStep";
import { ArmeStep } from "../types/steps/ItemStep";
import { MenuSubState } from "./StateMachine";

interface StatItem {
    name: string;
    value: number;
    maxValue: number;
}

/**
 * Parser simple pour les étapes de menu
 */
export class SimpleMenuParser {
    private static menuKeywords = ["ARME", "PICTO", "STAT", "SORT", "LUMINA", "UP ARME", "UP LUMINA", "FORMATION"];
    private static menuTypes = ["arme", "picto", "stat", "sort", "lumina", "upArme", "upLumina", "formation"];

    /**
     * Détecte si une ligne contient un mot-clé de menu
     */
    static isMenuKeyword(line: string): boolean {
        return this.menuKeywords.some((keyword) => line.trim().startsWith(keyword));
    }

    /**
     * Détecte le type de menu à partir d'une ligne
     */
    static getMenuType(line: string): string | null {
        const trimmedLine = line.trim();
        const idx = this.menuKeywords.findIndex((keyword) => trimmedLine.startsWith(keyword));
        return idx !== -1 ? this.menuTypes[idx] : null;
    }

    /**
     * Détermine le sous-état approprié pour un type de menu
     */
    static getMenuSubState(menuType: string): MenuSubState {
        switch (menuType) {
            case "arme":
                return "IN_ARME";
            case "picto":
                return "IN_PICTO";
            case "stat":
                return "IN_STAT";
            case "sort":
                return "IN_SORT";
            case "lumina":
                return "IN_LUMINA";
            case "upArme":
                return "IN_UP_ARME";
            case "upLumina":
                return "IN_UP_LUMINA";
            case "formation":
                return "IN_FORMATION";
            default:
                return null;
        }
    }

    /**
     * Parse une ligne d'arme
     */
    static parseArmeLine(line: string): ArmeStep {
        const match = line.trim().match(/^\(([VLMSo])\)\s+(.+)$/);
        if (match) {
            const characterCode = match[1];
            const weaponName = match[2].trim();
            const character = this.getCharacterName(characterCode);
            return new ArmeStep(weaponName, character);
        }
        throw new Error(`Format d'arme invalide: ${line}`);
    }

    /**
     * Parse une ligne de pictogramme
     */
    static parsePictoLine(line: string): PictoStep {
        const match = line.trim().match(/^\(([VLMSo])\)\s+(.+)$/);
        if (match) {
            const characterCode = match[1];
            const pictoName = match[2].trim();
            const character = this.getCharacterName(characterCode);
            return new PictoStep(pictoName, character);
        }
        throw new Error(`Format de pictogramme invalide: ${line}`);
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
            case "o":
                return "Monoco";
            default:
                return code;
        }
    }

    /**
     * Parse une ligne de lumina
     */
    static parseLuminaLine(line: string): LuminaStep {
        const match = line.trim().match(/^\(([VLMSo])\)\s+(.+)$/);
        if (match) {
            const characterCode = match[1];
            const luminaName = match[2].trim();
            const character = this.getCharacterName(characterCode);
            return new LuminaStep(luminaName, character);
        }
        throw new Error(`Format de lumina invalide: ${line}`);
    }

    /**
     * Parse une ligne de sort
     */
    static parseSortLine(line: string): SortStep {
        const match = line.trim().match(/^\(([VLMSo])\)\s+(.+?)(?:\s*\(([^)]+)\))?$/);
        if (match) {
            const characterCode = match[1];
            const spellName = match[2].trim();
            const position = match[3] ? match[3].trim() : "";
            const character = this.getCharacterName(characterCode);
            return new SortStep(spellName, character, position);
        }
        throw new Error(`Format de sort invalide: ${line}`);
    }

    /**
     * Parse une ligne de statistiques
     */
    static parseStatLine(line: string): StatStep[] {
        const characterMatch = line.trim().match(/^\(([VLMSo])\)\s+(.+)$/);
        if (characterMatch) {
            const characterCode = characterMatch[1];
            const statsText = characterMatch[2];
            const character = this.getCharacterName(characterCode);
            const statSteps: StatStep[] = [];

            // D'abord essayer de diviser par virgules
            let statParts = statsText.split(",").map((part) => part.trim());

            for (const part of statParts) {
                const statMatch = part.match(/^\+(\d+)\s+(\w+)\s*\((\d+)\)$/);
                if (statMatch) {
                    const value = parseInt(statMatch[1]);
                    const name = statMatch[2];
                    const maxValue = parseInt(statMatch[3]);
                    statSteps.push(new StatStep(name, character, value, maxValue));
                }
            }
            return statSteps;
        }
        throw new Error(`Format de statistique invalide: ${line}`);
    }

    /**
     * Parse une ligne d'amélioration d'arme
     */
    static parseUpArmeLine(line: string): UpArmeStep {
        const match = line.trim().match(/^\(([VLMSo])\)\s+(\w+)\s+\+(\d+)\s*\((\d+)\)$/);
        if (match) {
            const characterCode = match[1];
            const weaponName = match[2];
            const levelAdded = parseInt(match[3]);
            const totalLevel = parseInt(match[4]);
            const character = this.getCharacterName(characterCode);
            return new UpArmeStep(weaponName, character, levelAdded, totalLevel);
        }
        throw new Error(`Format d'amélioration d'arme invalide: ${line}`);
    }

    /**
     * Parse une ligne d'amélioration de lumina
     */
    static parseUpLuminaLine(line: string): UpLuminaStep {
        const match = line.trim().match(/^\(([VLMSo])\)\s+\+(\d+)\s*(?:Lumina)?\s*\((\d+)\)$/);
        if (match) {
            const characterCode = match[1];
            const luminaAdded = parseInt(match[2]);
            const totalLumina = parseInt(match[3]);
            const character = this.getCharacterName(characterCode);
            return new UpLuminaStep(character, luminaAdded, totalLumina);
        }
        throw new Error(`Format d'amélioration de lumina invalide: ${line}`);
    }

    /**
     * Parse une ligne de formation
     */
    static parseFormationLine(line: string): FormationStep[] {
        const formationSteps: FormationStep[] = [];
        const match = line.trim().match(/^\(([VLMSo])\)\s+(.+)$/);
        if (match) {
            const characterCode = match[1];
            const formationText = match[2].trim();
            const character = this.getCharacterName(characterCode);

            // Diviser par virgules pour gérer les formations multiples
            const formationParts = formationText.split(",").map((part) => part.trim());

            for (const formationPart of formationParts) {
                // Parser chaque formation individuellement
                const formationMatch = formationPart.match(/^([+-])(.+)$/);
                if (formationMatch) {
                    const operation = formationMatch[1];
                    const formationName = formationMatch[2].trim();
                    const toAdd = operation === "+" ? true : false;
                    formationSteps.push(new FormationStep(character, toAdd));
                }
            }
        }
        return formationSteps;
    }
}
