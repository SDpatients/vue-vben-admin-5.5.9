@echo off
chcp 65001 >nul
title 律师事务所管理系统 - 启动中...

echo ============================================
echo   律师事务所管理系统 v1.0.0
echo ============================================
echo.
echo [信息] 正在检查 Docker 环境...

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Docker，请先安装 Docker Desktop！
    echo         下载地址：https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [信息] Docker 环境检测通过！
echo.
echo [信息] 正在启动系统服务...

cd /d "%~dp0"
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo [错误] 系统启动失败！请检查上方日志排查问题。
    pause
    exit /b 1
)

echo.
echo ============================================
echo   系统启动成功！
echo.
echo   管理后台地址：http://localhost
echo   后端API地址： http://localhost/api/
echo.
echo   如需停止系统，请双击 stop.bat
echo ============================================
echo.
pause