import { Guide, Step, ParseResult } from "../types/GuideTypes";
import { LineParser } from "../utils/LineParser";
import { MenuParser } from "./MenuParser";
import { CombatParser } from "./CombatParser";
import { LootParser } from "./LootParser";
import { PurchaseParser } from "./PurchaseParser";
import { NoteParser } from "./NoteParser";

/**
 * Parseur principal du guide qui orchestre tous les parseurs spécialisés
 */
export class GuideParser {
    private menuParser: MenuParser;
    private combatParser: CombatParser;
    private lootParser: LootParser;
    private purchaseParser: PurchaseParser;
    private noteParser: NoteParser;

    constructor() {
        this.menuParser = new MenuParser();
        this.combatParser = new CombatParser();
        this.lootParser = new LootParser();
        this.purchaseParser = new PurchaseParser();
        this.noteParser = new NoteParser();
    }

    /**
     * Parse le contenu complet du guide
     * @param content - Le contenu brut du fichier guide
     * @returns Le guide parsé ou une erreur
     */
    public parseGuide(content: string): ParseResult {
        try {
            const lines = content.split("\n");

            // Lire le nom du jeu et la catégorie depuis les deux premières lignes
            if (lines.length < 2) {
                return {
                    success: false,
                    error: "Le fichier guide doit contenir au moins le nom du jeu et la catégorie",
                };
            }

            const gameName = lines[0].trim();
            const category = lines[1].trim();

            // Ignorer les deux premières lignes et la ligne vide qui suit
            const steps: Step[] = [];
            let currentId = 1;
            let currentAct = "";
            let currentChapter = "";
            let i = 3; // Commencer après les deux premières lignes + ligne vide

            // Parser toutes les étapes
            while (i < lines.length) {
                const line = lines[i].trim();

                if (!line) {
                    i++;
                    continue;
                }

                const context = {
                    acte: currentAct,
                    chapitre: currentChapter,
                    id: currentId,
                };

                // Acte
                if (LineParser.isActLine(line)) {
                    currentAct = line;
                    i++;
                    continue;
                }

                // Chapitre
                if (LineParser.isChapterLine(line)) {
                    currentChapter = LineParser.extractChapter(line);
                    i++;
                    continue;
                }

                // Loot groupé
                if (this.lootParser.isLootStart(line)) {
                    const result = this.lootParser.parseLootStep(lines, i, context);
                    steps.push(result.step);
                    currentId++;
                    i = result.nextIndex;
                    continue;
                }

                // Achat
                if (this.purchaseParser.isPurchaseStart(line)) {
                    const result = this.purchaseParser.parsePurchaseStep(lines, i, context);
                    steps.push(result.step);
                    currentId++;
                    i = result.nextIndex;
                    continue;
                }

                // Menu (avec gestion spéciale des notes qui précèdent)
                if (this.menuParser.isMenuStart(line)) {
                    const result = this.menuParser.parseMenuStep(lines, i, context);
                    steps.push(result.step);
                    currentId++;
                    i = result.nextIndex;
                    continue;
                }

                // Combat ou Boss
                if (this.combatParser.isCombatStart(line)) {
                    const result = this.combatParser.parseCombatStep(lines, i, context);
                    steps.push(result.step);
                    currentId++;
                    i = result.nextIndex;
                    continue;
                }

                // Note (avec vérification si elle précède un menu)
                if (this.noteParser.isNoteStart(line)) {
                    if (this.menuParser.isNoteBeforeMenu(lines, i)) {
                        // Note qui précède un menu - traiter comme un menu avec note
                        const result = this.menuParser.parseNoteWithMenu(lines, i, context);
                        steps.push(result.step);
                        currentId++;
                        i = result.nextIndex;
                    } else if (this.noteParser.isIsolatedNote(lines, i)) {
                        // Note isolée
                        const result = this.noteParser.parseNoteStep(lines, i, context);
                        steps.push(result.step);
                        currentId++;
                        i = result.nextIndex;
                    } else {
                        // Note non reconnue, passer à la ligne suivante
                        i++;
                    }
                    continue;
                }

                // Si rien d'autre, passer à la ligne suivante
                i++;
            }

            const guide: Guide = {
                game: gameName,
                category: category,
                steps: steps,
            };

            return {
                success: true,
                guide: guide,
            };
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors du parsing: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }

    /**
     * Parse un fichier guide depuis un chemin
     * @param filePath - Le chemin vers le fichier guide
     * @returns Le guide parsé ou une erreur
     */
    public async parseGuideFile(filePath: string): Promise<ParseResult> {
        try {
            // En environnement Electron, on utilise l'API IPC pour lire le fichier
            // Cette méthode sera appelée depuis le renderer process
            const fs = require("fs");
            const content = fs.readFileSync(filePath, "utf-8");
            return this.parseGuide(content);
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors de la lecture du fichier: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            };
        }
    }

    /**
     * Valide la structure d'un guide parsé
     * @param guide - Le guide à valider
     * @returns true si le guide est valide
     */
    public validateGuide(guide: Guide): boolean {
        if (!guide.game || !guide.category || !Array.isArray(guide.steps)) {
            return false;
        }

        // Vérifier que chaque étape a un ID unique et un type valide
        const stepIds = new Set<number>();
        const validStepTypes = ["combat", "boss", "loot", "purchase", "menu", "note", "act", "chapter"];

        for (const step of guide.steps) {
            if (!step.id || stepIds.has(step.id)) {
                return false; // ID manquant ou dupliqué
            }
            stepIds.add(step.id);

            if (!validStepTypes.includes(step.type)) {
                return false; // Type d'étape invalide
            }
        }

        return true;
    }
}
