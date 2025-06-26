const fs = require('fs');
const path = require('path');

// Lire le fichier d'entrée (par défaut speedrun.txt, sinon premier argument)
const inputFile = process.argv[2] || 'speedrun.txt';
// Si c'est un chemin absolu, l'utiliser directement, sinon le joindre au répertoire courant
const guidePath = path.isAbsolute(inputFile) ? inputFile : path.join(__dirname, inputFile);
const content = fs.readFileSync(guidePath, 'utf-8');

function parseContent(content) {
    const lines = content.split('\n');
    
    // Lire le nom du jeu et la catégorie depuis les deux premières lignes
    const gameName = lines[0].trim();
    const category = lines[1].trim();
    
    // Ignorer les deux premières lignes et la ligne vide qui suit
    const steps = [];
    let currentId = 1;
    let currentAct = '';
    let currentChapter = '';
    let i = 3; // Commencer après les deux premières lignes + ligne vide
    
    function isMenuLine(line) {
        return /(ARME|PICTO|LUMINA|UP ARME|UP LUMINA|STAT|SORT|FORMATION)/.test(line);
    }
    function getMenuType(line) {
        const match = line.match(/(ARME|PICTO|LUMINA|UP ARME|UP LUMINA|STAT|SORT|FORMATION)/);
        return match ? match[1] : '';
    }
    function isNote(line) {
        return /^\(A\)/.test(line);
    }
    function extractNote(line) {
        return line.replace(/^\(A\)\s*/, '').trim();
    }
    function isCharacterMark(line) {
        return /\((M|L|S|V|Mo)\)/.test(line);
    }
    function extractCharacter(action) {
        const match = action.match(/\((M|L|S|V|Mo)\)/);
        if (!match) return '';
        const map = {M: 'maelle', L: 'lune', S: 'sciel', V: 'verso', Mo: 'monoco'};
        return map[match[1]] || '';
    }
    function cleanAction(action) {
        return action.replace(/\((M|L|S|V|Mo)\)/, '').replace(/\(FAIL\)/, '').trim();
    }
    while (i < lines.length) {
        let line = lines[i].trim();
        if (!line) { i++; continue; }
        // Acte
        if (/Act/.test(line)) {
            currentAct = line;
            i++;
            continue;
        }
        // Chapitre
        if (line.startsWith('T:')) {
            currentChapter = line.substring(2).trim();
            i++;
            continue;
        }
        // Loot groupé
        if (line.startsWith('📦')) {
            let loots = [line.substring(1).trim().replace(/^\W+/g, '').trim()];
            let j = i+1;
            while (j < lines.length && lines[j].trim().startsWith('📦')) {
                loots.push(lines[j].trim().substring(1).trim().replace(/^\W+/g, '').trim());
                j++;
            }
            steps.push({
                id: currentId++,
                type: 'loot',
                titre: loots.join(' | '),
                acte: currentAct,
                chapitre: currentChapter
            });
            i = j;
            continue;
        }
        // Achat
        if (line.startsWith('💰')) {
            steps.push({
                id: currentId++,
                type: 'purchase',
                titre: line.substring(1).trim().replace(/^\W+/g, '').trim(),
                acte: currentAct,
                chapitre: currentChapter
            });
            i++;
            continue;
        }
        // Menu groupé (nouvelle logique)
        if (isMenuLine(line)) {
            let menuActions = [];
            let menuOrder = []; // Pour préserver l'ordre des menus
            let currentMenuType = getMenuType(line);
            let j = i + 1;
            
            // Ajouter le premier type de menu à l'ordre
            menuOrder.push(currentMenuType.toLowerCase());
            
            while (j < lines.length && lines[j].trim() !== '') {
                let l = lines[j].trim();
                if (isMenuLine(l)) {
                    currentMenuType = getMenuType(l);
                    // Ajouter le nouveau type à l'ordre s'il n'est pas déjà présent
                    if (!menuOrder.includes(currentMenuType.toLowerCase())) {
                        menuOrder.push(currentMenuType.toLowerCase());
                    }
                    j++;
                    continue;
                }
                
                // Vérifier si c'est une note avant de traiter comme une action de menu
                if (isNote(l)) {
                    menuActions.push({
                        type: 'note',
                        action: extractNote(l),
                        character: ''
                    });
                    j++;
                    continue;
                }
                
                // Cas spécial pour les stats : toutes les stats d'une ligne héritent du perso de la première stat
                if (currentMenuType.toLowerCase() === 'stat' && l.includes(',')) {
                    let parts = l.split(',').map(a => a.trim()).filter(Boolean);
                    let firstChar = extractCharacter(parts[0]);
                    let actions = parts.map(action => {
                        return {
                            type: 'stat',
                            action: cleanAction(action),
                            character: firstChar
                        };
                    });
                    menuActions.push(...actions);
                // Cas spécial pour les sorts : tous les sorts d'une ligne héritent du perso du marqueur
                } else if (currentMenuType.toLowerCase() === 'sort' && l.includes(',')) {
                    let parts = l.split(',').map(a => a.trim()).filter(Boolean);
                    let firstChar = extractCharacter(parts[0]);
                    let actions = parts.map(action => {
                        return {
                            type: 'sort',
                            action: cleanAction(action),
                            character: firstChar
                        };
                    });
                    menuActions.push(...actions);
                } else {
                    // On parse les actions de menu (ex: (V) +9 Force (9))
                    // On peut avoir plusieurs actions séparées par des virgules
                    let actions = l.split(',').map(a => a.trim()).filter(Boolean).map(action => {
                        let character = extractCharacter(action);
                        return {
                            type: currentMenuType.toLowerCase(),
                            action: cleanAction(action),
                            character
                        };
                    });
                    menuActions.push(...actions);
                }
                j++;
            }
            steps.push({
                id: currentId++,
                type: 'menu',
                actions: menuActions,
                menuOrder: menuOrder, // Ajouter l'ordre des menus
                acte: currentAct,
                chapitre: currentChapter
            });
            i = j;
            continue;
        }
        // Combat ou Boss
        if (line.startsWith('🛡️') || line.startsWith('🎯')) {
            let type = line.startsWith('🛡️') ? 'combat' : 'boss';
            let titre = line;
            let turns = [];
            let j = i+1;
            while (j < lines.length && lines[j].trim() && !lines[j].trim().startsWith('🛡️') && !lines[j].trim().startsWith('🎯') && !lines[j].trim().startsWith('📦') && !lines[j].trim().startsWith('💰') && !isMenuLine(lines[j].trim()) && !/Act/.test(lines[j].trim()) && !lines[j].trim().startsWith('T:')) {
                let turnLine = lines[j].trim();
                
                // Vérifier si c'est une note
                if (isNote(turnLine)) {
                    turns.push([{
                        action: extractNote(turnLine),
                        character: '',
                        fail: false,
                        isNote: true
                    }]);
                } else {
                    // Un tour = une ligne, split par '>'
                    let actions = turnLine.split('>').map(a => a.trim()).filter(Boolean).map(action => {
                        let character = extractCharacter(action);
                        let fail = /(FAIL)/.test(action);
                        let actionObj = {
                            action: cleanAction(action),
                            character
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
                chapitre: currentChapter
            });
            i = j;
            continue;
        }
        // Note isolée
        if (isNote(line)) {
            // Vérifier si la prochaine ligne est un menu
            let nextLineIndex = i + 1;
            while (nextLineIndex < lines.length && lines[nextLineIndex].trim() === '') {
                nextLineIndex++;
            }
            
            if (nextLineIndex < lines.length && isMenuLine(lines[nextLineIndex])) {
                // C'est une note qui précède un menu, on va l'ajouter au menu
                let menuActions = [];
                let menuOrder = [];
                let currentMenuType = getMenuType(lines[nextLineIndex]);
                menuOrder.push(currentMenuType.toLowerCase());
                
                // Ajouter la note comme première action du menu
                menuActions.push({
                    type: 'note',
                    action: extractNote(line),
                    character: ''
                });
                
                let j = nextLineIndex;
                while (j < lines.length && lines[j].trim() !== '') {
                    let l = lines[j].trim();
                    if (isMenuLine(l)) {
                        currentMenuType = getMenuType(l);
                        if (!menuOrder.includes(currentMenuType.toLowerCase())) {
                            menuOrder.push(currentMenuType.toLowerCase());
                        }
                        j++;
                        continue;
                    }
                    
                    // Vérifier si c'est une note avant de traiter comme une action de menu
                    if (isNote(l)) {
                        menuActions.push({
                            type: 'note',
                            action: extractNote(l),
                            character: ''
                        });
                        j++;
                        continue;
                    }
                    
                    // Cas spécial pour les stats : toutes les stats d'une ligne héritent du perso de la première stat
                    if (currentMenuType.toLowerCase() === 'stat' && l.includes(',')) {
                        let parts = l.split(',').map(a => a.trim()).filter(Boolean);
                        let firstChar = extractCharacter(parts[0]);
                        let actions = parts.map(action => {
                            return {
                                type: 'stat',
                                action: cleanAction(action),
                                character: firstChar
                            };
                        });
                        menuActions.push(...actions);
                    // Cas spécial pour les sorts : tous les sorts d'une ligne héritent du perso du marqueur
                    } else if (currentMenuType.toLowerCase() === 'sort' && l.includes(',')) {
                        let parts = l.split(',').map(a => a.trim()).filter(Boolean);
                        let firstChar = extractCharacter(parts[0]);
                        let actions = parts.map(action => {
                            return {
                                type: 'sort',
                                action: cleanAction(action),
                                character: firstChar
                            };
                        });
                        menuActions.push(...actions);
                    } else {
                        // On parse les actions de menu (ex: (V) +9 Force (9))
                        // On peut avoir plusieurs actions séparées par des virgules
                        let actions = l.split(',').map(a => a.trim()).filter(Boolean).map(action => {
                            let character = extractCharacter(action);
                            return {
                                type: currentMenuType.toLowerCase(),
                                action: cleanAction(action),
                                character
                            };
                        });
                        menuActions.push(...actions);
                    }
                    j++;
                }
                steps.push({
                    id: currentId++,
                    type: 'menu',
                    actions: menuActions,
                    menuOrder: menuOrder,
                    acte: currentAct,
                    chapitre: currentChapter
                });
                i = j;
                continue;
            } else {
                // Note isolée normale
                steps.push({
                    id: currentId++,
                    type: 'note',
                    titre: extractNote(line),
                    acte: currentAct,
                    chapitre: currentChapter
                });
                i++;
                continue;
            }
        }
        // Si rien d'autre, skip
        i++;
    }
    return {
        game: gameName,
        category: category,
        steps
    };
}

// Convert the file
try {
    const guide = parseContent(content);
    
    // Déterminer le fichier de sortie
    const outputFile = process.argv[3] || 'clair-obscur-guide-complete.json';
    fs.writeFileSync(outputFile, JSON.stringify(guide, null, 2));
    
    console.log('Guide converti avec succès !');
    console.log(`Fichier de sortie: ${outputFile}`);
    console.log(`Nombre d'étapes créées: ${guide.steps.length}`);
} catch (error) {
    console.error('Erreur lors de la conversion:', error);
} 