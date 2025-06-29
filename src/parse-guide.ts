import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";
import { StateMachine } from "./parsers/StateMachine";
import { SimpleLootParser } from "./parsers/SimpleLootParser";
import { SimplePurchaseParser } from "./parsers/SimplePurchaseParser";
import { SimpleNoteParser } from "./parsers/SimpleNoteParser";
import { SimpleImageParser } from "./parsers/SimpleImageParser";
import { SimpleCombatParser } from "./parsers/SimpleCombatParser";
import { SimpleMenuParser } from "./parsers/SimpleMenuParser";
import { Guide } from "./types/Guide";
import { ActionGroupStep, ActionGroupType } from "./types/steps/ActionGroupStep";
import { MenuStep } from "./types/steps/MenuStep";
import { CombatStep } from "./types/steps/CombatStep";
import {
    ArmeStep,
    FormationStep,
    ImageStep,
    LuminaStep,
    NoteStep,
    PictoStep,
    SortStep,
    StatStep,
    UpArmeStep,
    UpLuminaStep,
    LootStep,
    PurchaseStep,
} from "./types/steps/ItemStep";
import { TurnStep } from "./types/steps/TurnStep";

type Step =
    | ImageStep
    | NoteStep
    | MenuStep
    | CombatStep
    | LootStep
    | PurchaseStep
    | FormationStep
    | ArmeStep
    | PictoStep
    | StatStep
    | SortStep
    | LuminaStep
    | UpArmeStep
    | UpLuminaStep;

/**
 * Point d'entrée du parseur de guide (base saine)
 * Usage : node parse-guide.js [input.txt] [output.json]
 */
