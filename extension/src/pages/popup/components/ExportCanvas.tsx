import { Sparkles} from 'lucide-react';

export default function ExportCanvas({
  onOpen,
}: {
  count: number;
  onOpen: () => void;
}) {
  return (
    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
      <button
        className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
        onClick={onOpen}
      >
        <Sparkles size={18} />
        打开自定义画布
      </button>
    </div>
  );
}
