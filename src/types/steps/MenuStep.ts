import {
    ArmeStep,
    FormationStep,
    LuminaStep,
    PictoStep,
    SortStep,
    StatStep,
    UpArmeStep,
    UpLuminaStep,
    ImageStep,
    NoteStep,
} from "./ItemStep";

/**
 * Types spécifiques pour les menus
 */
export type MenuType =
    | ArmeStep
    | PictoStep
    | StatStep
    | SortStep
    | LuminaStep
    | UpArmeStep
    | UpLuminaStep
    | FormationStep
    | ImageStep
    | NoteStep;

/**
 * Étape de menu avec type spécifique
 */
export class MenuStep {
    public type: string = "menu";
    public menus: MenuType[];

    constructor() {
        this.menus = [];
    }

    addMenu(menu: MenuType) {
        this.menus.push(menu);
    }

    toJSON(): any {
        return {
            type: this.type,
            menus: this.menus.map((menu) => menu.toJSON()),
        };
    }
}
