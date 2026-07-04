import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  result?: 'loading' | 'success' | 'error';
  title?: string;
}

/**
 * 状态提示组件：用于展示加载中、操作成功或失败的结果
 */
export default function Loading({ 
  result = 'loading', 
  title = ''
}: Props) {
  const configs = {
    loading: {
      icon: <Loader2 className="animate-spin text-primary" size={24} />,
      defaultMessage: '正在处理...',
      textColor: 'text-gray-600'
    },
    success: {
      icon: <CheckCircle2 className="text-success" size={24} />,
      defaultMessage: '操作成功',
      textColor: 'text-success'
    },
    error: {
      icon: <XCircle className="text-danger" size={24} />,
      defaultMessage: '操作失败',
      textColor: 'text-danger'
    }
  };

  const config = configs[result];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-8 ${title}`}>
      <div className="transition-transform duration-300 scale-110">
        {config.icon}
      </div>
      <p className={`text-sm font-medium transition-colors duration-300 ${config.textColor}`}>
        {title || config.defaultMessage}
      </p>
    </div>
  );
}
