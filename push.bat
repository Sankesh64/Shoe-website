@echo off
echo ============================================
echo   Pushing Project to GitHub
echo ============================================
echo.

:: Remove inner .git if it exists to avoid submodule issues
if exist "vite-project\.git" (
    echo Removing inner .git from vite-project...
    rmdir /s /q "vite-project\.git"
)

if exist "backend\.git" (
    echo Removing inner .git from backend...
    rmdir /s /q "backend\.git"
)

:: Check if git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
    echo.
)

:: Set branch to main
git branch -M main

:: Add remote (skip if already exists)
git remote add origin https://github.com/Sankesh64/Shoe-website.git 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Remote 'origin' already exists, updating URL...
    git remote set-url origin https://github.com/Sankesh64/Shoe-website.git
)

echo.
echo Staging all files...
git add .

echo.
echo Committing changes...
git commit -m "Initial deployment setup"

echo.
echo Pushing to GitHub (main branch)...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Regular push failed. Trying force push...
    git push -u origin main --force
)

echo.
echo ============================================
echo   Done! Check: https://github.com/Sankesh64/Shoe-website
echo ============================================
pause
