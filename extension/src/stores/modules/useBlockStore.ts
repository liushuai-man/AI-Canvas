import { create } from 'zustand';
import { createStorage } from '../../utils/storage';
import type { Block } from '../../../../shared/types/block';
import { useSessionStore } from './useSessionStore';
import { reorderBlocks, reorderContentBlocks } from '../../hooks/useDragSort';

export interface BlockStore {
  blocks: Block[];
  blockMap: Record<string, Block[]>;
  selectedBlockIds: Set<string>;
  initBlocks: () => Promise<void>;
  setBlocks: (blocks: Block[]) => void;
  addBlock: (block: Omit<Block, 'id' | 'createdAt'>) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  clearBlocks: () => void;
  toggleBlockSelection: (id: string) => void;
  selectAllBlocks: () => void;
  clearSelection: () => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  reorderContentBlocks: (
    blockId: string,
    activeId: string,
    overId: string
  ) => void;
}

const blockStorage = createStorage<Record<string, Block[]>>('ai-canvas-blocks');

export const useBlockStore = create<BlockStore>((set, get) => ({
  blocks: [],
  blockMap: {},
  selectedBlockIds: new Set(),
  initBlocks: async () => {
    const sessionId = useSessionStore.getState().conversationId;
    if (!sessionId) return;
    const data = await blockStorage.get();
    const map = data || {};
    const currentBlocks = map[sessionId] || [];
    set({
      blocks: currentBlocks,
      blockMap: map,
      selectedBlockIds: new Set(currentBlocks.map((b) => b.id)),
    });
  },
  setBlocks: (blocks) => {
    const sessionId = useSessionStore.getState().conversationId;
    if (!sessionId) return;
    const { blockMap } = get();
    const newMap = {
      ...blockMap,
      [sessionId]: blocks,
    };

    blockStorage.set(newMap);

    set({
      blocks,
      blockMap: newMap,
    });
  },
  addBlock: (block) =>
    set((state) => {
      const sessionId = useSessionStore.getState().conversationId;
      if (!sessionId) return state;

      const newBlock: Block = {
        ...block,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      const newBlocks = [...state.blocks, newBlock];
      const newMap = {
        ...state.blockMap,
        [sessionId]: newBlocks,
      };
      blockStorage.set(newMap);
      return {
        blocks: newBlocks,
        blockMap: newMap,
      };
    }),
  updateBlock: (id, updates) =>
    set((state) => {
      const sessionId = useSessionStore.getState().conversationId;
      if (!sessionId) return state;

      const newBlocks = state.blocks.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      );
      const newMap = {
        ...state.blockMap,
        [sessionId]: newBlocks,
      };
      blockStorage.set(newMap);
      return {
        blocks: newBlocks,
        blockMap: newMap,
      };
    }),
  deleteBlock: (id) =>
    set((state) => {
      const sessionId = useSessionStore.getState().conversationId;
      if (!sessionId) return state;
      const newBlocks = state.blocks.filter((b) => b.id !== id);
      const newMap = {
        ...state.blockMap,
        [sessionId]: newBlocks,
      };
      blockStorage.set(newMap);
      return {
        blocks: newBlocks,
        blockMap: newMap,
      };
    }),

  clearBlocks: () => {
    const sessionId = useSessionStore.getState().conversationId;
    if (!sessionId) return;
    const { blockMap } = get();
    const newMap = {
      ...blockMap,
      [sessionId]: [],
    };
    blockStorage.set(newMap);
    set({
      blocks: [],
      blockMap: newMap,
      selectedBlockIds: new Set(),
    });
  },
  toggleBlockSelection: (id) =>
    set((state) => {
      const newSet = new Set(state.selectedBlockIds);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return { selectedBlockIds: newSet };
    }),

  selectAllBlocks: () =>
    set((state) => ({
      selectedBlockIds: new Set(state.blocks.map((b) => b.id)),
    })),

  clearSelection: () => set({ selectedBlockIds: new Set() }),
  reorderBlocks: (activeId, overId) =>
    set((state) => ({
      blocks: reorderBlocks(state.blocks, activeId, overId),
    })),

  reorderContentBlocks: (blockId, activeId, overId) =>
    set((state) => ({
      blocks: reorderContentBlocks(state.blocks, blockId, activeId, overId),
    })),
}));
