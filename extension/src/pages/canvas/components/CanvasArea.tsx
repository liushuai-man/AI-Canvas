import {
  useBlockStore,
  useCanvasStore,
  BlockStore,
} from '../../../../src/stores/index';
import EmptyState from '../../../../src/components/EmptyState';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import BlockRow from './Row/BlockRow';



export default function CanvasArea() {
  const { blocks, selectedBlockIds, toggleBlockSelection, reorderBlocks } = useBlockStore(
    (state: BlockStore) => state
  );
  const { width, theme } = useCanvasStore();
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
     if (!over || active.id === over.id) return;

     if (over.data.current?.sortable.containerId === 'blocks') {
       reorderBlocks(String(active.id), String(over.id));
     }
  };

  return (
    <div
      id="canvas-root"
      className={`
        w-full mx-auto rounded-2xl border transition-canvas
        width-${width} canvas-theme-${theme}
      `}
    >
      {blocks.length > 0 ? (
        <DndContext
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <SortableContext
            items={blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="py-4">
              {blocks.map((block) => {
                const isChecked = selectedBlockIds.has(block.id);
                return (
                  <BlockRow
                    key={block.id}
                    block={block}
                    isChecked={isChecked}
                    toggleBlockSelection={toggleBlockSelection}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
