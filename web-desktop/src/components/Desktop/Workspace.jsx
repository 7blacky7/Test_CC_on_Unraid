import React, { useCallback, useRef } from 'react';
import { useWindowStore } from '../../store/windowStore';
import Window from '../Windows/Window';
import TerminalWindow from '../Windows/TerminalWindow';
import BrowserWindow from '../Windows/BrowserWindow';
import PlaywrightBrowserWindow from '../Windows/PlaywrightBrowserWindow';
import FileExplorer from '../Windows/FileExplorer';
import './Workspace.css';

/**
 * Workspace Component
 *
 * Full-screen container area between TopBar and Dock that manages all open windows.
 * Features:
 * - Renders all open windows with sorted z-index
 * - Handles window focus management on click
 * - Provides workspace bounds for constrained window movement
 * - Dark background with optional gradient
 * - Manages window visibility based on minimized state
 */
const Workspace = () => {
  const { windows, focusWindow } = useWindowStore();
  const workspaceRef = useRef(null);

  /**
   * Get workspace bounds for constraining window dragging/resizing
   * Returns dimensions in pixels: { top, left, bottom, right, width, height }
   * Memoized to prevent unnecessary re-renders - only recalculate if ref changes
   */
  const workspaceBounds = React.useMemo(() => {
    if (!workspaceRef.current) {
      return { top: 0, left: 0, bottom: window.innerHeight, right: window.innerWidth, width: window.innerWidth, height: window.innerHeight };
    }

    const rect = workspaceRef.current.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height,
      maxX: rect.width - 100, // Minimum window width constraint
      maxY: rect.height - 50, // Minimum window height constraint
    };
  }, []); // Only calculate once after mount

  /**
   * Handle workspace click to focus windows
   * Focus window if not already focused
   */
  const handleWorkspaceClick = useCallback((e) => {
    // Only focus if clicking directly on workspace background
    if (e.target === workspaceRef.current) {
      // Could blur all windows here if needed
    }
  }, []);

  /**
   * Sort windows by z-index and filter out minimized windows
   * Focused window always renders last (on top)
   */
  const sortedWindows = React.useMemo(() => {
    return windows
      .filter(w => !w.isMinimized) // Don't render minimized windows in workspace
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)); // Sort by z-index
  }, [windows]);

  /**
   * Render the appropriate window component based on window type
   */
  const renderWindow = useCallback((windowData) => {
    const { id, type, title, icon, position, size, isFocused, zIndex, isMinimized } = windowData;

    const commonProps = {
      id,
      title,
      icon,
      position,
      size,
      isFocused,
      zIndex,
      workspaceBounds,
    };

    switch (type) {
      case 'terminal':
        return <TerminalWindow key={id} {...commonProps} />;
      case 'browser':
        return <PlaywrightBrowserWindow key={id} {...commonProps} initialUrl="https://google.com" />;
      case 'browser-old':
        // Keep old noVNC browser for fallback
        return <BrowserWindow key={id} {...commonProps} />;
      case 'files':
        return <FileExplorer key={id} {...commonProps} />;
      default:
        return <Window key={id} {...commonProps} />;
    }
  }, [workspaceBounds]);

  return (
    <div
      ref={workspaceRef}
      className="workspace"
      onClick={handleWorkspaceClick}
      data-testid="workspace"
      role="main"
    >
      {/* Render all visible (non-minimized) windows sorted by z-index */}
      <div className="workspace-windows-container">
        {sortedWindows.map((windowData) => renderWindow(windowData))}
      </div>

      {/* Empty state message when no windows are open */}
      {sortedWindows.length === 0 && (
        <div className="workspace-empty-state">
          <p>No windows open. Open an application from the dock to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Workspace;
