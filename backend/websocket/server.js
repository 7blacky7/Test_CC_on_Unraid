import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import BrowserStreamService from '../services/browserStreamService.js';

const PORT = process.env.WS_PORT || 8081;
const MAX_BROWSERS = 5;
const DEFAULT_SESSION_ID = 'default';

const wss = new WebSocketServer({ port: PORT });
const sessions = new Map(); // sessionId -> { ws, browser, page, cdpSession }

console.log(`[WebSocket] Server starting on port ${PORT}`);

// Ensure default session exists
async function ensureDefaultSession() {
  let session = BrowserStreamService.getSession(DEFAULT_SESSION_ID);

  if (!session) {
    console.log('[WebSocket] Creating default browser session...');
    session = await BrowserStreamService.createSession(DEFAULT_SESSION_ID);
    console.log('[WebSocket] Default browser session created');
  }

  return session;
}

wss.on('connection', async (ws) => {
  console.log('[WebSocket] Client connected');

  // Use unique client ID for tracking
  const clientId = uuidv4();
  console.log(`[WebSocket] Client ID: ${clientId}`);

  try {
    // Use shared default browser session instead of creating new one
    const browserSession = await ensureDefaultSession();

    // Store client with reference to shared session
    sessions.set(clientId, {
      ws,
      sessionId: DEFAULT_SESSION_ID,
      ...browserSession
    });

    // Setup CDP screencast for this client
    // Each client gets their own screencast callback but shares the same page
    await BrowserStreamService.startScreencast(DEFAULT_SESSION_ID, (frameData) => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify({
          type: 'frame',
          data: frameData,
          timestamp: Date.now()
        }));
      }
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      sessionId: DEFAULT_SESSION_ID,
      clientId: clientId,
      viewport: { width: 1920, height: 1080 }
    }));

    console.log(`[WebSocket] Client ready (using default session): ${clientId}`);

  } catch (error) {
    console.error('[WebSocket] Failed to setup client session:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to connect to browser'
    }));
    ws.close();
    return;
  }

  // Handle incoming messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      await handleMessage(clientId, data);
    } catch (error) {
      console.error('[WebSocket] Message handling error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  // Handle disconnect
  ws.on('close', async () => {
    console.log(`[WebSocket] Client disconnected: ${clientId}`);
    // Don't destroy the default session, just remove this client
    sessions.delete(clientId);
    console.log(`[WebSocket] Client removed, ${sessions.size} clients remaining`);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error);
  });
});

/**
 * Handle incoming WebSocket messages
 * @param {string} clientId - Client identifier
 * @param {Object} message - Parsed message object
 */
async function handleMessage(clientId, message) {
  const session = sessions.get(clientId);
  if (!session) {
    console.warn(`[WebSocket] Client not found: ${clientId}`);
    return;
  }

  const { page, ws } = session;

  try {
    switch (message.type) {
      case 'click':
        await page.mouse.click(message.x, message.y, {
          button: message.button || 'left'
        });
        break;

      case 'mousemove':
        await page.mouse.move(message.x, message.y);
        break;

      case 'scroll':
        await page.mouse.wheel(message.deltaX || 0, message.deltaY || 0);
        break;

      case 'keydown':
        await page.keyboard.down(message.key);
        break;

      case 'keyup':
        await page.keyboard.up(message.key);
        break;

      case 'type':
        await page.keyboard.type(message.text);
        break;

      case 'navigate':
        console.log(`[WebSocket] Navigating to: ${message.url}`);
        const response = await page.goto(message.url, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });

        ws.send(JSON.stringify({
          type: 'navigation',
          url: page.url(),
          title: await page.title(),
          success: response && response.ok()
        }));
        break;

      case 'back':
        await page.goBack({ waitUntil: 'domcontentloaded' });
        ws.send(JSON.stringify({
          type: 'navigation',
          url: page.url(),
          title: await page.title()
        }));
        break;

      case 'forward':
        await page.goForward({ waitUntil: 'domcontentloaded' });
        ws.send(JSON.stringify({
          type: 'navigation',
          url: page.url(),
          title: await page.title()
        }));
        break;

      case 'reload':
        await page.reload({ waitUntil: 'domcontentloaded' });
        ws.send(JSON.stringify({
          type: 'navigation',
          url: page.url(),
          title: await page.title()
        }));
        break;

      case 'resize':
        console.log(`[WebSocket] Resizing viewport to: ${message.width}x${message.height}`);

        // Stop current screencast
        await session.cdpSession.send('Page.stopScreencast').catch(() => {});

        // Set new viewport size
        await page.setViewportSize({
          width: message.width,
          height: message.height
        });

        // Restart screencast with new dimensions
        await session.cdpSession.send('Page.startScreencast', {
          format: 'jpeg',
          quality: 75,
          maxWidth: message.width,
          maxHeight: message.height,
          everyNthFrame: 1
        });

        // Notify client of successful resize
        ws.send(JSON.stringify({
          type: 'resized',
          width: message.width,
          height: message.height
        }));
        break;

      default:
        console.warn(`[WebSocket] Unknown message type: ${message.type}`);
    }
  } catch (error) {
    console.error(`[WebSocket] Error handling ${message.type}:`, error);
    ws.send(JSON.stringify({
      type: 'error',
      message: `Failed to execute ${message.type}: ${error.message}`
    }));
  }
}

console.log(`[WebSocket] Server running on port ${PORT}`);
console.log(`[WebSocket] Max browsers: ${MAX_BROWSERS}`);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[WebSocket] SIGTERM received, closing connections...');

  // Close all WebSocket connections
  for (const [clientId, session] of sessions) {
    console.log(`[WebSocket] Closing client: ${clientId}`);
    session.ws.close();
  }

  // Clear sessions map
  sessions.clear();

  // Note: Default browser session will be destroyed by server.js shutdown

  wss.close(() => {
    console.log('[WebSocket] Server closed');
    process.exit(0);
  });
});

export default wss;
