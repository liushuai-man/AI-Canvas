import { create } from 'zustand';

interface BlockEditIdStore {
  editId: string | null;
  setEditId: (id: string | null) => void;
}

export const useBlockEditIdStore = create<BlockEditIdStore>((set, get) => ({
  editId: null,
  setEditId: (id: string | null) => set({ editId: id }),
}));
