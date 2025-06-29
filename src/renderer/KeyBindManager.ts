import { KeyBinds, BindChangeEvent, StepChangeEvent } from "../types/GuideTypes";
import { FileManager } from "./FileManager";

/**
 * Gestionnaire des raccourcis clavier et événements
 */
export class KeyBindManager {
    private static instance: KeyBindManager;
    private fileManager: FileManager;
    private keyBinds: KeyBinds;
    private isBindingKey: boolean = false;
    private currentBindingKey: string | null = null;
    private eventListeners: Map<string, (...args: any[]) => void> = new Map();
    private ipcRenderer: any;

    private constructor() {
        this.fileManager = FileManager.getInstance();
        this.keyBinds = this.fileManager.loadKeyBinds();

        // Initialise ipcRenderer si disponible (Electron)
        if (typeof window !== "undefined" && (window as any).require) {
            this.ipcRenderer = (window as any).require("electron").ipcRenderer;
        }
    }

    /**
     * Instance singleton
     */
    public static getInstance(): KeyBindManager {
        if (!KeyBindManager.instance) {
            KeyBindManager.instance = new KeyBindManager();
        }
        return KeyBindManager.instance;
    }

    // ============================================================================
    // INITIALISATION ET CONFIGURATION
    // ============================================================================

    /**
     * Initialise le gestionnaire de raccourcis
     */
    public async initialize(): Promise<void> {
        await this.syncBindsWithMain();
        this.setupGlobalKeyListeners();
        this.setupIPCListeners();
    }

    /**
     * Synchronise les raccourcis avec le main process
     */
    public async syncBindsWithMain(): Promise<void> {
        this.keyBinds = await this.fileManager.syncBindsWithMain();
    }

    /**
     * Recharge les raccourcis depuis le localStorage
     */
    public reloadBinds(): void {
        this.keyBinds = this.fileManager.loadKeyBinds();
    }

    // ============================================================================
    // GESTION DES RACCOURCIS
    // ============================================================================

    /**
     * Obtient les raccourcis actuels
     */
    public getKeyBinds(): KeyBinds {
        return { ...this.keyBinds };
    }

    /**
     * Met à jour un raccourci spécifique
     */
    public async updateKeyBind(bindType: keyof KeyBinds, newKey: string): Promise<void> {
        // Convertir la touche en majuscules pour globalShortcut.register()
        const upperKey = newKey.toUpperCase();

        // Mettre à jour les binds locaux
        this.keyBinds[bindType] = upperKey;

        // Envoyer au main process
        if (this.ipcRenderer) {
            try {
                await this.ipcRenderer.invoke("update-binds", { [bindType]: upperKey });
            } catch (error) {
                console.error("Erreur lors de la mise à jour du bind:", error);
            }
        }

        // Émet un événement de changement
        this.emitBindChange(bindType, upperKey);
    }

    /**
     * Supprime un raccourci (le vide)
     */
    public async clearKeyBind(bindType: keyof KeyBinds): Promise<void> {
        this.keyBinds[bindType] = "";
        this.fileManager.saveKeyBinds(this.keyBinds);

        // Envoie les raccourcis au main process
        if (this.ipcRenderer) {
            try {
                await this.ipcRenderer.invoke("update-binds", { [bindType]: "" });
            } catch (error) {
                console.error("Erreur lors de la suppression du bind:", error);
            }
        }

        // Émet un événement de changement
        this.emitBindChange(bindType, "");
    }

    /**
     * Réinitialise tous les raccourcis aux valeurs par défaut
     */
    public async resetKeyBinds(): Promise<void> {
        this.keyBinds = {
            prev: "F1",
            next: "F2",
            toggleOverlay: "F3",
            chapter: "F4",
            reset: "F5",
        };
        this.fileManager.saveKeyBinds(this.keyBinds);

        // Envoie les raccourcis au main process
        if (this.ipcRenderer) {
            try {
                await this.ipcRenderer.invoke("update-binds", this.keyBinds);
            } catch (error) {
                console.error("Erreur lors de la réinitialisation des binds:", error);
            }
        }

        // Émet des événements de changement pour tous les raccourcis
        Object.keys(this.keyBinds).forEach((key) => {
            this.emitBindChange(key as keyof KeyBinds, this.keyBinds[key as keyof KeyBinds]);
        });
    }

