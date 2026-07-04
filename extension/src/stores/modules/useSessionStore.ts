import { create } from 'zustand';
import { createStorage } from '../../utils/storage';
interface SessionStore {
  conversationId: string | null;
  setConversationId: (id: string) => Promise<void>;
  loadConversationId: () => Promise<void>;
}
const sessionStorage = createStorage<{ conversationId: string | null }>(
  'ai-canvas-session'
);
export const useSessionStore = create<SessionStore>((set) => ({
  conversationId: null,
  setConversationId: async (id) => {
    await sessionStorage.set({ conversationId: id });
    set({ conversationId: id });
  },
  loadConversationId: async () => {
    const data = await sessionStorage.get();
    if (data) {
      set({ conversationId: data.conversationId });
    }
  },
}));
