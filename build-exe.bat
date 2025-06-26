@echo off
setlocal

set RELEASE_DIR=Release
set EXE_NAME=SpeedrunClairObscur.exe

REM Création du dossier Release si besoin
if not exist %RELEASE_DIR% mkdir %RELEASE_DIR%

REM Installation des dépendances
npm install

REM Compilation TypeScript
npm run build

REM Création de l'exécutable dans Release
npx electron-builder --win --publish=never --dir --config.directories.output=%RELEASE_DIR%

REM Copie des fichiers nécessaires dans Release
copy /Y clair-obscur-guide-complete.json %RELEASE_DIR%\
copy /Y speedrun.txt %RELEASE_DIR%\
copy /Y exemple-guide.txt %RELEASE_DIR%\
copy /Y DOCUMENTATION.md %RELEASE_DIR%\
copy /Y README.md %RELEASE_DIR%\

REM Message de fin
@echo.
@echo Terminé ! L'exécutable et les fichiers sont dans le dossier "%RELEASE_DIR%"
pause
endlocal 