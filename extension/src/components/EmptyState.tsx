import { Inbox } from 'lucide-react';

interface Props {
  message?: string;
  description?: string;
}

export default function EmptyState({
  message = '暂无画布内容',
  description = '请先在 AI 对话页面导入内容',
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Inbox size={32} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{message}</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">{description}</p>
    </div>
  );
}
