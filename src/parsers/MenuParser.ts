import { MenuStep, MenuAction, MenuActionType } from "../types/GuideTypes";
import { CharacterUtils } from "../utils/CharacterUtils";
import { LineParser } from "../utils/LineParser";

/**
 * Parseur spécialisé pour les étapes de menu
 */
export class MenuParser {
    private lineParser: LineParser;

    constructor() {
        this.lineParser = new LineParser();
    }

    /**
     * Parse une étape de menu complète
     * @param lines - Toutes les lignes du guide
     * @param startIndex - Index de début du menu
     * @param context - Contexte (acte, chapitre, id)
     * @returns L'étape de menu parsée et l'index suivant
     */
    public parseMenuStep(
        lines: string[],
        startIndex: number,
        context: { acte?: string; chapitre?: string; id: number }
    ): { step: MenuStep; nextIndex: number } {
        const menuActions: MenuAction[] = [];
        const menuOrder: string[] = [];
        let currentMenuType = "";
        let j = startIndex;

        // Traiter la première ligne de menu
        if (j < lines.length) {
            currentMenuType = LineParser.getMenuType(lines[j]);
            if (currentMenuType) {
                menuOrder.push(currentMenuType.toLowerCase());
            }
            j++;
        }

        // Parser toutes les lignes du menu
        while (j < lines.length && lines[j].trim() !== "") {
            const line = lines[j].trim();

            // Nouveau type de menu
            if (LineParser.isMenuLine(line)) {
                currentMenuType = LineParser.getMenuType(line);
                if (currentMenuType && !menuOrder.includes(currentMenuType.toLowerCase())) {
                    menuOrder.push(currentMenuType.toLowerCase());
                }
                j++;
                continue;
            }

            // Note dans le menu
            if (LineParser.isNote(line)) {
                const noteContent = LineParser.extractNote(line);
                menuActions.push({
                    type: "note" as MenuActionType,
                    action: noteContent,
                    character: "",
                    text: noteContent,
                    isSelected: false,
                });
                j++;
                continue;
            }

            // Actions de menu normales
            const actions = this.parseMenuActions(line, currentMenuType);
            menuActions.push(...actions);
            j++;
        }

        // Créer l'étape de menu
        const step: MenuStep = {
            id: context.id,
            type: "menu",
            title: this.generateMenuTitle(menuOrder),
            actions: menuActions,
            menuOrder: menuOrder,
            acte: context.acte,
            chapitre: context.chapitre,
        };

        return { step, nextIndex: j };
    }

    /**
     * Parse les actions d'une ligne de menu
     * @param line - La ligne à parser
     * @param menuType - Le type de menu actuel
     * @returns Array d'actions de menu
     */
    private parseMenuActions(line: string, menuType: string): MenuAction[] {
        const actions: MenuAction[] = [];

        // Cas spécial pour les stats : toutes les stats d'une ligne héritent du perso de la première stat
        if (menuType.toLowerCase() === "stat" && line.includes(",")) {
            const parts = line
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean);
            const firstChar = CharacterUtils.extractCharacter(parts[0]);

            parts.forEach((action) => {
                actions.push({
                    type: "stat" as MenuActionType,
                    action: CharacterUtils.cleanAction(action),
                    character: firstChar,
                    text: CharacterUtils.cleanAction(action),
                    isSelected: false,
                });
            });
        }
        // Cas spécial pour les sorts : tous les sorts d'une ligne héritent du perso du marqueur
        else if (menuType.toLowerCase() === "sort" && line.includes(",")) {
            const parts = line
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean);
            const firstChar = CharacterUtils.extractCharacter(parts[0]);

