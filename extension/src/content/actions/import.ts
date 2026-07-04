import { createStorage } from '../../utils/storage';
import type { Block } from '../../../../shared/types/block';
import { extractorMap } from '../registry/extractorMap';
import { detectAI } from '../detect/detectAI';
import { getConversationId } from '../../utils/conversationId';
const blockStorage = createStorage<Record<string, Block[]>>('ai-canvas-blocks');

export async function importConversation() {
  const ai = detectAI();
  if (!ai) return 0;
  const extractor = extractorMap[ai];
  if (!extractor) return 0;
  const newBlocks = extractor();
  const id = getConversationId();
  const map = (await blockStorage.get()) || {};
  const oldBlocks = map[id] || [];
  const merged = mergeBlocks(oldBlocks, newBlocks);
  map[id] = merged;
  await blockStorage.set(map);
  return merged.length - oldBlocks.length;
}

function mergeBlocks(oldBlocks: Block[], newBlocks: Block[]) {
  const result = [...oldBlocks];
  for (const newBlock of newBlocks) {
    const last = result[result.length - 1];
    if (last && last.role === newBlock.role) {
      const mergedContentBlocks = [
        ...last.contentBlocks,
        ...newBlock.contentBlocks,
      ];
      last.contentBlocks = mergedContentBlocks;
      continue;
    }
    const exists = result.some((b) => {
      if (b.role !== newBlock.role) return false;
      if (b.contentBlocks.length !== newBlock.contentBlocks.length)
        return false;
      // 检查内容是否相同
      return b.contentBlocks.every((block, index) => {
        const newBlockContent = newBlock.contentBlocks[index];
        if (block.type !== newBlockContent.type) return false;

        // 使用类型守卫确保 TypeScript 正确识别类型
        if (block.type === 'text' && newBlockContent.type === 'text') {
          return block.content === newBlockContent.content;
        }
        if (block.type === 'code' && newBlockContent.type === 'code') {
          return (
            block.code === newBlockContent.code &&
            block.language === newBlockContent.language
          );
        }
        if (block.type === 'list' && newBlockContent.type === 'list') {
          return (
            block.ordered === newBlockContent.ordered &&
            JSON.stringify(block.items) ===
              JSON.stringify(newBlockContent.items)
          );
        }
        if (block.type === 'table' && newBlockContent.type === 'table') {
          return (
            JSON.stringify(block.headers) ===
              JSON.stringify(newBlockContent.headers) &&
            JSON.stringify(block.rows) === JSON.stringify(newBlockContent.rows)
          );
        }
        return true;
      });
    });

    if (!exists) {
      result.push(newBlock);
    }
  }

  return result;
}
