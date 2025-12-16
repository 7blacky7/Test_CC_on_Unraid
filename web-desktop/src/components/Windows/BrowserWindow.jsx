import React, { useState, useCallback } from 'react';
import Window from './Window';
import './BrowserWindow.css';

// Browser Window component - noVNC iframe wrapper for desktop access
// Features:
// - Wraps base Window component
// - Contains iframe to /browser/vnc.html (noVNC service routed by Nginx)
// - Default size: 1280x720
// - Default position: offset from center
// - Browser/window icon in title
// - Responsive iframe that covers full window content area
// - Loading indicator while iframe loads
const BrowserWindow = ({
  windowId,
  id,
  title = 'Browser - Playwright',
  icon = 'language',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const resolvedWindowId = windowId || id;

  // Handle iframe load completion
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Handle iframe load error
  const handleIframeError = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <Window
      id={resolvedWindowId}
      title={title}
      icon={icon}
      {...props}
    >
      <div className="browser-container">
        {/* Loading indicator */}
        {isLoading && (
          <div className="browser-loading">
            <div className="spinner"></div>
            <p>Loading Browser...</p>
          </div>
        )}

        {/* noVNC iframe - proxied by Nginx to noVNC:6080 */}
        <iframe
          src="/browser/vnc.html"
          className={`browser-iframe ${isLoading ? 'loading' : 'loaded'}`}
          title="Browser - noVNC Desktop"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="clipboard-read; clipboard-write; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock"
        />
      </div>
    </Window>
  );
};

export default BrowserWindow;
