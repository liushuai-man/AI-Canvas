import { Monitor, Tablet, Smartphone, ChevronDown } from 'lucide-react';
import { useCanvasStore } from '../../../stores/index';

export default function Header() {
  const { width, theme, setWidth, setTheme } = useCanvasStore();

  return (
    <div className="h-12 px-4 flex items-center justify-between border-b bg-gray-800 text-white">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <span className="font-medium text-xs uppercase tracking-wider">宽度</span>
          <div className="flex bg-gray-900 rounded p-1">
            <button
              className={`p-1.5 rounded transition-colors ${
                width === 'desktop' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'
              }`}
              onClick={() => setWidth('desktop')}
              title="Desktop (850px)"
            >
              <Monitor size={14} />
            </button>
            <button
              className={`p-1.5 rounded transition-colors ${
                width === 'tablet' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'
              }`}
              onClick={() => setWidth('tablet')}
              title="Tablet (600px)"
            >
              <Tablet size={14} />
            </button>
            <button
              className={`p-1.5 rounded transition-colors ${
                width === 'mobile' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'
              }`}
              onClick={() => setWidth('mobile')}
              title="Mobile (400px)"
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>
        <div className="w-px h-6 bg-gray-700" />
        <div className="flex items-center gap-2 text-gray-400">
          <span className="font-medium text-xs uppercase tracking-wider">主题</span>
          <div className="flex bg-gray-900 rounded p-1 gap-1">
            <button
              className={`px-3 py-1 rounded text-xs transition-colors ${
                theme === 'light' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'
              }`}
              onClick={() => setTheme('light')}
            >
              高亮(Light)
            </button>
            <button
              className={`px-3 py-1 rounded text-xs transition-colors ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'
              }`}
              onClick={() => setTheme('dark')}
            >
              暗黑(Dark)
            </button>
            <button
              className={`px-3 py-1 rounded text-xs transition-colors ${
                theme === 'note' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'
              }`}
              onClick={() => setTheme('note')}
            >
              便签(Note)
            </button>
          </div>
        </div>
        <div className="w-px h-6 bg-gray-700" />
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded hover:bg-gray-700 text-xs flex items-center gap-1 text-gray-300">
            更多 <ChevronDown size={14} />
          </button>
        </div>
      </div>
      <button className="text-xs text-gray-400 hover:text-white transition-colors">登录</button>
    </div>
  );
}
