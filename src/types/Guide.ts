import { ActionGroupStep } from "./steps/ActionGroupStep";

/**
 * Classe principale représentant un guide de speedrun
 * Un guide ne contient que des groupes d'actions
 */
export class Guide {
    public game: string;
    public category: string;
    public actionGroups: ActionGroupStep[];

    constructor(game: string, category: string, actionGroups: ActionGroupStep[] = []) {
        this.game = game;
        this.category = category;
        this.actionGroups = actionGroups;
    }

    /**
     * Ajoute un groupe d'actions au guide
     */
    addActionGroup(actionGroup: ActionGroupStep): void {
        this.actionGroups.push(actionGroup);
    }

    /**
     * Obtient tous les steps de tous les groupes
     */
    getAllSteps(): any[] {
        const allSteps: any[] = [];
        this.actionGroups.forEach((group) => {
            allSteps.push(...group.steps);
        });
        return allSteps;
    }

    /**
     * Convertit le guide en objet JSON
     */
    toJSON(): any {
        return {
            game: this.game,
            category: this.category,
            actionGroups: this.actionGroups.map((group) => {
                const groupObj: any = {
                    id: group.id,
                    type: group.type,
                    acte: group.acte,
                    chapitre: group.chapitre,
                    titre: group.titre,
                };

                // Convertir les steps du groupe
                groupObj.steps = group.steps.map((step) => {
                    // Pour les steps simples (objets littéraux), copier toutes les propriétés
                    if (typeof step === "object" && step !== null && !step.hasOwnProperty("validate")) {
                        return { ...step };
                    }

                    // Pour les objets avec toJSON, utiliser leur méthode toJSON
                    if (typeof (step as any).toJSON === "function") {
                        return (step as any).toJSON();
                    }

                    // Sinon, retourner l'objet tel quel
                    return step;
                });

                return groupObj;
            }),
        };
    }

    /**
     * Crée un guide à partir d'un objet JSON
     */
    static fromJSON(data: any): Guide {
        const guide = new Guide(data.game, data.category);

        if (data.actionGroups && Array.isArray(data.actionGroups)) {
            data.actionGroups.forEach((groupData: any) => {
                const actionGroup = new ActionGroupStep(
                    groupData.id,
                    groupData.acte,
                    groupData.chapitre,
                    groupData.steps || []
                );
                guide.addActionGroup(actionGroup);
            });
        }

        return guide;
    }

    /**
     * Sauvegarde le guide dans un fichier
     */
    saveToFile(filePath: string): void {
        const fs = require("fs");
        const jsonData = this.toJSON();
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf8");
    }
}
