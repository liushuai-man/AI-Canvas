import TurndownService from 'turndown';

function createTurndown() {
  const td = new TurndownService({
    codeBlockStyle: 'fenced',
    headingStyle: 'atx',
    bulletListMarker: '-',
  });
  td.addRule('removeUnwanted', {
    filter: function (node) {
      return (
        node.nodeName === 'BUTTON' ||
        node.nodeName === 'SCRIPT' ||
        node.nodeName === 'STYLE' ||
        node.nodeName === 'SVG' ||
        (node instanceof HTMLElement && node.classList.contains('sr-only'))
      );
    },
    replacement: () => '',
  });
  td.addRule('codeBlock', {
    filter: function (node) {
      return node.nodeName === 'PRE';
    },
    replacement: function (content, node: Node) {
      if (!(node instanceof HTMLElement)) return '';

      const codeElement = node.querySelector('code');
      if (!codeElement) {
        const fallbackText = (node.textContent || '')
          .trimEnd();
        return `\n\n\`\`\`\n${fallbackText}\n\`\`\`\n\n`;
      }

      let language = '';
      const classList = Array.from(codeElement.classList);
      const langClass = classList.find((c) => c.startsWith('language-'));
      if (langClass) {
        language = langClass.replace('language-', '');
      }
      // 保留原始换行符，只去除首尾空白和替换nbsp
      const text = (codeElement.textContent || '')
        .replace(/\u00a0/g, ' ')
        .trimEnd();

      return `\n\n\`\`\`${language}\n${text}\n\`\`\`\n\n`;
    },
  });

  return td;
}

const turndown = createTurndown();
export function htmlToMarkdown(html: string) {
  return turndown.turndown(html).trim();
}