    // ============================================================================
    // ÉCOUTEURS D'ÉVÉNEMENTS GLOBAUX
    // ============================================================================

    /**
     * Configure les écouteurs d'événements clavier globaux
     */
    private setupGlobalKeyListeners(): void {
        // Supprime les anciens écouteurs s'ils existent
        this.removeGlobalKeyListeners();

        // Note: Les raccourcis globaux sont maintenant gérés par le processus principal
        // via globalShortcut, donc nous n'avons plus besoin d'écouteurs DOM ici
        // Les raccourcis fonctionnent même quand la fenêtre n'a pas le focus

        console.log("Raccourcis globaux configurés via le processus principal");
    }

    /**
     * Supprime les écouteurs d'événements clavier globaux
     */
    private removeGlobalKeyListeners(): void {
        // Les raccourcis globaux sont gérés par le processus principal
        // Pas besoin de nettoyer les écouteurs DOM
    }

    /**
     * Extrait la touche depuis un événement clavier
     */
    private getKeyFromEvent(event: KeyboardEvent): string {
        let key = (event.key || "").toLowerCase();

        // Ignorer les touches de modification seules
        if (key === "shift" || key === "control" || key === "alt" || key === "meta") {
            return "";
        }

        // Ignorer les touches système
        if (key === "capslock" || key === "numlock" || key === "scrolllock") {
            return "";
        }

        // Gestion des touches spéciales
        if (
            key === "f1" ||
            key === "f2" ||
            key === "f3" ||
            key === "f4" ||
            key === "f5" ||
            key === "f6" ||
            key === "f7" ||
            key === "f8" ||
            key === "f9" ||
            key === "f10" ||
            key === "f11" ||
            key === "f12"
        ) {
            return key.toUpperCase(); // F1, F2, etc.
        } else if (key === " ") {
            return "space";
        } else if (key === "enter") {
            return "enter";
        } else if (key === "escape") {
            return "escape";
        } else if (key === "tab") {
            return "tab";
        } else if (key === "backspace") {
            return "backspace";
        } else if (key === "delete") {
            return "delete";
        } else if (key === "arrowup") {
            return "arrowup";
        } else if (key === "arrowdown") {
            return "arrowdown";
        } else if (key === "arrowleft") {
            return "arrowleft";
        } else if (key === "arrowright") {
            return "arrowright";
        } else if (key === "home") {
            return "home";
        } else if (key === "end") {
            return "end";
        } else if (key === "pageup") {
            return "pageup";
        } else if (key === "pagedown") {
            return "pagedown";
        } else if (key === "insert") {
            return "insert";
        } else if (key === "printscreen") {
            return "printscreen";
        } else if (key === "pause") {
            return "pause";
        } else if (key === "contextmenu") {
            return "contextmenu";
        } else if (key === "spacebar") {
            return "space";
        }

        // Pour les touches normales, retourner la touche en majuscules
        return key.toUpperCase();
    }

    /**
     * Exécute l'action correspondant au raccourci
     */
    private async executeKeyBind(bindType: keyof KeyBinds): Promise<void> {
        if (!this.ipcRenderer) {
            console.warn("IPC non disponible");
            return;
        }

        switch (bindType) {
            case "prev":
                await this.handlePreviousStepWithSkips();
                break;
            case "next":
                await this.handleNextStepWithSkips();
                break;
            case "reset":
                const result = await this.fileManager.jumpToStep(0);
                if (result.success && result.step) {
                    this.emitStepChange(result.currentIndex || 0, result.totalSteps || 0, result.step, "reset");
                }
                break;
            case "chapter":
                this.showChapterMenu();
                break;
            case "toggleOverlay":
                this.toggleOverlay();
                break;
            default:
                console.warn(`Action inconnue pour le raccourci: ${bindType}`);
        }
    }

    // ============================================================================
    // ÉCOUTEURS IPC
    // ============================================================================

