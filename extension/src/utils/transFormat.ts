import html2pdf from 'html2pdf.js';
import MarkdownIt from 'markdown-it';
import markdownItHighlightjs from 'markdown-it-highlightjs';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: false,
}).use(markdownItHighlightjs, {
  auto: true,
  code: true,
});

function normalizeHighlightLanguage(language?: string | null) {
  if (!language) return null;

  const normalized = language.toLowerCase();
  const aliases: Record<string, string> = {
    'c++': 'cpp',
    shell: 'bash',
    sh: 'bash',
    zsh: 'bash',
    react: 'tsx',
    next: 'tsx',
  };

  return aliases[normalized] || normalized;
}

function highlightCodeToHtml(code: string, language?: string | null) {
  const normalizedLanguage = normalizeHighlightLanguage(language);

  if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
    return hljs.highlight(code, {
      language: normalizedLanguage,
      ignoreIllegals: true,
    }).value;
  }

  return hljs.highlightAuto(code).value;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildCodeBlockHtml(code: string, language?: string | null) {
  const safeLanguage = escapeHtml(
    normalizeHighlightLanguage(language) || 'plaintext'
  );
  const highlightedCode = highlightCodeToHtml(code, language);

  return `<pre class="export-code-block"><code class="hljs language-${safeLanguage}">${highlightedCode}</code></pre>`;
}

function buildHighlightThemeCss() {
  return `
    .ai-canvas-export .hljs{display:block;overflow-x:auto;padding:0;color:#24292e;background:#f6f8fa}
    .ai-canvas-export .hljs-comment,.ai-canvas-export .hljs-quote{color:#6a737d;font-style:italic}
    .ai-canvas-export .hljs-keyword,.ai-canvas-export .hljs-selector-tag,.ai-canvas-export .hljs-subst{color:#d73a49}
    .ai-canvas-export .hljs-number,.ai-canvas-export .hljs-literal,.ai-canvas-export .hljs-variable,.ai-canvas-export .hljs-template-variable,.ai-canvas-export .hljs-tag .hljs-attr{color:#005cc5}
    .ai-canvas-export .hljs-string,.ai-canvas-export .hljs-doctag{color:#032f62}
    .ai-canvas-export .hljs-title,.ai-canvas-export .hljs-section,.ai-canvas-export .hljs-selector-id{color:#6f42c1}
    .ai-canvas-export .hljs-type,.ai-canvas-export .hljs-class .hljs-title{color:#e36209}
    .ai-canvas-export .hljs-tag,.ai-canvas-export .hljs-name,.ai-canvas-export .hljs-attribute{color:#22863a}
    .ai-canvas-export .hljs-regexp,.ai-canvas-export .hljs-link{color:#032f62}
    .ai-canvas-export .hljs-symbol,.ai-canvas-export .hljs-bullet,.ai-canvas-export .hljs-built_in,.ai-canvas-export .hljs-builtin-name{color:#005cc5}
    .ai-canvas-export .hljs-meta{color:#735c0f}
    .ai-canvas-export .hljs-deletion{background:#ffeef0}
    .ai-canvas-export .hljs-addition{background:#f0fff4}
  `;
}

function buildMessageHtml(block: any) {
  const roleIcon = block.role === 'user' ? '👤' : '🤖';
  const roleName = block.role === 'user' ? '用户' : 'AI助手';
  const timeStr = block.createdAt
    ? new Date(block.createdAt).toLocaleString()
    : '';
  const sourceStr = block.source ? ` | 来源: ${block.source}` : '';

  const contentHtml = (block.contentBlocks || [])
    .map((contentBlock: any) => {
      if (contentBlock.type === 'code') {
        return buildCodeBlockHtml(
          contentBlock.code || '',
          contentBlock.language
        );
      }

      if (contentBlock.type === 'image') {
        const alt = escapeHtml(contentBlock.alt || '');
        const src = escapeHtml(contentBlock.src);
        return `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto;" />`;
      }

      return renderMarkdown([contentBlock]);
    })
    .join('\n');

  return `
    <section class="export-message">
      <h3>${roleIcon} ${roleName}</h3>
      <div class="export-message-content">
        ${contentHtml}
      </div>
      <blockquote>${escapeHtml(`${timeStr}${sourceStr}`)}</blockquote>
    </section>
    <hr />
  `;
}

