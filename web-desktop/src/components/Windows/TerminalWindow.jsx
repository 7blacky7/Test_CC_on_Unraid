import React, { useEffect, useMemo } from 'react';
import { useWindowStore } from '../../store/windowStore';
import Window from './Window';
import './TerminalWindow.css';

/**
 * TerminalWindow Component
 * Wraps the base Window component to display a ttyd terminal via iframe
 *
 * Features:
 * - Wraps base Window component with terminal icon
 * - Iframe displays ttyd service proxied by Nginx at /terminal/
 * - Default size: 800x600
 * - Default position: center of workspace
 * - Terminal icon in header
 * - Responsive iframe that fills content area
 * - No iframe border for seamless integration
 *
 * Props:
 * - windowId: unique identifier for the window (id or windowId)
 * - title: window title (default: "Terminal")
 * - initialPosition: initial position of window (optional)
 * - initialSize: initial size of window (optional)
 * - All other standard window props (focus, close, minimize, maximize)
 */
const TerminalWindow = ({
  id,
  windowId,
  title = 'Terminal',
  initialPosition = null,
  initialSize = null,
  ...props
}) => {
  const { windows } = useWindowStore();
  const effectiveId = id || windowId;
  const currentWindow = useMemo(
    () => windows.find(w => w.id === effectiveId),
    [windows, effectiveId]
  );

  // Terminal service URL - proxied by Nginx to ttyd:7681
  const terminalUrl = '/terminal/';

  // Calculate center position if not provided
  const defaultPosition = useMemo(() => {
    if (initialPosition) return initialPosition;
    if (currentWindow?.position) return currentWindow.position;

    // Center of viewport
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    const windowWidth = initialSize?.width || 800;
    const windowHeight = initialSize?.height || 600;

    return {
      x: Math.max(0, (screenWidth - windowWidth) / 2),
      y: Math.max(0, (screenHeight - windowHeight) / 2),
    };
  }, [initialPosition, currentWindow, initialSize]);

  return (
    <Window
      id={effectiveId}
      title={title}
      initialPosition={defaultPosition}
      initialSize={initialSize || { width: 800, height: 600 }}
      {...props}
    >
      <div className="terminal-container">
        <iframe
          src={terminalUrl}
          className="terminal-iframe"
          title="Terminal"
          allow="clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </Window>
  );
};

export default TerminalWindow;
