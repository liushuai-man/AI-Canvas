import type { Block, Source } from '../../../../shared/types/block';
import { normalizeChatGPTRole } from '../adapters/role';
import { parseContentToBlocks } from '../../hooks/useContentFormat';

function normalizeCodeText(code: string) {
  return code
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n+$/, '');
}

function extractCodeFromPre(pre: HTMLElement) {
  const codeEl = pre.querySelector('code');

  if (codeEl) {
    const renderedCode =
      codeEl.innerText || pre.innerText || codeEl.textContent || '';
    return normalizeCodeText(renderedCode);
  }

  return normalizeCodeText(pre.innerText || pre.textContent || '');
}

export function extractChatGPT(): Block[] {
  const nodes = document.querySelectorAll('[data-message-author-role]');
  return Array.from(nodes)
    .map((el) => {
      const rawRole = el.getAttribute('data-message-author-role');
      // 使用整个消息元素来确保能获取到所有图片
      const clone = el.cloneNode(true) as HTMLElement;
      const originalPres = Array.from(
        el.querySelectorAll('pre')
      ) as HTMLElement[];

      clone
        .querySelectorAll(
          '.flex.items-center.relative.text-token-text-secondary'
        )
        .forEach((h) => h.remove());
      // 移除按钮和辅助元素，但保留图片和svg
      clone
        .querySelectorAll('button, .sr-only')
        .forEach((item) => item.remove());

      // 处理图片 - 确保图片 src 正确
      clone.querySelectorAll('img').forEach((img) => {
        // 如果图片没有 src 或者 src 是空的，尝试从 data-src 或其他属性获取
        if (!img.getAttribute('src')) {
          const dataSrc = img.getAttribute('data-src') || img.getAttribute('data-original');
          if (dataSrc) {
            img.setAttribute('src', dataSrc);
          }
        }
        // 移除懒加载属性，确保图片可以被正确处理
        img.removeAttribute('loading');
      });

      // 将 ChatGPT 的代码块标准化为纯文本，避免每行包裹元素导致换行丢失。
      clone.querySelectorAll('pre').forEach((pre, index) => {
        const originalPre = originalPres[index];
        const normalizedCode = extractCodeFromPre(originalPre || pre);
        const originalCodeEl = originalPre?.querySelector('code');
        const clonedCodeEl = pre.querySelector('code');
        const codeEl = document.createElement('code');

        codeEl.textContent = normalizedCode;
        codeEl.className =
          originalCodeEl?.className || clonedCodeEl?.className || '';

        pre.replaceChildren(codeEl);
      });

      const contentBlocks = parseContentToBlocks(clone.innerHTML);

      return {
        id: crypto.randomUUID(),
        contentBlocks: contentBlocks,
        source: 'chatgpt' as Source,
        createdAt: Date.now(),
        role: normalizeChatGPTRole(rawRole),
      };
    })
    .filter((block) => block.contentBlocks.length > 0);
}
