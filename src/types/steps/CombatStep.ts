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
}
