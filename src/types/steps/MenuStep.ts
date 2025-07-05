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

    static fromJSON(data: any): MenuStep {
        const menu = new MenuStep();
        menu.menus = data.menus.map((menuData: any) => {
            if (menuData.type === "arme") {
                return ArmeStep.fromJSON(menuData);
            } else if (menuData.type === "picto") {
                return PictoStep.fromJSON(menuData);
            } else if (menuData.type === "stat") {
                return StatStep.fromJSON(menuData);
            } else if (menuData.type === "sort") {
                return SortStep.fromJSON(menuData);
            } else if (menuData.type === "lumina") {
                return LuminaStep.fromJSON(menuData);
            } else if (menuData.type === "upArme") {
                return UpArmeStep.fromJSON(menuData);
            } else if (menuData.type === "upLumina") {
                return UpLuminaStep.fromJSON(menuData);
            } else if (menuData.type === "formation") {
                return FormationStep.fromJSON(menuData);
            } else if (menuData.type === "image") {
                return ImageStep.fromJSON(menuData);
            } else if (menuData.type === "note") {
                return NoteStep.fromJSON(menuData);
            }
        });
        return menu;
    }
}