    /**
     * Configure les écouteurs d'événements IPC
     */
    private setupIPCListeners(): void {
        if (!this.ipcRenderer) {
            return;
        }

        const listeners = [
            {
                event: "next-step-from-main",
                handler: async () => {
                    await this.handleNextStepWithSkips();
                },
            },
            {
                event: "prev-step-from-main",
                handler: async () => {
                    await this.handlePreviousStepWithSkips();
                },
            },
            {
                event: "reset-step-from-main",
                handler: async () => {
                    const result = await this.fileManager.jumpToStep(0);
                    if (result.success && result.step) {
                        this.emitStepChange(result.currentIndex || 0, result.totalSteps || 0, result.step, "reset");
                    }
                },
            },
            { event: "chapter-step-from-main", handler: () => this.showChapterMenu() },
            { event: "toggle-overlay-from-main", handler: () => this.toggleOverlay() },
            { event: "toggle-options-or-header", handler: () => this.toggleOptionsOrHeader() },
        ];

        listeners.forEach(({ event, handler }) => {
            this.ipcRenderer.on(event, handler);
            this.eventListeners.set(`ipc-${event}`, handler);
        });
    }

    /**
     * Supprime les écouteurs d'événements IPC
     */
    private removeIPCListeners(): void {
        if (!this.ipcRenderer) {
            return;
        }

        this.eventListeners.forEach((handler, key) => {
            if (key.startsWith("ipc-")) {
                const event = key.replace("ipc-", "");
                this.ipcRenderer.removeListener(event, handler);
                this.eventListeners.delete(key);
            }
        });
    }

    // ============================================================================
    // CONFIGURATION DES RACCOURCIS
    // ============================================================================

    /**
     * Démarre la configuration d'un raccourci
     */
    public startKeyBinding(bindType: keyof KeyBinds, inputElement: HTMLInputElement): void {
        if (this.isBindingKey) {
            return;
        }

        this.isBindingKey = true;
        this.currentBindingKey = bindType;

        // Affiche l'état d'attente
        inputElement.classList.add("waiting-key");
        inputElement.value = "Appuyez sur une touche...";
        inputElement.focus();

        // Configure l'écouteur temporaire
        const tempKeyHandler = async (event: KeyboardEvent) => {
            event.preventDefault();
            event.stopPropagation();

            const pressedKey = this.getKeyFromEvent(event);

            // Ignorer les touches de modification seules
            if (!pressedKey) {
                return;
            }

            // Interdit la touche espace (comme l'ancien code)
            if (pressedKey === " " || pressedKey === "spacebar" || pressedKey === "space") {
                inputElement.value = "Espace interdit";
                setTimeout(() => {
                    inputElement.value = this.formatKeyForDisplay(this.keyBinds[bindType]);
                    inputElement.classList.remove("waiting-key");
                    this.isBindingKey = false;
                }, 1000);
                window.removeEventListener("keydown", tempKeyHandler, true);
                return;
            }

            // Met à jour le raccourci
            await this.updateKeyBind(bindType, pressedKey);

            // Met à jour l'affichage
            inputElement.value = this.formatKeyForDisplay(pressedKey);
            inputElement.classList.remove("waiting-key");

            // Nettoie
            this.isBindingKey = false;
            this.currentBindingKey = null;
            window.removeEventListener("keydown", tempKeyHandler, true);

            // Timeout de sécurité
            clearTimeout(timeoutId);
        };

        window.addEventListener("keydown", tempKeyHandler, true);

        // Timeout de sécurité (10 secondes)
        const timeoutId = setTimeout(() => {
            if (this.isBindingKey) {
                this.isBindingKey = false;
                this.currentBindingKey = null;
                inputElement.value = this.formatKeyForDisplay(this.keyBinds[bindType]);
                inputElement.classList.remove("waiting-key");
                window.removeEventListener("keydown", tempKeyHandler, true);
            }
        }, 10000);

        // Empêche la saisie manuelle
        inputElement.addEventListener("keydown", (e) => e.preventDefault(), { once: true });
    }

    /**
     * Formate une touche pour l'affichage
     */
    public formatKeyForDisplay(key: string): string {
        if (!key) return "Aucun";

        // Remplace les séparateurs pour un affichage plus propre
        return key.replace(/\+/g, " + ");
    }

    /**
     * Vérifie si un raccourci est en cours de configuration
     */
    public isCurrentlyBinding(): boolean {
        return this.isBindingKey;
    }

