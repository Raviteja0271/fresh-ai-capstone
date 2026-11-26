@echo off
title FRESH AI - Backend Server (Port 5000)
cd /d "%~dp0\.."
echo ========================================================
echo   FRESH AI - Flask REST API Server
echo   Running at: http://localhost:5000
echo ========================================================
echo.
"backend\venv\Scripts\python.exe" "backend\run.py"
if errorlevel 1 (
    echo.
    echo [ERROR] Backend server stopped unexpectedly.
    pause
)
