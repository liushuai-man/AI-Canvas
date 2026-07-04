import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Block } from '../../../shared/types/block';
import { reorderList } from '../utils/reorderList';
export function useDragSort(id: string) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return {
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging,
  };
}
export function reorderBlocks(
  blocks: Block[],
  activeId: string,
  overId: string
): Block[] {
  return reorderList(blocks, activeId, overId);
}

export function reorderContentBlocks(
  blocks: Block[],
  blockId: string,
  activeId: string,
  overId: string
): Block[] {
  return blocks.map((block) => {
    if (block.id !== blockId) return block;

    return {
      ...block,
      contentBlocks: reorderList(block.contentBlocks, activeId, overId),
    };
  });
}