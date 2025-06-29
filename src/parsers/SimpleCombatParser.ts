import { CombatStep, CombatActionType } from "../types/steps/CombatStep";
import { AttackStep, TurnStep } from "../types/steps/TurnStep";
import { NoteStep } from "../types/steps/ItemStep";

/**
 * Parser simple pour les étapes de combat
 */
export class SimpleCombatParser {
    /**
     * Détecte si une ligne annonce un combat
     */
    static isCombatLine(line: string): boolean {
        return line.startsWith("🛡️") || line.startsWith("🎯");
    }

    /**
     * Parse une ligne de combat
     */
    parseCombatLine(line: string): CombatStep {
        const currentCombat = new CombatStep(line.trim());
        return currentCombat;
    }

    /**
     * Détecte si une ligne est un tour de combat
     */
    static isTourLine(line: string): boolean {
        // Un tour commence par (V), (L), (M), (S), etc. ou par une action sans parenthèses
        // Amélioration : détecter aussi les actions comme PARRY, DODGE, etc. (majuscules ou minuscules)
        if (line.startsWith("PARRY")) {
            return true;
        }
        if (line.startsWith("DODGE")) {
            return true;
        }
        return /^\([VLMSo]\)/.test(line);
    }

    /**
     * Parse une ligne de tour
     */
    parseTourLine(line: string): TurnStep {
        const currentTour = new TurnStep();

        // Parse les actions du tour
        const actions = this.parseTourActions(line);
        actions.forEach((action) => {
            currentTour!.addAttack(action);
        });

        return currentTour;
    }

    /**
     * Parse les actions d'un tour
     */
    private parseTourActions(line: string): AttackStep[] {
        const attacks: AttackStep[] = [];

        // Divise la ligne par ">" pour séparer les actions
        const actionParts = line.split(">").map((part) => part.trim());

        actionParts.forEach((part) => {
            if (part) {
                const attack = this.parseAction(part);
                if (attack) {
                    attacks.push(attack);
                }
            }
        });

        return attacks;
    }

    /**
     * Parse une action individuelle
     */
    private parseAction(actionText: string): AttackStep | null {
        // Pattern pour (V) Action ou Action simple
        const match = actionText.match(/^\(([VLMSo])\)\s*(.+)$/);

        if (match) {
            const characterCode = match[1];
            const character = this.getCharacterName(characterCode);
            let action = match[2].trim();
            // Détecter si l'action contient (FAIL) ou (Fail)
            const hasFail = /\(FAIL\)|\(Fail\)/i.test(action);
            // Supprimer (FAIL) du nom de l'action
            action = action.replace(/\(FAIL\)|\(Fail\)/gi, "").trim();
            return new AttackStep(action, character, hasFail);
        } else {
            // Action sans personnage (comme PARRY, DODGE)
            const action = actionText.trim();
            if (action) {
                return new AttackStep(action, "", false);
            }
        }

        return null;
    }

    /**
     * Convertit le code de personnage en nom complet
     */
    private getCharacterName(code: string): string {
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
}
