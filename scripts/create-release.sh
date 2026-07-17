#!/bin/bash

# AI Canvas GitHub Release 创建脚本
# 使用方法: ./scripts/create-release.sh [version]

set -e

echo "=========================================="
echo "AI Canvas GitHub Release 创建脚本"
echo "=========================================="

# 获取版本号
VERSION=${1:-$(node -p "require('./extension/package.json').version")}
echo "版本: v$VERSION"

# 检查是否已构建
OUTPUT_FILE="extension/.output/ai-canvas-${VERSION}-chrome.zip"
if [ ! -f "$OUTPUT_FILE" ]; then
    echo "错误: 未找到构建文件 $OUTPUT_FILE"
    echo "请先运行 ./scripts/build-extension.sh"
    exit 1
fi

# 检查 Git 状态
if [ -n "$(git status --porcelain)" ]; then
    echo "警告: 有未提交的更改"
    git status --short
    echo ""
    read -p "是否继续？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 创建 Git Tag
echo "创建 Git Tag: v$VERSION"
git tag -a "v$VERSION" -m "Release v$VERSION"

# 推送 Tag
echo "推送 Tag 到远程仓库..."
git push origin "v$VERSION"

# 创建 Release 说明
RELEASE_NOTES="## AI Canvas v$VERSION

### 功能
- 从 ChatGPT 对话提取内容
- 可视化画布编辑
- 导出为 PDF/MD/TXT/HTML
- 保存到 Notion

### 安装方法
1. 下载 \`ai-canvas-${VERSION}-chrome.zip\`
2. 解压到本地文件夹
3. 打开 Chrome，访问 \`chrome://extensions/\`
4. 开启「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择解压后的文件夹

### 注意事项
- 后端 API 地址: http://120.55.2.225
- 首次使用需要登录 Notion 账户
- 如有问题，请提交 Issue"

# 创建 Release
echo "创建 GitHub Release..."
gh release create "v$VERSION" \
    --title "AI Canvas v$VERSION" \
    --notes "$RELEASE_NOTES" \
    "$OUTPUT_FILE"

echo "=========================================="
echo "Release 创建完成！"
echo "=========================================="
echo ""
echo "Release 链接: https://github.com/liushuai-man/AI-Canvas/releases/tag/v$VERSION"
echo ""
echo "请检查 Release 页面，确保文件已正确上传"
echo "=========================================="
