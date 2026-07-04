import { arrayMove } from '@dnd-kit/sortable';

export function reorderList<T extends { id: string }>(
  list: T[],
  activeId: string,
  overId: string
): T[] {
  const oldIndex = list.findIndex((item) => item.id === activeId);
  const newIndex = list.findIndex((item) => item.id === overId);

  if (oldIndex === -1 || newIndex === -1) return list;

  return arrayMove(list, oldIndex, newIndex);
}
