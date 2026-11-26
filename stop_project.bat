@echo off
title FRESH AI - Service Terminator
cd /d "%~dp0"

echo =====================================================================
echo    Stopping FRESH AI Application Services
echo =====================================================================
echo.

powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | ForEach-Object { $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; if ($proc) { Write-Host ('[STOPPING] Process: ' + $proc.ProcessName + ' (PID ' + $proc.Id + ') on port ' + $_.LocalPort); Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } }"

echo.
echo [SUCCESS] FRESH AI backend and frontend services have been stopped.
echo.
pause
