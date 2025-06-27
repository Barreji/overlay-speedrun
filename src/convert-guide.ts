import { GuideParser } from "./parsers/GuideParser";
import * as fs from "fs";
import * as path from "path";
import { Guide } from "./types/GuideTypes";

/**
 * Point d'entrée du convertisseur de guide
 * Remplace l'ancien convert-guide.js
 */
class GuideConverter {
    private parser: GuideParser;

    constructor() {
        this.parser = new GuideParser();
    }

    /**
     * Convertit un fichier guide texte en JSON
     * @param inputFile - Chemin vers le fichier d'entrée (défaut: speedrun.txt)
     * @param outputFile - Chemin vers le fichier de sortie (défaut: clair-obscur-guide-complete.json)
     */
    public async convertGuide(inputFile?: string, outputFile?: string): Promise<void> {
        try {
            // Déterminer les chemins de fichiers
            const inputPath = inputFile || "speedrun.txt";
            const outputPath = outputFile || "clair-obscur-guide-complete.json";

            // Si c'est un chemin absolu, l'utiliser directement, sinon le joindre au répertoire courant
            const guidePath = path.isAbsolute(inputPath) ? inputPath : path.join(process.cwd(), inputPath);

            const content = fs.readFileSync(guidePath, "utf8");
            const result = this.parser.parseGuide(content);

            if (result.success && result.guide) {
                fs.writeFileSync(outputPath, JSON.stringify(result.guide, null, 2));
                console.log("Guide converti avec succès !");
                console.log(`Fichier de sortie: ${outputPath}`);
                console.log(`Nombre d'étapes créées: ${result.guide.steps.length}`);
                console.log(`Jeu: ${result.guide.game}`);
                console.log(`Catégorie: ${result.guide.category}`);
            } else {
                console.error("Erreur lors de la conversion:", result.error);
                process.exit(1);
            }
        } catch (error) {
            console.error("Erreur lors de la lecture du fichier:", error);
            process.exit(1);
        }
    }

    /**
     * Affiche l'aide du programme
     */
    public showHelp(): void {
        console.log("Convertisseur de guide Clair/Obscur");
        console.log("");
        console.log("Usage:");
        console.log("  node convert-guide.js [fichier_entrée] [fichier_sortie]");
        console.log("");
        console.log("Arguments:");
        console.log("  fichier_entrée   Chemin vers le fichier guide texte (défaut: speedrun.txt)");
        console.log(
            "  fichier_sortie   Chemin vers le fichier JSON de sortie (défaut: clair-obscur-guide-complete.json)"
        );
        console.log("");
        console.log("Exemples:");
        console.log("  node convert-guide.js");
        console.log("  node convert-guide.js mon-guide.txt");
        console.log("  node convert-guide.js mon-guide.txt sortie.json");
    }
}

// Point d'entrée principal
async function main(): Promise<void> {
    const converter = new GuideConverter();

    // Récupérer les arguments de ligne de commande
    const args = process.argv.slice(2);

    // Afficher l'aide si demandé
    if (args.includes("--help") || args.includes("-h")) {
        converter.showHelp();
        return;
    }

    // Extraire les arguments
    const inputFile = args[0];
    const outputFile = args[1];

    // Lancer la conversion
    await converter.convertGuide(inputFile, outputFile);
}

// Exécuter le programme si ce fichier est appelé directement
if (require.main === module) {
    main().catch((error) => {
        console.error("Erreur fatale:", error);
        process.exit(1);
    });
}

// Exporter la classe pour utilisation dans d'autres modules
export { GuideConverter };
