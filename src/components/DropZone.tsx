'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  onSvgCodePasted: (source: string, name: string) => boolean;
}

export default function DropZone({ onFileSelected, onSvgCodePasted }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isInstallAvailable, setIsInstallAvailable] = useState(
    () => typeof window !== 'undefined' && window.pwaInstallAvailable === true
  );
  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false);
  const [pastedCode, setPastedCode] = useState('');
  const [pasteError, setPasteError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleFile = useCallback(
    (file: File) => {
      if (
        file.type === 'image/svg+xml' ||
        file.name.toLowerCase().endsWith('.svg')
      ) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFile]
  );

  const handleChooseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const openPasteDialog = useCallback(() => {
    setPasteError('');
    setIsPasteDialogOpen(true);
  }, []);

  const closePasteDialog = useCallback(() => {
    setIsPasteDialogOpen(false);
    setPasteError('');
  }, []);

  const handlePasteSubmit = useCallback(() => {
    if (!pastedCode.trim()) {
      setPasteError('Paste SVG code to continue.');
      return;
    }

    if (onSvgCodePasted(pastedCode, 'pasted-svg.svg')) {
      setPastedCode('');
      closePasteDialog();
    } else {
      setPasteError('That code doesn\'t appear to be a valid SVG.');
    }
  }, [closePasteDialog, onSvgCodePasted, pastedCode]);

  useEffect(() => {
    if (!isPasteDialogOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePasteDialog();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closePasteDialog, isPasteDialogOpen]);

  useEffect(() => {
    const showInstallButton = () => setIsInstallAvailable(true);
    const hideInstallButton = () => setIsInstallAvailable(false);

    window.addEventListener('pwa-install-available', showInstallButton);
    window.addEventListener('pwa-install-unavailable', hideInstallButton);

    return () => {
      window.removeEventListener('pwa-install-available', showInstallButton);
      window.removeEventListener('pwa-install-unavailable', hideInstallButton);
    };
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/freesvg.svg" alt="" width="24" height="24" />
          <span>Free SVG Viewer</span>
        </div>
        <a
          href="https://github.com/sen-priyansh/freesvgviewer"
          target="_blank"
          rel="noopener noreferrer"
          className="home-github-btn"
          title="View on GitHub"
          aria-label="View the project on GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </header>

      {/* Main content */}
      <div className="home-content">
        {/* Hero section */}
        <div className="home-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/freesvg.svg"
            alt="SVG Viewer"
            className="home-hero-logo"
            width="56"
            height="56"
          />
          <h1 className="home-hero-title">Open an SVG</h1>
          <p className="home-hero-subtitle">
            View, inspect, and export files without uploading them.
          </p>
        </div>

        {/* Drop zone card */}
        <div
          className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Animated border glow when dragging */}
          {isDragging && <div className="dropzone-glow" />}

          <div className="dropzone-inner">
            {/* Icon */}
            <div className="dropzone-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <h3 className="dropzone-title">
              {isDragging ? 'Drop it here!' : 'Drop an SVG here'}
            </h3>

            <div className="dropzone-divider">
              <span className="dropzone-divider-line" />
              <span className="dropzone-divider-text">or</span>
              <span className="dropzone-divider-line" />
            </div>

            <button
              type="button"
              className="dropzone-button"
              onClick={handleChooseClick}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Choose SVG
            </button>
            <button type="button" className="dropzone-paste-btn" onClick={openPasteDialog}>
              Paste SVG code
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>

        {isInstallAvailable && (
          <button
            type="button"
            className="home-pwa-install"
            onClick={() => window.dispatchEvent(new Event('pwa-install-request'))}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Install app
          </button>
        )}

        <div className="home-privacy">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>100% local — your files never leave the browser</span>
          <span style={{ opacity: 0.4 }}>&bull;</span>
          <Link href="/privacy" className="home-privacy-link">
            Privacy &amp; Cookies
          </Link>
        </div>
      </div>

      {isPasteDialogOpen && (
        <div className="paste-dialog-backdrop" onMouseDown={closePasteDialog}>
          <section
            className="paste-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paste-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="paste-dialog-header">
              <div>
                <h2 id="paste-dialog-title">Paste SVG code</h2>
                <p>It stays in your browser.</p>
              </div>
              <button type="button" className="paste-dialog-close" onClick={closePasteDialog} aria-label="Close paste dialog">
                ×
              </button>
            </div>
            <textarea
              className="paste-dialog-input"
              value={pastedCode}
              onChange={(event) => setPastedCode(event.target.value)}
              placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">…</svg>'}
              spellCheck={false}
              autoFocus
            />
            {pasteError && <p className="paste-dialog-error">{pasteError}</p>}
            <div className="paste-dialog-actions">
              <button type="button" className="paste-dialog-cancel" onClick={closePasteDialog}>Cancel</button>
              <button type="button" className="paste-dialog-preview" onClick={handlePasteSubmit}>Preview SVG</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
