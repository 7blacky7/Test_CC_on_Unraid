import React, { useEffect, useRef } from 'react';
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
 * - Auto-focus iframe when window is focused for keyboard input
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
  icon = 'terminal',
  isFocused,
  ...props
}) => {
  const effectiveId = id || windowId;
  const iframeRef = useRef(null);

  // Terminal service URL - proxied by Nginx to ttyd:7681
  const terminalUrl = '/terminal/';

  // Auto-focus iframe when window is focused to enable keyboard input
  useEffect(() => {
    if (isFocused && iframeRef.current) {
      // Small delay to ensure iframe is loaded
      const timer = setTimeout(() => {
        iframeRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  return (
    <Window
      id={effectiveId}
      title={title}
      icon={icon}
      isFocused={isFocused}
      {...props}
    >
      <div className="terminal-container" onClick={() => iframeRef.current?.focus()}>
        <iframe
          ref={iframeRef}
          src={terminalUrl}
          className="terminal-iframe"
          title="Terminal"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </Window>
  );
};

export default TerminalWindow;
