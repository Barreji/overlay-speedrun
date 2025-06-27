import { PurchaseStep } from "../types/GuideTypes";
import { LineParser } from "../utils/LineParser";

/**
 * Parseur spécialisé pour les étapes d'achat
 */
export class PurchaseParser {
    /**
     * Parse une étape d'achat
     * @param lines - Toutes les lignes du guide
     * @param startIndex - Index de début de l'achat
     * @param context - Contexte (acte, chapitre, id)
     * @returns L'étape d'achat parsée et l'index suivant
     */
    public parsePurchaseStep(
        lines: string[],
        startIndex: number,
        context: { acte?: string; chapitre?: string; id: number }
    ): { step: PurchaseStep; nextIndex: number } {
        const line = lines[startIndex];
        const purchaseContent = LineParser.extractPurchaseContent(line);

        // Créer l'étape d'achat
        const step: PurchaseStep = {
            id: context.id,
            type: "purchase",
            titre: purchaseContent,
            items: [purchaseContent],
            acte: context.acte,
            chapitre: context.chapitre,
        };

        return { step, nextIndex: startIndex + 1 };
    }

    /**
     * Vérifie si une ligne est le début d'un achat
     * @param line - La ligne à vérifier
     * @returns true si c'est le début d'un achat
     */
    public isPurchaseStart(line: string): boolean {
        return LineParser.isPurchaseLine(line);
    }

    /**
     * Extrait le contenu d'un achat depuis une ligne
     * @param line - La ligne d'achat
     * @returns Le contenu de l'achat sans l'emoji
     */
    public extractPurchaseContent(line: string): string {
        return LineParser.extractPurchaseContent(line);
    }
}
