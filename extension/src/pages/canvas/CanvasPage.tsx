import { useEffect } from 'react';
import {
  useBlockStore,
  useSessionStore,
  useNotionStore,
} from '../../stores/index';
import Header from './components/Header';
import CanvasArea from './components/CanvasArea';
import FloatingToolbar from './components/FloatingToolbar';
import '../../styles/global.css';

export default function CanvasPage() {
  const { initBlocks } = useBlockStore();
  const { conversationId, loadConversationId } = useSessionStore();
  const { loadNotionPageId } = useNotionStore();

  useEffect(() => {
    console.log('[Canvas] Initializing...');
    loadConversationId();
    loadNotionPageId();
  }, [loadConversationId, loadNotionPageId]);
  useEffect(() => {
    console.log('[Canvas] conversationId changed:', conversationId);
    if (conversationId) {
      initBlocks();
    }
  }, [conversationId, initBlocks]);

  useEffect(() => {
    const listener = (changes: any, areaName: string) => {
      if (areaName !== 'local') return;
      console.log('[Canvas] Storage changed:', Object.keys(changes));
      if (changes['ai-canvas-session']) {
        console.log('[Canvas] Session changed, reloading...');
        loadConversationId();
      }
      if (changes['ai-canvas-blocks']) {
        // 只有当 conversationId 存在时才重新加载 blocks
        const currentSessionId = useSessionStore.getState().conversationId;
        console.log('[Canvas] Blocks changed, currentSessionId:', currentSessionId);
        if (currentSessionId) {
          initBlocks();
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [initBlocks, loadConversationId]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-300 bg-[#e5e7eb]`}
    >
      <Header />
      <main className="flex-1  flex justify-center pt-6 pb-20">
        <CanvasArea />
      </main>
      <FloatingToolbar />
    </div>
  );
}
