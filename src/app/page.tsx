'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DropZone from '@/components/DropZone';
import SvgViewer from '@/components/SvgViewer';
import CodeViewer from '@/components/CodeViewer';
import { readSvgFile, validateSvg, createSvgBlobUrl, revokeBlobUrl } from '@/lib/svg';
import { exportSvgAsPng } from '@/lib/png';
import { exportSvgAsFavicon } from '@/lib/favicon';

export default function Home() {
  const [svgSource, setSvgSource] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

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
      setShowMenu(false);

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
      } catch {
        setError('Unable to open this SVG.');
      }
    },
    [blobUrl]
  );

  const handleExport = useCallback(async () => {
    if (!svgSource) return;
    setExporting(true);
    setShowMenu(false);

    try {
      const exportName = fileName.replace(/\.svg$/i, '') + '.png';
      await exportSvgAsPng(svgSource, exportName);
    } catch {
      setError('Unable to export PNG.');
    } finally {
      setExporting(false);
    }
  }, [svgSource, fileName]);

  const handleExportFavicon = useCallback(async () => {
    if (!svgSource) return;
    setExporting(true);
    setShowMenu(false);

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
    setShowMenu(false);
    fileInputRef.current?.click();
  }, []);

  const handleClose = useCallback(() => {
    setShowMenu(false);
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
      <header className="app-header">
        <div className="app-header-left">
          <h1 className="app-title">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="app-logo" src="/freesvg.svg" alt="Logo" width="20" height="20" />
            <span className="app-filename">{fileName}</span>
          </h1>
        </div>

        <div className="app-header-right" ref={menuRef}>
          {/* Export button (always visible on desktop) */}
          <button
            type="button"
            className="header-action-btn export-btn-desktop"
            onClick={handleExport}
            disabled={exporting}
            title="Export as PNG"
          >
            {exporting ? 'Exporting…' : 'Export PNG'}
          </button>

          {/* Menu button */}
          <button
            type="button"
            className="header-menu-btn"
            onClick={() => setShowMenu((prev) => !prev)}
            aria-label="Menu"
            title="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="header-menu">
              <button type="button" className="menu-item" onClick={handleOpenAnother}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Open SVG
              </button>
              <button
                type="button"
                className="menu-item export-btn-mobile"
                onClick={handleExport}
                disabled={exporting}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {exporting ? 'Exporting…' : 'Export PNG'}
              </button>
              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  setShowCode(true);
                  setShowMenu(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                View Code
              </button>
              <button
                type="button"
                className="menu-item"
                onClick={handleExportFavicon}
                disabled={exporting}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Export Favicon
              </button>
              <div className="menu-divider" />
              <button type="button" className="menu-item menu-item-danger" onClick={handleClose}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Close
              </button>
            </div>
          )}
        </div>
      </header>

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

      <SvgViewer blobUrl={blobUrl} fileName={fileName} />

      {showCode && (
        <CodeViewer source={svgSource} onClose={() => setShowCode(false)} />
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