            parts.forEach((action) => {
                actions.push({
                    type: "sort" as MenuActionType,
                    action: CharacterUtils.cleanAction(action),
                    character: firstChar,
                    text: CharacterUtils.cleanAction(action),
                    isSelected: false,
                });
            });
        }
        // Cas spécial pour la formation : format spécial
        else if (menuType.toLowerCase() === "formation") {
            const parts = line
                .split("/")
                .map((a) => a.trim())
                .filter(Boolean);

            parts.forEach((action) => {
                const character = CharacterUtils.extractCharacter(action);
                actions.push({
                    type: "formation" as MenuActionType,
                    action: CharacterUtils.cleanAction(action),
                    character: character,
                    text: CharacterUtils.cleanAction(action),
                    isSelected: false,
                });
            });
        }
        // Actions normales (séparées par des virgules)
        else {
            const parts = line
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean);

            parts.forEach((action) => {
                const character = CharacterUtils.extractCharacter(action);
                const cleanActionText = CharacterUtils.cleanAction(action);

                actions.push({
                    type: menuType.toLowerCase() as MenuActionType,
                    action: cleanActionText,
                    character: character,
                    text: cleanActionText,
                    isSelected: false,
                });
            });
        }

        return actions;
    }

    /**
     * Parse une note avec un menu (cas spécial où une note précède un menu)
     * @param lines - Toutes les lignes du guide
     * @param startIndex - Index de la note
     * @param context - Contexte (acte, chapitre, id)
     * @returns L'étape de menu avec la note intégrée et l'index suivant
     */
    public parseNoteWithMenu(
        lines: string[],
        startIndex: number,
        context: { acte?: string; chapitre?: string; id: number }
    ): { step: MenuStep; nextIndex: number } {
        // Extraire la note
        const noteLine = lines[startIndex];
        const noteContent = LineParser.extractNote(noteLine);

        // Trouver le début du menu
        let menuStartIndex = startIndex + 1;
        while (menuStartIndex < lines.length && lines[menuStartIndex].trim() === "") {
            menuStartIndex++;
        }

        // Parser le menu normalement
        const menuResult = this.parseMenuStep(lines, menuStartIndex, context);

        // Ajouter la note au début des actions du menu
        if (menuResult.step.actions) {
            menuResult.step.actions.unshift({
                type: "note" as MenuActionType,
                action: noteContent,
                character: "",
                text: noteContent,
                isSelected: false,
            });
        }

        return menuResult;
    }

    /**
     * Génère un titre pour le menu basé sur les types d'actions
     * @param menuOrder - L'ordre des types de menu
     * @returns Le titre du menu
     */
    private generateMenuTitle(menuOrder: string[]): string {
        if (menuOrder.length === 0) return "Menu";
        if (menuOrder.length === 1) return this.getMenuTypeLabel(menuOrder[0]);

        return `Menu ${menuOrder.map((type) => this.getMenuTypeLabel(type)).join(" + ")}`;
    }

    /**
     * Génère un label lisible pour un type de menu
     * @param menuType - Le type de menu
     * @returns Le label lisible
     */
    private getMenuTypeLabel(menuType: string): string {
        const labels: Record<string, string> = {
            arme: "Armes",
            picto: "Pictogrammes",
            lumina: "Lumina",
            "up arme": "Amélioration Armes",
            "up lumina": "Amélioration Lumina",
            stat: "Stats",
            sort: "Sorts",
            formation: "Formation",
        };

        return labels[menuType.toLowerCase()] || menuType;
    }

    /**
     * Vérifie si une ligne est le début d'un menu
     * @param line - La ligne à vérifier
     * @returns true si c'est le début d'un menu
     */
    public isMenuStart(line: string): boolean {
        return LineParser.isMenuLine(line);
    }

    /**
     * Vérifie si une note précède un menu
     * @param lines - Toutes les lignes
     * @param noteIndex - Index de la note
     * @returns true si la note précède un menu
     */
    public isNoteBeforeMenu(lines: string[], noteIndex: number): boolean {
        let nextLineIndex = noteIndex + 1;

        // Ignorer les lignes vides
        while (nextLineIndex < lines.length && lines[nextLineIndex].trim() === "") {
            nextLineIndex++;
        }

        // Vérifier si la prochaine ligne non-vide est un menu
        return nextLineIndex < lines.length && LineParser.isMenuLine(lines[nextLineIndex]);
    }
}
