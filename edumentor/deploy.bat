@echo off
REM EduMentor Firebase Deployment Script
REM This script ensures a clean build and deployment every time

echo.
echo ========================================
echo    EduMentor Deployment Process
echo ========================================
echo.

REM Step 1: Clean old build folder
echo [1/4] Cleaning old build files...
if exist build (
    rmdir /s /q build
    echo       Old build folder deleted
) else (
    echo       No existing build folder found
)
echo.

REM Step 2: Create fresh production build
echo [2/4] Creating fresh production build...
echo       This may take a few minutes...
echo.
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo       Build completed successfully!
echo.

REM Step 3: Verify build folder exists
echo [3/4] Verifying build folder...
if exist build (
    echo       Build folder created successfully
) else (
    echo       ERROR: Build folder not found!
    pause
    exit /b 1
)
echo.

REM Step 4: Deploy to Firebase
echo [4/4] Deploying to Firebase...
echo.
call firebase deploy --only hosting --force

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Deployment Complete!
echo ========================================
echo.
echo Next Steps:
echo   1. Clear browser cache (Ctrl+Shift+R)
echo   2. Open site in incognito mode
echo   3. Verify all fixes are working
echo.
echo If changes don't appear:
echo   - Wait 2-3 minutes for CDN cache
echo   - Use incognito/private browsing
echo   - Clear browser cache completely
echo.
echo ========================================
echo.
pause

