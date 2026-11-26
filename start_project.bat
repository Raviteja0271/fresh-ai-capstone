@echo off
title FRESH AI - Application Launcher
cd /d "%~dp0"

echo =====================================================================
echo    FRESH AI: Intelligent Phishing Detection and Secure Communication
echo    Final-Year Capstone Project - Windows Launcher
echo =====================================================================
echo.

REM 1. Check Python installation
where python >nul 2>nul
if errorlevel 1 (
    if not exist "backend\venv\Scripts\python.exe" (
        echo [ERROR] Python was not found in your system PATH.
        echo Please install Python 3.10 or newer from https://www.python.org/downloads/
        echo Make sure to check the option: Add python.exe to PATH during installation.
        echo.
        pause
        exit /b 1
    )
)

REM 2. Check Node.js and npm
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js and npm were not found in your system PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 3. Check GnuPG Status
where gpg >nul 2>nul
if errorlevel 1 (
    echo [NOTICE] GnuPG was not detected on Windows PATH.
    echo FRESH AI will use its internal Python Cryptography RSA-2048 engine.
    echo If you want to use native GnuPG, install Gpg4win from https://gpg4win.org
    echo.
) else (
    echo [OK] Native GnuPG detected on system PATH.
)

REM 4. Check or Create Virtual Environment
if not exist "backend\venv\Scripts\python.exe" (
    echo [INFO] Python virtual environment not found. Creating backend\venv...
    python -m venv "backend\venv"
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [INFO] Installing backend dependencies...
    "backend\venv\Scripts\pip.exe" install -r "backend\requirements.txt"
) else (
    echo [OK] Python virtual environment ready.
)

REM 5. Check frontend node_modules
if not exist "frontend\node_modules" (
    echo [INFO] Frontend node_modules not found. Installing packages...
    cd frontend
    call npm install
    cd ..
) else (
    echo [OK] Frontend packages ready.
)

REM 6. Ensure Database and Initial Demonstration Dataset Exist
if not exist "backend\database\fresh_ai.db" (
    echo [INFO] Initializing SQLite database and demonstration baseline...
    "backend\venv\Scripts\python.exe" "scripts\setup_database.py"
) else (
    echo [OK] SQLite database ready.
)

echo.
echo =====================================================================
echo    Launching FRESH AI Services:
echo    - Flask Backend API: http://localhost:5000
echo    - React Frontend UI: http://localhost:5173
echo    - Default Credentials: admin / Admin@FreshAI2026
echo =====================================================================
echo.

REM Start Flask Backend in its own window
start "FRESH AI - Backend (Port 5000)" cmd /k ""%~dp0scripts\run_backend.bat""

REM Wait for backend initialization
powershell -NoProfile -Command "Start-Sleep -Seconds 2"

REM Start React Frontend in its own window
start "FRESH AI - Frontend (Port 5173)" cmd /k ""%~dp0scripts\run_frontend.bat""

REM Wait for frontend dev server
powershell -NoProfile -Command "Start-Sleep -Seconds 3"

REM Open default browser
start http://localhost:5173

echo.
echo [SUCCESS] FRESH AI services are starting.
echo Server console windows will remain open to display real-time logs.
echo To terminate all services when done, double-click stop_project.bat.
echo.
pause
