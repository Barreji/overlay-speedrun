import {
    Step,
    MenuStep,
    NoteStep,
    ActStep,
    ChapterStep,
    LootStep,
    PurchaseStep,
    CombatStep,
    BossStep,
    MenuAction,
    CombatAction,
    CharacterCode,
} from "../types/GuideTypes";
import { CharacterUtils } from "../utils/CharacterUtils";
import { LineParser } from "../utils/LineParser";

export class StepRenderer {
    private lineParser: LineParser;
    private minimalOptions: any;

    constructor(minimalOptions?: any) {
        this.lineParser = new LineParser();
        this.minimalOptions = minimalOptions || {};
    }

    /**
     * Rend une étape complète avec son contenu formaté
     */
    renderStep(step: Step): string {
        const stepContent = this.renderStepContent(step);
        return `<div class="step" data-step-id="${step.id}">${stepContent}</div>`;
    }

    /**
     * Rend le contenu d'une étape selon son type
     */
    private renderStepContent(step: Step): string {
        switch (step.type) {
            case "menu":
                return this.renderMenuStep(step as MenuStep);
            case "note":
                return this.renderNoteStep(step as NoteStep);
            case "act":
                return this.renderActStep(step as ActStep);
            case "chapter":
                return this.renderChapterStep(step as ChapterStep);
            case "loot":
                return this.renderLootStep(step as LootStep);
            case "purchase":
                return this.renderPurchaseStep(step as PurchaseStep);
            case "combat":
                return this.renderCombatStep(step as CombatStep);
            case "boss":
                return this.renderBossStep(step as BossStep);
            default:
                return this.renderGenericStep(step);
        }
    }

    /**
     * Rend une étape de menu avec ses actions
     */
    private renderMenuStep(step: MenuStep): string {
        if (!step.actions || !step.actions.length) return "";

        // Utiliser l'ordre des menus stocké dans le JSON, ou l'ordre par défaut si pas disponible
        const typeOrder = step.menuOrder || [
            "arme",
            "picto",
            "lumina",
            "stat",
            "sort",
            "formation",
            "up arme",
            "up lumina",
        ];

        let html = "";
        let alreadyShownNotes = new Set();
        for (const type of typeOrder) {
            const actions = step.actions.filter((a) => a.type === type);
            if (!actions.length) continue;
            html += `<div class="menu-block"><span class="menu-type-label section-title">${this.menuTypeLabel(
                type
            )}</span>`;
            if (type === "formation") {
                html += `<div class="menu-formation-line">`;
                html += actions
                    .map(
                        (a) =>
                            `<span class="${this.getCharacterColorClass(a.character)}">${a.action
                                .replace(/^[-+]/, "")
                                .trim()}</span>`
                    )
                    .join(" / ");
                html += `</div>`;
            } else if (type === "stat") {
                const byChar = this.groupBy(actions, (a) => a.character);
                for (const char in byChar) {
                    html += `<div class="menu-actions-line">`;
                    html += byChar[char].map((a) => this.renderStatAction(a)).join(" / ");
                    html += `</div>`;
                }
            } else if (type === "note") {
                // En mode minimaliste, ne pas afficher les notes
                if (!this.minimalOptions?.skipNotes) {
                    actions.forEach((action) => {
                        html += `<div class="note-line">💡 ${action.action}</div>`;
                        alreadyShownNotes.add(action.action);
                    });
                }
            } else {
                const byChar = this.groupBy(actions, (a) => a.character);
                for (const char in byChar) {
                    byChar[char].forEach((action) => {
                        html += `<div class="menu-actions-line">`;
                        html += `<span class="${this.getCharacterColorClass(action.character)}">${
                            action.action
                        }</span>`;
                        html += `</div>`;
                    });
                }
            }
            html += `</div>`;
        }
        // Afficher les notes qui ne sont pas dans menuOrder (ex : notes intercalées)
        const notes = step.actions.filter((a) => a.type === "note" && !alreadyShownNotes.has(a.action));
        if (!this.minimalOptions?.skipNotes) {
            notes.forEach((action) => {
                html += `<div class="menu-block"><div class="note-line">💡 ${action.action}</div></div>`;
            });
        }
        return html;
    }

