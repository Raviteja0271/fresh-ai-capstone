@echo off
title FRESH AI - Frontend Server (Port 5173)
cd /d "%~dp0\..\frontend"
echo ========================================================
echo   FRESH AI - React Vite Development Server
echo   Running at: http://localhost:5173
echo ========================================================
echo.
call npm run dev
if errorlevel 1 (
    echo.
    echo [ERROR] Frontend server stopped unexpectedly.
    pause
)