function buildExportBody(content: any[]) {
  const exportDate = new Date().toLocaleString();
  const htmlContent = content
    .map((block) => buildMessageHtml(block))
    .join('\n');

  return `
  <style>
    .ai-canvas-export {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 850px;
      margin: auto;
      padding: 40px;
      line-height: 1.6;
      color: #24292e;
      background-color: #fff;
    }
    .ai-canvas-export h1 { text-align: center; border-bottom: 1px solid #eaecef; padding-bottom: .3em; margin-bottom: 1.5rem; }
    .ai-canvas-export h3 { margin-top: 2rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; border-bottom: 1px solid #eee; padding-bottom: .3em; }
    .ai-canvas-export p { margin-top: 0; margin-bottom: 16px; }
    .ai-canvas-export blockquote { padding: 0 1em; color: #6a737d; border-left: .25em solid #dfe2e5; margin: 0 0 16px 0; }
    .ai-canvas-export pre { padding: 16px; overflow: auto; line-height: 1.45; background-color: #f6f8fa; border-radius: 6px; margin-bottom: 16px; white-space: pre; tab-size: 2; }
    .ai-canvas-export code { font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace; font-size: 85%; background-color: rgba(27,31,35,.05); border-radius: 3px; padding: .2em .4em; }
    .ai-canvas-export pre code { background-color: transparent; padding: 0; font-size: 100%; white-space: inherit; }
    .ai-canvas-export hr { height: .25em; padding: 0; margin: 24px 0; background-color: #e1e4e8; border: 0; }
    .ai-canvas-export ul, .ai-canvas-export ol { padding-left: 2em; margin-bottom: 16px; }
    .ai-canvas-export table { border-spacing: 0; border-collapse: collapse; margin-bottom: 16px; width: 100%; }
    .ai-canvas-export table th, .ai-canvas-export table td { padding: 6px 13px; border: 1px solid #dfe2e5; }
    .ai-canvas-export table tr { background-color: #fff; border-top: 1px solid #c6cbd1; }
    .ai-canvas-export table tr:nth-child(2n) { background-color: #f6f8fa; }
    .ai-canvas-export .export-meta { margin-bottom: 24px; }
    .ai-canvas-export .export-message { margin-bottom: 24px; }
    .ai-canvas-export .export-message-content > *:last-child { margin-bottom: 0; }
    .ai-canvas-export .export-code-block { margin: 16px 0; }
    ${buildHighlightThemeCss()}
  </style>
  <article class="ai-canvas-export">
    <h1>AI Canvas 导出内容</h1>
    <blockquote class="export-meta"><strong>导出日期</strong>: ${escapeHtml(exportDate)}</blockquote>
    <hr />
    ${htmlContent}
  </article>
  `;
}
/**
 * 将 Markdown 转换为纯文本
 */
export function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+(.*)$/gm, '$1\n')
    .replace(/^\s*[-*+]\s+(.*)$/gm, '• $1')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * contentBlocks 转换为 Markdown
 */
