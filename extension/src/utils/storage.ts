export function createStorage<T>(key: string) {
  return {
    async get(): Promise<T | null> {
      const result = await chrome.storage.local.get(key);
      return (result[key] as T) ?? null;
    },

    async set(value: T) {
      await chrome.storage.local.set({ [key]: value });
    },

    async clear() {
      await chrome.storage.local.remove(key);
    },
  };
}
