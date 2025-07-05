import { CombatStep } from "./CombatStep";
import { MenuStep } from "./MenuStep";
import { LootStep, PurchaseStep, ImageStep } from "./ItemStep";

/**
 * Types possibles pour un groupe d'actions
 */
export type ActionGroupType = "loot" | "purchase" | "menu" | "combat" | "image" | "mixte";

/**
 * Type union pour les types de steps principaux
 */
export type StepType = CombatStep | MenuStep | LootStep | PurchaseStep | ImageStep;

/**
 * Étape de groupe d'actions contenant plusieurs steps
 */
export class ActionGroupStep {
    public id: number;
    public type: ActionGroupType;
    public titre: string;
    public acte: string;
    public chapitre: string;
    public steps: StepType[];

    constructor(id: number, acte: string, chapitre: string, steps: StepType[] = []) {
        this.id = id;
        this.titre = "";
        this.acte = acte;
        this.chapitre = chapitre;
        this.steps = steps;
        this.type = this.determineGroupType();
        this.generateTitle();
    }

    /**
     * Génère automatiquement le titre du groupe basé sur les steps qu'il contient
     */
    generateTitle(): void {
        if (this.steps.length === 0) {
            this.titre = "Erreur";
            return;
        }

        // Si le groupe ne contient qu'un seul combat, utiliser son titre
        if (this.steps.length === 1 && this.steps[0] instanceof CombatStep) {
            const combatTitle = this.steps[0].titre || "Combat";
            return;
        }

        // Si le groupe ne contient qu'un seul menu, utiliser "Menu"
        if (this.steps.length === 1 && this.steps[0] instanceof MenuStep) {
            this.titre = "⚙️ Menu";
            return;
        }

        // Si tous les steps sont du même type, utiliser le titre approprié
        const stepTypes = this.steps.map((step) => step.type);

        if (stepTypes.every((type) => type === "loot")) {
            this.titre = "📦 Loot";
            return;
        }

        if (stepTypes.every((type) => type === "purchase")) {
            this.titre = "💰 Achat";
            return;
        }

        if (stepTypes.every((type) => type === "image")) {
            this.titre = "🖼️ Image";
            return;
        }

        // Pour les groupes mixtes, créer un titre avec les emojis dans l'ordre des steps
        const emojiMap: { [key: string]: string } = {
            loot: "📦",
            purchase: "💰",
            menu: "⚙️",
            combat: "🛡️",
            boss: "🎯",
            img: "🖼️",
            note: "💡",
            arme: "⚔️",
            picto: "🎨",
            stat: "📊",
            sort: "✨",
            lumina: "💎",
            upArme: "🔧",
            upLumina: "🔧",
        };

        // Créer le titre avec les emojis dans l'ordre des steps
        const emojis: string[] = [];
        for (const step of this.steps) {
            const emoji = emojiMap[step.type];
            if (emoji) {
                emojis.push(emoji);
            }
        }

        if (emojis.length > 0) {
            this.titre = emojis.join("");
        } else {
            this.titre = "Groupe d'actions";
        }
    }

    /**
     * Détermine automatiquement le type du groupe basé sur les steps qu'il contient
     */
    determineGroupType(): ActionGroupType {
        const stepTypes = this.steps.map((step) => step.type);

        // Si tous les steps sont du même type, utiliser ce type
        if (stepTypes.every((type) => type === "loot")) {
            return "loot";
        } else if (stepTypes.every((type) => type === "purchase")) {
            return "purchase";
        } else if (stepTypes.every((type) => type === "menu")) {
            return "menu";
        } else if (stepTypes.every((type) => type === "combat")) {
            return "combat";
        } else if (stepTypes.every((type) => type === "img")) {
            return "image";
        } else if (
            stepTypes.every(
                (type) =>
                    type === "arme" ||
                    type === "picto" ||
                    type === "stat" ||
                    type === "sort" ||
                    type === "lumina" ||
                    type === "upArme" ||
                    type === "upLumina"
            )
        ) {
            return "menu"; // Tous ces types font partie des menus
        }
        return "mixte";
    }

    toJSON(): any {
        return {
            id: this.id,
            type: this.type,
            acte: this.acte,
            chapitre: this.chapitre,
            titre: this.titre,
            steps: this.steps.map((step) => step.toJSON()),
        };
    }

    static fromJSON(data: any): ActionGroupStep {
        const steps = data.steps.map((stepData: any) => {
            if (stepData.type === "combat") {
                return CombatStep.fromJSON(stepData);
            } else if (stepData.type === "menu") {
                return MenuStep.fromJSON(stepData);
            } else if (stepData.type === "loot") {
                return LootStep.fromJSON(stepData);
            } else if (stepData.type === "purchase") {
                return PurchaseStep.fromJSON(stepData);
            } else if (stepData.type === "image") {
                return ImageStep.fromJSON(stepData);
            }
        });

        const actionGroup = new ActionGroupStep(data.id, data.acte, data.chapitre, steps);
        return actionGroup;
    }
}
