import ContentBlock from '../BlockItem/components/ContentBlock';
import { useDragSort } from '../../../../hooks/useDragSort';
import { GripVertical } from 'lucide-react';
import type {
  Block,
  ContentBlock as ContentBlockType,
} from '../../../../../../shared/types/block';
type Props = {
  block: Block;
  contentBlock: ContentBlockType;
};
export default function ContentBlockRow({ block, contentBlock }: Props) {
  const { attributes, listeners, setNodeRef, style } = useDragSort(
    contentBlock.id
  );
  return (
    <div
      key={contentBlock.id}
      ref={setNodeRef}
      {...attributes}
      style={style}
      className="relative group"
    >
      <div
        {...listeners}
        className="absolute -left-7 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={14} />
      </div>
      <ContentBlock block={block} contentBlock={contentBlock} />
    </div>
  );
}
