@echo off
title Star Citizen Crafting Hub Launcher
echo ========================================================
echo   STAR CITIZEN CRAFT & SUPPLY HUB - LANCEMENT GLOBAL
echo ========================================================
echo.
echo [1/2] Lancement de l'agent local Python...
start "Star Citizen Agent (Python - Port 5500)" cmd /k "cd /d "%~dp0local_agent" && python agent_server.py"

timeout /t 2 /nobreak >nul

echo [2/2] Lancement de l'application Web React...
start "Star Citizen Web App (React - Port 5173)" cmd /k "cd /d "%~dp0webapp" && npm run dev"

echo.
echo ========================================================
echo   TOUT EST EN COURS D'EXECUTION !
echo   - Interface Web : http://localhost:5173
echo   - Agent Local   : http://127.0.0.1:5500
echo ========================================================
echo.
echo Ouverture automatique de votre navigateur dans 3 secondes...
timeout /t 3 /nobreak >nul
start http://localhost:5173
pause
