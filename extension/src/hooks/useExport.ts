import { blocksToMarkdown, toTXT, toPDF, toHTML } from '../utils/transFormat';
import { downloadFile } from '../utils/download';
import type { Block } from '../../../shared/types/block';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// 检查内容中是否有图片
function hasImages(blocks: Block[]): boolean {
  return blocks.some(block => {
    const contentBlocks = block.contentBlocks || [];
    return contentBlocks.some((cb: any) => cb.type === 'image');
  });
}

// 提取所有图片 URL
function extractImageUrls(blocks: Block[]): string[] {
  const urls: string[] = [];
  blocks.forEach(block => {
    const contentBlocks = block.contentBlocks || [];
    contentBlocks.forEach((cb: any) => {
      if (cb.type === 'image' && cb.src) {
        urls.push(cb.src);
      }
    });
  });
  return [...new Set(urls)]; // 去重
}

// 下载图片并返回 Blob
async function fetchImageAsBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      return await response.blob();
    }
  } catch (e) {
    console.warn('Failed to fetch image:', url, e);
  }
  return null;
}

// 导出为 ZIP 文件（包含图片）
async function exportWithImages(
  blocks: Block[],
  contentGenerator: (blocks: Block[], imagePathMap: Map<string, string>) => string,
  fileExtension: string,
  mimeType: string,
  defaultFilename: string
) {
  const zip = new JSZip();
  const imgFolder = zip.folder('images')!;
  const imageUrls = extractImageUrls(blocks);
  const imagePathMap = new Map<string, string>();
  
  // 下载所有图片
  let imageIndex = 1;
  for (const url of imageUrls) {
    const blob = await fetchImageAsBlob(url);
    if (blob) {
      // 根据 URL 确定文件扩展名
      let ext = 'png';
      if (url.includes('.jpg') || url.includes('.jpeg')) ext = 'jpg';
      else if (url.includes('.gif')) ext = 'gif';
      else if (url.includes('.webp')) ext = 'webp';
      else if (url.includes('.svg')) ext = 'svg';
      
      const filename = `image-${imageIndex}.${ext}`;
      imgFolder.file(filename, blob);
      imagePathMap.set(url, `images/${filename}`);
      imageIndex++;
    } else {
      // 如果下载失败，保留原始 URL
      imagePathMap.set(url, url);
    }
  }
  
  // 生成内容
  const content = contentGenerator(blocks, imagePathMap);
  zip.file(defaultFilename, content);
  
  // 生成 ZIP 文件并下载
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${defaultFilename.replace(`.${fileExtension}`, '')}.zip`);
}

export function useExport(blocks: Block[]) {
  const exportMD = async () => {
    await importContent(blocks);
    if (!validateBlocks(blocks)) return;
    
    if (hasImages(blocks)) {
      await exportWithImages(
        blocks,
        (blocks, imagePathMap) => blocksToMarkdown(blocks, imagePathMap),
        'md',
        'text/markdown',
        'ai-canvas.md'
      );
    } else {
      const content = blocksToMarkdown(blocks);
      downloadFile(content, 'ai-canvas.md', 'text/markdown');
    }
  };

  const exportTxt = async () => {
    await importContent(blocks);
    if (!validateBlocks(blocks)) return;
    
    if (hasImages(blocks)) {
      await exportWithImages(
        blocks,
        (blocks, imagePathMap) => toTXT(blocks, imagePathMap),
        'txt',
        'text/plain',
        'ai-canvas.txt'
      );
    } else {
      const content = toTXT(blocks);
      downloadFile(content, 'ai-canvas.txt', 'text/plain');
    }
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
