@echo off
chcp 65001 >nul
title 律师事务所管理系统 - 停止中...

echo ============================================
echo   律师事务所管理系统 v1.0.0
echo ============================================
echo.
echo [信息] 正在停止系统服务...

cd /d "%~dp0"
docker-compose down

if %errorlevel% neq 0 (
    echo.
    echo [错误] 系统停止失败！请检查上方日志。
    pause
    exit /b 1
)

echo.
echo ============================================
echo   系统已成功停止！
echo ============================================
echo.
pause