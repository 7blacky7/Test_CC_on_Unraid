import React, { useRef, useEffect } from 'react';
import Window from './Window';
import BrowserToolbar from './BrowserToolbar';
import useBrowserStream from '../../hooks/useBrowserStream';

/**
 * PlaywrightBrowserWindow Component
 * Browser window with live CDP screencast streaming
 *
 * Features:
 * - Real-time browser view via Playwright CDP screencast
 * - Mouse and keyboard input forwarding
 * - URL navigation with toolbar
 * - Automatic coordinate scaling for resized windows
 * - WebSocket-based bidirectional communication
 */
const PlaywrightBrowserWindow = ({
  windowId,
  id,
  title = 'Browser',
  icon = 'language',
  initialUrl = 'https://google.com',
  ...props
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const resolvedWindowId = windowId || id;

  // Browser stream state and actions
  const {
    currentFrame,
    url,
    loading,
    connected,
    canGoBack,
    canGoForward,
    viewport,
    sendClick,
    sendScroll,
    sendKey,
    navigate,
    goBack,
    goForward,
    reload,
    sendResize
  } = useBrowserStream();

  /**
   * Render frame to canvas when new frame arrives
   */
  useEffect(() => {
    if (!currentFrame || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = `data:image/jpeg;base64,${currentFrame}`;
  }, [currentFrame]);

  /**
   * Navigate to initial URL when connected
   */
  useEffect(() => {
    if (connected && initialUrl && url === 'about:blank') {
      // Small delay to ensure browser is ready
      setTimeout(() => {
        navigate(initialUrl);
      }, 500);
    }
  }, [connected]);

  /**
   * Handle window resize - adjust browser viewport dynamically
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        // Only resize if dimensions actually changed and are reasonable
        if (width > 300 && height > 200 && (width !== viewport.width || height !== viewport.height)) {
          // Debounce resize events (wait 500ms after last resize)
          if (window.resizeTimeout) clearTimeout(window.resizeTimeout);

          window.resizeTimeout = setTimeout(() => {
            const newWidth = Math.floor(width);
            const newHeight = Math.floor(height - 40); // Subtract toolbar height

            console.log(`[PlaywrightBrowser] Window resized to: ${newWidth}x${newHeight}`);
            sendResize(newWidth, newHeight);
          }, 500);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (window.resizeTimeout) clearTimeout(window.resizeTimeout);
    };
  }, [viewport, sendResize]);

  /**
   * Handle canvas click events
   * Calculates scaled coordinates and forwards to browser
   */
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale coordinates to viewport size
    const scaleX = viewport.width / rect.width;
    const scaleY = viewport.height / rect.height;

    const scaledX = Math.round(x * scaleX);
    const scaledY = Math.round(y * scaleY);

    const button = e.button === 2 ? 'right' : e.button === 1 ? 'middle' : 'left';

    sendClick(scaledX, scaledY, button);
  };

  /**
   * Handle canvas scroll events
   */
  const handleWheel = (e) => {
    e.preventDefault();
    sendScroll(e.deltaX, e.deltaY);
  };

  /**
   * Handle keyboard events when container is focused
   */
  const handleKeyDown = (e) => {
    // Allow browser shortcuts like Ctrl+T, Ctrl+W, etc.
    // But prevent some default behaviors
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
    sendKey(e.key, 'down');
  };

  const handleKeyUp = (e) => {
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
    sendKey(e.key, 'up');
  };

  return (
    <Window
      id={resolvedWindowId}
      title={url || title}
      icon={icon}
      {...props}
    >
      <div
        ref={containerRef}
        className="flex flex-col h-full bg-white"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        {/* Browser Toolbar */}
        <BrowserToolbar
          url={url}
          loading={loading}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onNavigate={navigate}
          onBack={goBack}
          onForward={goForward}
          onReload={reload}
        />

        {/* Browser Viewport */}
        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          <canvas
            ref={canvasRef}
            width={viewport.width}
            height={viewport.height}
            className="w-full h-full cursor-default"
            onClick={handleCanvasClick}
            onContextMenu={(e) => e.preventDefault()}
            onWheel={handleWheel}
            style={{ imageRendering: 'auto' }}
          />

          {/* Connection Status Overlay */}
          {!connected && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
              <p className="text-gray-600">Connecting to browser...</p>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && connected && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
              <div className="h-full bg-yellow-400 animate-pulse" style={{ width: '70%' }}></div>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
};

export default PlaywrightBrowserWindow;
