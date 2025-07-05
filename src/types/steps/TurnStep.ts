import { ImageStep, NoteStep } from "./ItemStep";

export class AttackStep {
    public action: string;
    public character: string;
    public fail: boolean;

    constructor(action: string, character: string, fail: boolean = false) {
        this.action = action;
        this.character = character;
        this.fail = fail;
    }

    toJSON(): any {
        const result: any = {
            action: this.action,
            character: this.character,
        };

        if (this.fail) {
            result.fail = true;
        }

        return result;
    }

    static fromJSON(data: any): AttackStep {
        return new AttackStep(data.action, data.character, data.fail);
    }
}

/**
 * Tour de combat contenant plusieurs actions
 */
export class TurnStep {
    public attacks: AttackStep[];

    constructor() {
        this.attacks = [];
    }

    /**
     * Ajoute une attaque au tour
     */
    addAttack(attack: AttackStep): void {
        this.attacks.push(attack);
    }

    /**
     * Retourne le nombre d'attaques dans le tour
     */
    getAttackCount(): number {
        return this.attacks.length;
    }

    /**
     * Vérifie si le tour est vide
     */
    isEmpty(): boolean {
        return this.attacks.length === 0;
    }

    /**
     * Vide le tour
     */
    clear(): void {
        this.attacks = [];
    }

    /**
     * Retourne une représentation JSON du tour
     */
    toJSON(): any {
        return this.attacks.map((attack) => {
            if (attack.toJSON) {
                return attack.toJSON();
            }
            return attack;
        });
    }

    static fromJSON(data: any): TurnStep {
        const turn = new TurnStep();
        turn.attacks = data.attacks.map((attackData: any) => AttackStep.fromJSON(attackData));
        return turn;
    }
}
