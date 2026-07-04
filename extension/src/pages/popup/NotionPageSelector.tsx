import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, RefreshCw } from 'lucide-react';
import { useNotion } from '../../hooks/useNotion';
import { useNotionStore } from '../../stores/index';
import { NotionPageData } from '../../../../shared/types/notion';

interface NotionPageSelectorProps {
  onBack: () => void;
}

export default function NotionPageSelector({
  onBack,
}: NotionPageSelectorProps) {
  const [pages, setPages] = useState<NotionPageData[]>([]);
  const { getNotionPages, isLoading, error } = useNotion();
  const { setNotionPageId, loadDefaultPage, notionPageId } = useNotionStore();

  async function fetchPages() {
    const fetchedPages = await getNotionPages();
    setPages(fetchedPages);
    await loadDefaultPage(fetchedPages);
  }
  
  useEffect(() => {
    fetchPages();
  }, []);
  
  const handleRefresh = () => {
    fetchPages();
  };
  
  const handlePageSelect = async (page: NotionPageData) => {
    await setNotionPageId(page.id);
    onBack();
  };
  return (
    <div className="p-4 w-full">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <button
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          选择 Notion 保存位置
        </button>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 工作空间 */}
      <div className="mb-6">
        <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          我的工作空间
        </button>
      </div>
      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : pages.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
            暂无可用的 Notion 页面
          </div>
        ) : (
          <div className="space-y-2">
            {pages.map((page) => (
              <div
              key={page.id}
              className={`p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors ${page.id === notionPageId ? 'bg-blue-100' : 'bg-blue-50'}`}
              onClick={() => handlePageSelect(page)}
            >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-blue-500" />
                  <span className="text-sm">{page.title}</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {new Date(page.lastEditedTime).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
