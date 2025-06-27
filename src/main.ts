import { app, BrowserWindow, ipcMain, screen, globalShortcut, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { Guide, Step, LoadResult } from "./types/GuideTypes";
import { GuideParser } from "./parsers/GuideParser";

const execAsync = promisify(exec);

app.disableHardwareAcceleration();

class SpeedrunGuideApp {
    private mainWindow: BrowserWindow | null = null;
    private currentGuide: Guide | null = null;
    private currentStepIndex: number = 0;
    private binds = {
        prev: "F1",
        next: "F2",
        toggleOverlay: "F3",
        chapter: "F4",
        reset: "F5",
    };
    private overlayHidden: boolean = false;
    private guideParser: GuideParser;

    constructor() {
        this.guideParser = new GuideParser();
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

    private setupGlobalShortcuts(): void {
        globalShortcut.unregisterAll();

        Object.entries(this.binds).forEach(([action, key]) => {
            if (key && key.toLowerCase() !== " " && key.toLowerCase() !== "space") {
                const success = globalShortcut.register(key, () => {
                    setTimeout(() => {
                        if (action === "toggleOverlay") {
                            this.toggleOverlay();
                        } else {
                            this.mainWindow?.webContents.send(`${action}-step-from-main`);
                        }
                    }, 10);
                });
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
                webSecurity: false,
            },
            type: "toolbar",
            show: false,
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

            // S'assurer que la fenêtre reste au premier plan
            this.mainWindow?.setAlwaysOnTop(true, "screen-saver");

            // Maintenir la fenêtre au premier plan périodiquement
            this.startAlwaysOnTopMaintenance();
        });

        // Maintenir la fenêtre au premier plan
        this.mainWindow.on("blur", () => {
            if (!this.overlayHidden) {
                this.mainWindow?.setAlwaysOnTop(true, "screen-saver");
            }
        });
    }

    private startAlwaysOnTopMaintenance(): void {
        // Vérifier et maintenir la fenêtre au premier plan toutes les 2 secondes
        setInterval(() => {
            if (this.mainWindow && !this.overlayHidden && this.mainWindow.isVisible()) {
                this.mainWindow.setAlwaysOnTop(true, "screen-saver");
            }
        }, 2000);
    }

    private toggleOverlay() {
        if (!this.mainWindow) return;
        if (this.overlayHidden) {
            this.mainWindow.showInactive();
            this.mainWindow.setAlwaysOnTop(true, "screen-saver");
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

                this.currentGuide = JSON.parse(data) as Guide;
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

                // Lire le contenu du fichier txt
                const content = fs.readFileSync(txtFilePath, "utf8");
                const result = this.guideParser.parseGuide(content);
                if (result.success && result.guide) {
                    fs.writeFileSync(jsonPath, JSON.stringify(result.guide, null, 2));
                } else {
                    throw new Error(result.error || "Erreur lors du parsing");
                }

                return { success: true, jsonPath: jsonPath };
            } catch (error) {
                console.error("Erreur lors de la conversion:", error);
                return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
            }
        });
    }
}

// Initialize the app
new SpeedrunGuideApp();
