'use client';

import { useCallback, useRef, useState } from 'react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
}

export default function DropZone({ onFileSelected }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
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

  return (
    <div className="home-container">
      {/* Ambient background glow */}
      <div className="home-glow home-glow-1" />
      <div className="home-glow home-glow-2" />

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
          <h2 className="home-hero-title">SVG Viewer</h2>
          <p className="home-hero-subtitle">
            View, zoom, pan, and export your SVG files — entirely in the browser.
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
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>

        {/* Feature chips */}
        <div className="home-features">
          <div className="home-feature-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            Zoom &amp; Pan
          </div>
          <div className="home-feature-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export PNG
          </div>
          <div className="home-feature-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Export Favicon
          </div>
          <div className="home-feature-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            View Source
          </div>
        </div>

        {/* Privacy badge */}
        <div className="home-privacy">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          100% local — your files never leave the browser
        </div>
      </div>
    </div>
  );
}
