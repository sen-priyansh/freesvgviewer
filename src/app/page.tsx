'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DropZone from '@/components/DropZone';
import SvgViewer from '@/components/SvgViewer';
import CodeViewer from '@/components/CodeViewer';
import { readSvgFile, validateSvg, createSvgBlobUrl, revokeBlobUrl } from '@/lib/svg';
import { exportSvgAsPng, exportSvgAsPngAtResolution } from '@/lib/png';
import { exportSvgAsFavicon } from '@/lib/favicon';

export default function Home() {
  const [svgSource, setSvgSource] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [showPngMenu, setShowPngMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URL on unmount or when changing files
  useEffect(() => {
    return () => {
      if (blobUrl) revokeBlobUrl(blobUrl);
    };
  }, [blobUrl]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPngMenu(false);
      }
    };
    if (showPngMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPngMenu]);

  // Keyboard shortcut: Ctrl/Cmd+O to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      setError(null);
      setShowCode(false);
      setShowPngMenu(false);

      try {
        const source = await readSvgFile(file);

        if (!validateSvg(source)) {
          setError("That file doesn\u2019t appear to be a valid SVG.");
          return;
        }

        // Clean up previous blob URL
        if (blobUrl) {
          revokeBlobUrl(blobUrl);
        }

        const newBlobUrl = createSvgBlobUrl(source);
        setSvgSource(source);
        setBlobUrl(newBlobUrl);
        setFileName(file.name);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error ? caughtError.message : 'Unable to open this SVG.'
        );
      }
    },
    [blobUrl]
  );

  const handleExportSvg = useCallback(() => {
    if (!svgSource) return;
    const exportName = fileName.replace(/\.svg$/i, '') + '.svg';
    const blob = new Blob([svgSource], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgSource, fileName]);

  const handleExportPng = useCallback(async (longEdge: number | null) => {
    if (!svgSource) return;
    setExporting(true);
    setShowPngMenu(false);

    try {
      const exportName = fileName.replace(/\.svg$/i, '') + '.png';
      if (longEdge === null) {
        await exportSvgAsPng(svgSource, exportName);
      } else {
        await exportSvgAsPngAtResolution(svgSource, exportName, longEdge);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Unable to export PNG.'
      );
    } finally {
      setExporting(false);
    }
  }, [svgSource, fileName]);

  const handleExportFavicon = useCallback(async () => {
    if (!svgSource) return;
    setExporting(true);
    setShowPngMenu(false);

    try {
      const exportName = fileName.replace(/\.svg$/i, '') + '.ico';
      await exportSvgAsFavicon(svgSource, exportName);
    } catch {
      setError('Unable to export favicon.');
    } finally {
      setExporting(false);
    }
  }, [svgSource, fileName]);

  const handleOpenAnother = useCallback(() => {
    setShowPngMenu(false);
    fileInputRef.current?.click();
  }, []);

  const handleClose = useCallback(() => {
    setShowPngMenu(false);
    if (blobUrl) revokeBlobUrl(blobUrl);
    setSvgSource(null);
    setBlobUrl(null);
    setFileName('');
    setShowCode(false);
    setError(null);
  }, [blobUrl]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelected(files[0]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileSelected]
  );

  // No SVG loaded — show drop zone
  if (!blobUrl || !svgSource) {
    return (
      <div className="app-shell">
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="error-dismiss"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <DropZone onFileSelected={handleFileSelected} />
      </div>
    );
  }

  // SVG loaded — show viewer
  return (
    <div className="app-shell">
      {/* Ambient background glow to match home screen */}
      <div className="home-glow home-glow-1" />
      <div className="home-glow home-glow-2" />

      {/* Top bar: filename + close */}
      <div className="top-bar">
        <div className="file-info-box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="floating-logo" src="/freesvg.svg" alt="Logo" width="18" height="18" />
          <div className="filename-input-wrapper">
            <input
              type="text"
              className="filename-input"
              value={fileName.replace(/\.svg$/i, '')}
              onChange={(e) => setFileName(e.target.value ? e.target.value + '.svg' : '.svg')}
              spellCheck={false}
            />
            <span className="filename-ext">.svg</span>
          </div>
          <div className="name-bar-divider" />
          <button type="button" className="name-bar-btn" onClick={handleExportSvg} title="Download SVG">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
        <div className="top-bar-right">
          <a
            href="https://github.com/sen-priyansh/freesvgviewer"
            target="_blank"
            rel="noopener noreferrer"
            className="top-bar-icon-btn"
            title="View on GitHub"
            aria-label="GitHub Repository"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
          <button type="button" className="top-bar-close" onClick={handleClose} title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="bottom-bar">
        <button
          type="button"
          className={`bottom-bar-btn ${!showCode ? 'active' : ''}`}
          onClick={() => setShowCode(false)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>Preview</span>
        </button>

        <button
          type="button"
          className={`bottom-bar-btn ${showCode ? 'active' : ''}`}
          onClick={() => setShowCode(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Code</span>
        </button>

        <div className="bottom-bar-sep" />

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            type="button"
            className="bottom-bar-btn"
            onClick={() => setShowPngMenu((prev) => !prev)}
            disabled={exporting}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>PNG</span>
          </button>

          {showPngMenu && (
            <div className="png-menu">
              <button type="button" className="png-menu-btn" onClick={() => handleExportPng(1024)}>1024px (Recommended)</button>
              <button type="button" className="png-menu-btn" onClick={() => handleExportPng(2048)}>2048px</button>
              <button type="button" className="png-menu-btn" onClick={() => handleExportPng(4096)}>4096px</button>
              <button type="button" className="png-menu-btn" onClick={() => handleExportPng(6144)}>6144px</button>
              <button type="button" className="png-menu-btn" onClick={() => handleExportPng(null)}>Original size</button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="bottom-bar-btn"
          onClick={handleExportFavicon}
          disabled={exporting}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Favicon</span>
        </button>

        <div className="bottom-bar-sep" />

        <button type="button" className="bottom-bar-btn" onClick={handleOpenAnother}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span>Open</span>
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="error-dismiss"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {!showCode ? (
        <SvgViewer blobUrl={blobUrl} fileName={fileName} />
      ) : (
        <CodeViewer source={svgSource!} />
      )}

      {/* Hidden file input for "Open" action */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
