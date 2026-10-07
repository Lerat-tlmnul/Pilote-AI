import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse markdown lines into structured elements
  const renderFormattedText = (text: string) => {
    // Process bold, italics, inline code, and links
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Combined regex for inline formatting: bold (**text**), italic (*text*), inline code (`code`), links ([text](url))
    const inlineRegex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
    let match: RegExpExecArray | null;

    while ((match = inlineRegex.exec(text)) !== null) {
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      if (match[1]) {
        // Bold
        parts.push(
          <strong key={`bold-${match.index}`} className="font-bold text-slate-900">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Italic
        parts.push(
          <em key={`italic-${match.index}`} className="italic text-slate-800">
            {match[4]}
          </em>
        );
      } else if (match[5]) {
        // Inline code
        parts.push(
          <code
            key={`code-${match.index}`}
            className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 text-slate-900 font-mono text-xs border border-slate-200/80"
          >
            {match[6]}
          </code>
        );
      } else if (match[7]) {
        // Link
        parts.push(
          <a
            key={`link-${match.index}`}
            href={match[9]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 hover:text-sky-800 underline underline-offset-2 font-medium"
          >
            {match[8]}
          </a>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeLanguage = '';
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' = 'ul';

  const flushList = (key: string) => {
    if (inList && listItems.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`list-${key}`} className="my-2 ml-5 list-decimal space-y-1 text-xs sm:text-sm text-slate-800">
            {listItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`list-${key}`} className="my-2 ml-5 list-disc space-y-1 text-xs sm:text-sm text-slate-800">
            {listItems}
          </ul>
        );
      }
      inList = false;
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks (```)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        elements.push(
          <div key={`code-block-${i}`} className="my-3 rounded-2xl overflow-hidden bg-slate-900 text-slate-100 shadow-sm border border-slate-800">
            {codeLanguage && (
              <div className="px-3.5 py-1.5 bg-slate-950/60 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-slate-800/80">
                {codeLanguage}
              </div>
            )}
            <pre className="p-3.5 text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{codeBlockLines.join('\n')}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeLanguage = '';
      } else {
        flushList(`before-code-${i}`);
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      flushList(`h1-${i}`);
      elements.push(
        <h1 key={`h1-${i}`} className="text-base sm:text-lg font-extrabold text-slate-900 mt-3 mb-1.5 tracking-tight">
          {renderFormattedText(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushList(`h2-${i}`);
      elements.push(
        <h2 key={`h2-${i}`} className="text-sm sm:text-base font-bold text-slate-900 mt-2.5 mb-1 tracking-tight">
          {renderFormattedText(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      flushList(`h3-${i}`);
      elements.push(
        <h3 key={`h3-${i}`} className="text-xs sm:text-sm font-bold text-slate-900 mt-2 mb-1">
          {renderFormattedText(line.slice(4))}
        </h3>
      );
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      flushList(`hr-${i}`);
      elements.push(<hr key={`hr-${i}`} className="my-3 border-t border-slate-200/80" />);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList(`quote-${i}`);
      elements.push(
        <blockquote key={`quote-${i}`} className="my-2 pl-3.5 border-l-2 border-slate-300 italic text-slate-600 text-xs sm:text-sm">
          {renderFormattedText(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Numbered List (1. ...)
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      if (!inList || listType !== 'ol') {
        flushList(`before-ol-${i}`);
        inList = true;
        listType = 'ol';
      }
      listItems.push(
        <li key={`li-ol-${i}`} className="leading-relaxed">
          {renderFormattedText(numMatch[2])}
        </li>
      );
      continue;
    }

    // Unordered List (- ... or * ...)
    const bulletMatch = line.match(/^[-*]\s+(.*)/);
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        flushList(`before-ul-${i}`);
        inList = true;
        listType = 'ul';
      }
      listItems.push(
        <li key={`li-ul-${i}`} className="leading-relaxed">
          {renderFormattedText(bulletMatch[1])}
        </li>
      );
      continue;
    }

    // If empty line, flush list and add small spacing
    if (!line.trim()) {
      flushList(`empty-${i}`);
      elements.push(<div key={`empty-${i}`} className="h-1.5" />);
      continue;
    }

    // Regular paragraph
    flushList(`p-${i}`);
    elements.push(
      <p key={`p-${i}`} className="my-1 text-xs sm:text-sm leading-relaxed text-slate-800">
        {renderFormattedText(line)}
      </p>
    );
  }

  flushList('final');

  return <div className="space-y-0.5">{elements}</div>;
};
