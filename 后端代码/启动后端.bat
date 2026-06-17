@echo off
chcp 65001 >nul
title XYZ Market - Backend Startup Script
setlocal enabledelayedexpansion

cd /d "%~dp0"

:: ===== 1. Check JDK =====
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] JDK not found.
    pause
    exit /b 1
)
for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr "version"') do set JDK_VERSION=%%v
echo [OK] JDK %JDK_VERSION%

:: ===== 2. Check and free port 8080 =====
:check_port
set PORT_PID=
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":8080 " ^| findstr LISTENING') do set PORT_PID=%%a
if defined PORT_PID (
    if not "!PORT_PID!"=="0" (
        taskkill /F /PID !PORT_PID! >nul 2>&1
        timeout /t 3 /nobreak >nul
        goto check_port
    )
)
if exist "data\xyz_market.trace.db" del /f /q "data\xyz_market.trace.db" >nul 2>&1

:: ===== 3. Find Maven =====
set MAVEN_CMD=
where mvn >nul 2>&1
if !errorlevel! equ 0 ( set MAVEN_CMD=mvn ) else (
    for %%p in (
        "%USERPROFILE%\.trae-cn\tools\maven\latest\bin"
        "D:\tools\maven\apache-maven-3.9.16\bin"
        "D:\tools\maven\apache-maven-3.9.9\bin"
        "C:\apache-maven-3.9.9\bin"
    ) do if exist "%%~p\mvn.cmd" set "MAVEN_CMD=%%~p\mvn.cmd" & goto :maven_found
    if exist "mvnw.cmd" set "MAVEN_CMD=mvnw.cmd" & goto :maven_found
    goto :no_maven
)
:maven_found

echo [OK] Using Maven: %MAVEN_CMD%
start "XYZ Market Backend" "%MAVEN_CMD%" spring-boot:run

echo [VERIFY] Waiting 12 seconds...
timeout /t 12 /nobreak >nul
netstat -ano | findstr /C:":8080 " | findstr LISTENING >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Backend running on http://localhost:8080
) else (
    echo [WARNING] Port 8080 not listening yet.
)
pause
goto :end

:no_maven
echo [ERROR] Maven not found.
pause
exit /b 1

:end