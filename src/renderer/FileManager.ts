import { Guide, KeyBinds, MinimalOptions, LoadResult, ParseResult, SavedConfig } from "../types/GuideTypes";

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
    public loadMinimalOptions(): MinimalOptions {
        const defaultOptions: MinimalOptions = {
            hideHeader: false,
            skipLoot: false,
            skipPurchase: false,
            skipNotes: false,
            fontSize: 100,
        };

        try {
            const saved = localStorage.getItem("speedrun_minimal_options");
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
    public saveMinimalOptions(options: MinimalOptions): void {
        try {
            localStorage.setItem("speedrun_minimal_options", JSON.stringify(options));
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des options:", error);
        }
    }

    /**
     * Charge la configuration complète depuis localStorage
     */
    public loadConfig(): SavedConfig {
        return {
            minimalOptions: this.loadMinimalOptions(),
            keyBinds: this.loadKeyBinds(),
        };
    }

    /**
     * Sauvegarde la configuration complète dans localStorage
     */
    public saveConfig(config: SavedConfig): void {
        if (config.minimalOptions) {
            const currentOptions = this.loadMinimalOptions();
            const mergedOptions = { ...currentOptions, ...config.minimalOptions };
            this.saveMinimalOptions(mergedOptions);
        }
        if (config.keyBinds) {
            const currentBinds = this.loadKeyBinds();
            const mergedBinds = { ...currentBinds, ...config.keyBinds };
            this.saveKeyBinds(mergedBinds);
        }
    }

    /**
     * Sauvegarde l'index de l'étape actuelle
     */
    public saveCurrentStepIndex(index: number): void {
        try {
            localStorage.setItem("speedrun_current_step", index.toString());
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'étape actuelle:", error);
        }
    }

    /**
     * Charge l'index de l'étape actuelle
     */
    public loadCurrentStepIndex(): number {
        try {
            const saved = localStorage.getItem("speedrun_current_step");
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            console.warn("Erreur lors du chargement de l'étape actuelle:", error);
            return 0;
        }
    }

    // ============================================================================
    // GESTION DES FICHIERS (IPC)
    // ============================================================================

    /**
     * Charge un guide depuis un fichier JSON
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
        const possiblePaths = [
            "clair-obscur-guide-complete.json",
            "Release/clair-obscur-guide-complete.json",
            "../clair-obscur-guide-complete.json",
        ];

        for (const path of possiblePaths) {
            try {
                const result = await this.loadGuideFromFile(path);
                if (result.success && result.guide) {
                    return result;
                }
            } catch (error) {
                // Continuer avec le chemin suivant
            }
        }

        return { success: false, error: "Aucun guide trouvé" };
    }

    /**
     * Ouvre un sélecteur de fichier JSON
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
     * Ouvre un sélecteur de fichier TXT
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
     * Convertit un fichier TXT en JSON
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

    /**
     * Crée un guide à partir d'un fichier TXT
     */
    public async createGuideFromTxt(): Promise<LoadResult> {
        try {
            // Sélectionne le fichier TXT
            const selectResult = await this.selectTxtFile();
            if (!selectResult.success || !selectResult.filePath) {
                return {
                    success: false,
                    error: selectResult.error || "Aucun fichier sélectionné",
                };
            }

            // Convertit en JSON
            const convertResult = await this.convertTxtToJson(selectResult.filePath);
            if (!convertResult.success || !convertResult.jsonPath) {
                return {
                    success: false,
                    error: convertResult.error || "Erreur lors de la conversion",
                };
            }

            // Charge le guide converti
            const loadResult = await this.loadGuideFromFile(convertResult.jsonPath);
            return loadResult;
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors de la création du guide: ${error}`,
            };
        }
    }

    /**
     * Charge un guide depuis un fichier JSON sélectionné
     */
    public async loadGuideFromSelectedFile(): Promise<LoadResult> {
        try {
            const selectResult = await this.selectJsonFile();
            if (!selectResult.success || !selectResult.filePath) {
                return {
                    success: false,
                    error: selectResult.error || "Aucun fichier sélectionné",
                };
            }

            const loadResult = await this.loadGuideFromFile(selectResult.filePath);
            return loadResult;
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors du chargement: ${error}`,
            };
        }
    }

    // ============================================================================
    // GESTION DES ÉTAPES (IPC)
    // ============================================================================

    /**
     * Récupère l'étape actuelle depuis le main process
     */
    public async getCurrentStep(): Promise<{
        success: boolean;
        step?: any;
        currentIndex?: number;
        totalSteps?: number;
        error?: string;
    }> {
        if (!this.ipcRenderer) {
            return {
                success: false,
                error: "IPC non disponible (pas dans Electron)",
            };
        }

        try {
            const result = await this.ipcRenderer.invoke("get-current-step");
            return result;
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors de la récupération: ${error}`,
            };
        }
    }

    /**
     * Passe à l'étape suivante
     */
    public async nextStep(): Promise<{
        success: boolean;
        step?: any;
        currentIndex?: number;
        totalSteps?: number;
        error?: string;
    }> {
        if (!this.ipcRenderer) {
            return {
                success: false,
                error: "IPC non disponible (pas dans Electron)",
            };
        }

        try {
            const result = await this.ipcRenderer.invoke("next-step");
            return result;
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors du passage à l'étape suivante: ${error}`,
            };
        }
    }

    /**
     * Passe à l'étape précédente
     */
    public async previousStep(): Promise<{
        success: boolean;
        step?: any;
        currentIndex?: number;
        totalSteps?: number;
        error?: string;
    }> {
        if (!this.ipcRenderer) {
            return {
                success: false,
                error: "IPC non disponible (pas dans Electron)",
            };
        }

        try {
            const result = await this.ipcRenderer.invoke("previous-step");
            return result;
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors du passage à l'étape précédente: ${error}`,
            };
        }
    }

    /**
     * Saute à une étape spécifique
     */
    public async jumpToStep(
        stepIndex: number
    ): Promise<{ success: boolean; step?: any; currentIndex?: number; totalSteps?: number; error?: string }> {
        if (!this.ipcRenderer) {
            return {
                success: false,
                error: "IPC non disponible (pas dans Electron)",
            };
        }

        try {
            const result = await this.ipcRenderer.invoke("jump-to-step", stepIndex);
            return result;
        } catch (error) {
            return {
                success: false,
                error: `Erreur lors du saut d'étape: ${error}`,
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

    /**
     * Ferme l'application
     */
    public closeApp(): void {
        if (this.ipcRenderer) {
            this.ipcRenderer.invoke("close-app");
        }
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

    /**
     * Nettoie le localStorage (supprime toutes les données sauvegardées)
     */
    public clearAllData(): void {
        try {
            localStorage.removeItem("speedrun_binds");
            localStorage.removeItem("speedrun_minimal_options");
            localStorage.removeItem("speedrun_current_step");
        } catch (error) {
            console.error("Erreur lors du nettoyage des données:", error);
        }
    }

    /**
     * Exporte la configuration actuelle
     */
    public exportConfig(): string {
        const config = this.loadConfig();
        return JSON.stringify(config, null, 2);
    }

    /**
     * Importe une configuration
     */
    public importConfig(configJson: string): boolean {
        try {
            const config = JSON.parse(configJson) as SavedConfig;
            this.saveConfig(config);
            return true;
        } catch (error) {
            console.error("Erreur lors de l'import de la configuration:", error);
            return false;
        }
    }
}
