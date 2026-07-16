import { createStorage } from '../../utils/storage';
import type { Block } from '../../../../shared/types/block';
import { extractorMap } from '../registry/extractorMap';
import { detectAI } from '../detect/detectAI';
import { getConversationId } from '../../utils/conversationId';
const blockStorage = createStorage<Record<string, Block[]>>('ai-canvas-blocks');

export async function importConversation() {
  console.log('[import] Starting import...');
  const ai = detectAI();
  console.log('[import] Detected AI:', ai);
  if (!ai) return 0;
  const extractor = extractorMap[ai];
  if (!extractor) return 0;
  const newBlocks = extractor();
  console.log('[import] Extracted blocks:', newBlocks.length);
  const id = getConversationId();
  console.log('[import] Conversation ID:', id);
  const map = (await blockStorage.get()) || {};
  const oldBlocks = map[id] || [];
  const merged = mergeBlocks(oldBlocks, newBlocks);
  map[id] = merged;
  await blockStorage.set(map);
  console.log('[import] Total blocks:', merged.length);
  return merged.length;
}

function mergeBlocks(oldBlocks: Block[], newBlocks: Block[]) {
  const result = [...oldBlocks];
  
  for (const newBlock of newBlocks) {
    // 检查是否已存在相同的 block（通过比较内容）
    const exists = result.some((b) => {
      if (b.role !== newBlock.role) return false;
      if (b.contentBlocks.length !== newBlock.contentBlocks.length) return false;
      
      // 检查内容是否相同
      return b.contentBlocks.every((block, index) => {
        const newBlockContent = newBlock.contentBlocks[index];
        if (block.type !== newBlockContent.type) return false;

        if (block.type === 'text' && newBlockContent.type === 'text') {
          return block.content === newBlockContent.content;
        }
        if (block.type === 'code' && newBlockContent.type === 'code') {
          return block.code === newBlockContent.code;
        }
        if (block.type === 'list' && newBlockContent.type === 'list') {
          return JSON.stringify(block.items) === JSON.stringify(newBlockContent.items);
        }
        if (block.type === 'table' && newBlockContent.type === 'table') {
          return JSON.stringify(block.headers) === JSON.stringify(newBlockContent.headers) &&
                 JSON.stringify(block.rows) === JSON.stringify(newBlockContent.rows);
        }
        if (block.type === 'image' && newBlockContent.type === 'image') {
          return block.src === newBlockContent.src;
        }
        return false;
      });
    });

    if (!exists) {
      result.push(newBlock);
    }
  }

  return result;
}
