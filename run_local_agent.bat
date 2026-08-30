@echo off
title Star Citizen Companion - Local Agent (Python)
echo ========================================================
echo   STAR CITIZEN CRAFT & INVENTORY - LOCAL AGENT
echo ========================================================
echo.
cd /d "%~dp0local_agent"
python agent_server.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Une erreur est survenue lors du lancement de Python.
    echo Verifiez que Python 3 est installe et ajoute au PATH Windows.
)
pause
