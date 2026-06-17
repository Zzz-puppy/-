@echo off
chcp 65001 >nul
title XYZ Market - Shutdown
setlocal enabledelayedexpansion

echo [1/3] Finding xyz-market Java processes...
wmic process where "name='java.exe' and commandline like '%%xyz-market%%'" get processid 2>nul | findstr /r "[0-9]" >"%TEMP%\xyz_pids.txt"
set "KILLED="
for /f %%p in (%TEMP%\xyz_pids.txt) do (
    if not "%%p"=="ProcessId" (
        taskkill /F /PID %%p >nul 2>&1 && set "KILLED=1"
    )
)
if defined KILLED ( echo [OK] xyz-market Java process killed. ) else ( echo No xyz-market Java process found. )
del /f /q "%TEMP%\xyz_pids.txt" >nul 2>&1

echo [2/3] Releasing port 8080...
:check_port
set "PORT_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":8080 " ^| findstr "LISTENING"') do set "PORT_PID=%%a"
if defined PORT_PID (
    if not "!PORT_PID!"=="0" (
        taskkill /F /PID !PORT_PID! >nul 2>&1
        timeout /t 2 /nobreak >nul
        goto check_port
    )
)
if exist "data\xyz_market.trace.db" del /f /q "data\xyz_market.trace.db" >nul 2>&1
echo [OK] Port 8080 is free.
pause