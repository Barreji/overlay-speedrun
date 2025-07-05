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

export class ParseGuide {
    private stateMachine: StateMachine;
    private currentActe: string = "";
    private currentChapitre: string = "";
    private guide: Guide;
    private currentGroupSteps: any[] = [];
    private stepId: number = 1;
    private currentMenu: MenuStep | null = null;
    private currentCombat: CombatStep | null = null;
    private combatParser: SimpleCombatParser;
    private menuParser: SimpleMenuParser;
    private inputPath: string = "";
    private outputPath: string = "";

    private constructor(inputPath: string, outputPath: string) {
        this.inputPath = inputPath;
        this.outputPath = outputPath;
        this.stateMachine = new StateMachine();
        this.guide = new Guide("Clair Obscur", "Any% Glitchless Expert");
        this.combatParser = new SimpleCombatParser();
        this.menuParser = new SimpleMenuParser();
    }

    private finalizeCurrentGroup() {
        if (this.currentGroupSteps.length > 0 && !this.onlyNotesInGroup()) {
            const actionGroup = new ActionGroupStep(this.stepId++, this.currentActe, this.currentChapitre, this.currentGroupSteps);
            this.guide.addActionGroup(actionGroup);
            this.currentGroupSteps = [];
        }
    }

    private onlyNotesInGroup(): boolean {
        return this.currentGroupSteps.every((step) => step instanceof NoteStep);
    }

    private finalizeCurrentMenu(lineNumber: number, readLine: string) {
        if (this.currentMenu) {
            this.currentGroupSteps.push(this.currentMenu);
            this.currentMenu = null;
            this.stateMachine.resetToSearch(lineNumber, readLine);
        }
    }

    private finalizeCurrentCombat(lineNumber: number, readLine: string) {
        if (this.currentCombat) {
            this.currentGroupSteps.push(this.currentCombat);
            this.currentCombat = null;
            this.stateMachine.resetToSearch(lineNumber, readLine);
        }
    }