async function main() {
    console.log("Début du script");
    // Récupérer les arguments
    const args = process.argv.slice(2);
    const inputFile = args[0] || "speedrun.txt";
    const outputFile = args[1] || "test-output.json";

    // Résoudre les chemins
    const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(process.cwd(), inputFile);
    const outputPath = path.isAbsolute(outputFile) ? outputFile : path.join(process.cwd(), outputFile);

    // Vérifier que le fichier existe
    if (!fs.existsSync(inputPath)) {
        console.error(`Fichier d'entrée introuvable: ${inputPath}`);
        process.exit(1);
    }

    // Créer la machine à états
    const stateMachine = new StateMachine();

    // Variables pour tracker l'acte et chapitre courants
    let currentActe = "";
    let currentChapitre = "";

    // Créer le guide
    const guide = new Guide("Clair Obscur", "Any% Glitchless Expert");

    // Variables pour collecter les steps du groupe en cours
    let currentGroupSteps: any[] = [];
    let stepId = 1;

    // Variables pour gérer le menu en cours
    let currentMenu: MenuStep | null = null;
    let currentCombat: CombatStep | null = null;

    // Parsers
    const combatParser = new SimpleCombatParser();
    const menuParser = new SimpleMenuParser();

    /**
     * Finalise le groupe d'actions en cours et l'ajoute au guide
     */
    function finalizeCurrentGroup() {
        if (currentGroupSteps.length > 0) {
            const actionGroup = new ActionGroupStep(stepId++, currentActe, currentChapitre, currentGroupSteps);
            guide.addActionGroup(actionGroup);
            currentGroupSteps = [];
        }
    }

    /**
     * Finalise le menu en cours et l'ajoute au groupe
     */
    function finalizeCurrentMenu() {
        if (currentMenu) {
            // Ajouter les actions du menu individuellement au lieu du MenuStep entier
            currentGroupSteps.push(currentMenu);
            currentMenu = null;
        }
    }

    /**
     * Finalise le combat en cours et l'ajoute au groupe
     */
    function finalizeCurrentCombat() {
        if (currentCombat) {
            currentGroupSteps.push(currentCombat);
            currentCombat = null;
        }
    }

    function addStep(step: Step) {
        if (stateMachine.getState() === "IN_COMBAT" && currentCombat) {
            if (step instanceof NoteStep || step instanceof ImageStep || step instanceof TurnStep) {
                currentCombat.addTurn(step);
            }
        }
        if (stateMachine.getState() === "IN_MENU" && currentMenu) {
            if (
                step instanceof NoteStep ||
                step instanceof ImageStep ||
                step instanceof ArmeStep ||
                step instanceof PictoStep ||
                step instanceof StatStep ||
                step instanceof SortStep ||
                step instanceof LuminaStep ||
                step instanceof UpArmeStep ||
                step instanceof UpLuminaStep ||
                step instanceof FormationStep
            ) {
                currentMenu.addMenu(step);
            }
        }
        currentGroupSteps.push(step);
    }

    // Lire le fichier ligne par ligne
    const rl = readline.createInterface({
        input: fs.createReadStream(inputPath),
        crlfDelay: Infinity,
    });

    let lineNumber = 0;
    for await (const line of rl) {
        try {
            lineNumber++;
            const readLine = line.trim();

            // Si la ligne est vide, finaliser le groupe en cours
            if (readLine === "") {
                if (stateMachine.getState() === "IN_COMBAT") {
                    finalizeCurrentCombat();
                }
                if (stateMachine.getState() === "IN_MENU") {
                    finalizeCurrentMenu();
                }
                finalizeCurrentGroup();
                stateMachine.resetToSearch(lineNumber, readLine);
                continue;
            }

            // Détecter les changements d'acte
            if (readLine.startsWith("Act ")) {
                currentActe = readLine;
                stateMachine.setState("SEARCH", lineNumber, readLine);
                continue;
            }

            // Détecter les changements de chapitre
            if (readLine.startsWith("T:")) {
                currentChapitre = readLine.substring(2);
                stateMachine.setState("SEARCH", lineNumber, readLine);
                continue;
            }

            // Détecter les lignes de note
            if (SimpleNoteParser.isNoteLine(readLine)) {
                const noteStep = SimpleNoteParser.parseNoteLine(readLine);
                addStep(noteStep);
                continue;
            }

            if (SimpleImageParser.isImageLine(readLine)) {
                const imageStep = SimpleImageParser.parseImageLine(readLine);
                addStep(imageStep);
                continue;
            }

            // Détecter les lignes de loot
            if (SimpleLootParser.isLootLine(readLine)) {
                if (currentCombat) {
                    finalizeCurrentCombat();
                }
                const lootSteps = SimpleLootParser.parseLootLine(readLine);
                lootSteps.forEach((step) => addStep(step));
                continue;
            }

            // Détecter les lignes d'achat
            if (SimplePurchaseParser.isPurchaseLine(readLine)) {
                if (currentCombat) {
                    finalizeCurrentCombat();
                }
                const purchaseSteps = SimplePurchaseParser.parsePurchaseLine(readLine);
                purchaseSteps.forEach((step) => addStep(step));
                continue;
            }

            // Détecter les lignes de combat (🛡️ ou 🎯)
            if (SimpleCombatParser.isCombatLine(readLine)) {
                const combatStep = combatParser.parseCombatLine(readLine);
                currentCombat = combatStep;
                stateMachine.setState("IN_COMBAT", lineNumber, readLine);
                continue;
            }

            // Détecter les lignes de menu
            if (SimpleMenuParser.isMenuKeyword(readLine)) {
                if (!currentMenu) {
                    currentMenu = new MenuStep();
                }
                const menuType = SimpleMenuParser.getMenuType(readLine);
                if (menuType) {
                    const menuSubState = SimpleMenuParser.getMenuSubState(menuType);
                    stateMachine.setState("IN_MENU", lineNumber, readLine, menuSubState);
                }
                continue;
            }

            // In Combat
            if (stateMachine.getState() === "IN_COMBAT") {
                if (SimpleCombatParser.isTourLine(readLine)) {
                    const turnStep = combatParser.parseTourLine(readLine);
                    if (currentCombat) {
                        currentCombat.addTurn(turnStep);
                    }
                    continue;
                }
            }

            // Si on est en mode menu, parser les lignes de menu
            if (stateMachine.getState() === "IN_MENU") {
                const menuSubState = stateMachine.getMenuSubState();

                // Parser selon le sous-état du menu
                switch (menuSubState) {
                    case "IN_ARME":
                        if (currentMenu) {
                            currentMenu.addMenu(SimpleMenuParser.parseArmeLine(readLine));
                        }
                        continue;
                    case "IN_PICTO":
                        if (currentMenu) {
                            currentMenu.addMenu(SimpleMenuParser.parsePictoLine(readLine));
                        }
                        continue;

                    case "IN_STAT":
                        if (currentMenu) {
                            const statSteps = SimpleMenuParser.parseStatLine(readLine);
                            statSteps.forEach((step) => addStep(step));
                        }
                        continue;

                    case "IN_SORT":
                        if (currentMenu) {
                            currentMenu.addMenu(SimpleMenuParser.parseSortLine(readLine));
                        }
                        continue;

                    case "IN_LUMINA":
                        if (currentMenu) {
                            currentMenu.addMenu(SimpleMenuParser.parseLuminaLine(readLine));
                        }
                        continue;

                    case "IN_UP_ARME":
                        if (currentMenu) {
                            currentMenu.addMenu(SimpleMenuParser.parseUpArmeLine(readLine));
                        }
                        continue;

                    case "IN_UP_LUMINA":
                        if (currentMenu) {
                            currentMenu.addMenu(SimpleMenuParser.parseUpLuminaLine(readLine));
                        }
                        continue;

                    case "IN_FORMATION":
                        if (currentMenu) {
                            const formationSteps = SimpleMenuParser.parseFormationLine(readLine);
                            formationSteps.forEach((step) => addStep(step));
                        }
                        continue;
                }
            }
        } catch (err) {
            console.error(`Erreur à la ligne ${lineNumber}: "${line}"`);
            console.error(err);
            throw err; // Relancer l'erreur pour qu'elle soit capturée par le catch global
        }
    }

    // Finaliser le groupe en cours à la fin du fichier
    if (stateMachine.getState() === "IN_COMBAT") {
        finalizeCurrentCombat();
    }
    finalizeCurrentGroup();

    // Sauvegarder le guide dans un fichier
    console.log("Avant sauvegarde du guide");
    guide.saveToFile(outputPath);
    console.log(`Parsing terminé. Résultat écrit dans ${outputPath}`);
    console.log("Fichier écrit !");
}

if (require.main === module) {
    main().catch((err) => {
        console.error("Erreur fatale:", err);
        process.exit(1);
    });
}
