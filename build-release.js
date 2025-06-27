const fs = require('fs');
const path = require('path');

// Fonction pour copier un fichier
function copyFile(source, destination) {
    try {
        fs.copyFileSync(source, destination);
        console.log(`✅ Copié: ${source} -> ${destination}`);
    } catch (error) {
        console.error(`❌ Erreur lors de la copie de ${source}:`, error.message);
    }
}

// Fonction pour créer un dossier s'il n'existe pas
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Créé le dossier: ${dir}`);
    }
}

// Fonction pour nettoyer le dossier Release
function cleanReleaseDir() {
    const releaseDir = path.join(__dirname, 'Release');
    if (fs.existsSync(releaseDir)) {
        // Supprimer tout sauf les .exe
        fs.readdirSync(releaseDir).forEach(file => {
            if (!file.endsWith('.exe')) {
                const filePath = path.join(releaseDir, file);
                if (fs.lstatSync(filePath).isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(filePath);
                }
            }
        });
        console.log('🧹 Dossier Release nettoyé (sauf .exe)');
    }
    ensureDir(releaseDir);
}

// Fonction principale
function buildRelease() {
    console.log('🚀 Début de la préparation du dossier Release...\n');
    
    // Nettoyer et créer le dossier Release
    cleanReleaseDir();
    
    const releaseDir = path.join(__dirname, 'Release');
    
    // Liste des fichiers à copier
    const filesToCopy = [
        'clair-obscur-guide-complete.json',
        'speedrun.txt',
        'exemple-guide.txt',
        'DOCUMENTATION.md',
        'README.md',
        'CHANGELOG.md',
        'logo.ico'
    ];
    
    // Copier les fichiers
    filesToCopy.forEach(file => {
        const sourcePath = path.join(__dirname, file);
        const destPath = path.join(releaseDir, file);
        
        if (fs.existsSync(sourcePath)) {
            copyFile(sourcePath, destPath);
        } else {
            console.warn(`⚠️  Fichier non trouvé: ${file}`);
        }
    });
    
    console.log('\n✅ Préparation du dossier Release terminée !');
    console.log(`📁 Dossier: ${releaseDir}`);
}

// Exécuter le script
buildRelease(); 