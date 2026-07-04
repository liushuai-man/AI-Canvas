import React, { useEffect } from 'react';
import type { Block, ContentBlock } from '../../../../../../../shared/types/block';
import { useContentBlockHandle } from '../../../../../hooks/useContentBlockHandle';
import ContentBlockRenderer from '../../ContentBlockRenderer';

interface Props {
  block: Block;
  contentBlock: ContentBlock;
}

 const ContentBlock: React.FC<Props> = ({ block, contentBlock }) => {
  const {
    isEditing,
    content,
    textareaRef,
    handleDoubleClick,
    handleBlur,
    handleChange,
    handleKeyDown,
  } = useContentBlockHandle({ block, contentBlock });

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing, content, textareaRef]);

  if (isEditing) {
    return (
      <div className="w-full bg-transparent p-0 ring-2 ring-blue-400 rounded-lg z-10">
        <textarea
          ref={textareaRef}
          className="w-full p-4 bg-transparent outline-none resize-none text-[13px] leading-relaxed block"
          style={{ minHeight: '80px' }}
          value={content}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="编辑内容..."
        />
      </div>
    );
  }

  return (
    <div onDoubleClick={handleDoubleClick}>
      <ContentBlockRenderer block={contentBlock} />
    </div>
  );
};

export default ContentBlock;