    private addStep(step: Step) {
        if (this.stateMachine.getState() === "IN_COMBAT" && this.currentCombat) {
            if (step instanceof NoteStep || step instanceof ImageStep || step instanceof TurnStep) {
                this.currentCombat.addTurn(step);
                return;
            }
        }
        if (this.stateMachine.getState() === "IN_MENU" && this.currentMenu) {
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
                this.currentMenu.addMenu(step);
                return;
            }
        }
        this.currentGroupSteps.push(step);
    }

    private async parseInternal() {
        // Vérifier que le fichier existe
        if (!fs.existsSync(this.inputPath)) {
            console.error(`Fichier d'entrée introuvable: ${this.inputPath}`);
            process.exit(1);
        }

        // Lire le fichier ligne par ligne
        const rl = readline.createInterface({
            input: fs.createReadStream(this.inputPath),
            crlfDelay: Infinity,
        });

        let lineNumber = 0;
        for await (const line of rl) {
            try {
                lineNumber++;
                const readLine = line.trim();

                if (readLine === "") {
                    if (this.stateMachine.getState() === "IN_COMBAT") {
                        this.finalizeCurrentCombat(lineNumber, readLine);
                    }
                    else if (this.stateMachine.getState() === "IN_MENU") {
                        this.finalizeCurrentMenu(lineNumber, readLine);
                    }
                    this.finalizeCurrentGroup();
                    this.stateMachine.resetToSearch(lineNumber, readLine);
                    continue;
                }

                if (readLine.startsWith("Act ")) {
                    this.currentActe = readLine;
                    this.stateMachine.setState("SEARCH", lineNumber, readLine);
                    continue;
                }

                if (readLine.startsWith("T:")) {
                    this.currentChapitre = readLine.substring(2);
                    this.stateMachine.setState("SEARCH", lineNumber, readLine);
                    continue;
                }

                if (SimpleNoteParser.isNoteLine(readLine)) {
                    const noteStep = SimpleNoteParser.parseNoteLine(readLine);
                    this.addStep(noteStep);
                    continue;
                }

                if (SimpleImageParser.isImageLine(readLine)) {
                    const imageStep = SimpleImageParser.parseImageLine(readLine);
                    this.addStep(imageStep);
                    continue;
                }

                if (SimpleLootParser.isLootLine(readLine)) {
                    if (this.currentCombat) {
                        this.finalizeCurrentCombat(lineNumber, readLine);
                    }
                    const lootSteps = SimpleLootParser.parseLootLine(readLine);
                    lootSteps.forEach((step) => this.addStep(step));
                    continue;
                }

                if (SimplePurchaseParser.isPurchaseLine(readLine)) {
                    if (this.currentCombat) {
                        this.finalizeCurrentCombat(lineNumber, readLine);
                    }
                    const purchaseSteps = SimplePurchaseParser.parsePurchaseLine(readLine);
                    purchaseSteps.forEach((step) => this.addStep(step));
                    continue;
                }

                if (SimpleCombatParser.isCombatLine(readLine)) {
                    if (this.currentCombat) {
                        this.finalizeCurrentCombat(lineNumber, readLine);
                    }
                    const combatStep = this.combatParser.parseCombatLine(readLine);
                    this.currentCombat = combatStep;
                    this.stateMachine.setState("IN_COMBAT", lineNumber, readLine);
                    continue;
                }

                if (SimpleMenuParser.isMenuKeyword(readLine)) {
                    if (!this.currentMenu) {
                        this.currentMenu = new MenuStep();
                    }
                    const menuType = SimpleMenuParser.getMenuType(readLine);
                    if (menuType) {
                        const menuSubState = SimpleMenuParser.getMenuSubState(menuType);
                        this.stateMachine.setState("IN_MENU", lineNumber, readLine, menuSubState);
                    }
                    continue;
                }

                if (this.stateMachine.getState() === "IN_COMBAT") {
                    if (SimpleCombatParser.isTourLine(readLine)) {
                        const turnStep = this.combatParser.parseTourLine(readLine);
                        if (this.currentCombat) {
                            this.currentCombat.addTurn(turnStep);
                        }
                        continue;
                    }
                }

                if (this.stateMachine.getState() === "IN_MENU") {
                    const menuSubState = this.stateMachine.getMenuSubState();
                    switch (menuSubState) {
                        case "IN_ARME":
                            if (this.currentMenu) {
                                this.currentMenu.addMenu(SimpleMenuParser.parseArmeLine(readLine));
                            }
                            continue;
                        case "IN_PICTO":
                            if (this.currentMenu) {
                                this.currentMenu.addMenu(SimpleMenuParser.parsePictoLine(readLine));
                            }
                            continue;
                        case "IN_STAT":
                            if (this.currentMenu) {
                                const statSteps = SimpleMenuParser.parseStatLine(readLine);
                                statSteps.forEach((step) => this.addStep(step));
                            }
                            continue;
                        case "IN_SORT":
                            if (this.currentMenu) {
                                this.currentMenu.addMenu(SimpleMenuParser.parseSortLine(readLine));
                            }
                            continue;
                        case "IN_LUMINA":
                            if (this.currentMenu) {
                                this.currentMenu.addMenu(SimpleMenuParser.parseLuminaLine(readLine));
                            }
                            continue;
                        case "IN_UP_ARME":
                            if (this.currentMenu) {
                                this.currentMenu.addMenu(SimpleMenuParser.parseUpArmeLine(readLine));
                            }
                            continue;
                        case "IN_UP_LUMINA":
                            if (this.currentMenu) {
                                this.currentMenu.addMenu(SimpleMenuParser.parseUpLuminaLine(readLine));
                            }
                            continue;
                        case "IN_FORMATION":
                            if (this.currentMenu) {
                                const formationSteps = SimpleMenuParser.parseFormationLine(readLine);
                                formationSteps.forEach((step) => this.addStep(step));
                            }
                            continue;
                        default:
                            continue;
                    }
                }
            } catch (err) {
                console.error(`Erreur à la ligne ${lineNumber}: "${line}"`);
                console.error(err);
                throw err;
            }
        }

        if (this.stateMachine.getState() === "IN_COMBAT") {
            this.finalizeCurrentCombat(lineNumber, "");
        }
        this.finalizeCurrentGroup();

        console.log("Avant sauvegarde du guide");
        this.guide.saveToFile(this.outputPath);
        console.log(`Parsing terminé. Résultat écrit dans ${this.outputPath}`);
        console.log("Fichier écrit !");
        return this.outputPath;
    }

    static async parse(inputFile?: string, outputFile?: string) {
        const args = process.argv.slice(2);
        const input = inputFile || args[0] || "speedrun.txt";
        const output = outputFile || args[1] || "test-test.json";
        const inputPath = path.isAbsolute(input) ? input : path.join(process.cwd(), input);
        const outputPath = path.isAbsolute(output) ? output : path.join(process.cwd(), output);
        const parser = new ParseGuide(inputPath, outputPath);
        return await parser.parseInternal();
    }
}

if (require.main === module) {
    ParseGuide.parse().catch((err) => {
        console.error("Erreur fatale:", err);
        process.exit(1);
    });
}
