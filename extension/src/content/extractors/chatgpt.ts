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
  console.log('[extractChatGPT] Found nodes:', nodes.length);
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
      
      // 处理包含图片的 button - 将图片提取出来放到父元素中
      clone.querySelectorAll('button').forEach((button) => {
        const img = button.querySelector('img');
        if (img) {
          // 清理图片 src
          let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
          src = src.replace(/`/g, '').trim();
          
          let alt = img.getAttribute('alt') || '';
          alt = alt.replace(/`/g, '').trim();
          
          // 过滤掉 favicon 和小图标
          const isFavicon = src.includes('favicon') || 
                           src.includes('google.com/s2/favicons') ||
                           src.includes('favicon.ico');
          
          if (src && src.startsWith('http') && !isFavicon) {
            // 创建新的 img 元素
            const newImg = document.createElement('img');
            newImg.setAttribute('src', src);
            if (alt) newImg.setAttribute('alt', alt);
            newImg.style.maxWidth = '100%';
            newImg.style.height = 'auto';
            newImg.style.display = 'block';
            newImg.style.margin = '8px 0';
            newImg.style.borderRadius = '8px';
            
            // 将图片插入到 button 前面
            button.parentNode?.insertBefore(newImg, button);
          }
          // 移除 button
          button.remove();
        }
      });
      
      // 移除其他按钮和辅助元素
      clone
        .querySelectorAll('button:not(:has(img)), .sr-only')
        .forEach((item) => item.remove());

      // 处理图片 - 确保图片 src 正确
      clone.querySelectorAll('img').forEach((img) => {
        // 清理 src 属性中的反引号和空格
        let src = img.getAttribute('src') || '';
        src = src.replace(/`/g, '').trim();
        
        // 如果图片没有 src 或者 src 是空的，尝试从 data-src 或其他属性获取
        if (!src) {
          src = img.getAttribute('data-src') || img.getAttribute('data-original') || '';
          src = src.replace(/`/g, '').trim();
        }
        
        if (src) {
          img.setAttribute('src', src);
        }
        
        // 同样清理 alt 属性
        let alt = img.getAttribute('alt') || '';
        alt = alt.replace(/`/g, '').trim();
        if (alt) {
          img.setAttribute('alt', alt);
        }
        
        // 移除懒加载属性，确保图片可以被正确处理
        img.removeAttribute('loading');
        // 确保图片有正确的 display 样式
        img.style.display = 'block';
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

      // 使用 parseContentToBlocks 解析内容
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
