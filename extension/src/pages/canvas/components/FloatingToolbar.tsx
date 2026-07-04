import { useRef, useEffect, useState } from 'react';
import SmartIcon from '../../../components/SmartIcon';
import { useBlockStore, BlockStore } from '../../../../src/stores/index';
import { getSelectedBlocks, useExport } from '../../../../src/hooks/useExport';
import SaveNotion from '../../popup/components/SaveNotion';
import NotionPageSelector from '../../popup/NotionPageSelector';

export default function FloatingToolbar() {
  const { blocks, selectedBlockIds, selectAllBlocks, clearSelection } =
    useBlockStore((state: BlockStore) => state);
  const selectedBlocks = getSelectedBlocks(blocks, [...selectedBlockIds]);
  const { exportPdf, exportMD, exportTxt, exportHtml } =
    useExport(selectedBlocks);
  const getSelectAllState = () => {
    if (blocks.length === 0 || selectedBlockIds.size === 0) return 0;
    if (selectedBlockIds.size === blocks.length) return 2;
    return 1;
  };
  const checkboxRef = useRef<HTMLInputElement>(null);
  const handleSelectAll = () => {
    if (getSelectAllState() === 0) {
      selectAllBlocks();
    } else {
      clearSelection();
    }
  };
  const selectAllState = getSelectAllState();
  const [openNotion, setOpenNotion] = useState(false);
  const [showPageSelector, setShowPageSelector] = useState(false);

  const handleOpenNotion = () => {
    setOpenNotion(!openNotion);
    setShowPageSelector(false);
  };

  const handleGoNotion = () => {
    setShowPageSelector(true);
  };

  const handleBackFromSelector = () => {
    setShowPageSelector(false);
  };

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = selectAllState === 1;
    }
  }, [selectAllState]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="flex items-center gap-3 px-4 py-2 bg-white border shadow-lg rounded-full">
        <label className="flex items-center gap-1 text-sm">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={selectAllState === 2}
            onChange={handleSelectAll}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          全选
        </label>
        <span className="text-sm text-gray-400">
          {selectedBlockIds.size} / {blocks.length}条
        </span>
        <div className="w-px h-4 bg-gray-200" />
        <SmartIcon type="pdf" onClick={() => exportPdf()} />
        <SmartIcon type="md" onClick={() => exportMD()} />
        <SmartIcon type="txt" onClick={() => exportTxt()} />
        <SmartIcon type="html" onClick={() => exportHtml()} />
        <div className="w-px h-4 bg-gray-200" />
        <SmartIcon type="notion" onClick={() => handleOpenNotion()} />
      </div>
      {openNotion && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2">
          {showPageSelector ? (
            <NotionPageSelector onBack={handleBackFromSelector} />
          ) : (
            <SaveNotion onGoNotion={handleGoNotion} />
          )}
        </div>
      )}
    </div>
  );
}
