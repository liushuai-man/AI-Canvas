import type { ContentBlock } from '../../../shared/types/block';
import hljs from 'highlight.js';

export function parseContentToBlocks(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const tempEl = document.createElement('div');
  tempEl.innerHTML = html;

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) {
        const trimmedText = text.trim();
        if (trimmedText) {
          blocks.push({
            id: crypto.randomUUID(),
            type: 'text',
            content: trimmedText,
          });
        }
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    if (el.tagName === 'STRONG' || el.tagName === 'B') {
      const text = el.textContent?.trim();
      if (text) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: `**${text}**`,
        });
      }
      return;
    }

    if (el.tagName === 'EM' || el.tagName === 'I') {
      const text = el.textContent?.trim();
      if (text) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: `*${text}*`,
        });
      }
      return;
    }

    if (el.tagName === 'PRE') {
      const codeEl = el.querySelector('code');
      let code = '';
      if (codeEl) {
        const clonedCodeEl = codeEl.cloneNode(true) as HTMLElement;

        clonedCodeEl.querySelectorAll('br').forEach((br) => {
          const textNode = document.createTextNode('\n');
          br.parentNode?.replaceChild(textNode, br);
        });
        code = clonedCodeEl.textContent || '';
      } else {
        code = el.textContent || '';
      }
      let language = null;
      if (codeEl) {
        const langClass = Array.from(codeEl.classList).find((c) =>
          c.startsWith('language-')
        );
        if (langClass) {
          language = langClass.replace('language-', '');
        }
      }

      // 使用 highlight.js 自动检测语言
      if (!language && code) {
        try {
          const result = hljs.highlightAuto(code);
          if (result.language) {
            language = result.language;
          }
        } catch (error) {
          // 如果 highlight.js 不可用，继续使用手动检测
        }
      }

      // 手动检测作为备用
      if (!language) {
        const codeStart = code.trim();
        const commonLanguages = [
          'python',
          'javascript',
          'js',
          'java',
          'c',
          'c++',
          'cpp',
          'go',
          'rust',
          'html',
          'css',
          'vue',
          'react',
          'angular',
          'next',
          'typescript',
          'markdown',
          'json',
          'xml',
          'yaml',
          'properties',
          'sql',
          'bash',
          'shell',
          'zsh',
          'fish',
          'lua',
          'perl',
          'ruby',
        ];

        for (const lang of commonLanguages) {
          if (codeStart.toLowerCase().startsWith(lang)) {
            // 检查语言标识后面是否有空格或其他非字母数字字符
            const langLength = lang.length;
            if (langLength < codeStart.length) {
              const nextChar = codeStart[langLength];
              if (!/[a-zA-Z0-9]/.test(nextChar)) {
                language = lang;
                const codeLines = code.split('\n');
                if (codeLines.length > 0) {
                  codeLines[0] = codeLines[0].substring(langLength).trim();
                  code = codeLines.join('\n').trim();
                }
                break;
              }
            }
          }
        }
      }

      code = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      blocks.push({
        id: crypto.randomUUID(),
        type: 'code',
        language: language,
        code: code,
      });

      return;
    }

    if (el.tagName === 'CODE' && el.parentElement?.tagName !== 'PRE') {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'inlineCode',
        code: el.textContent || '',
      });
      return;
    }

    // 处理标题标签
    if (
      el.tagName === 'H1' ||
      el.tagName === 'H2' ||
      el.tagName === 'H3' ||
      el.tagName === 'H4' ||
      el.tagName === 'H5' ||
      el.tagName === 'H6'
    ) {
      const text = el.textContent?.trim();
      if (text) {
        const level = parseInt(el.tagName.substring(1));
        const markdownHeader = '#'.repeat(level) + ' ' + text;
        blocks.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: markdownHeader,
        });
      }
      return;
    }

    // 处理段落标签
    if (el.tagName === 'P') {
      const text = el.textContent?.trim();
      if (text) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: text,
        });
      }
      return;
    }

    if (el.tagName === 'TABLE') {
      const rows = Array.from(el.querySelectorAll('tr'));

      const parsedRows = rows.map((tr) =>
        Array.from(tr.children).map((td) => td.textContent?.trim() || '')
      );

      if (parsedRows.length > 0) {
        const [headers, ...body] = parsedRows;

        blocks.push({
          id: crypto.randomUUID(),
          type: 'table',
          headers,
          rows: body,
        });
      }

      return;
    }

    if (el.tagName === 'UL' || el.tagName === 'OL') {
      const items = Array.from(el.children)
        .filter((li) => li.tagName === 'LI')
        .map((li) => li.textContent?.trim() || '');

      blocks.push({
        id: crypto.randomUUID(),
        type: 'list',
        ordered: el.tagName === 'OL',
        items,
      });

      return;
    }

    if (el.children.length === 0) {
      const text = el.textContent?.trim();
      if (text) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: text,
        });
      }
      return;
    }

    el.childNodes.forEach(processNode);
  };

  tempEl.childNodes.forEach(processNode);

  return blocks;
}

export function formatContentBlock(block: ContentBlock): string {
  switch (block.type) {
    case 'text':
      return block.content;
    case 'code':
      return `\`\`\`${block.language || ''}\n${block.code}\n\`\`\``;
    case 'inlineCode':
      return `\`${(block as any).code}\``;
    case 'list':
      return block.items
        .map((item, index) =>
          block.ordered ? `${index + 1}. ${item}` : `• ${item}`
        )
        .join('\n');
    case 'table':
      const headers = block.headers.join('|');
      const separator = block.headers.map(() => '---').join('|');
      const rows = block.rows.map((row) => row.join('|')).join('\n');
      return `| ${headers} |\n| ${separator} |\n| ${rows} |`;
    default:
      return '';
  }
}
