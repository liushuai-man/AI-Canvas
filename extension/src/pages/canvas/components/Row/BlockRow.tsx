import BlockItem from '../BlockItem/BlockItem';
import { useDragSort } from '../../../../../src/hooks/useDragSort';
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
      <div {...listeners} className="cursor-grab px-2 select-none">
        ☰
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
