import { detectAI } from '../src/content/detect/detectAI';
import { injectImportButton } from '../src/content/ui/ImportButton';
import { importConversation } from '../src/content/actions/import';
import { useBlockStore, useSessionStore } from '../src/stores/index';
import { debounce } from '../src/utils/debounce';
import { getConversationId } from '../src/utils/conversationId';

let lastId: string | null = null;
let initialized = false;
function init() {
  const ai = detectAI();
  if (!ai) return;

  if (initialized) return;
  initialized = true;
  injectImportButton();
}
const debouncedImport = debounce(() => {
  importConversation();
}, 600);

const ContentScript = {
  matches: ['<all_urls>'],
  async main() {
    init();
    const firstId = getConversationId();

    if (firstId && firstId !== 'temp') {
      lastId = firstId;
      await useSessionStore.getState().setConversationId(firstId);
      await useBlockStore.getState().initBlocks();
    }
    const observer = new MutationObserver(async () => {
      const newId = getConversationId();
      if (!newId || newId === 'temp') return;
      if (newId !== lastId) {
        lastId = newId;
        await useSessionStore.getState().setConversationId(newId);
        await useBlockStore.getState().initBlocks();
        debouncedImport();
        return;
      }
      debouncedImport();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    if (!(window as any).__AI_CANVAS_LISTENER__) {
      (window as any).__AI_CANVAS_LISTENER__ = true;

      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'importConversation') {
          importConversation()
            .then((count) => sendResponse({ success: true, count }))
            .catch((err) =>
              sendResponse({ success: false, error: err.message })
            );
          return true;
        }
      });
    }
  },
};

export default ContentScript;
