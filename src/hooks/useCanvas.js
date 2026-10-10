import { useState, useCallback, useRef } from 'react';

export const useCanvas = () => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const onWheel = useCallback((e) => {
    e.preventDefault();

    // Lower sensitivity for smoother zoom
    const zoomSensitivity = 0.0005;
    const delta = -e.deltaY * zoomSensitivity;
    const newScale = Math.min(Math.max(0.1, transform.scale + delta), 5);

    // Calculate mouse position in canvas coordinates (before zoom)
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const canvasX = (mouseX - transform.x) / transform.scale;
    const canvasY = (mouseY - transform.y) / transform.scale;

    // Adjust transform so the point under mouse stays at same screen position
    const newX = mouseX - canvasX * newScale;
    const newY = mouseY - canvasY * newScale;

    setTransform({ x: newX, y: newY, scale: newScale });
  }, [transform]);

  const onMouseDown = useCallback((e) => {
    // Only pan on middle mouse button OR left click on canvas background
    const isBackground = e.target.classList.contains('canvas-container') ||
                         e.target.classList.contains('canvas-content') ||
                         e.target.classList.contains('canvas-grid-pattern');

    if (e.button === 1 || (e.button === 0 && isBackground)) {
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const onMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  }, [isPanning]);

  return {
    transform,
    handlers: {
      onWheel,
      onMouseDown,
      onMouseUp,
      onMouseMove,
      onMouseLeave: onMouseUp
    }
  };
};
