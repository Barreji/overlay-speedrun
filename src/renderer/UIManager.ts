import { Guide, Step, MinimalOptions, KeyBinds, ChapterInfo, LoadResult, NotificationType } from "../types/GuideTypes";
import { DOMElements } from "./types/DOMTypes";
import { FileManager } from "./FileManager";
import { KeyBindManager } from "./KeyBindManager";
import { StepRenderer } from "./StepRenderer";
import { CharacterUtils } from "../utils/CharacterUtils";

/**
 * Gestionnaire principal de l'interface utilisateur
 */
export class UIManager {
    private static instance: UIManager;

    // Composants
    private fileManager: FileManager;
    private keyBindManager: KeyBindManager;
    private stepRenderer: StepRenderer;

    // État de l'application
    private currentStep: Step | null = null;
    private currentIndex: number = 0;
    private totalSteps: number = 0;
    private guide: Guide | null = null;
    private chapterList: ChapterInfo[] = [];
    private minimalOptions: MinimalOptions;

    // Éléments DOM
    private elements: DOMElements;

    // État de l'interface
    private isOptionsMenuVisible: boolean = false;
    private isChapterMenuVisible: boolean = false;

    private constructor() {
        this.fileManager = FileManager.getInstance();
        this.keyBindManager = KeyBindManager.getInstance();
        this.minimalOptions = this.fileManager.loadMinimalOptions();
        this.stepRenderer = new StepRenderer(this.minimalOptions);
        this.elements = this.initializeElements();
    }

    /**
     * Instance singleton
     */
    public static getInstance(): UIManager {
        if (!UIManager.instance) {
            UIManager.instance = new UIManager();
        }
        return UIManager.instance;
    }

    // ============================================================================
    // INITIALISATION
    // ============================================================================

    /**
     * Initialise l'interface utilisateur
     */
    public async initialize(): Promise<void> {
        this.elements = this.initializeElements();
        this.setupUIEvents();
        this.setupCustomEventListeners();

        // Exposer l'instance et les options pour KeyBindManager
        (window as any).uiManager = this;
        (window as any).uiManager.minimalOptions = this.minimalOptions;

        await this.keyBindManager.initialize();
        await this.loadGuideOnStart();
        this.applyFontSize();
        this.autoResizeWindow();
    }

    /**
     * Initialise les références aux éléments DOM
     */
    private initializeElements(): DOMElements {
        return {
            gameName: document.getElementById("game-name"),
            categoryName: document.getElementById("category-name"),
            actLocation: document.getElementById("act-location"),
            stepNumber: document.getElementById("step-number"),
            stepContent: document.getElementById("step-content"),
            stepTitle: document.getElementById("step-title"),
            stepDisplay: document.querySelector(".step-display"),
            settingsBtn: document.getElementById("settings-btn"),
            closeBtn: document.getElementById("close-btn"),
            optionsMenu: document.getElementById("options-menu"),
            chapterMenu: document.getElementById("chapter-menu"),
            chapterMenuBtn: document.getElementById("chapter-menu-btn"),
            hideHeaderBtn: document.getElementById("hide-header-btn"),
            showHeaderBtn: document.getElementById("show-header-btn"),
            resetBindsBtn: document.getElementById("reset-binds-btn"),
            closeOptionsBtn: document.getElementById("close-options-btn"),
        };
    }

