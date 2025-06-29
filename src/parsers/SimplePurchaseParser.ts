import { PurchaseStep } from "../types/steps";

export class SimplePurchaseParser {
    /**
     * Parse une ligne d'achat commençant par 💰
     * Exemples:
     * - "💰 Attaque fragilisante"
     * - "💰 Instant Critique, 2 Chroma Poli"
     */
    static parsePurchaseLine(line: string): PurchaseStep[] {
        // Enlever l'emoji 💰 et les espaces
        const content = line.replace("💰", "").trim();

        // Séparer par les virgules
        const items = content
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

        // Créer un PurchaseStep pour chaque item
        return items.map((item) => {
            return new PurchaseStep(item);
        });
    }

    /**
     * Vérifie si une ligne est une ligne d'achat
     */
    static isPurchaseLine(line: string): boolean {
        return line.trim().startsWith("💰");
    }
}
