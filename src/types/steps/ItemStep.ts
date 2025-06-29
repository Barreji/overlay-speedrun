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
}
