import { useState, useCallback, useEffect } from 'react';
import { useWindowStore } from '../store/windowStore';

// TODO: Implement window state management with drag, resize, and focus handling
export const useWindow = (windowId, initialPosition = { x: 100, y: 100 }, initialSize = { width: 800, height: 600 }) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { focusWindow, closeWindow, minimizeWindow, windows } = useWindowStore();

  const currentWindow = windows.find(w => w.id === windowId);
  const isFocused = currentWindow?.isFocused || false;

  const handleMouseDown = useCallback((e) => {
    // TODO: Implement drag start logic
    if (e.target.closest('.window-controls')) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    focusWindow(windowId);
  }, [position, windowId, focusWindow]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || isMaximized) return;

    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  }, [isDragging, isMaximized, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClose = useCallback(() => {
    closeWindow(windowId);
  }, [windowId, closeWindow]);

  const handleMinimize = useCallback(() => {
    minimizeWindow(windowId);
  }, [windowId, minimizeWindow]);

  const handleMaximize = useCallback(() => {
    setIsMaximized(!isMaximized);
  }, [isMaximized]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    position,
    size,
    isMaximized,
    isFocused,
    handleMouseDown,
    handleClose,
    handleMinimize,
    handleMaximize,
  };
};
