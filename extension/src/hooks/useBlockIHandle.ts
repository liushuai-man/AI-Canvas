import { useBlockStore, useBlockEditIdStore } from '../stores/index';
import type { Block, ContentBlock } from '../../../shared/types/block';

type Params = {
  block: Block;
};

export function useBlockHandle({ block }: Params) {
  const { updateBlock, addBlock, deleteBlock, clearBlocks } = useBlockStore();
  const { editId, setEditId } = useBlockEditIdStore();
  const startEdit = (contentBlockId: string) => {
    setEditId(contentBlockId);
  };

  const endEdit = () => {
    setEditId(null);
  };

  const addContentBlock = (type: ContentBlock['type']) => {
    let newContentBlock: ContentBlock;

    switch (type) {
      case 'text':
        newContentBlock = {
          id: crypto.randomUUID(),
          type: 'text',
          content: '',
        };
        break;
      case 'code':
        newContentBlock = {
          id: crypto.randomUUID(),
          type: 'code',
          language: null,
          code: '',
        };
        break;
      case 'list':
        newContentBlock = {
          id: crypto.randomUUID(),
          type: 'list',
          ordered: false,
          items: [],
        };
        break;
      case 'table':
        newContentBlock = {
          id: crypto.randomUUID(),
          type: 'table',
          headers: [],
          rows: [],
        };
        break;
      default:
        return;
    }

    updateBlock(block.id, {
      contentBlocks: [...block.contentBlocks, newContentBlock],
    });
  };

  // 删除内容块
  const deleteContentBlock = (contentBlockId: string) => {
    updateBlock(block.id, {
      contentBlocks: block.contentBlocks.filter((b) => b.id !== contentBlockId),
    });
  };

  // 删除整个 block
  const deleteBlockById = () => {
    deleteBlock(block.id);
  };

  // 清空 block 的内容
  const clearBlockContent = () => {
    updateBlock(block.id, {
      contentBlocks: [],
    });
  };

  return {
    editId,
    startEdit,
    endEdit,
    addContentBlock,
    deleteContentBlock,
    deleteBlockById,
    clearBlockContent,
  };
}
