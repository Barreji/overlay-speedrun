import { UIManager } from "./renderer/UIManager";

// Point d'entrée principal du renderer

(async () => {
    // Initialise l'UI et tous les gestionnaires
    const uiManager = UIManager.getInstance();
    await uiManager.initialize();

    // Communication avec le main process (si besoin d'ajouter des listeners globaux)
    if (typeof window !== "undefined" && (window as any).require) {
        const { ipcRenderer } = (window as any).require("electron");
        // Exemples d'écouteurs globaux (peuvent être étendus selon les besoins)
        ipcRenderer.on("reload-guide", async () => {
            await uiManager["loadGuideOnStart"]?.();
        });
        // Ajoutez ici d'autres canaux IPC si besoin
    }

    // Nettoyage à la fermeture de la fenêtre
    window.addEventListener("beforeunload", () => {
        uiManager.destroy();
    });
})();
