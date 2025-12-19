import { chromium } from 'playwright';

/**
 * BrowserStreamService
 * Manages Playwright browser instances with CDP screencast streaming
 */
class BrowserStreamService {
  constructor() {
    this.sessions = new Map(); // sessionId -> { browser, context, page, cdpSession, frameCallback, pendingFrame, isSending }
  }

  /**
   * Create a new browser session
   * @param {string} sessionId - Unique session identifier
   * @returns {Promise<Object>} Session object with browser, page, etc.
   */
  async createSession(sessionId) {
    console.log(`[BrowserStream] Creating browser session: ${sessionId}`);

    // Launch browser
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // Get CDP session
    const client = await context.newCDPSession(page);

    // Store session
    const session = {
      browser,
      context,
      page,
      cdpSession: client,
      frameCallback: null,
      pendingFrame: null,
      isSending: false
    };

    this.sessions.set(sessionId, session);

    // Navigate to blank page
    await page.goto('about:blank');

    console.log(`[BrowserStream] Browser session created: ${sessionId}`);

    return session;
  }

  /**
   * Start CDP screencast for a session
   * @param {string} sessionId - Session identifier
   * @param {Function} frameCallback - Callback for frame data
   */
  async startScreencast(sessionId, frameCallback) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    console.log(`[BrowserStream] Starting screencast: ${sessionId}`);

    session.frameCallback = frameCallback;

    // Start screencast
    await session.cdpSession.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 80,
      maxWidth: 1920,
      maxHeight: 1080,
      everyNthFrame: 1
    });

    // Handle frames
    session.cdpSession.on('Page.screencastFrame', async ({ data, sessionId: frameSessionId }) => {
      // Store latest frame
      session.pendingFrame = { data, frameSessionId };

      // Send frame if not currently sending
      if (!session.isSending) {
        await this._sendFrame(sessionId);
      }
    });

    console.log(`[BrowserStream] Screencast started: ${sessionId}`);
  }

  /**
   * Internal: Send pending frame to client
   * @param {string} sessionId - Session identifier
   * @private
   */
  async _sendFrame(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.pendingFrame) return;

    session.isSending = true;

    const { data, frameSessionId } = session.pendingFrame;

    // Send frame to client via callback
    if (session.frameCallback) {
      session.frameCallback(data);
    }

    // Acknowledge frame to CDP
    try {
      await session.cdpSession.send('Page.screencastFrameAck', {
        sessionId: frameSessionId
      });
    } catch (error) {
      console.error(`[BrowserStream] Frame ack failed: ${error.message}`);
    }

    session.pendingFrame = null;
    session.isSending = false;

    // Send next frame if pending (recursive)
    if (session.pendingFrame) {
      await this._sendFrame(sessionId);
    }
  }

  /**
   * Destroy a browser session and cleanup resources
   * @param {string} sessionId - Session identifier
   */
  async destroySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.log(`[BrowserStream] Destroying browser session: ${sessionId}`);

    try {
      // Stop screencast
      await session.cdpSession.send('Page.stopScreencast').catch(() => {});

      // Close browser
      await session.browser.close();
    } catch (error) {
      console.error(`[BrowserStream] Error destroying session: ${error.message}`);
    }

    this.sessions.delete(sessionId);
    console.log(`[BrowserStream] Browser session destroyed: ${sessionId}`);
  }

  /**
   * Get session by ID
   * @param {string} sessionId - Session identifier
   * @returns {Object|undefined} Session object or undefined
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * Get number of active sessions
   * @returns {number} Active session count
   */
  getSessionCount() {
    return this.sessions.size;
  }
}

// Export singleton instance
const browserStreamService = new BrowserStreamService();
export default browserStreamService;
