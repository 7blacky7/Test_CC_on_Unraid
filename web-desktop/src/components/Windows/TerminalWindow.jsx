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
  icon = 'terminal',
  ...props
}) => {
  const effectiveId = id || windowId;

  // Terminal service URL - proxied by Nginx to ttyd:7681
  const terminalUrl = '/terminal/';

  return (
    <Window
      id={effectiveId}
      title={title}
      icon={icon}
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
