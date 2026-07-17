#!/bin/bash

# AI Canvas 扩展构建脚本
# 使用方法: ./scripts/build-extension.sh [version]

set -e

echo "=========================================="
echo "AI Canvas 扩展构建脚本"
echo "=========================================="

# 获取版本号
VERSION=${1:-$(node -p "require('./extension/package.json').version")}
echo "版本: $VERSION"

# 进入扩展目录
cd extension

# 安装依赖
echo "安装依赖..."
pnpm install

# 构建扩展
echo "构建扩展..."
pnpm build

# 构建 zip 包
echo "构建 zip 包..."
pnpm zip

# 检查输出文件
OUTPUT_FILE=".output/ai-canvas-${VERSION}-chrome.zip"
if [ -f "$OUTPUT_FILE" ]; then
    echo "=========================================="
    echo "构建完成！"
    echo "=========================================="
    echo ""
    echo "输出文件: extension/$OUTPUT_FILE"
    echo "文件大小: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo ""
    echo "下一步："
    echo "1. 创建 GitHub Release"
    echo "2. 上传 $OUTPUT_FILE 到 Release"
    echo "3. 发布 Release"
    echo "=========================================="
else
    echo "错误: 构建失败，未找到输出文件"
    exit 1
fi
