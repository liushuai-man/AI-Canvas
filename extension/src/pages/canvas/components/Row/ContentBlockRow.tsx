import ContentBlock from '../BlockItem/components/ContentBlock';
import { useDragSort } from '../../../../hooks/useDragSort';
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
      {...listeners}
      style={style}
    >
      <ContentBlock block={block} contentBlock={contentBlock} />
    </div>
  );
}
