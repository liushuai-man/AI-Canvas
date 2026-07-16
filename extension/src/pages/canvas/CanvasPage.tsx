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
    loadConversationId();
    loadNotionPageId();
  }, [loadConversationId, loadNotionPageId]);
  useEffect(() => {
    if (conversationId) {
      console.log('[Canvas] 会话 ID 变化:', conversationId);
      initBlocks();
    }
  }, [conversationId, initBlocks]);

  useEffect(() => {
    const listener = (changes: any, areaName: string) => {
      if (areaName !== 'local') return;
      if (changes['ai-canvas-session']) {
        loadConversationId();
      }
      if (changes['ai-canvas-blocks']) {
        initBlocks();
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
