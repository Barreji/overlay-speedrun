import { NoteStep } from "../types/GuideTypes";
import { LineParser } from "../utils/LineParser";

/**
 * Parseur spécialisé pour les étapes de note
 */
export class NoteParser {
    /**
     * Parse une étape de note isolée
     * @param lines - Toutes les lignes du guide
     * @param startIndex - Index de début de la note
     * @param context - Contexte (acte, chapitre, id)
     * @returns L'étape de note parsée et l'index suivant
     */
    public parseNoteStep(
        lines: string[],
        startIndex: number,
        context: { acte?: string; chapitre?: string; id: number }
    ): { step: NoteStep; nextIndex: number } {
        const line = lines[startIndex];
        const noteContent = LineParser.extractNote(line);

        // Créer l'étape de note
        const step: NoteStep = {
            id: context.id,
            type: "note",
            titre: noteContent,
            content: noteContent,
            acte: context.acte,
            chapitre: context.chapitre,
        };

        return { step, nextIndex: startIndex + 1 };
    }

    /**
     * Vérifie si une ligne est le début d'une note
     * @param line - La ligne à vérifier
     * @returns true si c'est le début d'une note
     */
    public isNoteStart(line: string): boolean {
        return LineParser.isNote(line);
    }

    /**
     * Extrait le contenu d'une note depuis une ligne
     * @param line - La ligne de note
     * @returns Le contenu de la note sans le préfixe (A)
     */
    public extractNoteContent(line: string): string {
        return LineParser.extractNote(line);
    }

    /**
     * Vérifie si une note est isolée (pas suivie d'un menu)
     * @param lines - Toutes les lignes du guide
     * @param noteIndex - Index de la note
     * @returns true si la note est isolée
     */
    public isIsolatedNote(lines: string[], noteIndex: number): boolean {
        let nextLineIndex = noteIndex + 1;

        // Ignorer les lignes vides
        while (nextLineIndex < lines.length && lines[nextLineIndex].trim() === "") {
            nextLineIndex++;
        }

        // Si pas de ligne suivante ou ligne suivante n'est pas un menu, c'est une note isolée
        return nextLineIndex >= lines.length || !LineParser.isMenuLine(lines[nextLineIndex]);
    }
}