function contentBlocksToMarkdown(contentBlocks: any[]): string {
  if (!contentBlocks || contentBlocks.length === 0) return '';

  return contentBlocks
    .map((block) => {
      switch (block.type) {
        case 'text':
          return block.content;
        case 'code':
          const language = block.language || '';
          return `\`\`\`${language}\n${block.code}\n\`\`\``;
        case 'list':
          return block.items
            .map((item: string, index: number) =>
              block.ordered ? `${index + 1}. ${item}` : `- ${item}`
            )
            .join('\n');
        case 'table':
          const headers = block.headers.join('|');
          const separator = block.headers.map(() => '---').join('|');
          return `| ${headers} |\n| ${separator} |\n${block.rows
            .map((row: string[]) => `| ${row.join(' | ')} |`)
            .join('\n')}`;
        case 'inlineCode':
          return `\`${block.code}\``;
        case 'image':
          return `![${block.alt || ''}](${block.src})`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * 转 Markdown 字符串（用于 MD 直接导出）
 */
export const blocksToMarkdown = (content: any[]) => {
  if (!content || content.length === 0) return '';

  const exportDate = new Date().toLocaleString();
  const title = `# AI Canvas 导出内容\n\n> **导出日期**: ${exportDate}\n\n---\n\n`;

  const blocks = content.map((b) => {
    const roleIcon = b.role === 'user' ? '👤' : '🤖';
    const roleName = b.role === 'user' ? '用户' : 'AI助手';
    const timeStr = b.createdAt ? new Date(b.createdAt).toLocaleString() : '';
    const sourceStr = b.source ? ` | 来源: ${b.source}` : '';

    const header = `### ${roleIcon} ${roleName}`;
    const messageContent = contentBlocksToMarkdown(b.contentBlocks);
    const footer = `> ${timeStr}${sourceStr}`;

    return `${header}\n\n${messageContent}\n\n${footer}\n\n---`;
  });

  return title + blocks.join('\n\n');
};

/**
 * 转 TXT
 */
export function toTXT(content: any[]) {
  return content
    .map((b) => {
      const role = b.role === 'user' ? '[用户]' : '[AI助手]';
      let cleanContent = '';

      cleanContent = b.contentBlocks
        .map((block: any) => {
          switch (block.type) {
            case 'text':
              return stripMarkdown(block.content);
            case 'code':
              return block.code;
            case 'list':
              return block.items
                .map((item: string, index: number) =>
                  block.ordered ? `${index + 1}. ${item}` : `• ${item}`
                )
                .join('\n');
            case 'table':
              const headers = block.headers.join('\t');
              const rows = block.rows
                .map((row: string[]) => row.join('\t'))
                .join('\n');
              return `${headers}\n${rows}`;
            case 'image':
              return `[图片: ${block.alt || block.src}]`;
            default:
              return '';
          }
        })
        .join('\n\n');

      return `${role}\n${cleanContent}`;
    })
    .join('\n\n');
}

/**
 * 渲染单个 Markdown 内容为 HTML
 */
export function renderMarkdown(content: string | any[]): string {
  if (Array.isArray(content)) {
    // 处理 contentBlocks
    const markdown = contentBlocksToMarkdown(content);
    return md.render(markdown);
  }
  // 处理传统的字符串内容
  return md.render(content);
}

/**
 * 转 PDF
 */
export function toPDF(content: any[]) {
  const exportContainer = document.createElement('div');
  exportContainer.innerHTML = buildExportBody(content);

  // 添加必要的样式以确保正确渲染
  exportContainer.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 850px;
    z-index: 99999;
    background: white;
    pointer-events: none;
  `;

  document.body.appendChild(exportContainer);

  // 等待 DOM 更新后再生成 PDF
  setTimeout(() => {
    html2pdf()
      .from(exportContainer)
      .set({
        margin: 15,
        filename: 'ai-canvas.pdf',
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        },
        jsPDF: { format: 'a4', orientation: 'portrait', unit: 'mm' },
      })
      .save()
      .finally(() => {
        document.body.removeChild(exportContainer);
      });
  }, 100);
}

/**
 * 全局转 HTML（带样式）
 */
export function toHTML(content: any[]) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>AI Canvas 导出内容</title>
</head>
<body>
  ${buildExportBody(content)}
</body>
</html>
`;
}
