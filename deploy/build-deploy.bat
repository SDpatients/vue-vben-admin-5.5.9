@echo off
chcp 65001 >nul
title 律师事务所管理系统 - 打包构建中...

echo ============================================
echo   律师事务所管理系统 - 部署包构建脚本
echo ============================================
echo.

set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "FRONTEND_DIST=%PROJECT_DIR%\apps\web-ele\dist"

echo [步骤 1/4] 检查构建环境...
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 pnpm，请先安装 pnpm！
    echo         npm install -g pnpm
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js！
    pause
    exit /b 1
)

echo [信息] 环境检测通过！

echo.
echo [步骤 2/4] 清理旧的构建产物...
if exist "%FRONTEND_DIST%" (
    rmdir /s /q "%FRONTEND_DIST%"
    echo [信息] 已清理前端构建产物
)

echo.
echo [步骤 3/4] 构建前端应用 (web-ele) [Docker部署模式]...
cd /d "%PROJECT_DIR%\apps\web-ele"
call pnpm vite build --mode production.docker
if %errorlevel% neq 0 (
    echo [错误] 前端构建失败！
    pause
    exit /b 1
)
echo [信息] 前端构建完成！

echo.
echo [步骤 4/4] 检查部署文件完整性...
echo.
echo ============================================
echo   构建完成！
echo.
echo   前端构建产物：apps\web-ele\dist\
echo.
echo   [重要] 请确保以下文件已就位：
echo   1. deploy\backend\app.jar              - Spring Boot JAR 包
echo   2. deploy\backend\application-prod.yml  - Docker 生产环境配置
echo   3. deploy\.env                          - Docker 环境变量（从 .env.example 复制）
echo.
echo   部署命令：
echo   cd deploy
echo   docker-compose up -d
echo.
echo   或直接双击 deploy\start.bat
echo ============================================
echo.
pause