    /**
     * Obtient le type de raccourci en cours de configuration
     */
    public getCurrentBindingKey(): string | null {
        return this.currentBindingKey;
    }

    // ============================================================================
    // ACTIONS DES RACCOURCIS
    // ============================================================================

    /**
     * Affiche le menu des chapitres
     */
    private showChapterMenu(): void {
        // Cette méthode sera implémentée dans UIManager
        // Pour l'instant, on émet un événement personnalisé
        const event = new CustomEvent("show-chapter-menu");
        window.dispatchEvent(event);
    }

    /**
     * Bascule l'overlay
     */
    private toggleOverlay(): void {
        // Cette méthode sera implémentée dans UIManager
        // Pour l'instant, on émet un événement personnalisé
        const event = new CustomEvent("toggle-overlay");
        window.dispatchEvent(event);
    }

    /**
     * Bascule les options ou l'en-tête
     */
    private toggleOptionsOrHeader(): void {
        // Cette méthode sera implémentée dans UIManager
        // Pour l'instant, on émet un événement personnalisé
        const event = new CustomEvent("toggle-options-or-header");
        window.dispatchEvent(event);
    }

    // ============================================================================
    // ÉVÉNEMENTS PERSONNALISÉS
    // ============================================================================

    /**
     * Émet un événement de changement de raccourci
     */
    private emitBindChange(bindType: keyof KeyBinds, newKey: string): void {
        const event = new CustomEvent<BindChangeEvent>("bind-change", {
            detail: {
                bindType,
                newKey,
            },
        });
        window.dispatchEvent(event);
    }

    /**
     * Émet un événement de changement d'étape
     */
    public emitStepChange(currentIndex: number, totalSteps: number, step: any, direction: string = "next"): void {
        const event = new CustomEvent<StepChangeEvent>("step-change", {
            detail: {
                currentIndex,
                totalSteps,
                step,
                direction,
            },
        });
        window.dispatchEvent(event);
    }

    /**
     * Gère la navigation vers l'avant avec skips
     */
    private async handleNextStepWithSkips(): Promise<void> {
        if (!this.ipcRenderer) return;

        try {
            const result = await this.ipcRenderer.invoke("next-step");
            if (result.success && result.step) {
                // Vérifier si l'étape doit être skipée
                const shouldSkip = await this.shouldSkipStep(result.step);
                if (shouldSkip) {
                    await this.handleNextStepWithSkips();
                    return;
                }

                this.emitStepChange(result.currentIndex || 0, result.totalSteps || 0, result.step, "next");
            }
        } catch (error) {
            console.error("Erreur lors de la navigation:", error);
        }
    }

    /**
     * Gère la navigation vers l'arrière avec skips
     */
    private async handlePreviousStepWithSkips(): Promise<void> {
        if (!this.ipcRenderer) return;

        try {
            const result = await this.ipcRenderer.invoke("previous-step");
            if (result.success && result.step) {
                // Vérifier si l'étape doit être skipée
                const shouldSkip = await this.shouldSkipStep(result.step);
                if (shouldSkip) {
                    await this.handlePreviousStepWithSkips();
                    return;
                }

                this.emitStepChange(result.currentIndex || 0, result.totalSteps || 0, result.step, "prev");
            }
        } catch (error) {
            console.error("Erreur lors de la navigation:", error);
        }
    }

    /**
     * Vérifie si une étape doit être skipée selon les options minimalistes
     */
    private async shouldSkipStep(step: any): Promise<boolean> {
        if (!step) return false;

        // Récupérer les options minimalistes depuis UIManager
        const uiManager = (window as any).uiManager;
        if (!uiManager || !uiManager.minimalOptions) {
            return false;
        }

        const minimalOptions = uiManager.minimalOptions;

        // Vérifier les options de skip
        if (minimalOptions.skipLoot && step.type === "loot") {
            return true;
        }
        if (minimalOptions.skipPurchase && step.type === "purchase") {
            return true;
        }

        return false;
    }

    // ============================================================================
    // NETTOYAGE
    // ============================================================================

    /**
     * Nettoie les ressources
     */
    public destroy(): void {
        this.removeGlobalKeyListeners();
        this.removeIPCListeners();
        this.eventListeners.clear();
    }
}
