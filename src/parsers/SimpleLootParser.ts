import { LootStep } from "../types/steps";

export class SimpleLootParser {
    /**
     * Parse une ligne de loot commençant par 📦
     * Exemples:
     * - "📦 Entre les algues $665 Chroma"
     * - "📦 $360 Chroma, Teinte Energie"
     */
    static parseLootLine(line: string): LootStep[] {
        // Enlever l'emoji 📦 et les espaces
        const content = line.replace("📦", "").trim();

        // Séparer par les virgules
        const items = content
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

        // Créer un LootStep pour chaque item
        return items.map((item) => {
            return new LootStep(item);
        });
    }

    static isLootLine(line: string): boolean {
        return line.trim().startsWith("📦");
    }
}
