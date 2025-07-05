/**
 * Étape de loot
 */
export class LootStep {
    public type: string = "loot";
    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    toJSON(): any {
        return {
            type: this.type,
            name: this.name,
        };
    }

    static fromJSON(data: any): LootStep {
        return new LootStep(data.name);
    }
}

/**
 * Étape d'achat
 */
export class PurchaseStep {
    public type: string = "purchase";
    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    toJSON(): any {
        return {
            type: this.type,
            name: this.name,
        };
    }

    static fromJSON(data: any): PurchaseStep {
        return new PurchaseStep(data.name);
    }
}

export class ArmeStep {
    public type: string = "arme";
    public name: string;
    public character: string;

    constructor(name: string, character: string) {
        this.name = name;
        this.character = character;
    }

    toJSON(): any {
        return {
            type: this.type,
            name: this.name,
            character: this.character,
        };
    }

    static fromJSON(data: any): ArmeStep {
        return new ArmeStep(data.name, data.character);
    }
}

export class PictoStep {
    public type: string = "picto";
    public name: string;
    public character: string;

    constructor(name: string, character: string) {
        this.name = name;
        this.character = character;
    }

    toJSON(): any {
        return {
            type: this.type,
            name: this.name,
            character: this.character,
        };
    }

    static fromJSON(data: any): PictoStep {
        return new PictoStep(data.name, data.character);
    }
}

export class LuminaStep {
    public type: string = "lumina";
    public name: string;
    public character: string;

    constructor(name: string, character: string) {
        this.name = name;
        this.character = character;
    }

    toJSON(): any {
        return {
            type: this.type,
            name: this.name,
            character: this.character,
        };
    }

    static fromJSON(data: any): LuminaStep {
        return new LuminaStep(data.name, data.character);
    }
}

export class SortStep {
    public type: string = "sort";
    public name: string;
    public character: string;
    public position: string;

    constructor(name: string, character: string, position: string) {
        this.name = name;
        this.character = character;
        this.position = position;
    }

    toJSON(): any {
        return {
            type: this.type,
            name: this.name,
            character: this.character,
            position: this.position,
        };
    }

    static fromJSON(data: any): SortStep {
        return new SortStep(data.name, data.character, data.position);
    }
}

export class StatStep {
    public type: string = "stat";
    public name: string;
    public character: string;
    public toAdd: number;
    public total: number;

    constructor(name: string, character: string, toAdd: number, total: number) {
        this.name = name;
        this.character = character;
        this.toAdd = toAdd;
        this.total = total;
    }

    toJSON(): any {
        return {
            type: this.type,
            name: this.name,
            character: this.character,
            toAdd: this.toAdd,
            total: this.total,
        };
    }

    static fromJSON(data: any): StatStep {
        return new StatStep(data.name, data.character, data.toAdd, data.total);
    }
}

export class UpArmeStep {
    public type: string = "upArme";
    public name: string;
    public character: string;
    public toAdd: number;
    public total: number;

    constructor(name: string, character: string, toAdd: number, total: number) {
        this.name = name;
        this.character = character;
        this.toAdd = toAdd;
        this.total = total;
    }

    toJSON(): any {
        return {
            type: this.type,
            name: this.name,
            character: this.character,
            toAdd: this.toAdd,
            total: this.total,
        };
    }

    static fromJSON(data: any): UpArmeStep {
        return new UpArmeStep(data.name, data.character, data.toAdd, data.total);
    }
}

export class UpLuminaStep {
    public type: string = "upLumina";
    public character: string;
    public toAdd: number;
    public total: number;

    constructor(character: string, toAdd: number, total: number) {
        this.character = character;
        this.toAdd = toAdd;
        this.total = total;
    }

    toJSON(): any {
        return {
            type: this.type,
            character: this.character,
            toAdd: this.toAdd,
            total: this.total,
        };
    }

    static fromJSON(data: any): UpLuminaStep {
        return new UpLuminaStep(data.character, data.toAdd, data.total);
    }
}

export class FormationStep {
    public type: string = "formation";
    public character: string;
    public toAdd: boolean | null;

    constructor(character: string, toAdd: boolean | null) {
        this.character = character;
        this.toAdd = toAdd;
    }

    toJSON(): any {
        return {
            type: this.type,
            character: this.character,
            toAdd: this.toAdd,
        };
    }

    static fromJSON(data: any): FormationStep {
        return new FormationStep(data.character, data.toAdd);
    }
}

export class ImageStep {
    public type: string = "image";
    public imagePath: string;
    public character: string;

    constructor(imagePath: string, character: string) {
        this.imagePath = imagePath;
        this.character = character;
    }

    toJSON(): any {
        return {
            type: this.type,
            imagePath: this.imagePath,
            character: this.character,
        };
    }

    static fromJSON(data: any): ImageStep {
        return new ImageStep(data.imagePath, data.character);
    }
}

export class NoteStep {
    public type: string = "note";
    public note: string;

    constructor(note: string) {
        this.note = note;
    }

    toJSON(): any {
        return {
            type: this.type,
            note: this.note,
        };
    }

    static fromJSON(data: any): NoteStep {
        return new NoteStep(data.note);
    }
}
