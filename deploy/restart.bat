@echo off
chcp 65001 >nul
title 律师事务所管理系统 - 重启中...

echo ============================================
echo   律师事务所管理系统 v1.0.0
echo ============================================
echo.
echo [信息] 正在重启系统...

cd /d "%~dp0"
docker-compose restart

if %errorlevel% neq 0 (
    echo.
    echo [错误] 系统重启失败！
    pause
    exit /b 1
)

echo.
echo ============================================
echo   系统已成功重启！
echo ============================================
echo.
pause