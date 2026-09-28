'use client';

import { useCallback, useState } from 'react';

interface CodeViewerProps {
  source: string;
  onClose: () => void;
}

export default function CodeViewer({ source, onClose }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = source;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [source]);

  // Simple syntax highlighting for SVG/XML
  const highlightedLines = source.split('\n').map((line, i) => {
    const highlighted = highlightXml(line);
    return (
      <div key={i} className="code-line">
        <span className="code-line-number">{i + 1}</span>
        <span
          className="code-line-content"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    );
  });

  return (
    <div className="code-viewer-overlay">
      <div className="code-viewer">
        {/* Header */}
        <div className="code-viewer-header">
          <h2 className="code-viewer-title">SVG Source</h2>
          <button
            type="button"
            className="code-viewer-close"
            onClick={onClose}
            aria-label="Close code viewer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Code area */}
        <div className="code-viewer-body">
          <pre className="code-pre">{highlightedLines}</pre>
        </div>

        {/* Footer */}
        <div className="code-viewer-footer">
          <span className="code-viewer-info">
            {source.split('\n').length} lines
          </span>
          <button
            type="button"
            className="code-copy-btn"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple XML/SVG syntax highlighting.
 * Returns HTML string with span elements for coloring.
 * This is safe because we control the output entirely.
 */
function highlightXml(line: string): string {
  return line
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Comments
    .replace(
      /(&lt;!--.*?--&gt;)/g,
      '<span class="hl-comment">$1</span>'
    )
    // Tag names
    .replace(
      /(&lt;\/?)([\w:-]+)/g,
      '$1<span class="hl-tag">$2</span>'
    )
    // Attribute values (quoted strings)
    .replace(
      /(&quot;|")(.*?)(&quot;|")/g,
      '<span class="hl-string">&quot;$2&quot;</span>'
    )
    // Attribute names
    .replace(
      /\b([\w:-]+)(=)/g,
      '<span class="hl-attr">$1</span>$2'
    );
}
