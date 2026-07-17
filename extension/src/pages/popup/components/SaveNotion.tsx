import { useState } from 'react';
import { Database, Save, LogIn, LogOut, CheckCircle } from 'lucide-react';
import { useNotionStore, useBlockStore } from '../../../stores/index';
import { useNotion } from '../../../hooks/useNotion';

interface SaveNotionProps {
  onGoNotion: () => void;
}

export default function SaveNotion({ onGoNotion }: SaveNotionProps) {
  const { notionPageId, userId, setUserId } = useNotionStore();
  const { handleSaveNotion, startAuth, logout, isLoading } = useNotion();
  const { blocks } = useBlockStore();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!notionPageId) {
      alert('请先选择一个 Notion 页面');
      return;
    }
    // 从 Block[] 中提取 ContentBlock[]
    const contentBlocks = blocks.flatMap((block) => block.contentBlocks);
    if (contentBlocks.length === 0) {
      alert('没有可保存的内容');
      return;
    }
    // 添加标题 block
    const titleBlock = {
      id: crypto.randomUUID(),
      type: 'text' as const,
      content: `AI Canvas 导出 - ${new Date().toLocaleString()}`,
    };
    const blocksWithTitle = [titleBlock, ...contentBlocks];
    const success = await handleSaveNotion(
      notionPageId,
      blocksWithTitle,
      userId || undefined
    );
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleLogin = () => {
    startAuth();
  };

  const handleLogout = async () => {
    if (userId) {
      await logout(userId);
      await setUserId(null);
    }
  };

  return (
    <div className="p-3">
      <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1">
          保存到 Notion
          <span className="text-gray-400 text-xs">?</span>
        </span>
        {!userId ? (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            未登录
          </span>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <LogOut size={12} />
            退出登录
          </button>
        )}
      </div>

      {!userId ? (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <Database size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500 mb-2">请先登录 Notion 账户</p>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex items-center gap-1 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <LogIn size={14} />
            {isLoading ? '登录中...' : '登录 Notion'}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onGoNotion}
            className="flex-1 flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <div className="flex items-center gap-2">
              <Database size={16} className="text-gray-500" />
              <span>{notionPageId ? '已选择页面' : '选择页面'}</span>
            </div>
            <span className="text-gray-400">▼</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !notionPageId || saveSuccess}
            className={`w-24 flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              saveSuccess
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle size={14} />
                已保存
              </>
            ) : (
              <>
                <Save size={14} />
                {isLoading ? '保存中...' : '保存'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
