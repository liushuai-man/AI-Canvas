import type { Block } from '../../../../../../shared/types/block';
import { useCanvasStore, useBlockStore } from '../../../../stores/index';
import HeaderInfo from './components/HeaderInfo';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ContentBlockRow from '../Row/ContentBlockRow';
import '../../../../styles/global.css';
import '../../../../styles/markdown.css';

interface Props {
  block: Block;
  checked: boolean;
}

export default function BlockItem({ block, checked }: Props) {
  const { theme } = useCanvasStore();
  const { reorderContentBlocks } = useBlockStore();
  const isUser = block.role === 'user';

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderContentBlocks(block.id, String(active.id), String(over.id));
  };

  return (
    <div className="relative flex flex-col gap-2 px-6 py-6 transition-all duration-200">
      <HeaderInfo block={block} />

      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`
            w-fit max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed transition-all
            ${isUser ? `block-user-${theme}` : `block-ai-${theme}`}
            ${checked ? 'checked' : ''}
            shadow-sm
          `}
        >
          <DndContext
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <SortableContext
              items={block.contentBlocks.map((contentBlock) => contentBlock.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {block.contentBlocks?.map((contentBlock) => {
                  return (
                    <ContentBlockRow
                      key={contentBlock.id}
                      block={block}
                      contentBlock={contentBlock}
                    />
                  );
                }) || <div className="text-gray-500 text-sm">无内容</div>}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
