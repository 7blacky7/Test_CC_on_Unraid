import React, { useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { useWindowStore } from '../../store/windowStore';
import './Window.css';

/**
 * Base Window Component
 *
 * Draggable and resizable window with focus management integrated with windowStore.
 * Supports maximization, minimization, and constrained movement within workspace bounds.
 *
 * Props:
 * - id: Window ID from windowStore
 * - title: Window title
 * - icon: Material Symbol icon name
 * - isFocused: Whether window has focus
 * - zIndex: z-index stack order
 * - position: Current position { x, y }
 * - size: Current size { width, height }
 * - workspaceBounds: Workspace dimensions for constraining movement
 * - onFocus, onClose, onMinimize, onMaximize: Optional callbacks
 * - children: Window content
 */
const Window = ({
  id,
  title,
  icon = 'window',
  isFocused = false,
  zIndex = 10,
  position = { x: 100, y: 100 },
  size = { width: 800, height: 600 },
  workspaceBounds = null,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  children
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousState, setPreviousState] = useState(null);
  const { focusWindow, closeWindow, minimizeWindow, updateWindowPosition, updateWindowSize } = useWindowStore();

  /**
   * Handle window focus - ensures window is focused in store
   */
  const handleFocus = useCallback(() => {
    focusWindow(id);
    if (onFocus) onFocus();
  }, [id, focusWindow, onFocus]);

  /**
   * Handle close - removes window from store
   */
  const handleClose = useCallback(() => {
    closeWindow(id);
    if (onClose) onClose();
  }, [id, closeWindow, onClose]);

  /**
   * Handle minimize - hides window from workspace
   */
  const handleMinimize = useCallback(() => {
    minimizeWindow(id);
    if (onMinimize) onMinimize();
  }, [id, minimizeWindow, onMinimize]);

  /**
   * Handle maximize - expands window to fill workspace
   */
  const handleMaximize = useCallback(() => {
    if (!isMaximized) {
      setPreviousState({ position, size });
      setIsMaximized(true);
      if (onMaximize) onMaximize();
    } else {
      setIsMaximized(false);
      if (onMaximize) onMaximize();
    }
  }, [isMaximized, position, size, onMaximize]);

  /**
   * Handle drag stop - update position in store
   */
  const handleDragStop = useCallback((e, d) => {
    updateWindowPosition(id, { x: d.x, y: d.y });
  }, [id, updateWindowPosition]);

  /**
   * Handle resize stop - update size in store
   */
  const handleResizeStop = useCallback((e, direction, ref, delta, position) => {
    updateWindowSize(id, {
      width: ref.style.width ? parseInt(ref.style.width) : size.width,
      height: ref.style.height ? parseInt(ref.style.height) : size.height,
    });
    if (position) {
      updateWindowPosition(id, position);
    }
  }, [id, size, updateWindowSize, updateWindowPosition]);

  // Maximized window dimensions (accounting for TopBar and Dock)
  const maximizedPosition = { x: 0, y: 0 };
  const maximizedSize = workspaceBounds
    ? { width: workspaceBounds.width, height: workspaceBounds.height }
    : {
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        height: typeof window !== 'undefined' ? window.innerHeight - 120 : 1080
      };

  const currentPosition = isMaximized ? maximizedPosition : position;
  const currentSize = isMaximized ? maximizedSize : size;

  // Calculate bounds for constrained movement
  const dragBounds = workspaceBounds
    ? {
        top: workspaceBounds.top || 0,
        left: workspaceBounds.left || 0,
        right: (workspaceBounds.right || window.innerWidth) - 100,
        bottom: (workspaceBounds.bottom || window.innerHeight) - 50,
      }
    : 'parent';

  return (
    <Rnd
      position={currentPosition}
      size={currentSize}
      minWidth={400}
      minHeight={300}
      bounds={dragBounds}
      dragHandleClassName="window-titlebar-drag"
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onMouseDown={handleFocus}
      style={{ zIndex }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`window-container ${isFocused ? 'window-focused' : ''} ${isMaximized ? 'window-maximized' : ''}`}
      >
        {/* Title Bar */}
        <div className="window-titlebar">
          {/* macOS-style controls (left side) */}
          <div className="window-controls-left">
            <button
              onClick={handleClose}
              className="window-control-btn window-control-close"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
            <button
              onClick={handleMinimize}
              className="window-control-btn window-control-minimize"
              aria-label="Minimize"
            >
              <span className="material-symbols-outlined text-xs">remove</span>
            </button>
            <button
              onClick={handleMaximize}
              className="window-control-btn window-control-maximize"
              aria-label="Maximize"
            >
              <span className="material-symbols-outlined text-xs">
                {isMaximized ? 'close_fullscreen' : 'open_in_full'}
              </span>
            </button>
          </div>

          {/* Title (center) - draggable area */}
          <div className="window-titlebar-drag window-title-content">
            {icon && (
              <span className="material-symbols-outlined text-base mr-2">
                {icon}
              </span>
            )}
            <span className="window-title-text">{title}</span>
          </div>

          {/* Right side spacer for symmetry */}
          <div className="window-controls-right"></div>
        </div>

        {/* Content Area */}
        <div className="window-content">
          {children}
        </div>
      </motion.div>
    </Rnd>
  );
};

export default Window;
