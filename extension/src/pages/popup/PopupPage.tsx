import { useEffect, useState } from 'react';
import { useExport } from '../../hooks/useExport';
import { useBlockStore, useSessionStore, useNotionStore } from '../../stores/index';
import { Brain, CheckCircle2 } from 'lucide-react';
import '../../styles/global.css';
import ExportCanvas from './components/ExportCanvas';
import QuickExport from './components/QuickExport';
import SaveNotion from './components/SaveNotion';
import NotionPageSelector from './NotionPageSelector';
export default function PopupPage() {
  const { blocks, initBlocks } = useBlockStore();
  const [page, setPage] = useState<'home' | 'notion'>('home');
  const { loadConversationId } = useSessionStore();
  const { loadNotionPageId } = useNotionStore();
  const { exportMD, exportTxt, exportPdf, exportHtml } = useExport(blocks);
  const messageCount = blocks.length;
  console.log('[Popup Canvas] blocks:', blocks);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const init = async () => {
      await loadConversationId();
      await initBlocks();
      await loadNotionPageId();
      setLoading(false);
      console.log('[Popup Canvas] blocks:', blocks);
    };

    init();
  }, [initBlocks, loadNotionPageId]);
  useEffect(() => {
    const listener = (changes: any, areaName: string) => {
      if (areaName !== 'local') return;

      if (changes['ai-canvas-blocks']) {
        initBlocks();
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [initBlocks]);
  const openCanvas = async () => {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length > 0) {
        try {
          await chrome.tabs.sendMessage(tabs[0].id!, {
            action: 'importConversation',
          });
        } catch (err) {
          console.log('Content script not available, skipping import');
        }
      }
    } catch (err) {
      console.error('Error importing conversation:', err);
    }

    const canvasTabs = await chrome.tabs.query({
      url: chrome.runtime.getURL('canvas.html*'),
    });
    if (canvasTabs.length > 0) {
      await chrome.tabs.update(canvasTabs[0].id!, { active: true });
      await chrome.windows.update(canvasTabs[0].windowId!, { focused: true });
    } else {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('canvas.html'),
      });
    }
  };
  if (loading) {
    return <div className="w-64 p-4">加载中...</div>;
  }
  return (
    <div className="w-80 p-4 bg-white rounded-xl shadow-lg ">
      {page === 'home' && (
        <div>
          <h2 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2 text-gray-800">
            <Brain size={20} className="text-primary" />
            AI Canvas
          </h2>

          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-success" />
            当前导出: {messageCount} 条消息
          </span>
          <ExportCanvas count={messageCount} onOpen={openCanvas} />
          <QuickExport
            exportFns={{ exportPdf, exportMD, exportTxt, exportHtml }}
          />
          <SaveNotion onGoNotion={() => setPage('notion')} />
        </div>
      )}
      {page === 'notion' && (
        <NotionPageSelector onBack={() => setPage('home')} />
      )}
    </div>
  );
}
