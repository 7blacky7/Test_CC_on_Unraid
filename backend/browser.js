import express from 'express';
import browserStreamService from './services/browserStreamService.js';

const router = express.Router();

/**
 * Browser API Routes
 * Provides REST endpoints for browser control using shared browser instance
 */

// Default session ID for shared browser instance
const DEFAULT_SESSION_ID = 'default';

/**
 * Helper: Get or create default session
 */
async function ensureDefaultSession() {
  let session = browserStreamService.getSession(DEFAULT_SESSION_ID);

  if (!session) {
    console.log('[Browser API] Creating default session...');
    session = await browserStreamService.createSession(DEFAULT_SESSION_ID);
  }

  return session;
}

/**
 * POST /api/browser/navigate
 * Navigate to a URL
 *
 * Body: { url: string }
 */
router.post('/navigate', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    console.log(`[Browser API] Navigate to: ${url}`);

    const session = await ensureDefaultSession();
    const { page } = session;

    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    const title = await page.title();
    const currentUrl = page.url();

    res.json({
      success: true,
      data: {
        url: currentUrl,
        title,
        status: response ? response.status() : null,
        ok: response ? response.ok() : false
      }
    });

  } catch (error) {
    console.error('[Browser API] Navigate error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/browser/click
 * Click at coordinates
 *
 * Body: { x: number, y: number, button?: 'left' | 'right' | 'middle' }
 */
router.post('/click', async (req, res) => {
  try {
    const { x, y, button = 'left' } = req.body;

    if (x === undefined || y === undefined) {
      return res.status(400).json({
        success: false,
        error: 'x and y coordinates are required'
      });
    }

    console.log(`[Browser API] Click at (${x}, ${y}) with ${button} button`);

    const session = await ensureDefaultSession();
    const { page } = session;

    await page.mouse.click(x, y, { button });

    res.json({
      success: true,
      data: {
        x,
        y,
        button,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('[Browser API] Click error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/browser/screenshot
 * Take screenshot of current page
 *
 * Body: { fullPage?: boolean, type?: 'png' | 'jpeg', quality?: number }
 */
router.post('/screenshot', async (req, res) => {
  try {
    const { fullPage = false, type = 'png', quality = 80 } = req.body;

    console.log(`[Browser API] Taking screenshot (fullPage: ${fullPage})`);

    const session = await ensureDefaultSession();
    const { page } = session;

    const screenshot = await page.screenshot({
      fullPage,
      type,
      quality: type === 'jpeg' ? quality : undefined
    });

    res.json({
      success: true,
      data: {
        screenshot: screenshot.toString('base64'),
        type,
        fullPage,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('[Browser API] Screenshot error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/browser/content
 * Get page content (title, url, text, html)
 */
router.get('/content', async (req, res) => {
  try {
    console.log('[Browser API] Getting page content');

    const session = await ensureDefaultSession();
    const { page } = session;

    const title = await page.title();
    const url = page.url();
    const html = await page.content();
    const textContent = await page.evaluate(() => document.body.innerText);

    res.json({
      success: true,
      data: {
        title,
        url,
        html,
        text: textContent,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('[Browser API] Content error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/browser/evaluate
 * Execute JavaScript code in browser context
 *
 * Body: { code: string }
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required'
      });
    }

    console.log('[Browser API] Evaluating JavaScript code');

    const session = await ensureDefaultSession();
    const { page } = session;

    const result = await page.evaluate((codeString) => {
      // Execute code in page context
      return eval(codeString);
    }, code);

    res.json({
      success: true,
      data: {
        result,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('[Browser API] Evaluate error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/browser/type
 * Type text in focused element or at specific selector
 *
 * Body: { text: string, selector?: string }
 */
router.post('/type', async (req, res) => {
  try {
    const { text, selector } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    console.log(`[Browser API] Typing text${selector ? ` in ${selector}` : ''}`);

    const session = await ensureDefaultSession();
    const { page } = session;

    if (selector) {
      await page.type(selector, text);
    } else {
      await page.keyboard.type(text);
    }

    res.json({
      success: true,
      data: {
        text,
        selector: selector || null,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('[Browser API] Type error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/browser/wait
 * Wait for selector, navigation, or timeout
 *
 * Body: { selector?: string, timeout?: number, navigation?: boolean }
 */
router.post('/wait', async (req, res) => {
  try {
    const { selector, timeout = 30000, navigation = false } = req.body;

    console.log(`[Browser API] Waiting for ${selector || navigation ? 'navigation' : 'timeout'}`);

    const session = await ensureDefaultSession();
    const { page } = session;

    if (selector) {
      await page.waitForSelector(selector, { timeout });
    } else if (navigation) {
      await page.waitForNavigation({ timeout });
    } else {
      await page.waitForTimeout(timeout);
    }

    res.json({
      success: true,
      data: {
        selector: selector || null,
        timeout,
        navigation,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('[Browser API] Wait error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/browser/status
 * Get browser session status
 */
router.get('/status', async (req, res) => {
  try {
    const session = browserStreamService.getSession(DEFAULT_SESSION_ID);

    if (!session) {
      return res.json({
        success: true,
        data: {
          active: false,
          sessionId: DEFAULT_SESSION_ID,
          message: 'No active browser session'
        }
      });
    }

    const { page } = session;
    const url = page.url();
    const title = await page.title();

    res.json({
      success: true,
      data: {
        active: true,
        sessionId: DEFAULT_SESSION_ID,
        url,
        title,
        viewport: page.viewportSize(),
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('[Browser API] Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
