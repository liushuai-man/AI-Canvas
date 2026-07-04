import { useState, useRef, useEffect } from 'react';
import { useBlockStore } from '../stores/modules/useBlockStore';
import { useBlockEditIdStore } from '../stores/modules/useBlockEditIdStore';
import type { Block, ContentBlock } from '../../../shared/types/block';
import { formatContentBlock } from './useContentFormat';

type Params = {
  block: Block;
  contentBlock: ContentBlock;
};

function parseEditableCodeBlock(
  value: string,
  fallbackLanguage: string | null
): { code: string; language: string | null } {
  const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const fencedMatch = normalized.match(/^```([^\n`]*)\n([\s\S]*?)\n```$/);

  if (!fencedMatch) {
    return {
      code: normalized,
      language: fallbackLanguage,
    };
  }

  const nextLanguage = fencedMatch[1].trim() || fallbackLanguage;

  return {
    language: nextLanguage,
    code: fencedMatch[2],
  };
}

export function useContentBlockHandle({ block, contentBlock }: Params) {
  const { updateBlock } = useBlockStore();
  const { editId, setEditId } = useBlockEditIdStore();
  const [content, setContent] = useState<string>(
    formatContentBlock(contentBlock)
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = editId === contentBlock.id;

  const getContentBlock = (): string => {
    return formatContentBlock(contentBlock);
  };

  const updateContentBlock = (newValue: string) => {
    let updatedContentBlock: ContentBlock;

    switch (contentBlock.type) {
      case 'text':
        updatedContentBlock = {
          ...contentBlock,
          content: newValue,
        };
        break;
      case 'code':
        const parsedCodeBlock = parseEditableCodeBlock(
          newValue,
          contentBlock.language
        );
        updatedContentBlock = {
          ...contentBlock,
          language: parsedCodeBlock.language,
          code: parsedCodeBlock.code,
        };
        break;
      case 'list':
        updatedContentBlock = {
          ...contentBlock,
          items: newValue.split('\n').filter((item) => item.trim() !== ''),
        };
        break;
      case 'table':
        const lines = newValue.split('\n').filter((line) => line.trim() !== '');
        if (lines.length >= 2) {
          const headers = lines[0].split('|').map((header) => header.trim());
          const rows = lines
            .slice(2)
            .map((line) => line.split('|').map((cell) => cell.trim()));
          updatedContentBlock = {
            ...contentBlock,
            headers,
            rows,
          };
        } else {
          updatedContentBlock = contentBlock;
        }
        break;
      default:
        updatedContentBlock = contentBlock;
    }

    updateBlock(block.id, {
      contentBlocks: block.contentBlocks.map((b) =>
        b.id === contentBlock.id ? updatedContentBlock : b
      ),
    });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditId(contentBlock.id);
  };

  const handleBlur = () => {
    setEditId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    updateContentBlock(value);

    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 500) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleBlur();
    }

    if (e.key === 'Escape') {
      handleBlur();
    }
  };
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 500) + 'px';
    }
  }, [isEditing, content]);

  return {
    isEditing,
    content,
    getContentBlock,
    textareaRef,
    handleDoubleClick,
    handleBlur,
    handleChange,
    handleKeyDown,
  };
}
