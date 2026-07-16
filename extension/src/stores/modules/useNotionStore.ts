import { create } from 'zustand';
import { createStorage } from '../../utils/storage';
import { NotionPageData } from '../../../../shared/types/notion';

interface NotionStore {
  notionPageId: string | null;
  notionPages: NotionPageData[];
  userId: string | null;
  isLoggedIn: boolean;
  setNotionPageId: (id: string | null) => Promise<void>;
  setNotionPages: (pages: NotionPageData[]) => void;
  setUserId: (id: string | null) => Promise<void>;
  loadNotionPageId: () => Promise<void>;
  loadDefaultPage: (pages: NotionPageData[]) => Promise<void>;
  getPageTitleById: (pageId: string) => string;
  clearNotionData: () => Promise<void>;
}

const notionStorage = createStorage<{
  notionPageId: string | null;
  userId: string | null;
}>('ai-canvas-notion');

const getDefaultStorage = (): {
  notionPageId: string | null;
  userId: string | null;
} => ({
  notionPageId: null,
  userId: null,
});

export const useNotionStore = create<NotionStore>((set, get) => ({
  notionPageId: null,
  notionPages: [],
  userId: null,
  isLoggedIn: false,

  setNotionPageId: async (id: string | null) => {
    const current = (await notionStorage.get()) || getDefaultStorage();
    const updated = { ...current, notionPageId: id };
    await notionStorage.set(updated);
    set({ notionPageId: id });
  },

  setNotionPages: (pages: NotionPageData[]) => {
    set({ notionPages: pages });
  },

  setUserId: async (id: string | null) => {
    const current = (await notionStorage.get()) || getDefaultStorage();
    await notionStorage.set({ ...current, userId: id });
    set({ userId: id, isLoggedIn: !!id });
  },

  loadNotionPageId: async () => {
    const data = await notionStorage.get();
    if (data) {
      set({
        notionPageId: data.notionPageId,
        userId: data.userId,
        isLoggedIn: !!data.userId,
      });
    }
  },

  loadDefaultPage: async (pages: NotionPageData[]) => {
    const data = (await notionStorage.get()) || getDefaultStorage();
    if (data && data.notionPageId) {
      set({ notionPageId: data.notionPageId });
    } else if (pages.length > 0) {
      const defaultPageId = pages[0].id;
      const updated = { ...data, notionPageId: defaultPageId };
      await notionStorage.set(updated);
      set({ notionPageId: defaultPageId });
    }
  },

  getPageTitleById: (pageId: string) => {
    const { notionPages } = get();
    const page = notionPages.find((page) => page.id === pageId);
    return page ? page.title : 'Untitled';
  },

  clearNotionData: async () => {
    await notionStorage.set(getDefaultStorage());
    set({
      notionPageId: null,
      userId: null,
      isLoggedIn: false,
      notionPages: [],
    });
  },
}));
