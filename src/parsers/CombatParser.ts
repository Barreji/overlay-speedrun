import { CombatStep, BossStep, Turn } from "../types/GuideTypes";
import { CharacterUtils } from "../utils/CharacterUtils";
import { LineParser } from "../utils/LineParser";

/**
 * Parseur spécialisé pour les étapes de combat et boss
 */
export class CombatParser {
    /**
     * Parse une étape de combat ou boss
     * @param lines - Toutes les lignes du guide
     * @param startIndex - Index de début du combat
     * @param context - Contexte (acte, chapitre, id)
     * @returns L'étape de combat parsée et l'index suivant
     */
    public parseCombatStep(
        lines: string[],
        startIndex: number,
        context: { acte?: string; chapitre?: string; id: number }
    ): { step: CombatStep | BossStep; nextIndex: number } {
        const line = lines[startIndex];
        const isBoss = LineParser.isBossLine(line);
        const type = isBoss ? "boss" : "combat";
        const title = line;
        const turns: Turn[][] = [];

        let j = startIndex + 1;

        // Parser tous les tours jusqu'à la fin du combat
        while (j < lines.length && this.canContinueCombat(lines[j])) {
            const turnLine = lines[j].trim();

            // Vérifier si c'est une note
            if (LineParser.isNote(turnLine)) {
                const noteContent = LineParser.extractNote(turnLine);
                turns.push([
                    {
                        action: noteContent,
                        character: "",
                        fail: false,
                        isNote: true,
                    },
                ]);
            } else {
                // Parser les actions du tour (séparées par '>')
                const actions = this.parseTurnActions(turnLine);
                if (actions.length > 0) {
                    turns.push(actions);
                }
            }

            j++;
        }

        // Créer l'étape de combat
        const step: CombatStep | BossStep = {
            id: context.id,
            type,
            titre: title,
            turns,
            actions: [],
            acte: context.acte,
            chapitre: context.chapitre,
        };

        return { step, nextIndex: j };
    }

    /**
     * Parse les actions d'un tour de combat
     * @param turnLine - La ligne du tour
     * @returns Array d'actions de combat
     */
    private parseTurnActions(turnLine: string): Turn[] {
        const actions: Turn[] = [];

        // Diviser par '>' pour séparer les actions
        const actionParts = turnLine
            .split(">")
            .map((a) => a.trim())
            .filter(Boolean);

        actionParts.forEach((action) => {
            const character = CharacterUtils.extractCharacter(action);
            const fail = /(FAIL)/.test(action);
            const cleanActionText = CharacterUtils.cleanAction(action);

            const combatAction: Turn = {
                action: cleanActionText,
                character,
                fail,
                isNote: false,
            };

            actions.push(combatAction);
        });

        return actions;
    }

    /**
     * Vérifie si on peut continuer à parser le combat
     * @param line - La ligne à vérifier
     * @returns true si on peut continuer le combat
     */
    private canContinueCombat(line: string): boolean {
        const trimmedLine = line.trim();

        // Ligne vide = fin du combat
        if (!trimmedLine) return false;

        // Nouveau combat/boss = fin du combat actuel
        if (LineParser.isCombatOrBossLine(trimmedLine)) return false;

        // Nouveau loot = fin du combat
        if (LineParser.isLootLine(trimmedLine)) return false;

        // Nouvel achat = fin du combat
        if (LineParser.isPurchaseLine(trimmedLine)) return false;

        // Nouveau menu = fin du combat
        if (LineParser.isMenuLine(trimmedLine)) return false;

        // Nouvel acte = fin du combat
        if (LineParser.isActLine(trimmedLine)) return false;

        // Nouveau chapitre = fin du combat
        if (LineParser.isChapterLine(trimmedLine)) return false;

        return true;
    }

    /**
     * Vérifie si une ligne est le début d'un combat
     * @param line - La ligne à vérifier
     * @returns true si c'est le début d'un combat
     */
    public isCombatStart(line: string): boolean {
        return LineParser.isCombatOrBossLine(line);
    }

    /**
     * Détermine si c'est un boss ou un combat normal
     * @param line - La ligne du combat
     * @returns 'boss' ou 'combat'
     */
    public getCombatType(line: string): "boss" | "combat" {
        return LineParser.isBossLine(line) ? "boss" : "combat";
    }
}
