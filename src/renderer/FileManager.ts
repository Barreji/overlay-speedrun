import { KeyBinds, Options, LoadResult, ParseResult } from "../types/GuideTypes";

/**
 * Gestionnaire de fichiers et localStorage pour le renderer
 */
export class FileManager {
    private static instance: FileManager;
    private ipcRenderer: any;

    private constructor() {
        // Initialise ipcRenderer si disponible (Electron)
        if (typeof window !== "undefined" && (window as any).require) {
            this.ipcRenderer = (window as any).require("electron").ipcRenderer;
        }
    }

    /**
     * Instance singleton
     */
    public static getInstance(): FileManager {
        if (!FileManager.instance) {
            FileManager.instance = new FileManager();
        }
        return FileManager.instance;
    }

    // ============================================================================
    // GESTION DU LOCALSTORAGE
    // ============================================================================

    /**
     * Charge les raccourcis clavier depuis localStorage
     */
    public loadKeyBinds(): KeyBinds {
        const defaultBinds: KeyBinds = {
            prev: "F1",
            next: "F2",
            toggleOverlay: "F3",
            chapter: "F4",
            reset: "F5",
        };

        try {
            const saved = localStorage.getItem("speedrun_binds");
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...defaultBinds, ...parsed };
            }
        } catch (error) {
            console.warn("Erreur lors du chargement des raccourcis:", error);
        }

        return defaultBinds;
    }

    /**
     * Sauvegarde les raccourcis clavier dans localStorage
     */
    public saveKeyBinds(binds: KeyBinds): void {
        try {
            localStorage.setItem("speedrun_binds", JSON.stringify(binds));

            // Synchronise avec le main process si disponible
            if (this.ipcRenderer) {
                this.ipcRenderer.invoke("update-binds", binds);
            }
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des raccourcis:", error);
        }
    }

    /**
     * Charge les options minimales depuis localStorage
     */
    public loadOptions(): Options {
        const defaultOptions: Options = {
            hideHeader: false,
            skipLoot: false,
            skipPurchase: false,
            skipNotes: false,
            fontSize: 100,
            imageSize: 100,
        };

        try {
            const saved = localStorage.getItem("speedrun_options");
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...defaultOptions, ...parsed };
            }
        } catch (error) {
            console.warn("Erreur lors du chargement des options:", error);
        }

        return defaultOptions;
    }

    /**
     * Sauvegarde les options minimales dans localStorage
     */
    public saveOptions(options: Options): void {
        try {
            localStorage.setItem("speedrun_options", JSON.stringify(options));
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des options:", error);
        }
    }

    // ============================================================================
    // GESTION DES FICHIERS (IPC)
    // ============================================================================

    /**
     * Charge un guide depuis un fichier JSON MODIF
     */
    public async loadGuideFromFile(filePath: string): Promise<LoadResult> {
        if (!this.ipcRenderer) {
            return {
                success: false,
                error: "IPC non disponible (pas dans Electron)",
            };
        }

        try {
            const result = await this.ipcRenderer.invoke("load-guide", filePath);
            return result as LoadResult;
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors du chargement: ${error}`,
            };
        }
    }

    /**
     * Charge le guide par défaut
     */
    public async loadDefaultGuide(): Promise<LoadResult> {
        const possiblePaths = "clair-obscur-guide-complete.json";

        try {
            const result = await this.loadGuideFromFile(possiblePaths);
            if (result.success && result.guide) {
                return result;
            }
        } catch (error) {
            return { success: false, error: `Erreur lors du chargement: ${error}` };
        }

        return { success: false, error: "Aucun guide trouvé" };
    }

    /**
     * Ouvre un sélecteur de fichier JSON MODIF
     */
    public async selectJsonFile(): Promise<{ success: boolean; filePath?: string; error?: string }> {
        if (!this.ipcRenderer) {
            return {
                success: false,
                error: "IPC non disponible (pas dans Electron)",
            };
        }

        try {
            const result = await this.ipcRenderer.invoke("select-json-file");
            return result;
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors de la sélection: ${error}`,
            };
        }
    }

    /**
     * Ouvre un sélecteur de fichier TXT MODIF
     */
    public async selectTxtFile(): Promise<{ success: boolean; filePath?: string; error?: string }> {
        if (!this.ipcRenderer) {
            return {
                success: false,
                error: "IPC non disponible (pas dans Electron)",
            };
        }

        try {
            const result = await this.ipcRenderer.invoke("select-txt-file");
            return result;
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors de la sélection: ${error}`,
            };
        }
    }

    /**
     * Convertit un fichier TXT en JSON MODIF
     */
    public async convertTxtToJson(
        txtFilePath: string
    ): Promise<{ success: boolean; jsonPath?: string; error?: string }> {
        if (!this.ipcRenderer) {
            return {
                success: false,
                error: "IPC non disponible (pas dans Electron)",
            };
        }

        try {
            const result = await this.ipcRenderer.invoke("convert-txt-to-json", txtFilePath);
            return result;
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors de la conversion: ${error}`,
            };
        }
    }

    // ============================================================================
    // SYNCHRONISATION AVEC LE MAIN PROCESS
    // ============================================================================

    /**
     * Synchronise les raccourcis avec le main process
     */
    public async syncBindsWithMain(): Promise<KeyBinds> {
        if (!this.ipcRenderer) {
            return this.loadKeyBinds();
        }

        try {
            const mainBinds = await this.ipcRenderer.invoke("get-binds");
            if (mainBinds) {
                const currentBinds = this.loadKeyBinds();
                const mergedBinds = { ...currentBinds, ...mainBinds };
                this.saveKeyBinds(mergedBinds);
                return mergedBinds;
            }
        } catch (error) {
            console.warn("Erreur lors de la synchronisation des raccourcis:", error);
        }

        return this.loadKeyBinds();
    }

    // ============================================================================
    // UTILITAIRES
    // ============================================================================

    /**
     * Vérifie si l'environnement est Electron
     */
    public isElectron(): boolean {
        return typeof window !== "undefined" && !!(window as any).require;
    }
}
