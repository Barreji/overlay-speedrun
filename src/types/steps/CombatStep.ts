import { NoteStep } from "./ItemStep";
import { ImageStep } from "./ItemStep";
import { TurnStep } from "./TurnStep";

export type CombatActionType = ImageStep | NoteStep | TurnStep;

/**
 * Étape de combat
 */
export class CombatStep {
    public type: string = "combat";
    public titre: string;
    public turns: CombatActionType[];

    constructor(titre: string) {
        this.titre = titre;
        this.turns = [];
    }

    addTurn(turn: CombatActionType): void {
        this.turns.push(turn);
    }

    toJSON(): any {
        return {
            type: this.type,
            titre: this.titre,
            turns: this.turns.map((turn) => turn.toJSON()),
        };
    }

    static fromJSON(data: any): CombatStep {
        const combat = new CombatStep(data.titre);
        combat.turns = data.turns.map((turnData: any) => {
            if (turnData.type === "image") {
                return ImageStep.fromJSON(turnData);
            } else if (turnData.type === "note") {
                return NoteStep.fromJSON(turnData);
            } else if (turnData.type === "turn") {
                return TurnStep.fromJSON(turnData);
            }
        });
        return combat;
    }
}
