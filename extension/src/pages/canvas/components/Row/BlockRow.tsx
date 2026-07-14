import BlockItem from '../BlockItem/BlockItem';
import { useDragSort } from '../../../../../src/hooks/useDragSort';
import { GripVertical } from 'lucide-react';
import type { Block } from '../../../../../../shared/types/block';

type Props = {
  block: Block;
  isChecked: boolean;
  toggleBlockSelection: (id: string) => void;
};
export default function BlockRow({
  block,
  isChecked,
  toggleBlockSelection,
}: Props) {
  const { attributes, listeners, setNodeRef, style } = useDragSort(block.id);
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      className="group relative flex items-start px-4"
    >
      <div
        {...listeners}
        className="cursor-grab px-1 py-8 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
      >
        <GripVertical size={16} />
      </div>
      <div className="flex-shrink-0 w-8 flex justify-center pt-8">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleBlockSelection(block.id)}
        />
      </div>

      <div className="flex-1 min-w-0">
        <BlockItem block={block} checked={isChecked} />
      </div>
    </div>
  );
}
