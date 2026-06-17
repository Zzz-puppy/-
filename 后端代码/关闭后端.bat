@echo off
chcp 65001 >nul
title XYZ Market - Shutdown Tool
setlocal enabledelayedexpansion

echo ========================================
echo   XYZ Market - Backend Shutdown
echo ========================================
echo.

:: ===== 1. Kill xyz-market Java process via wmic =====
echo [1/3] Finding xyz-market Java processes...
wmic process where "name='java.exe' and commandline like '%%xyz-market%%'" get processid 2>nul | findstr /r "[0-9]" >"%TEMP%\xyz_pids.txt"
set "KILLED="
for /f %%p in (%TEMP%\xyz_pids.txt) do (
    if not "%%p"=="ProcessId" (
        echo   Killing xyz-market Java PID: %%p
        taskkill /F /PID %%p >nul 2>&1 && set "KILLED=1"
    )
)
if defined KILLED (
    echo [OK] xyz-market Java process killed.
) else (
    echo   No xyz-market Java process found.
)
del /f /q "%TEMP%\xyz_pids.txt" >nul 2>&1

:: ===== 2. Kill any process on port 8080 =====
echo [2/3] Releasing port 8080...
:check_port
set "PORT_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C":8080 " ^| findstr "LISTENING"') do set PORT_PID=%%a
if defined PORT_PID (
    if not "!PORT_PID!"=="0" (
        echo   Killing PID !PORT_PID! on port 8080...
        taskkill /F /PID !PORT_PID! >nul 2>&1
        timeout /t 2 /nobreak >nul
        goto check_port
    )
)

:: Clean up stale H2 trace log (safe to delete)
if exist "data\xyz_market.trace.db" (
    del /f /q "data\xyz_market.trace.db" >nul 2>&1
)

echo [OK] Port 8080 is free.
echo.
echo ========================================
echo   Cleanup complete.
echo   You can now start the backend.
echo ========================================
echo.
pause