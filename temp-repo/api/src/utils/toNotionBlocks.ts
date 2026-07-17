import type { ContentBlock } from '../types/block';

// Notion 支持的代码语言类型
type LanguageRequest =
  | 'abap'
  | 'arduino'
  | 'bash'
  | 'basic'
  | 'c'
  | 'clojure'
  | 'coffeescript'
  | 'c++'
  | 'c#'
  | 'css'
  | 'dart'
  | 'diff'
  | 'docker'
  | 'elixir'
  | 'elm'
  | 'erlang'
  | 'flow'
  | 'fortran'
  | 'f#'
  | 'gherkin'
  | 'glsl'
  | 'go'
  | 'graphql'
  | 'groovy'
  | 'haskell'
  | 'html'
  | 'java'
  | 'javascript'
  | 'json'
  | 'julia'
  | 'kotlin'
  | 'latex'
  | 'less'
  | 'lisp'
  | 'livescript'
  | 'lua'
  | 'makefile'
  | 'markdown'
  | 'matlab'
  | 'mermaid'
  | 'nix'
  | 'objective-c'
  | 'ocaml'
  | 'pascal'
  | 'perl'
  | 'php'
  | 'plain text'
  | 'powershell'
  | 'prolog'
  | 'python'
  | 'r'
  | 'ruby'
  | 'rust'
  | 'scala'
  | 'scheme'
  | 'scss'
  | 'shell'
  | 'sql'
  | 'swift'
  | 'typescript'
  | 'vb.net'
  | 'verilog'
  | 'vhdl'
  | 'xml'
  | 'yaml';

// 转换 ContentBlock 为 Notion Block
export function toNotionBlocks(blocks: ContentBlock[]) {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'text':
          return {
            object: 'block' as const,
            type: 'paragraph' as const,
            paragraph: {
              rich_text: [
                {
                  type: 'text' as const,
                  text: {
                    content: block.content,
                  },
                },
              ],
            },
          };

        case 'code':
          const language = (block.language || 'plain text') as LanguageRequest;
          return {
            object: 'block' as const,
            type: 'code' as const,
            code: {
              rich_text: [
                {
                  type: 'text' as const,
                  text: {
                    content: block.code,
                  },
                },
              ],
              language,
            },
          };

        case 'list':
          if (block.ordered) {
            return block.items.map((item: string) => ({
              object: 'block' as const,
              type: 'numbered_list_item' as const,
              numbered_list_item: {
                rich_text: [
                  {
                    type: 'text' as const,
                    text: { content: item },
                  },
                ],
              },
            }));
          }
          return block.items.map((item: string) => ({
            object: 'block' as const,
            type: 'bulleted_list_item' as const,
            bulleted_list_item: {
              rich_text: [
                {
                  type: 'text' as const,
                  text: { content: item },
                },
              ],
            },
          }));

        case 'table':
          // Notion table 需要先创建 table block，然后添加 table_row
          // 由于 API 限制，我们将其转换为文本格式
          const tableLines: string[] = [];
          if (block.headers.length > 0) {
            tableLines.push(block.headers.join(' | '));
            tableLines.push(block.headers.map(() => '---').join(' | '));
          }
          block.rows.forEach((row: string[]) => {
            tableLines.push(row.join(' | '));
          });
          return {
            object: 'block' as const,
            type: 'paragraph' as const,
            paragraph: {
              rich_text: [
                {
                  type: 'text' as const,
                  text: {
                    content: tableLines.join('\n'),
                  },
                },
              ],
            },
          };

        case 'inlineCode':
          return {
            object: 'block' as const,
            type: 'paragraph' as const,
            paragraph: {
              rich_text: [
                {
                  type: 'text' as const,
                  text: {
                    content: block.code,
                  },
                  annotations: {
                    code: true,
                  },
                },
              ],
            },
          };

        case 'image':
          return {
            object: 'block' as const,
            type: 'image' as const,
            image: {
              type: 'external' as const,
              external: {
                url: block.src,
              },
            },
          };

        default:
          return [];
      }
    })
    .flat();
}
