@echo off
title Star Citizen Crafting Web App (React)
echo ========================================================
echo   STAR CITIZEN CRAFT & INVENTORY - WEB INTERFACE
echo ========================================================
echo.
cd /d "%~dp0webapp"
npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Une erreur est survenue lors du lancement de npm.
    echo Verifiez que Node.js est installe et ajoute au PATH Windows.
)
pause
