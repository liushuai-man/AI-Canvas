import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import {
  ContentBlock,
  TextBlock,
  CodeBlock,
  ListBlock,
  TableBlock,
  InLineCodeBlock,
} from '../../../../../shared/types/block';

interface Props {
  block: ContentBlock;
}

function normalizeHighlightLanguage(language: string | null) {
  if (!language) return null;

  const normalized = language.toLowerCase();
  const aliases: Record<string, string> = {
    'c++': 'cpp',
    shell: 'bash',
    sh: 'bash',
    zsh: 'bash',
    react: 'tsx',
    next: 'tsx',
  };

  return aliases[normalized] || normalized;
}

function highlightCode(code: string, language: string | null) {
  const normalizedLanguage = normalizeHighlightLanguage(language);

  if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
    return hljs.highlight(code, {
      language: normalizedLanguage,
      ignoreIllegals: true,
    }).value;
  }

  return hljs.highlightAuto(code).value;
}

const ContentBlockRenderer: React.FC<Props> = ({ block }) => {
  switch (block.type) {
    case 'text':
      return (
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {(block as TextBlock).content}
          </ReactMarkdown>
        </div>
      );
    case 'code':
      const codeBlock = block as CodeBlock;
      const highlightedCode = codeBlock.code
        ? highlightCode(codeBlock.code, codeBlock.language)
        : '';
      return (
        <div className="my-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500 font-mono">
              {codeBlock.language || 'code'}
            </span>
          </div>
          <pre
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto whitespace-pre font-mono text-sm"
            style={{ tabSize: 2 }}
          >
            <code
              className={`hljs language-${normalizeHighlightLanguage(codeBlock.language) || ''}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </div>
      );
    case 'inlineCode':
      const inlineCodeBlock = block as InLineCodeBlock;
      return (
        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-sm">
          {inlineCodeBlock.code}
        </code>
      );
    case 'list':
      const listBlock = block as ListBlock;
      return (
        <div className="my-4">
          {listBlock.ordered ? (
            <ol className="list-decimal pl-6 space-y-1">
              {listBlock.items.map((item, index) => (
                <li key={index}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item}
                  </ReactMarkdown>
                </li>
              ))}
            </ol>
          ) : (
            <ul className="list-disc pl-6 space-y-1">
              {listBlock.items.map((item, index) => (
                <li key={index}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item}
                  </ReactMarkdown>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    case 'table':
      const tableBlock = block as TableBlock;
      return (
        <div className="my-4 overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                {tableBlock.headers.map((header, index) => (
                  <th
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 px-4 py-2"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableBlock.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={
                    rowIndex % 2 === 0
                      ? 'bg-white dark:bg-gray-900'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-gray-200 dark:border-gray-700 px-4 py-2"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
};

export default ContentBlockRenderer;
