export type ParserState = "SEARCH" | "IN_COMBAT" | "IN_MENU";
export type MenuSubState =
    | "IN_ARME"
    | "IN_PICTO"
    | "IN_STAT"
    | "IN_SORT"
    | "IN_LUMINA"
    | "IN_UP_ARME"
    | "IN_UP_LUMINA"
    | "IN_FORMATION"
    | null;

export class StateMachine {
    private currentState: ParserState;
    private currentMenuSubState: MenuSubState;

    constructor() {
        this.currentState = "SEARCH";
        this.currentMenuSubState = null;
    }

    /**
     * Change l'état courant de la machine
     */
    setState(state: ParserState, line: number, content: string, menuSubState?: MenuSubState) {
        this.currentState = state;
        if (menuSubState !== undefined) {
            this.currentMenuSubState = menuSubState;
        }
    }

    /**
     * Retourne l'état courant
     */
    getState(): ParserState {
        return this.currentState;
    }

    /**
     * Retourne le sous-état de menu courant
     */
    getMenuSubState(): MenuSubState {
        return this.currentMenuSubState;
    }

    /**
     * Change le sous-état de menu
     */
    setMenuSubState(menuSubState: MenuSubState, line: number, content: string) {
        this.currentMenuSubState = menuSubState;
    }

    /**
     * Repasse en état SEARCH depuis n'importe quel état
     */
    resetToSearch(line: number, content: string) {
        this.currentState = "SEARCH";
        this.currentMenuSubState = null;
    }

    /**
     * Réinitialise la machine
     */
    reset() {
        this.currentState = "SEARCH";
        this.currentMenuSubState = null;
    }
}
