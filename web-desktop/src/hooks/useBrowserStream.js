import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing browser WebSocket stream
 * Handles connection, frame receiving, and input sending
 */
const useBrowserStream = () => {
  const [currentFrame, setCurrentFrame] = useState(null);
  const [url, setUrl] = useState('about:blank');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [viewport, setViewport] = useState({ width: 1920, height: 1080 });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const retriesRef = useRef(0);
  const maxRetries = 10;

  /**
   * Establish WebSocket connection
   */
  const connect = () => {
    // WebSocket URL - use relative path for proxy
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/browser`;

    console.log('[BrowserStream] Connecting to:', wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[BrowserStream] WebSocket connected');
      setConnected(true);
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'connected':
          console.log('[BrowserStream] Browser session created:', message.sessionId);
          setViewport(message.viewport);
          setLoading(false);
          break;

        case 'frame':
          setCurrentFrame(message.data);
          setLoading(false);
          break;

        case 'navigation':
          console.log('[BrowserStream] Navigated to:', message.url);
          setUrl(message.url);
          setLoading(false);
          // TODO: Get actual canGoBack/canGoForward from backend
          // For now, assume we can go back after first navigation
          if (message.url !== 'about:blank') {
            setCanGoBack(true);
          }
          break;

        case 'error':
          console.error('[BrowserStream] Error:', message.message);
          setLoading(false);
          break;

        case 'browser_restarted':
          console.log('[BrowserStream] Browser restarted after crash');
          setLoading(false);
          break;

        default:
          console.warn('[BrowserStream] Unknown message type:', message.type);
      }
    };

    ws.onerror = (error) => {
      console.error('[BrowserStream] WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('[BrowserStream] WebSocket disconnected');
      setConnected(false);
      wsRef.current = null;

      // Auto-reconnect with exponential backoff
      if (retriesRef.current < maxRetries) {
        const delay = Math.min(1000 * (2 ** retriesRef.current), 30000);
        console.log(`[BrowserStream] Reconnecting in ${delay}ms... (attempt ${retriesRef.current + 1}/${maxRetries})`);

        reconnectTimeoutRef.current = setTimeout(() => {
          retriesRef.current++;
          connect();
        }, delay);
      } else {
        console.error('[BrowserStream] Max reconnect attempts reached');
      }
    };

    wsRef.current = ws;
  };

  /**
   * Initialize WebSocket connection on mount
   */
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  /**
   * Send message to WebSocket server
   * @param {Object} message - Message object
   */
  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[BrowserStream] WebSocket not connected, cannot send:', message.type);
    }
  };

  /**
   * Send click event to browser
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} button - Mouse button ('left', 'right', 'middle')
   */
  const sendClick = (x, y, button = 'left') => {
    sendMessage({ type: 'click', x, y, button });
  };

  /**
   * Send scroll event to browser
   * @param {number} deltaX - Horizontal scroll delta
   * @param {number} deltaY - Vertical scroll delta
   */
  const sendScroll = (deltaX, deltaY) => {
    sendMessage({ type: 'scroll', deltaX, deltaY });
  };

  /**
   * Send keyboard event to browser
   * @param {string} key - Key name
   * @param {string} action - 'down' or 'up'
   */
  const sendKey = (key, action = 'down') => {
    sendMessage({ type: action === 'down' ? 'keydown' : 'keyup', key });
  };

  /**
   * Navigate to URL
   * @param {string} targetUrl - URL to navigate to
   */
  const navigate = (targetUrl) => {
    setLoading(true);
    sendMessage({ type: 'navigate', url: targetUrl });
  };

  /**
   * Navigate back in history
   */
  const goBack = () => {
    if (canGoBack) {
      setLoading(true);
      sendMessage({ type: 'back' });
    }
  };

  /**
   * Navigate forward in history
   */
  const goForward = () => {
    if (canGoForward) {
      setLoading(true);
      sendMessage({ type: 'forward' });
    }
  };

  /**
   * Reload current page
   */
  const reload = () => {
    setLoading(true);
    sendMessage({ type: 'reload' });
  };

  return {
    // State
    currentFrame,
    url,
    loading,
    connected,
    canGoBack,
    canGoForward,
    viewport,

    // Actions
    sendClick,
    sendScroll,
    sendKey,
    navigate,
    goBack,
    goForward,
    reload
  };
};

export default useBrowserStream;
