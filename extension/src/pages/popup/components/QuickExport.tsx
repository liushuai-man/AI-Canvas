import { FileArchive, FileText, File, FileCodeCorner, CopyIcon } from 'lucide-react';
import ExportButton from '../../../components/ExportButton';
import { useExport } from '../../../hooks/useExport';
import { useBlockStore } from '../../../stores/index';
type ExportSectionProps = {
  exportFns: {
    exportPdf: () => void;
    exportMD: () => void;
    exportTxt: () => void;
    exportHtml: () => void;
  };
};
export default function QuickExport({ exportFns }: ExportSectionProps) {
  const { blocks } = useBlockStore();
  const { copyToClipboard } = useExport(blocks);
  return (
    <div className="mt-4">
      <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1 justify-start">
        一键导出
        <button
          title="复制全部"
          onClick={copyToClipboard}
          className="flex items-center hover:text-primary transition-all duration-200 hover:scale-110 active:scale-95 text-gray-400"
        >
          <CopyIcon size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ExportButton
          icon={<FileArchive size={14} />}
          label="PDF"
          onClick={exportFns.exportPdf}
        />
        <ExportButton
          icon={<FileText size={14} />}
          label="MD"
          onClick={exportFns.exportMD}
        />
        <ExportButton
          icon={<File size={14} />}
          label="TXT"
          onClick={exportFns.exportTxt}
        />
        <ExportButton
          icon={<FileCodeCorner size={14} />}
          label="HTML"
          onClick={exportFns.exportHtml}
        />
      </div>
    </div>
  );
}
