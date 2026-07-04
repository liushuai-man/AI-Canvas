import React from 'react';
import type { Block } from '../../../../../../../shared/types/block';
import { formatTime } from '../../../../../utils/format';
import { User, Bot } from 'lucide-react';

interface Props {
  block: Block;
}

const HeaderInfo: React.FC<Props> = ({ block }) => {
  const isUser = block.role === 'user';

  return (
    <div
      className={`flex items-center gap-2 text-[10px] text-gray-400 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white">
            <Bot size={14} />
          </div>
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            {block.source || 'AI'}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span>{formatTime(block.createdAt)}</span>
        {isUser && (
          <div className="flex items-center gap-2">
            <span className="font-medium">You Asked</span>
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              <User size={14} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderInfo;