import React, { useState, useCallback, useRef, useEffect } from 'react';
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

  // Track dragging and resizing state to prevent circular updates
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  // Local state for position and size during drag/resize
  const [localPosition, setLocalPosition] = useState(position);
  const [localSize, setLocalSize] = useState(size);

  // Sync position and size with props when changed from external sources (not during drag/resize)
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalPosition(position);
    }
  }, [position]);

  useEffect(() => {
    if (!isResizingRef.current) {
      setLocalSize(size);
    }
  }, [size]);

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
   * Handle drag - update local position during drag
   */
  const handleDrag = useCallback((e, d) => {
    isDraggingRef.current = true;
    setLocalPosition({ x: d.x, y: d.y });
  }, []);

  /**
   * Handle drag stop - update store with final position
   */
  const handleDragStop = useCallback((e, d) => {
    const newPosition = { x: d.x, y: d.y };
    setLocalPosition(newPosition);
    updateWindowPosition(id, newPosition);
    isDraggingRef.current = false;
  }, [id, updateWindowPosition]);

  /**
   * Handle resize - update local state during resize
   */
  const handleResize = useCallback((e, direction, ref, delta, position) => {
    isResizingRef.current = true;
    const newSize = {
      width: ref.style.width ? parseInt(ref.style.width) : localSize.width,
      height: ref.style.height ? parseInt(ref.style.height) : localSize.height,
    };
    setLocalSize(newSize);

    // Position can change during resize (e.g., resizing from top/left edges)
    if (position) {
      setLocalPosition(position);
    }
  }, [localSize]);

  /**
   * Handle resize stop - update store with final size and position
   */
  const handleResizeStop = useCallback((e, direction, ref, delta, position) => {
    const newSize = {
      width: ref.style.width ? parseInt(ref.style.width) : localSize.width,
      height: ref.style.height ? parseInt(ref.style.height) : localSize.height,
    };
    setLocalSize(newSize);
    updateWindowSize(id, newSize);

    // Position can change during resize (e.g., resizing from top/left edges)
    if (position) {
      setLocalPosition(position);
      updateWindowPosition(id, position);
    }

    isResizingRef.current = false;
  }, [id, localSize, updateWindowSize, updateWindowPosition]);

  // Maximized window dimensions (accounting for TopBar and Dock)
  const maximizedPosition = { x: 0, y: 0 };
  const maximizedSize = workspaceBounds
    ? { width: workspaceBounds.width, height: workspaceBounds.height }
    : {
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        height: typeof window !== 'undefined' ? window.innerHeight - 120 : 1080
      };

  // For maximized state, we override position/size
  // For normal state, use uncontrolled defaultPosition
  const currentSize = isMaximized ? maximizedSize : localSize;

  // Calculate bounds for constrained movement - memoize to prevent object recreation
  // Note: react-rnd bounds should be relative to the parent, not absolute screen coordinates
  const dragBounds = React.useMemo(() => {
    return workspaceBounds
      ? {
          top: 0,
          left: 0,
          right: workspaceBounds.width - 100, // Ensure window stays visible
          bottom: workspaceBounds.height - 50, // Ensure window stays visible
        }
      : 'parent';
  }, [workspaceBounds]);

  return (
    <Rnd
      position={isMaximized ? maximizedPosition : localPosition}
      size={currentSize}
      minWidth={400}
      minHeight={300}
      dragHandleClassName="window-titlebar-drag"
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      style={{ zIndex }}
    >
      <motion.div
        className={`window-container ${isFocused ? 'window-focused' : ''} ${isMaximized ? 'window-maximized' : ''}`}
        onMouseDown={handleFocus}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        {/* Title Bar */}
        <div className="window-titlebar window-titlebar-drag">
          {/* macOS-style controls (left side) */}
          <div className="window-controls-left" onMouseDown={(e) => e.stopPropagation()}>
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
          <div className="window-title-content">
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
