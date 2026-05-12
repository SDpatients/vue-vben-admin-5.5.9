#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIST="$PROJECT_DIR/apps/web-ele/dist"

echo "============================================"
echo "  律师事务所管理系统 - 部署包构建脚本"
echo "============================================"
echo ""

echo "[步骤 1/4] 检查构建环境..."
if ! command -v pnpm &>/dev/null; then
    echo "[错误] 未检测到 pnpm，请先安装 pnpm！"
    exit 1
fi

if ! command -v node &>/dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js！"
    exit 1
fi

echo "[信息] 环境检测通过！"

echo ""
echo "[步骤 2/4] 清理旧的构建产物..."
if [ -d "$FRONTEND_DIST" ]; then
    rm -rf "$FRONTEND_DIST"
    echo "[信息] 已清理前端构建产物"
fi

echo ""
echo "[步骤 3/4] 构建前端应用 (web-ele)..."
cd "$PROJECT_DIR" || exit 1
pnpm run build:ele
if [ $? -ne 0 ]; then
    echo "[错误] 前端构建失败！"
    exit 1
fi
echo "[信息] 前端构建完成！"

echo ""
echo "[步骤 4/4] 检查部署文件完整性..."
echo ""
echo "============================================"
echo "  构建完成！"
echo ""
echo "  前端构建产物：apps/web-ele/dist/"
echo ""
echo "  [重要] 请确保以下文件已就位："
echo "  1. deploy/backend/app.jar      - Spring Boot JAR 包"
echo "  2. deploy/backend/application.yml - Spring Boot 配置文件"
echo "  3. deploy/.env                  - 环境变量（从 .env.example 复制）"
echo ""
echo "  部署命令："
echo "  cd deploy"
echo "  docker-compose up -d"
echo ""
echo "  或直接运行 deploy/start.sh"
echo "============================================"