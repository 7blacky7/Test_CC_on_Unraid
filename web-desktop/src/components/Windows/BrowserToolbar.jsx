import React, { useState, useEffect } from 'react';

/**
 * BrowserToolbar Component
 * Navigation controls and URL bar for the browser window
 */
const BrowserToolbar = ({
  url,
  loading,
  canGoBack,
  canGoForward,
  onNavigate,
  onBack,
  onForward,
  onReload
}) => {
  const [inputUrl, setInputUrl] = useState(url || '');

  // Update input when URL changes (e.g., from navigation)
  useEffect(() => {
    setInputUrl(url || '');
  }, [url]);

  /**
   * Handle URL submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    let targetUrl = inputUrl.trim();

    if (!targetUrl) return;

    // Add https:// if no protocol
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    onNavigate(targetUrl);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
      {/* Navigation Buttons */}
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          !canGoBack ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Back"
        aria-label="Go back"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={onForward}
        disabled={!canGoForward}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          !canGoForward ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Forward"
        aria-label="Go forward"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <button
        onClick={onReload}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        title="Reload"
        aria-label="Reload page"
      >
        <svg
          className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* URL Bar */}
      <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter URL..."
          className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-yellow-400 bg-white"
          aria-label="URL"
        />
        <button
          type="submit"
          className="px-4 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500 font-medium transition-colors"
          aria-label="Navigate"
        >
          Go
        </button>
      </form>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default BrowserToolbar;
