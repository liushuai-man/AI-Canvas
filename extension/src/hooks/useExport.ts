import { blocksToMarkdown, toTXT, toPDF, toHTML } from '../utils/transFormat';
import { downloadFile } from '../utils/download';
import type { Block } from '../../../shared/types/block';

export function useExport(blocks: Block[]) {
  const exportMD = async () => {
    await importContent(blocks);
    if (!validateBlocks(blocks)) return;
    const content = blocksToMarkdown(blocks);
    downloadFile(content, 'ai-canvas.md', 'text/markdown');
  };

  const exportTxt = async () => {
    await importContent(blocks);
    if (!validateBlocks(blocks)) return;
    const content = toTXT(blocks);
    downloadFile(content, 'ai-canvas.txt', 'text/plain');
  };

  const exportPdf = async () => {
    await importContent(blocks);
    if (!validateBlocks(blocks)) return;
    toPDF(blocks);
  };

  const exportHtml = async () => {
    await importContent(blocks);
    if (!validateBlocks(blocks)) return;
    const content = toHTML(blocks);
    downloadFile(content, 'ai-canvas.html', 'text/html');
  };

  const copyToClipboard = async () => {
    await importContent(blocks);
    if (!validateBlocks(blocks)) return;
    const content = blocksToMarkdown(blocks);
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {}
  };
  return {
    exportMD,
    exportTxt,
    exportPdf,
    exportHtml,
    copyToClipboard,
  };
}

export const validateBlocks = (content: any[]) => {
  if (!content || content.length === 0) {
    alert('正在抓取内容，请稍候...');
    return false;
  }
  return true;
};

export function getSelectedBlocks(blocks: Block[], selectedIds: string[]) {
  return blocks.filter((b) => selectedIds.includes(b.id));
}

export const importContent = async (blocks: Block[]) => {
  if (blocks.length === 0) {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs.length > 0) {
      await chrome.tabs.sendMessage(tabs[0].id!, {
        action: 'importConversation',
      });
    }
  }
};
