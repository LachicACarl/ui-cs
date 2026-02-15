@echo off
echo.
echo ========================================
echo   Gracewell NEXUS - Quick Install
echo ========================================
echo.

echo [1/3] Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend install failed
    pause
    exit /b 1
)

echo.
echo [2/3] Installing frontend dependencies...
cd ..
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend install failed
    pause
    exit /b 1
)

echo.
echo [3/3] Setup complete!
echo.
echo ========================================
echo   Ready to start Gracewell NEXUS
echo ========================================
echo.
echo To run the system:
echo   1. Run: start-backend.bat
echo   2. Run: start-frontend.bat
echo.
pause
