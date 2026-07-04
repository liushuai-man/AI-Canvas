import { Database, Save, LogIn, LogOut } from 'lucide-react';
import { useNotionStore, useBlockStore } from '../../../stores/index';
import { useNotion } from '../../../hooks/useNotion';

interface SaveNotionProps {
  onGoNotion: () => void;
}

export default function SaveNotion({ onGoNotion }: SaveNotionProps) {
  const { notionPageId, userId, setUserId } = useNotionStore();
  const { handleSaveNotion, startAuth, logout, isLoading } = useNotion();
  const { blocks } = useBlockStore();

  const handleSave = async () => {
    if (!notionPageId) {
      alert('请先选择一个 Notion 页面');
      return;
    }
    const success = await handleSaveNotion(
      notionPageId,
      blocks,
      userId || undefined
    );
    if (success) {
      alert('保存成功！');
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
    <div className="mt-4 mb-4">
      <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1">
          保存到 Notion
          <span className="text-gray-400 text-xs">?</span>
        </span>
        {!userId ? (
          <button
            onClick={handleLogin}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <LogIn size={12} />
            登录
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <LogOut size={12} />
            退出
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
            disabled={isLoading || !notionPageId}
            className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={14} />
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      )}
    </div>
  );
}
