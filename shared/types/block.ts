export type Role = 'user' | 'assistant';

export type Source = 'chatgpt' | 'claude' | 'gemini' | 'manual';

export type Block = {
  id: string;
  role: Role;
  contentBlocks: ContentBlock[];
  source: Source;
  createdAt: number;
};

export type ContentBlock =
  | TextBlock
  | CodeBlock
  | ListBlock
  | TableBlock
  | InLineCodeBlock
  | ImageBlock;

type BaseBlock = {
  id: string;
};

export type TextBlock = BaseBlock & {
  type: 'text';
  content: string;
};

export type CodeBlock = BaseBlock & {
  type: 'code';
  language: string | null;
  code: string;
};

export type ListBlock = BaseBlock & {
  type: 'list';
  ordered: boolean;
  items: string[];
};

export type TableBlock = BaseBlock & {
  type: 'table';
  headers: string[];
  rows: string[][];
};

export type EditorState = {
  editing: {
    blockId: string;
    contentBlockId: string;
  } | null;
};
export type InLineCodeBlock = BaseBlock & {
  type: 'inlineCode';
  code: string;
};

export type ImageBlock = BaseBlock & {
  type: 'image';
  src: string;
  alt?: string;
};