    /**
     * Configure les événements de l'interface utilisateur
     */
    private setupUIEvents(): void {
        // Bouton des paramètres
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.toggleOptionsMenu();
            });
        }

        // Bouton de fermeture
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener("click", () => {
                this.fileManager.closeApp();
            });
        }

        // Boutons d'en-tête
        if (this.elements.hideHeaderBtn) {
            this.elements.hideHeaderBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.minimalOptions.hideHeader = true;
                this.fileManager.saveMinimalOptions(this.minimalOptions);
                this.updateStepDisplay();
            });
        }

        if (this.elements.showHeaderBtn) {
            this.elements.showHeaderBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.minimalOptions.hideHeader = false;
                this.fileManager.saveMinimalOptions(this.minimalOptions);
                this.updateStepDisplay();
            });
        }

        // Fermeture des menus au clic extérieur
        document.addEventListener("click", (e) => {
            if (
                this.elements.optionsMenu &&
                !this.elements.optionsMenu.contains(e.target as Node) &&
                this.elements.settingsBtn !== e.target
            ) {
                this.hideOptionsMenu();
            }
            if (
                this.elements.chapterMenu &&
                !this.elements.chapterMenu.contains(e.target as Node) &&
                this.elements.chapterMenuBtn !== e.target
            ) {
                this.hideChapterMenu();
            }
        });

        // Configuration des raccourcis dans le menu des options
        this.setupKeyBindingEvents();
        this.setupOptionsEvents();
        this.setupGuideManagementEvents();
    }

    /**
     * Configure les écouteurs d'événements personnalisés
     */
    private setupCustomEventListeners(): void {
        // Événements du KeyBindManager
        window.addEventListener("show-chapter-menu", () => {
            this.showChapterMenu();
        });

        window.addEventListener("toggle-overlay", () => {
            this.toggleOverlay();
        });

        // Événements de changement de raccourci
        window.addEventListener("bind-change", ((event: CustomEvent) => {
            this.updateKeyBindDisplay(event.detail.bindType, event.detail.newKey);
        }) as EventListener);

        // Événements de changement d'étape
        window.addEventListener("step-change", ((event: CustomEvent) => {
            this.handleStepChange(event.detail);
        }) as EventListener);

        // Événements de menu
        window.addEventListener("show-chapter-menu", () => this.showChapterMenu());
        window.addEventListener("toggle-overlay", () => this.toggleOverlay());
        window.addEventListener("toggle-options-or-header", () => this.toggleOptionsOrHeader());
    }

    // ============================================================================
    // GESTION DES GUIDES
    // ============================================================================

    /**
     * Charge le guide au démarrage
     */
    private async loadGuideOnStart(): Promise<void> {
        try {
            const result = await this.fileManager.loadDefaultGuide();

            if (result.success && result.guide) {
                this.guide = result.guide;
                this.updateGuideInfo(result.guide);
                this.buildChapterList();

                // Charger directement l'étape 0 au lieu d'utiliser getCurrentStep
                this.currentIndex = 0;
                this.currentStep = this.guide.steps[0] || null;
                this.totalSteps = this.guide.steps.length;
                this.updateStepDisplay();

                // Sauvegarder l'index de l'étape actuelle
                this.fileManager.saveCurrentStepIndex(0);
            } else {
                this.showError("Erreur de chargement du guide", result.error || "Guide non trouvé");
            }
        } catch (error) {
            this.showError("Erreur de chargement", "Impossible de charger le guide");
        }
    }

    /**
     * Met à jour les informations du guide
     */
    private updateGuideInfo(guide: Guide): void {
        if (this.elements.gameName) {
            this.elements.gameName.textContent = guide.game;
        }
        if (this.elements.categoryName) {
            this.elements.categoryName.textContent = guide.category;
        }
    }

    /**
     * Construit la liste des chapitres
     */
    private buildChapterList(): void {
        if (!this.guide) return;

        const chapters: ChapterInfo[] = [];
        let lastChapter = "";

        this.guide.steps.forEach((step, index) => {
            if (step.chapitre && step.chapitre !== lastChapter) {
                chapters.push({ name: step.chapitre, index });
                lastChapter = step.chapitre;
            }
        });

        this.chapterList = chapters;
    }

    /**
     * Charge l'étape actuelle
     */
    private async loadCurrentStep(): Promise<void> {
        try {
            const result = await this.fileManager.getCurrentStep();

            if (result.success && result.currentIndex !== undefined) {
                this.currentIndex = result.currentIndex;
                this.currentStep = this.guide?.steps[result.currentIndex] || null;
                this.totalSteps = this.guide?.steps.length || 0;

                // Afficher l'étape (les skips sont gérés dans KeyBindManager)
                this.updateStepDisplay();
            }
        } catch (error) {
            console.error("Erreur lors du chargement de l'étape actuelle:", error);
        }
    }

    /**
     * Gère les changements d'étape
     */
    private handleStepChange(event: any): void {
        const { currentIndex, totalSteps, step, direction = "next" } = event;

        this.currentIndex = currentIndex;
        this.totalSteps = totalSteps;
        this.currentStep = step;

        // Afficher l'étape (les skips sont gérés dans KeyBindManager)
        this.updateStepDisplay();
        this.animateStepChange();
    }

    // ============================================================================
    // AFFICHAGE DES ÉTAPES
    // ============================================================================

    /**
     * Met à jour l'affichage de l'étape
     */
    private updateStepDisplay(): void {
        if (!this.currentStep) {
            this.showEmptyState();
            return;
        }

        // Mettre à jour les options minimalistes dans le StepRenderer
        this.stepRenderer.updateMinimalOptions(this.minimalOptions);

        this.updateStepInfo();
        this.renderStepContent();
        this.updateHeaderVisibility();
        this.autoResizeWindow();
    }

    /**
     * Affiche l'état vide (pas de guide chargé)
     */
    private showEmptyState(): void {
        if (this.elements.stepNumber) {
            this.elements.stepNumber.textContent = "0/0";
        }
        if (this.elements.stepContent) {
            this.elements.stepContent.innerHTML = `
                <div style="color: #666; text-align: center; padding: 20px;">
                    <h3>Chargez un guide pour commencer</h3>
                    <p>Utilisez le menu des paramètres pour charger un guide</p>
                </div>
            `;
        }
        if (this.elements.actLocation) {
            this.elements.actLocation.textContent = "";
        }
        this.autoResizeWindow();
    }

    /**
     * Met à jour la visibilité de l'en-tête
     */
    private updateHeaderVisibility(): void {
        const guideHeader = document.querySelector(".guide-header") as HTMLElement;
        if (guideHeader) {
            guideHeader.style.display = this.minimalOptions.hideHeader ? "none" : "block";
        }

        if (this.elements.hideHeaderBtn) {
            this.elements.hideHeaderBtn.style.display = this.minimalOptions.hideHeader ? "none" : "block";
        }
        if (this.elements.showHeaderBtn) {
            this.elements.showHeaderBtn.style.display = this.minimalOptions.hideHeader ? "block" : "none";
        }
    }

    /**
     * Met à jour les informations de l'étape
     */
    private updateStepInfo(): void {
        if (!this.currentStep) return;

        // Numéro d'étape
        if (this.elements.stepNumber) {
            this.elements.stepNumber.textContent = `${this.currentIndex + 1}/${this.totalSteps}`;
        }

        // Localisation (acte/chapitre)
        if (this.elements.actLocation) {
            let location = "";
            if (this.currentStep.acte && this.currentStep.chapitre) {
                location = `${this.currentStep.acte} - ${this.currentStep.chapitre}`;
            } else if (this.currentStep.acte) {
                location = this.currentStep.acte;
            }
            this.elements.actLocation.textContent = location;
        }

        // Titre de l'étape
        if (this.elements.stepTitle) {
            let title = this.getStepTitle(this.currentStep);

            // Logique spéciale pour certains types
            if (this.currentStep.type === "loot") {
                title = "📦 Loot";
            } else if (this.currentStep.type === "purchase") {
                title = "💰 Achat";
            } else if (this.currentStep.type === "menu") {
                title = "Menu";
            }

            this.elements.stepTitle.textContent = title;
        }
    }

    /**
     * Rend le contenu de l'étape
     */
    private renderStepContent(): void {
        if (!this.currentStep || !this.elements.stepContent) return;

        // En mode minimaliste, ignorer les notes si configuré
        if (this.minimalOptions.skipNotes && this.currentStep.type === "note") {
            this.elements.stepContent.innerHTML = "";
            return;
        }

        // Utilise le StepRenderer pour le rendu
        const html = this.stepRenderer.renderStep(this.currentStep);
        this.elements.stepContent.innerHTML = html;

        // Appliquer la taille de police aux nouveaux éléments générés
        this.applyFontSize();
    }

    /**
     * Obtient le titre d'une étape
     */
    private getStepTitle(step: Step): string {
        return step.titre || "";
    }

    // ============================================================================
    // GESTION DES MENUS
    // ============================================================================

    /**
     * Bascule l'affichage du menu des options
     */
    private toggleOptionsMenu(): void {
        if (this.isOptionsMenuVisible) {
            this.hideOptionsMenu();
        } else {
            this.showOptionsMenu();
        }
    }

    /**
     * Affiche le menu des options
     */
    private showOptionsMenu(): void {
        if (!this.elements.optionsMenu) return;

        this.isOptionsMenuVisible = true;

        // Fonction pour afficher les valeurs des raccourcis
        const displayBindValue = (val: string): string => {
            return val === " " ? "espace" : val || "";
        };

        // Générer le contenu HTML du menu
        this.elements.optionsMenu.innerHTML = `
            <div class="options-title" style="display: flex; align-items: center; justify-content: space-between;">
                <span>Options</span>
                <button id="close-options-x" class="close-x-btn" title="Fermer">&#10005;</button>
            </div>
            
            <div class="guide-management-section">
                <div class="section-title">Gestion des guides</div>
                <div class="guide-actions">
                    <button id="create-guide-btn" class="guide-btn">📝 Créer un guide (.txt → .json)</button>
                    <button id="load-guide-btn" class="guide-btn">📂 Charger un guide (.json)</button>
                </div>
                <div class="current-guide-info">
                    <small>Guide actuel: ${this.guide ? this.guide.game + " - " + this.guide.category : "Aucun"}</small>
                </div>
            </div>
            
            <div class="minimal-options-section">
                <div class="section-title">Options d'affichage</div>
                <label class="font-size-label">
                    Taille de police: <span id="font-size-value">${this.minimalOptions.fontSize}%</span>
                    <input type="range" id="font-size-slider" min="50" max="200" value="${
                        this.minimalOptions.fontSize
                    }" step="10">
                </label>
                <label><input type="checkbox" id="option-skipLoot" ${
                    this.minimalOptions.skipLoot ? "checked" : ""
                }> Ignorer les loots</label>
                <label><input type="checkbox" id="option-skipPurchase" ${
                    this.minimalOptions.skipPurchase ? "checked" : ""
                }> Ignorer les achats</label>
                <label><input type="checkbox" id="option-skipNotes" ${
                    this.minimalOptions.skipNotes ? "checked" : ""
                }> Masquer les notes</label>
            </div>
            
            <div class="binds-section">
                <div class="section-title">Raccourcis clavier</div>
                <label>prev : <span class="bind-input-group"><input type="text" id="bind-prev" value="${displayBindValue(
                    this.keyBindManager.getKeyBinds().prev
                )}" maxlength="20" readonly><span class="unbind-btn" id="unbind-prev">❌</span></span></label>
                <label>next : <span class="bind-input-group"><input type="text" id="bind-next" value="${displayBindValue(
                    this.keyBindManager.getKeyBinds().next
                )}" maxlength="20" readonly><span class="unbind-btn" id="unbind-next">❌</span></span></label>
                <label>hide/show : <span class="bind-input-group"><input type="text" id="bind-toggleOverlay" value="${displayBindValue(
                    this.keyBindManager.getKeyBinds().toggleOverlay
                )}" maxlength="20" readonly><span class="unbind-btn" id="unbind-toggleOverlay">❌</span></span></label>
                <label>chapter : <span class="bind-input-group"><input type="text" id="bind-chapter" value="${displayBindValue(
                    this.keyBindManager.getKeyBinds().chapter
                )}" maxlength="20" readonly><span class="unbind-btn" id="unbind-chapter">❌</span></span></label>
                <label>reset : <span class="bind-input-group"><input type="text" id="bind-reset" value="${displayBindValue(
                    this.keyBindManager.getKeyBinds().reset
                )}" maxlength="20" readonly><span class="unbind-btn" id="unbind-reset">❌</span></span></label>
            </div>
        `;

        this.elements.optionsMenu.style.display = "block";

        // Gestion de la croix de fermeture
        const closeBtn = document.getElementById("close-options-x");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                this.hideOptionsMenu();
            });
        }

        // Configurer tous les événements du menu
        this.setupGuideManagementEvents();
        this.setupKeyBindingEvents();
        this.setupOptionsEvents();
    }

    /**
     * Cache le menu des options
     */
    private hideOptionsMenu(): void {
        if (!this.elements.optionsMenu) return;

        this.isOptionsMenuVisible = false;
        this.elements.optionsMenu.style.display = "none";
    }

    /**
     * Met à jour le contenu du menu des options
     */
    private updateOptionsMenuContent(): void {
        // Cette méthode sera implémentée pour mettre à jour l'affichage
        // des raccourcis et options dans le menu
    }

    /**
     * Affiche le menu des chapitres
     */
    public showChapterMenu(): void {
        if (!this.elements.chapterMenu || !this.chapterList.length) return;

        this.isChapterMenuVisible = true;
        this.elements.chapterMenu.style.display = "block";

        // Génère le contenu du menu
        const menuContent = this.chapterList
            .map(
                (chapter, index) =>
                    `<div class="chapter-item" data-index="${chapter.index}">${index} - ${chapter.name}</div>`
            )
            .join("");

        this.elements.chapterMenu.innerHTML = menuContent;

        // Ajoute les événements de clic
        const chapterItems = this.elements.chapterMenu.querySelectorAll(".chapter-item");
        chapterItems.forEach((item) => {
            item.addEventListener("click", (e) => {
                const index = parseInt((e.target as HTMLElement).getAttribute("data-index") || "0");
                this.hideChapterMenu();
                this.jumpToStep(index);
            });
        });
    }

    /**
     * Cache le menu des chapitres
     */
    public hideChapterMenu(): void {
        if (!this.elements.chapterMenu) return;

        this.isChapterMenuVisible = false;
        this.elements.chapterMenu.style.display = "none";
    }

    /**
     * Bascule l'overlay
     */
    private toggleOverlay(): void {
        if (window.require) {
            const { remote } = window.require("electron");
            if (remote && remote.getCurrentWindow) {
                const win = remote.getCurrentWindow();
                if (win.isVisible()) {
                    win.hide();
                } else {
                    win.show();
                }
            }
        }
    }

    /**
     * Bascule les options ou l'en-tête
     */
    private toggleOptionsOrHeader(): void {
        // Si le menu des options est ouvert, le fermer
        if (this.isOptionsMenuVisible) {
            this.hideOptionsMenu();
        } else {
            // Sinon, basculer l'en-tête
            this.minimalOptions.hideHeader = !this.minimalOptions.hideHeader;
            this.updateHeaderVisibility();
        }
    }

    // ============================================================================
    // NAVIGATION
    // ============================================================================

    /**
     * Saute à une étape spécifique
     */
    private async jumpToStep(stepIndex: number): Promise<void> {
        try {
            const result = await this.fileManager.jumpToStep(stepIndex);
            if (result.success) {
                this.currentIndex = result.currentIndex || stepIndex;
                this.currentStep = this.guide?.steps[this.currentIndex] || null;
                this.updateStepDisplay();
                this.animateStepChange();
            }
        } catch (error) {
            console.error("Error jumping to step:", error);
        }
    }

    // ============================================================================
    // ÉVÉNEMENTS DES RACCOURCIS
    // ============================================================================

    /**
     * Configure les événements de configuration des raccourcis
     */
    private setupKeyBindingEvents(): void {
        const bindFields = [
            { id: "bind-prev", key: "prev" },
            { id: "bind-next", key: "next" },
            { id: "bind-toggleOverlay", key: "toggleOverlay" },
            { id: "bind-chapter", key: "chapter" },
            { id: "bind-reset", key: "reset" },
        ];

        bindFields.forEach(({ id, key }) => {
            const input = document.getElementById(id) as HTMLInputElement;
            if (input) {
                input.addEventListener("click", () => {
                    this.keyBindManager.startKeyBinding(key as keyof KeyBinds, input);
                });
            }
        });

        // Boutons de suppression des raccourcis
        Object.keys(this.keyBindManager.getKeyBinds()).forEach((key) => {
            const btn = document.getElementById(`clear-${key}-btn`);
            if (btn) {
                btn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await this.keyBindManager.clearKeyBind(key as keyof KeyBinds);
                });
            }
        });

        // Bouton de réinitialisation
        if (this.elements.resetBindsBtn) {
            this.elements.resetBindsBtn.addEventListener("click", async () => {
                await this.keyBindManager.resetKeyBinds();
            });
        }
    }

    /**
     * Met à jour l'affichage d'un raccourci
     */
    private updateKeyBindDisplay(bindType: keyof KeyBinds, newKey: string): void {
        const input = document.getElementById(`bind-${bindType}`) as HTMLInputElement;
        if (input) {
            input.value = this.keyBindManager.formatKeyForDisplay(newKey);
        }
    }

    // ============================================================================
    // ÉVÉNEMENTS DES OPTIONS
    // ============================================================================

    /**
     * Configure les événements des options
     */
    private setupOptionsEvents(): void {
        // Cases à cocher pour les options minimalistes
        const optionCheckboxes = [
            { id: "option-skipLoot", key: "skipLoot" as keyof MinimalOptions },
            { id: "option-skipPurchase", key: "skipPurchase" as keyof MinimalOptions },
            { id: "option-skipNotes", key: "skipNotes" as keyof MinimalOptions },
        ];

        optionCheckboxes.forEach(({ id, key }) => {
            const checkbox = document.getElementById(id) as HTMLInputElement;
            if (checkbox) {
                checkbox.checked = this.minimalOptions[key] as boolean;
                checkbox.addEventListener("change", (e) => {
                    const target = e.target as HTMLInputElement;
                    (this.minimalOptions as any)[key] = target.checked;
                    this.fileManager.saveMinimalOptions(this.minimalOptions);
                    this.updateStepDisplay();
                });
            }
        });

        // Barre de progression pour la taille de police
        const fontSizeSlider = document.getElementById("font-size-slider") as HTMLInputElement;
        const fontSizeValue = document.getElementById("font-size-value");

        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.value = this.minimalOptions.fontSize.toString();
            fontSizeValue.textContent = this.minimalOptions.fontSize + "%";

            fontSizeSlider.addEventListener("input", (e) => {
                const newSize = parseInt((e.target as HTMLInputElement).value);
                this.minimalOptions.fontSize = newSize;
                fontSizeValue.textContent = newSize + "%";
                this.fileManager.saveMinimalOptions(this.minimalOptions);
                this.applyFontSize();
            });
        }
    }

    // ============================================================================
    // GESTION DES GUIDES
    // ============================================================================

    /**
     * Configure les événements de gestion des guides
     */
    private setupGuideManagementEvents(): void {
        // Bouton pour créer un guide
        const createGuideBtn = document.getElementById("create-guide-btn");
        if (createGuideBtn) {
            createGuideBtn.addEventListener("click", () => {
                this.createGuideFromTxt();
            });
        }

        // Bouton pour charger un guide
        const loadGuideBtn = document.getElementById("load-guide-btn");
        if (loadGuideBtn) {
            loadGuideBtn.addEventListener("click", () => {
                this.loadGuideFromFile();
            });
        }
    }

    /**
     * Crée un guide à partir d'un fichier TXT
     */
    private async createGuideFromTxt(): Promise<void> {
        try {
            const result = await this.fileManager.createGuideFromTxt();
            if (result.success && result.guide) {
                this.guide = result.guide;
                this.updateGuideInfo(result.guide);
                this.buildChapterList();
                await this.loadCurrentStep();
                this.showNotification("Guide créé avec succès", "success");
            } else {
                this.showNotification(result.error || "Erreur lors de la création", "error");
            }
        } catch (error) {
            console.error("Error creating guide:", error);
            this.showNotification("Erreur lors de la création du guide", "error");
        }
    }

    /**
     * Charge un guide depuis un fichier
     */
    private async loadGuideFromFile(): Promise<void> {
        try {
            const result = await this.fileManager.loadGuideFromSelectedFile();
            if (result.success && result.guide) {
                this.guide = result.guide;
                this.updateGuideInfo(result.guide);
                this.buildChapterList();
                await this.loadCurrentStep();
                this.showNotification("Guide chargé avec succès", "success");
            } else {
                this.showNotification(result.error || "Erreur lors du chargement", "error");
            }
        } catch (error) {
            console.error("Error loading guide:", error);
            this.showNotification("Erreur lors du chargement du guide", "error");
        }
    }

    // ============================================================================
    // UTILITAIRES D'AFFICHAGE
    // ============================================================================

    /**
     * Ajuste automatiquement la taille de la fenêtre
     */
    private autoResizeWindow(): void {
        const container = document.querySelector(".overlay-container");
        if (!container) return;

        setTimeout(() => {
            const rect = container.getBoundingClientRect();
            const stepDisplay = document.querySelector(".step-display");
            const minW = 300,
                maxW = 900,
                minH = 100,
                maxH = window.innerHeight * 0.9;
            let w = Math.ceil(rect.width);

            // Calculer la hauteur nécessaire
            let h;
            if (stepDisplay) {
                const contentHeight = stepDisplay.scrollHeight;
                const headerElement = document.querySelector(".guide-header") as HTMLElement;
                const headerHeight = headerElement?.offsetHeight || 0;
                const padding = 30;
                h = Math.ceil(headerHeight + contentHeight + padding);
            } else {
                h = Math.ceil(rect.height);
            }

            w = Math.max(minW, Math.min(maxW, w));
            h = Math.max(minH, Math.min(maxH, h));

            // Redimensionner la fenêtre via IPC
            if (this.fileManager.isElectron()) {
                // Utiliser IPC pour redimensionner la fenêtre
                const { remote } = window.require("electron");
                const win = remote.getCurrentWindow();
                const curW = win.getSize()[0];
                const curH = win.getSize()[1];
                if (curW !== w || curH !== h) {
                    win.setSize(w, h);
                }
            }
        }, 10);
    }

    /**
     * Applique la taille de police configurée
     */
    private applyFontSize(): void {
        const scale = this.minimalOptions.fontSize / 100;

        const elements = [
            ".overlay-container",
            ".guide-header",
            ".step-display",
            ".step-header",
            "#step-title",
            "#step-number",
            "#step-content",
            "#act-location",
            ".options-menu",
            ".chapter-menu",
            // Ajout des éléments manquants pour le scaling
            ".menu-type-label",
            ".note-line",
            ".menu-actions-line",
            ".menu-formation-line",
            ".combat-turn-line",
            ".loot-line",
            ".purchase-line",
            ".step-act",
            ".step-chapter",
            ".act-title",
            ".chapter-title",
            ".act-description",
            ".chapter-description",
        ];

        elements.forEach((selector) => {
            const element = document.querySelector(selector) as HTMLElement;
            if (element) {
                element.style.fontSize = `${scale * 100}%`;
            }
        });

        // Tailles spécifiques
        if (this.elements.stepTitle) {
            this.elements.stepTitle.style.fontSize = `${scale * 16}px`;
        }
        if (this.elements.stepNumber) {
            this.elements.stepNumber.style.fontSize = `${scale * 12}px`;
        }
        if (this.elements.stepContent) {
            this.elements.stepContent.style.fontSize = `${scale * 13}px`;
        }
        if (this.elements.actLocation) {
            this.elements.actLocation.style.fontSize = `${scale * 14}px`;
        }

        // Tailles spécifiques pour les éléments de menu et notes
        const menuTypeLabels = document.querySelectorAll(".menu-type-label");
        menuTypeLabels.forEach((element) => {
            (element as HTMLElement).style.fontSize = `${scale * 13}px`;
        });

        const noteLines = document.querySelectorAll(".note-line");
        noteLines.forEach((element) => {
            (element as HTMLElement).style.fontSize = `${scale * 12}px`;
        });
    }

    /**
     * Anime le changement d'étape
     */
    private animateStepChange(): void {
        if (this.elements.stepDisplay) {
            this.elements.stepDisplay.style.opacity = "0.5";
            setTimeout(() => {
                if (this.elements.stepDisplay) {
                    this.elements.stepDisplay.style.opacity = "1";
                }
            }, 150);
        }
    }

    // ============================================================================
    // NOTIFICATIONS ET ERREURS
    // ============================================================================

    /**
     * Affiche une notification
     */
    private showNotification(message: string, type: NotificationType = "info"): void {
        // Supprimer les notifications existantes
        const existingNotifications = document.querySelectorAll(".notification");
        existingNotifications.forEach((notification) => notification.remove());

        // Créer la nouvelle notification
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#3b82f6"};
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(notification);

        // Supprimer la notification après 3 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    /**
     * Affiche une erreur
     */
    private showError(title: string, message: string): void {
        if (this.elements.stepContent) {
            this.elements.stepContent.innerHTML = `
                <div style="color: #ef4444; text-align: center; padding: 20px;">
                    <h3>${title}</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    // ============================================================================
    // NETTOYAGE
    // ============================================================================

    /**
     * Nettoie les ressources
     */
    public destroy(): void {
        this.keyBindManager.destroy();
        // Supprimer les écouteurs d'événements personnalisés
        window.removeEventListener("show-chapter-menu", () => {});
        window.removeEventListener("toggle-overlay", () => {});
        window.removeEventListener("bind-change", () => {});
        window.removeEventListener("step-change", () => {});
    }
}
