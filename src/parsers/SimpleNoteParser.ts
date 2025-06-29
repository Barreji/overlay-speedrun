import { NoteStep } from "../types/steps";

export class SimpleNoteParser {
    /**
     * Parse une ligne de note commençant par (A)
     * Exemples:
     * - "(A) Si vous ratez un DODGE, 1 Shot"
     * - "(A) 1er PARRY crit ? Surcharge t2 + PARRY"
     */
    static parseNoteLine(line: string): NoteStep {
        // Enlever le préfixe (A) et les espaces
        const note = line.replace("(A)", "").trim();

        return new NoteStep(note);
    }

    /**
     * Vérifie si une ligne est une ligne de note
     */
    static isNoteLine(line: string): boolean {
        return line.trim().startsWith("(A)");
    }
}
