@echo off
chcp 65001 >nul
title XYZ Market - Backend Server
setlocal enabledelayedexpansion

echo ========================================
echo    XYZ Market - Startup Script
echo ========================================
echo.

:: Switch to script directory
cd /d "%~dp0"

:: ===== 1. Check JDK =====
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] JDK not found.
echo   Download: https://adoptium.net/temurin/releases/?version=17
    pause
    exit /b 1
)
for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr "version"') do set JDK_VERSION=%%v
echo [OK] JDK %JDK_VERSION%

:: ===== 2. Check and free port 8080 =====
echo [STEP] Checking port 8080...
:check_port
set PORT_PID=
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /C:":8080 " ^| findstr LISTENING') do set PORT_PID=%%a

if defined PORT_PID (
    if "!PORT_PID!"=="0" (
        echo   Port 8080 stuck in kernel state. Reboot required.
        pause
        exit /b 1
    )
    echo   Port 8080 occupied by PID !PORT_PID!. Killing...
    taskkill /F /PID !PORT_PID! >nul 2>&1
    if !errorlevel! equ 0 (
        echo   Killed. Waiting 3s...
        timeout /t 3 /nobreak >nul
    ) else (
        echo   Failed to kill. Run as Administrator.
        pause
        exit /b 1
    )
    goto check_port
)

echo   Port 8080 is free.

:: Clean stale H2 trace log to avoid DB lock issues
if exist "data\xyz_market.trace.db" del /f /q "data\xyz_market.trace.db" >nul 2>&1
echo.

:: ===== 3. Find Maven =====
set MAVEN_CMD=
where mvn >nul 2>&1
if !errorlevel! equ 0 (
    set MAVEN_CMD=mvn
) else (
    for %%p in (
        "%USERPROFILE%\.trae-cn\tools\maven\latest\bin"
        "D:\tools\maven\apache-maven-3.9.16\bin"
        "D:\tools\maven\apache-maven-3.9.9\bin"
        "C:\apache-maven-3.9.9\bin"
        "C:\Program Files\apache-maven\bin"
    ) do if exist "%%~p\mvn.cmd" set "MAVEN_CMD=%%~p\mvn.cmd" & goto :maven_found
    if exist "mvnw.cmd" set "MAVEN_CMD=mvnw.cmd" & goto :maven_found
    goto :no_maven
)
:maven_found

echo [OK] Using Maven: %MAVEN_CMD%
echo.

:: ===== 4. Start backend =====
echo ========================================
echo   Starting backend server...
echo   URL: http://localhost:8080
echo   Wait for "Started XYZMarketApplication"
echo ========================================
echo.

start "XYZ Market Backend" "%MAVEN_CMD%" spring-boot:run

:: Wait and verify startup
echo [VERIFY] Waiting 12 seconds for server to start...
timeout /t 12 /nobreak >nul

netstat -ano | findstr /C":8080 " | findstr LISTENING >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Backend is running on http://localhost:8080
) else (
    echo [WARNING] Port 8080 is not listening yet.
echo   The Maven window may still be compiling.
echo   Please check the new window titled "XYZ Market Backend".
echo.
echo   If it shows errors, try:
echo     1. Close the XYZ Market Backend window
echo     2. Run: mvn clean compile -DskipTests
echo     3. Run this script again
echo.
echo   If the error says "Column not found":
echo     Delete the database file and restart:
echo       del data\xyz_market.mv.db
)
echo.
pause
goto :end

:no_maven
echo [ERROR] Maven not found.
echo   Please install Maven or compile first:
echo     mvn clean package -DskipTests
echo.
echo   Then run this script again, or use:
echo     java -jar target\xyz-market-1.0.0.jar
pause
exit /b 1

:end
echo.
echo ========================================
echo   Server stopped.
echo ========================================
echo.
pause