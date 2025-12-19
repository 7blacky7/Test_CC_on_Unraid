/**
 * BrowserAPI - Shared Browser Instance Client
 *
 * Provides a simple API to interact with the shared browser instance
 * running in the backend via REST API endpoints.
 *
 * This ensures all browser operations are visible in the Browser Stream UI.
 */

export class BrowserAPI {
  /**
   * Create a new BrowserAPI instance
   * @param {string} baseUrl - Base URL of the backend server
   */
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a request to the browser API
   * @private
   * @param {string} endpoint - API endpoint (e.g., '/navigate')
   * @param {string} method - HTTP method
   * @param {Object} body - Request body
   * @returns {Promise<Object>} Response data
   */
  async _request(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}/api/browser${endpoint}`;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }

      return data.data;
    } catch (error) {
      console.error(`[BrowserAPI] ${method} ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   * @returns {Promise<Object>} Navigation result with url, title, status
   */
  async navigate(url) {
    console.log(`[BrowserAPI] Navigating to: ${url}`);
    return this._request('/navigate', 'POST', { url });
  }

  /**
   * Click at coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} button - Mouse button ('left', 'right', 'middle')
   * @returns {Promise<Object>} Click result
   */
  async click(x, y, button = 'left') {
    console.log(`[BrowserAPI] Clicking at (${x}, ${y}) with ${button} button`);
    return this._request('/click', 'POST', { x, y, button });
  }

  /**
   * Take a screenshot
   * @param {Object} options - Screenshot options
   * @param {boolean} options.fullPage - Capture full page
   * @param {string} options.type - Image type ('png' or 'jpeg')
   * @param {number} options.quality - JPEG quality (0-100)
   * @returns {Promise<Object>} Screenshot result with base64 data
   */
  async screenshot(options = {}) {
    const { fullPage = false, type = 'png', quality = 80 } = options;
    console.log(`[BrowserAPI] Taking screenshot (fullPage: ${fullPage})`);
    return this._request('/screenshot', 'POST', { fullPage, type, quality });
  }

  /**
   * Get page content
   * @returns {Promise<Object>} Page content with title, url, html, text
   */
  async getContent() {
    console.log('[BrowserAPI] Getting page content');
    return this._request('/content', 'GET');
  }

  /**
   * Evaluate JavaScript code in browser context
   * @param {string} code - JavaScript code to execute
   * @returns {Promise<Object>} Evaluation result
   */
  async evaluate(code) {
    console.log('[BrowserAPI] Evaluating JavaScript code');
    return this._request('/evaluate', 'POST', { code });
  }

  /**
   * Type text
   * @param {string} text - Text to type
   * @param {string} selector - Optional selector to type in
   * @returns {Promise<Object>} Type result
   */
  async type(text, selector = null) {
    console.log(`[BrowserAPI] Typing text${selector ? ` in ${selector}` : ''}`);
    return this._request('/type', 'POST', { text, selector });
  }

  /**
   * Wait for selector, navigation, or timeout
   * @param {Object} options - Wait options
   * @param {string} options.selector - Selector to wait for
   * @param {number} options.timeout - Timeout in milliseconds
   * @param {boolean} options.navigation - Wait for navigation
   * @returns {Promise<Object>} Wait result
   */
  async wait(options = {}) {
    const { selector = null, timeout = 30000, navigation = false } = options;
    console.log(`[BrowserAPI] Waiting for ${selector || navigation ? 'navigation' : 'timeout'}`);
    return this._request('/wait', 'POST', { selector, timeout, navigation });
  }

  /**
   * Get browser session status
   * @returns {Promise<Object>} Status with active, url, title, viewport
   */
  async getStatus() {
    console.log('[BrowserAPI] Getting browser status');
    return this._request('/status', 'GET');
  }

  /**
   * Get page title
   * @returns {Promise<string>} Page title
   */
  async getTitle() {
    const content = await this.getContent();
    return content.title;
  }

  /**
   * Get current URL
   * @returns {Promise<string>} Current URL
   */
  async getUrl() {
    const content = await this.getContent();
    return content.url;
  }

  /**
   * Get page text content
   * @returns {Promise<string>} Page text
   */
  async getText() {
    const content = await this.getContent();
    return content.text;
  }

  /**
   * Get page HTML
   * @returns {Promise<string>} Page HTML
   */
  async getHtml() {
    const content = await this.getContent();
    return content.html;
  }

  /**
   * Check if browser is active
   * @returns {Promise<boolean>} True if browser is active
   */
  async isActive() {
    const status = await this.getStatus();
    return status.active;
  }
}

// Export default instance
export default new BrowserAPI();