    /**
     * Rend une action de stat avec coloration spéciale
     */
    private renderStatAction(action: any): string {
        // +X Force (Y) : Y en couleur
        const match = action.action.match(/(.+?)\(([^)]+)\)$/);
        if (match) {
            return `<span class="${this.getCharacterColorClass(
                action.character
            )}">${match[1].trim()} (<span class="stat-max">${match[2]}</span>)</span>`;
        }
        return `<span class="${this.getCharacterColorClass(action.character)}">${action.action}</span>`;
    }

    /**
     * Retourne le label pour un type de menu
     */
    private menuTypeLabel(type: string): string {
        switch (type) {
            case "arme":
                return "Arme";
            case "picto":
                return "Picto";
            case "lumina":
                return "Lumina";
            case "stat":
                return "Stat";
            case "sort":
                return "Sort";
            case "formation":
                return "Formation";
            case "up arme":
                return "Up Arme";
            case "up lumina":
                return "Up Lumina";
            default:
                return type;
        }
    }

    /**
     * Groupe un tableau par une fonction
     */
    private groupBy(arr: any[], fn: (item: any) => string): Record<string, any[]> {
        return arr.reduce((acc, x) => {
            const k = fn(x) || "autre";
            acc[k] = acc[k] || [];
            acc[k].push(x);
            return acc;
        }, {} as Record<string, any[]>);
    }

    /**
     * Retourne la classe CSS pour la couleur d'un personnage
     */
    private getCharacterColorClass(character: string): string {
        if (!character) return "";
        const map: Record<string, string> = {
            verso: "character-verso",
            maelle: "character-maelle",
            lune: "character-lune",
            sciel: "character-sciel",
            monoco: "character-monoco",
        };
        return map[(character || "").toLowerCase()] || "";
    }

    /**
     * Rend une étape de note
     */
    private renderNoteStep(step: NoteStep): string {
        // En mode minimaliste, ne pas afficher les étapes de type note
        if (this.minimalOptions.skipNotes) {
            return "";
        }
        return `<div class="note-line">💡 ${step.titre}</div>`;
    }

    /**
     * Rend une étape d'acte
     */
    private renderActStep(step: ActStep): string {
        let html = `<div class="step-act">`;
        html += `<div class="step-header act-header">Acte ${step.actNumber}</div>`;
        html += `<div class="act-title">${CharacterUtils.formatWithColors(step.title)}</div>`;

        if (step.description) {
            html += `<div class="act-description">${CharacterUtils.formatWithColors(step.description)}</div>`;
        }

        html += `</div>`;
        return html;
    }

    /**
     * Rend une étape de chapitre
     */
    private renderChapterStep(step: ChapterStep): string {
        let html = `<div class="step-chapter">`;
        html += `<div class="step-header chapter-header">Chapitre ${step.chapterNumber}</div>`;
        html += `<div class="chapter-title">${CharacterUtils.formatWithColors(step.title)}</div>`;

        if (step.description) {
            html += `<div class="chapter-description">${CharacterUtils.formatWithColors(step.description)}</div>`;
        }

        html += `</div>`;
        return html;
    }

    /**
     * Rend une étape de loot
     */
    private renderLootStep(step: LootStep): string {
        let html = "";
        if (step.titre && step.titre.includes("|")) {
            html += step.titre
                .split("|")
                .map((l) => `<div class="loot-line">${l.trim()}</div>`)
                .join("");
        } else if (step.titre) {
            html += `<div class="loot-line">${step.titre}</div>`;
        }
        return html;
    }

    /**
     * Rend une étape d'achat
     */
    private renderPurchaseStep(step: PurchaseStep): string {
        let html = "";
        if (step.titre && step.titre.includes(",")) {
            html += step.titre
                .split(",")
                .map((l) => `<div class="purchase-line">${l.trim()}</div>`)
                .join("");
        } else if (step.titre) {
            html += `<div class="purchase-line">${step.titre}</div>`;
        }
        return html;
    }

    /**
     * Rend une étape de combat
     */
    private renderCombatStep(step: CombatStep): string {
        let html = "";
        if (step.turns && step.turns.length > 0) {
            for (const turn of step.turns) {
                html += '<div class="combat-turn-line">';
                // Vérifier si c'est une note
                if (turn.length === 1 && turn[0].isNote) {
                    // En mode minimaliste, ne pas afficher les notes
                    if (!this.minimalOptions.skipNotes) {
                        html += `<div class="note-line">💡 ${turn[0].action}</div>`;
                    }
                } else {
                    html += turn
                        .map((action) => this.renderCombatAction(action))
                        .join(' <span style="color:#666">&gt;</span> ');
                }
                html += "</div>";
            }
        }
        return html;
    }

    /**
     * Rend une action de combat
     */
    private renderCombatAction(action: any): string {
        if (!action) return "";
        if (action.action.toUpperCase().includes("PARRY")) {
            return `<span style="color:#ef4444;font-weight:bold;">PARRY</span>`;
        }
        if (action.action.toUpperCase().includes("DODGE")) {
            return `<span style="color:#22c55e;font-weight:bold;">DODGE</span>`;
        }
        const charClass = this.getCharacterColorClass(action.character);
        let fail = action.fail ? ' <span style="color:#ef4444;font-weight:bold;">(FAIL)</span>' : "";
        return `<span class="${charClass}">${action.action}${fail}</span>`;
    }

    /**
     * Rend une étape de boss
     */
    private renderBossStep(step: BossStep): string {
        let html = "";
        if (step.turns && step.turns.length > 0) {
            for (const turn of step.turns) {
                html += '<div class="combat-turn-line">';
                // Vérifier si c'est une note
                if (turn.length === 1 && turn[0].isNote) {
                    // En mode minimaliste, ne pas afficher les notes
                    if (!this.minimalOptions.skipNotes) {
                        html += `<div class="note-line">💡 ${turn[0].action}</div>`;
                    }
                } else {
                    html += turn
                        .map((action) => this.renderCombatAction(action))
                        .join(' <span style="color:#666">&gt;</span> ');
                }
                html += "</div>";
            }
        }
        return html;
    }

    /**
     * Rend une étape générique (fallback)
     */
    private renderGenericStep(step: Step): string {
        let html = `<div class="step-generic">`;
        html += `<div class="step-header">${step.type}</div>`;
        html += `<div class="step-content">${CharacterUtils.formatWithColors(step.content || "")}</div>`;
        html += `</div>`;
        return html;
    }

    /**
     * Rend une liste d'étapes
     */
    renderSteps(steps: Step[]): string {
        return steps.map((step) => this.renderStep(step)).join("");
    }

    /**
     * Rend une étape avec des classes CSS spécifiques pour les états
     */
    renderStepWithState(step: Step, isCurrent: boolean = false, isCompleted: boolean = false): string {
        const stepContent = this.renderStepContent(step);
        const classes = ["step"];

        if (isCurrent) classes.push("current-step");
        if (isCompleted) classes.push("completed-step");

        return `<div class="${classes.join(" ")}" data-step-id="${step.id}">${stepContent}</div>`;
    }

    /**
     * Rend une étape avec des données personnalisées
     */
    renderStepWithData(step: Step, customData: Record<string, any> = {}): string {
        const stepContent = this.renderStepContent(step);
        const dataAttributes = Object.entries(customData)
            .map(([key, value]) => `data-${key}="${value}"`)
            .join(" ");

        return `<div class="step" data-step-id="${step.id}" ${dataAttributes}>${stepContent}</div>`;
    }

    /**
     * Met à jour les options minimalistes
     */
    public updateMinimalOptions(minimalOptions: any): void {
        this.minimalOptions = minimalOptions;
    }
}
