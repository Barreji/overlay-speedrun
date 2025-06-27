import { LootStep } from "../types/GuideTypes";
import { LineParser } from "../utils/LineParser";

/**
 * Parseur spécialisé pour les étapes de loot
 */
export class LootParser {
    /**
     * Parse une étape de loot (peut être groupée)
     * @param lines - Toutes les lignes du guide
     * @param startIndex - Index de début du loot
     * @param context - Contexte (acte, chapitre, id)
     * @returns L'étape de loot parsée et l'index suivant
     */
    public parseLootStep(
        lines: string[],
        startIndex: number,
        context: { acte?: string; chapitre?: string; id: number }
    ): { step: LootStep; nextIndex: number } {
        const items: string[] = [];
        let j = startIndex;

        // Parser tous les loots consécutifs
        while (j < lines.length && LineParser.isLootLine(lines[j])) {
            const lootContent = LineParser.extractLootContent(lines[j]);
            items.push(lootContent);
            j++;
        }

        // Créer l'étape de loot
        const step: LootStep = {
            id: context.id,
            type: "loot",
            titre: items.join(" | "),
            items,
            acte: context.acte,
            chapitre: context.chapitre,
        };

        return { step, nextIndex: j };
    }

    /**
     * Vérifie si une ligne est le début d'un loot
     * @param line - La ligne à vérifier
     * @returns true si c'est le début d'un loot
     */
    public isLootStart(line: string): boolean {
        return LineParser.isLootLine(line);
    }

    /**
     * Extrait le contenu d'un loot depuis une ligne
     * @param line - La ligne de loot
     * @returns Le contenu du loot sans l'emoji
     */
    public extractLootContent(line: string): string {
        return LineParser.extractLootContent(line);
    }
}
