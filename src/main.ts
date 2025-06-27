import { app, BrowserWindow, ipcMain, screen, globalShortcut, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

app.disableHardwareAcceleration();

interface SpeedrunStep {
    id: number;
    title: string;
    description: string;
    time?: string;
    notes?: string;
}

interface SpeedrunGuide {
    game: string;
    category: string;
    steps: SpeedrunStep[];
}

class SpeedrunGuideApp {
    private mainWindow: BrowserWindow | null = null;
    private currentGuide: SpeedrunGuide | null = null;
    private currentStepIndex: number = 0;
    private binds: { [key: string]: string } = {
        prev: "F1",
        next: "F2",
        toggleOverlay: "F3",
        chapter: "F4",
        reset: "F5",
        toggleMinimal: "F6",
    };
    private overlayHidden: boolean = false;

    constructor() {
        this.initializeApp();
    }

    private initializeApp(): void {
        app.whenReady().then(() => {
            this.createWindow();
            this.setupIPC();
            this.setupGlobalShortcuts();
        });

        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createWindow();
            }
        });
    }

    private createWindow(): void {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;

        // Create a small overlay window in the top-left corner
        this.mainWindow = new BrowserWindow({
            x: 20,
            y: 20,
            frame: false,
            alwaysOnTop: true,
            transparent: true,
            resizable: true,
            skipTaskbar: true,
            focusable: true,
            icon: path.join(__dirname, "../logo.ico"),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                // Désactiver le cache pour éviter les erreurs de permissions
                webSecurity: false,
            },
        });

        this.mainWindow.webContents.session.clearCache();
        this.mainWindow.webContents.session.clearStorageData();

        this.mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

        // Prevent the window from being closed accidentally
        this.mainWindow.on("close", (event) => {
            event.preventDefault();
        });

        // Afficher la fenêtre après le chargement
        this.mainWindow.once("ready-to-show", () => {
            this.mainWindow?.showInactive();
            this.overlayHidden = false;
        });
    }

    private setupGlobalShortcuts() {
        globalShortcut.unregisterAll();
        if (
            this.binds.toggleOverlay &&
            this.binds.toggleOverlay.toLowerCase() !== " " &&
            this.binds.toggleOverlay.toLowerCase() !== "space"
        ) {
            globalShortcut.register(this.binds.toggleOverlay, () => {
                this.toggleOverlay();
            });
        }
        if (this.binds.next && this.binds.next.toLowerCase() !== " " && this.binds.next.toLowerCase() !== "space") {
            globalShortcut.register(this.binds.next, () => {
                // Envoyer le signal sans interférer avec les touches maintenues
                setTimeout(() => {
                    this.mainWindow?.webContents.send("next-step-from-main");
                }, 10);
            });
        }
        if (this.binds.prev && this.binds.prev.toLowerCase() !== " " && this.binds.prev.toLowerCase() !== "space") {
            globalShortcut.register(this.binds.prev, () => {
                // Envoyer le signal sans interférer avec les touches maintenues
                setTimeout(() => {
                    this.mainWindow?.webContents.send("prev-step-from-main");
                }, 10);
            });
        }
        if (this.binds.reset && this.binds.reset.toLowerCase() !== " " && this.binds.reset.toLowerCase() !== "space") {
            globalShortcut.register(this.binds.reset, () => {
                setTimeout(() => {
                    this.mainWindow?.webContents.send("reset-step-from-main");
                }, 10);
            });
        }
        if (
            this.binds.chapter &&
            this.binds.chapter.toLowerCase() !== " " &&
            this.binds.chapter.toLowerCase() !== "space"
        ) {
            globalShortcut.register(this.binds.chapter, () => {
                setTimeout(() => {
                    this.mainWindow?.webContents.send("chapter-menu-from-main");
                }, 10);
            });
        }
        if (
            this.binds.toggleMinimal &&
            this.binds.toggleMinimal.toLowerCase() !== " " &&
            this.binds.toggleMinimal.toLowerCase() !== "space"
        ) {
            globalShortcut.register(this.binds.toggleMinimal, () => {
                setTimeout(() => {
                    this.mainWindow?.webContents.send("toggle-options-or-header");
                }, 10);
            });
        }
    }

    private toggleOverlay() {
        if (!this.mainWindow) return;
        if (this.overlayHidden) {
            this.mainWindow.showInactive();
            this.overlayHidden = false;
        } else {
            this.mainWindow.hide();
            this.overlayHidden = true;
        }
    }

    private setupIPC(): void {
        // Load guide from JSON file
        ipcMain.handle("load-guide", async (event, filePath: string) => {
            try {
                // Essayer plusieurs emplacements pour le fichier JSON
                const possiblePaths = [
                    filePath,
                    path.join(__dirname, "..", filePath),
                    path.join(__dirname, "..", "..", filePath),
                    path.join(process.resourcesPath, filePath),
                    path.join(process.resourcesPath, "..", filePath),
                    path.join(process.cwd(), filePath),
                    path.join(process.cwd(), "..", filePath),
                ];

                let data = null;
                let usedPath = "";

                for (const tryPath of possiblePaths) {
                    try {
                        if (fs.existsSync(tryPath)) {
                            data = fs.readFileSync(tryPath, "utf8");
                            usedPath = tryPath;
                            break;
                        }
                    } catch (error) {
                        // Tentative échouée, continuer avec le prochain chemin
                    }
                }

                if (!data) {
                    return {
                        success: false,
                        error: `Fichier non trouvé. Chemins essayés: ${possiblePaths.join(", ")}`,
                    };
                }

                this.currentGuide = JSON.parse(data) as SpeedrunGuide;
                this.currentStepIndex = 0;
                return { success: true, guide: this.currentGuide };
            } catch (error) {
                console.error("Erreur lors du chargement du guide:", error);
                return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
            }
        });

        // Get current step
        ipcMain.handle("get-current-step", () => {
            if (!this.currentGuide || this.currentStepIndex >= this.currentGuide.steps.length) {
                return { success: false, error: "No guide loaded or step out of bounds" };
            }
            return {
                success: true,
                step: this.currentGuide.steps[this.currentStepIndex],
                currentIndex: this.currentStepIndex,
                totalSteps: this.currentGuide.steps.length,
            };
        });

        // Navigate to next step
        ipcMain.handle("next-step", () => {
            if (!this.currentGuide) {
                return { success: false, error: "No guide loaded" };
            }

            if (this.currentStepIndex < this.currentGuide.steps.length - 1) {
                this.currentStepIndex++;
                return {
                    success: true,
                    step: this.currentGuide.steps[this.currentStepIndex],
                    currentIndex: this.currentStepIndex,
                    totalSteps: this.currentGuide.steps.length,
                };
            }
            return { success: false, error: "Already at last step" };
        });

        // Navigate to previous step
        ipcMain.handle("previous-step", () => {
            if (!this.currentGuide) {
                return { success: false, error: "No guide loaded" };
            }

            if (this.currentStepIndex > 0) {
                this.currentStepIndex--;
                return {
                    success: true,
                    step: this.currentGuide.steps[this.currentStepIndex],
                    currentIndex: this.currentStepIndex,
                    totalSteps: this.currentGuide.steps.length,
                };
            }
            return { success: false, error: "Already at first step" };
        });

        // Jump to specific step
        ipcMain.handle("jump-to-step", (event, stepIndex: number) => {
            if (!this.currentGuide) {
                return { success: false, error: "No guide loaded" };
            }

            if (stepIndex >= 0 && stepIndex < this.currentGuide.steps.length) {
                this.currentStepIndex = stepIndex;
                return {
                    success: true,
                    step: this.currentGuide.steps[this.currentStepIndex],
                    currentIndex: this.currentStepIndex,
                    totalSteps: this.currentGuide.steps.length,
                };
            }
            return { success: false, error: "Step index out of bounds" };
        });

        // Get guide info
        ipcMain.handle("get-guide-info", () => {
            if (!this.currentGuide) {
                return { success: false, error: "No guide loaded" };
            }
            return {
                success: true,
                game: this.currentGuide.game,
                category: this.currentGuide.category,
                totalSteps: this.currentGuide.steps.length,
            };
        });

        // Fermer l'application proprement
        ipcMain.handle("close-app", () => {
            if (this.mainWindow) {
                this.mainWindow.destroy();
            }
            app.quit();
        });

        ipcMain.handle("update-binds", (event, binds) => {
            this.binds = { ...this.binds, ...binds };
            this.setupGlobalShortcuts();
            return { success: true };
        });

        ipcMain.handle("get-binds", () => {
            return this.binds;
        });

        ipcMain.handle("toggle-overlay", () => {
            this.toggleOverlay();
            return { success: true };
        });

        // Sélectionner un fichier .txt
        ipcMain.handle("select-txt-file", async () => {
            try {
                if (!this.mainWindow) {
                    return { success: false, error: "Main window not available" };
                }

                const result = await dialog.showOpenDialog(this.mainWindow, {
                    title: "Sélectionner un fichier .txt",
                    filters: [
                        { name: "Fichiers texte", extensions: ["txt"] },
                        { name: "Tous les fichiers", extensions: ["*"] },
                    ],
                    properties: ["openFile"],
                });

                if (!result.canceled && result.filePaths.length > 0) {
                    return { success: true, filePath: result.filePaths[0] };
                } else {
                    return { success: false, error: "Aucun fichier sélectionné" };
                }
            } catch (error) {
                console.error("Erreur lors de la sélection du fichier .txt:", error);
                return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
            }
        });

        // Sélectionner un fichier .json
        ipcMain.handle("select-json-file", async () => {
            try {
                if (!this.mainWindow) {
                    return { success: false, error: "Main window not available" };
                }

                const result = await dialog.showOpenDialog(this.mainWindow, {
                    title: "Sélectionner un fichier .json",
                    filters: [
                        { name: "Fichiers JSON", extensions: ["json"] },
                        { name: "Tous les fichiers", extensions: ["*"] },
                    ],
                    properties: ["openFile"],
                });

                if (!result.canceled && result.filePaths.length > 0) {
                    return { success: true, filePath: result.filePaths[0] };
                } else {
                    return { success: false, error: "Aucun fichier sélectionné" };
                }
            } catch (error) {
                console.error("Erreur lors de la sélection du fichier .json:", error);
                return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
            }
        });

        // Convertir un fichier .txt en .json
        ipcMain.handle("convert-txt-to-json", async (event, txtFilePath: string) => {
            try {
                // Vérifier que le fichier .txt existe
                if (!fs.existsSync(txtFilePath)) {
                    return { success: false, error: "Fichier .txt introuvable" };
                }

                // Créer le chemin pour le fichier .json de sortie
                const txtDir = path.dirname(txtFilePath);
                const txtName = path.basename(txtFilePath, ".txt");
                const jsonPath = path.join(txtDir, `${txtName}-converted.json`);

                // Copier le fichier .txt temporairement dans le dossier de l'application
                const tempTxtPath = path.join(process.cwd(), "temp-speedrun.txt");
                fs.copyFileSync(txtFilePath, tempTxtPath);

                // Exécuter le script de conversion
                const convertScriptPath = path.join(process.cwd(), "convert-guide.js");

                if (!fs.existsSync(convertScriptPath)) {
                    // Si le script n'existe pas, on utilise une conversion directe
                    const content = fs.readFileSync(tempTxtPath, "utf8");
                    const guide = this.parseContent(content);
                    fs.writeFileSync(jsonPath, JSON.stringify(guide, null, 2));
                } else {
                    // Exécuter le script convert-guide.js avec le fichier temporaire et le fichier de sortie
                    await execAsync(`node "${convertScriptPath}" "${tempTxtPath}" "${jsonPath}"`, {
                        cwd: process.cwd(),
                    });
                }

                // Nettoyer le fichier temporaire
                if (fs.existsSync(tempTxtPath)) {
                    fs.unlinkSync(tempTxtPath);
                }

                return { success: true, jsonPath: jsonPath };
            } catch (error) {
                console.error("Erreur lors de la conversion:", error);
                return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
            }
        });
    }

    // Fonction de parsing du contenu (copiée de convert-guide.js)
    private parseContent(content: string): SpeedrunGuide {
        const lines = content.split("\n");
        const steps: any[] = [];
        let currentId = 1;
        let currentAct = "";
        let currentChapter = "";
        let i = 0;

        function isMenuLine(line: string) {
            return /(ARME|PICTO|LUMINA|UP ARME|UP LUMINA|STAT|SORT|FORMATION)/.test(line);
        }
        function getMenuType(line: string) {
            const match = line.match(/(ARME|PICTO|LUMINA|UP ARME|UP LUMINA|STAT|SORT|FORMATION)/);
            return match ? match[1] : "";
        }
        function isNote(line: string) {
            return /^\(A\)/.test(line);
        }
        function extractNote(line: string) {
            return line.replace(/^\(A\)\s*/, "").trim();
        }
        function isCharacterMark(line: string) {
            return /\((M|L|S|V|Mo)\)/.test(line);
        }
        function extractCharacter(action: string) {
            const match = action.match(/\((M|L|S|V|Mo)\)/);
            if (!match) return "";
            const map: { [key: string]: string } = { M: "maelle", L: "lune", S: "sciel", V: "verso", Mo: "monoco" };
            return map[match[1]] || "";
        }
        function cleanAction(action: string) {
            return action
                .replace(/\((M|L|S|V|Mo)\)/, "")
                .replace(/\(FAIL\)/, "")
                .trim();
        }

        while (i < lines.length) {
            let line = lines[i].trim();
            if (!line) {
                i++;
                continue;
            }

            // Acte
            if (/Act/.test(line)) {
                currentAct = line;
                i++;
                continue;
            }

            // Chapitre
            if (line.startsWith("T:")) {
                currentChapter = line.substring(2).trim();
                i++;
                continue;
            }

            // Loot groupé
            if (line.startsWith("📦")) {
                let loots = [line.substring(1).trim().replace(/^\W+/g, "").trim()];
                let j = i + 1;
                while (j < lines.length && lines[j].trim().startsWith("📦")) {
                    loots.push(lines[j].trim().substring(1).trim().replace(/^\W+/g, "").trim());
                    j++;
                }
                steps.push({
                    id: currentId++,
                    type: "loot",
                    titre: loots.join(" | "),
                    acte: currentAct,
                    chapitre: currentChapter,
                });
                i = j;
                continue;
            }

            // Achat
            if (line.startsWith("💰")) {
                steps.push({
                    id: currentId++,
                    type: "purchase",
                    titre: line.substring(1).trim().replace(/^\W+/g, "").trim(),
                    acte: currentAct,
                    chapitre: currentChapter,
                });
                i++;
                continue;
            }

            // Menu groupé
            if (isMenuLine(line)) {
                let menuActions: any[] = [];
                let menuOrder: string[] = [];
                let currentMenuType = getMenuType(line);
                let j = i + 1;

                menuOrder.push(currentMenuType.toLowerCase());

                while (j < lines.length && lines[j].trim() !== "") {
                    let l = lines[j].trim();
                    if (isMenuLine(l)) {
                        currentMenuType = getMenuType(l);
                        if (!menuOrder.includes(currentMenuType.toLowerCase())) {
                            menuOrder.push(currentMenuType.toLowerCase());
                        }
                        j++;
                        continue;
                    }

                    if (isNote(l)) {
                        menuActions.push({
                            type: "note",
                            action: extractNote(l),
                            character: "",
                        });
                        j++;
                        continue;
                    }

                    if (currentMenuType.toLowerCase() === "stat" && l.includes(",")) {
                        let parts = l
                            .split(",")
                            .map((a) => a.trim())
                            .filter(Boolean);
                        let firstChar = extractCharacter(parts[0]);
                        let actions = parts.map((action) => {
                            return {
                                type: "stat",
                                action: cleanAction(action),
                                character: firstChar,
                            };
                        });
                        menuActions.push(...actions);
                    } else if (currentMenuType.toLowerCase() === "sort" && l.includes(",")) {
                        let parts = l
                            .split(",")
                            .map((a) => a.trim())
                            .filter(Boolean);
                        let firstChar = extractCharacter(parts[0]);
                        let actions = parts.map((action) => {
                            return {
                                type: "sort",
                                action: cleanAction(action),
                                character: firstChar,
                            };
                        });
                        menuActions.push(...actions);
                    } else {
                        let actions = l
                            .split(",")
                            .map((a) => a.trim())
                            .filter(Boolean)
                            .map((action) => {
                                let character = extractCharacter(action);
                                return {
                                    type: currentMenuType.toLowerCase(),
                                    action: cleanAction(action),
                                    character,
                                };
                            });
                        menuActions.push(...actions);
                    }
                    j++;
                }
                steps.push({
                    id: currentId++,
                    type: "menu",
                    actions: menuActions,
                    menuOrder: menuOrder,
                    acte: currentAct,
                    chapitre: currentChapter,
                });
                i = j;
                continue;
            }

            // Combat ou Boss
            if (line.startsWith("🛡️") || line.startsWith("🎯")) {
                let type = line.startsWith("🛡️") ? "combat" : "boss";
                let titre = line;
                let turns: any[] = [];
                let j = i + 1;
                while (
                    j < lines.length &&
                    lines[j].trim() &&
                    !lines[j].trim().startsWith("🛡️") &&
                    !lines[j].trim().startsWith("🎯") &&
                    !lines[j].trim().startsWith("📦") &&
                    !lines[j].trim().startsWith("💰") &&
                    !isMenuLine(lines[j].trim()) &&
                    !/Act/.test(lines[j].trim()) &&
                    !lines[j].trim().startsWith("T:")
                ) {
                    let turnLine = lines[j].trim();

                    if (isNote(turnLine)) {
                        turns.push([
                            {
                                action: extractNote(turnLine),
                                character: "",
                                fail: false,
                                isNote: true,
                            },
                        ]);
                    } else {
                        let actions = turnLine
                            .split(">")
                            .map((a) => a.trim())
                            .filter(Boolean)
                            .map((action) => {
                                let character = extractCharacter(action);
                                let fail = /(FAIL)/.test(action);
                                let actionObj: any = {
                                    action: cleanAction(action),
                                    character,
                                };

                                // N'ajouter fail que si c'est true
                                if (fail) {
                                    actionObj.fail = true;
                                }

                                return actionObj;
                            });
                        if (actions.length) {
                            turns.push(actions);
                        }
                    }
                    j++;
                }
                steps.push({
                    id: currentId++,
                    type,
                    titre,
                    turns,
                    acte: currentAct,
                    chapitre: currentChapter,
                });
                i = j;
                continue;
            }

            // Note isolée
            if (isNote(line)) {
                let nextLineIndex = i + 1;
                while (nextLineIndex < lines.length && lines[nextLineIndex].trim() === "") {
                    nextLineIndex++;
                }

                if (nextLineIndex < lines.length && isMenuLine(lines[nextLineIndex])) {
                    // Note qui précède un menu
                    let menuActions: any[] = [];
                    let menuOrder: string[] = [];
                    let currentMenuType = getMenuType(lines[nextLineIndex]);
                    menuOrder.push(currentMenuType.toLowerCase());

                    menuActions.push({
                        type: "note",
                        action: extractNote(line),
                        character: "",
                    });

                    let j = nextLineIndex;
                    while (j < lines.length && lines[j].trim() !== "") {
                        let l = lines[j].trim();
                        if (isMenuLine(l)) {
                            currentMenuType = getMenuType(l);
                            if (!menuOrder.includes(currentMenuType.toLowerCase())) {
                                menuOrder.push(currentMenuType.toLowerCase());
                            }
                            j++;
                            continue;
                        }

                        if (isNote(l)) {
                            menuActions.push({
                                type: "note",
                                action: extractNote(l),
                                character: "",
                            });
                            j++;
                            continue;
                        }

                        if (currentMenuType.toLowerCase() === "stat" && l.includes(",")) {
                            let parts = l
                                .split(",")
                                .map((a) => a.trim())
                                .filter(Boolean);
                            let firstChar = extractCharacter(parts[0]);
                            let actions = parts.map((action) => {
                                return {
                                    type: "stat",
                                    action: cleanAction(action),
                                    character: firstChar,
                                };
                            });
                            menuActions.push(...actions);
                        } else if (currentMenuType.toLowerCase() === "sort" && l.includes(",")) {
                            let parts = l
                                .split(",")
                                .map((a) => a.trim())
                                .filter(Boolean);
                            let firstChar = extractCharacter(parts[0]);
                            let actions = parts.map((action) => {
                                return {
                                    type: "sort",
                                    action: cleanAction(action),
                                    character: firstChar,
                                };
                            });
                            menuActions.push(...actions);
                        } else {
                            let actions = l
                                .split(",")
                                .map((a) => a.trim())
                                .filter(Boolean)
                                .map((action) => {
                                    let character = extractCharacter(action);
                                    return {
                                        type: currentMenuType.toLowerCase(),
                                        action: cleanAction(action),
                                        character,
                                    };
                                });
                            menuActions.push(...actions);
                        }
                        j++;
                    }
                    steps.push({
                        id: currentId++,
                        type: "menu",
                        actions: menuActions,
                        menuOrder: menuOrder,
                        acte: currentAct,
                        chapitre: currentChapter,
                    });
                    i = j;
                    continue;
                } else {
                    // Note isolée normale
                    steps.push({
                        id: currentId++,
                        type: "note",
                        titre: extractNote(line),
                        acte: currentAct,
                        chapitre: currentChapter,
                    });
                    i++;
                    continue;
                }
            }

            // Si rien d'autre, skip
            i++;
        }

        return {
            game: "Clair Obscur",
            category: "Any% Expert Glitchless",
            steps,
        };
    }
}

// Initialize the app
new SpeedrunGuideApp();
