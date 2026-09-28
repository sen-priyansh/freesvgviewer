'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SvgViewerProps {
  blobUrl: string;
  fileName: string;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 20;
const ZOOM_STEP = 0.15;
const PAN_STEP = 24;

export default function SvgViewer({ blobUrl, fileName }: SvgViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const [fitScale, setFitScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  // Fit the SVG to the container on load
  const fitToScreen = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Calculate "fit" scale when image loads
  const handleImageLoad = useCallback(() => {
    // Reset to fit view
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (imgRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const imgNaturalW = imgRef.current.naturalWidth;
      const imgNaturalH = imgRef.current.naturalHeight;
      if (imgNaturalW > 0 && imgNaturalH > 0) {
        const scaleX = containerRect.width / imgNaturalW;
        const scaleY = containerRect.height / imgNaturalH;
        const fit = Math.min(scaleX, scaleY, 1) * 0.9; // 90% of container
        setFitScale(fit);
      }
    }
  }, []);

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((prev) => {
        const next = prev * (1 + delta);
        return Math.min(Math.max(next, MIN_ZOOM), MAX_ZOOM);
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Mouse pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsPanning(true);
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Touch pan and pinch zoom
  const touchesRef = useRef<React.Touch[]>([]);
  const lastPinchDist = useRef(0);

  const getTouchDist = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchesRef.current = Array.from(e.touches) as unknown as React.Touch[];
    if (e.touches.length === 1) {
      lastPointer.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      lastPinchDist.current = getTouchDist(
        e.touches[0] as unknown as React.Touch,
        e.touches[1] as unknown as React.Touch
      );
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastPointer.current.x;
      const dy = e.touches[0].clientY - lastPointer.current.y;
      lastPointer.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    } else if (e.touches.length === 2) {
      const dist = getTouchDist(
        e.touches[0] as unknown as React.Touch,
        e.touches[1] as unknown as React.Touch
      );
      if (lastPinchDist.current > 0) {
        const scale = dist / lastPinchDist.current;
        setZoom((prev) =>
          Math.min(Math.max(prev * scale, MIN_ZOOM), MAX_ZOOM)
        );
      }
      lastPinchDist.current = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = 0;
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * (1 + ZOOM_STEP * 2), MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev * (1 - ZOOM_STEP * 2), MIN_ZOOM));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPan((current) => ({ ...current, x: current.x + PAN_STEP }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPan((current) => ({ ...current, x: current.x - PAN_STEP }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPan((current) => ({ ...current, y: current.y + PAN_STEP }));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPan((current) => ({ ...current, y: current.y - PAN_STEP }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  const displayZoom = Math.round(zoom * fitScale * 100);

  return (
    <div className="viewer-container">
      {/* Canvas area */}
      <div
        ref={containerRef}
        className="viewer-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        {/* Checkerboard background for transparency */}
        <div
          className="viewer-image-wrapper"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom * fitScale})`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={blobUrl}
            alt={fileName}
            className="viewer-image"
            onLoad={handleImageLoad}
            draggable={false}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="viewer-toolbar">
        <button
          type="button"
          className="toolbar-btn"
          onClick={zoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <span className="toolbar-zoom-label">{displayZoom}%</span>

        <button
          type="button"
          className="toolbar-btn"
          onClick={zoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <div className="toolbar-separator" />

        <button
          type="button"
          className="toolbar-btn toolbar-btn-text"
          onClick={fitToScreen}
          title="Fit to screen"
        >
          Fit
        </button>

        <button
          type="button"
          className="toolbar-btn toolbar-btn-text"
          onClick={resetZoom}
          title="Reset zoom (0)"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
