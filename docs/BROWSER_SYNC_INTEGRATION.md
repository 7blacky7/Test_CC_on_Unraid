# Browser Sync Integration - Shared Browser Instance

## Übersicht

Diese Integration ermöglicht es Claude Code Skills, den gleichen Browser zu nutzen wie der Browser Stream. Dadurch sind alle Navigationen und Interaktionen live im Browser-Fenster sichtbar.

## Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Desktop UI)                    │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │  Browser Stream      │    │  Terminal / File Manager │  │
│  │  (WebSocket Client)  │    │                          │  │
│  └──────────┬───────────┘    └──────────────────────────┘  │
└─────────────┼───────────────────────────────────────────────┘
              │
              │ WebSocket (Port 8081)
              │
┌─────────────▼───────────────────────────────────────────────┐
│                      Backend Server                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Browser Stream Service                      │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  DEFAULT Session ("default")                   │  │   │
│  │  │  - Chromium Browser Instance                   │  │   │
│  │  │  - CDP Session (Screencast)                    │  │   │
│  │  │  - Page Context                                │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │         ▲                              ▲              │   │
│  │         │                              │              │   │
│  │    WebSocket                      REST API            │   │
│  │    Handler                        Routes              │   │
│  └────────┼──────────────────────────────┼───────────────┘   │
│           │                              │                   │
│      Port 8081                      Port 8080                │
└───────────┼──────────────────────────────┼───────────────────┘
            │                              │
            │                              │
            ▼                              ▼
    ┌───────────────┐            ┌─────────────────┐
    │  WebSocket    │            │  Skills via     │
    │  Clients      │            │  BrowserAPI     │
    │  (Stream UI)  │            │  (REST Client)  │
    └───────────────┘            └─────────────────┘
```

## Komponenten

### 1. Backend REST API (`backend/browser.js`)

Stellt REST-Endpoints für Browser-Kontrolle bereit:

- `POST /api/browser/navigate` - Navigate to URL
- `POST /api/browser/click` - Click at coordinates
- `POST /api/browser/screenshot` - Take screenshot
- `GET /api/browser/content` - Get page content
- `POST /api/browser/evaluate` - Run JS code
- `POST /api/browser/type` - Type text
- `POST /api/browser/wait` - Wait for conditions
- `GET /api/browser/status` - Get browser status

### 2. Session Management

**Default Session:** `"default"`
- Wird beim Server-Start erstellt
- Wird von WebSocket-Clients UND REST API geteilt
- Nur EINE Browser-Instanz für alle

**WebSocket-Clients:**
- Erstellen KEINE eigene Session mehr
- Nutzen die "default" Session
- Erhalten eigene Screencast-Callbacks
- Werden als Client-IDs getrackt (nicht Session-IDs)

### 3. Skills Library (`skills/lib/browser-api.js`)

JavaScript-Client für die Browser REST API:

```javascript
import { BrowserAPI } from '../lib/browser-api.js';

const browser = new BrowserAPI('http://localhost:8080');

// Navigate
await browser.navigate('https://example.com');

// Get content
const content = await browser.getContent();
console.log(content.title, content.url, content.text);

// Screenshot
const screenshot = await browser.screenshot({ fullPage: true });

// Evaluate JS
const result = await browser.evaluate('document.title');
```

### 4. Migration von Skills

**Vorher (eigene Browser-Instanz):**
```javascript
const { chromium } = require('playwright');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://example.com');
await browser.close();
```

**Nachher (Shared Browser via REST API):**
```javascript
import { BrowserAPI } from '../lib/browser-api.js';

const browser = new BrowserAPI('http://localhost:8080');
await browser.navigate('https://example.com');
```

## Setup

### 1. Backend starten

```bash
cd backend
npm install
npm run dev
```

Der Server:
- Erstellt "default" Browser-Session beim Start
- Läuft auf Port 8080 (REST API)
- WebSocket-Server läuft auf Port 8081

### 2. Frontend starten

```bash
cd web-desktop
npm install
npm run dev
```

Desktop UI:
- Läuft auf Port 5173
- Öffnet WebSocket zu Port 8081
- Nutzt "default" Session

### 3. Skills nutzen

```bash
cd skills/playwright-navigate

# Shared Browser (SICHTBAR im Stream!)
node navigate-shared.js https://github.com

# Original (eigener Browser, NICHT sichtbar)
node navigate.js https://github.com
```

## Vorteile

1. **Live-Sichtbarkeit:** Alle Skill-Aktionen sind im Browser-Fenster sichtbar
2. **Ressourcen-Effizienz:** Nur eine Browser-Instanz statt mehrere
3. **Synchronisation:** Mehrere Skills können koordiniert arbeiten
4. **Debugging:** Einfacher zu debuggen durch visuelle Rückmeldung
5. **Konsistenz:** Alle nutzen die gleiche Browser-Konfiguration

## Implementierungsdetails

### Server-Initialisierung (`backend/server.js`)

```javascript
async function initializeServer() {
  // Create default browser session BEFORE starting server
  await browserStreamService.createSession('default');

  // Start Express server
  app.listen(PORT, () => {
    console.log('Server running...');
  });
}

// Graceful shutdown
async function shutdown() {
  // Destroy default session
  await browserStreamService.destroySession('default');
  process.exit(0);
}
```

### WebSocket-Client-Handling (`backend/websocket/server.js`)

```javascript
wss.on('connection', async (ws) => {
  const clientId = uuidv4(); // Unique client ID

  // Use shared default session
  const browserSession = await ensureDefaultSession();

  // Track client (not session)
  sessions.set(clientId, {
    ws,
    sessionId: 'default',
    ...browserSession
  });

  // Setup screencast for THIS client
  await BrowserStreamService.startScreencast('default', (frameData) => {
    ws.send(JSON.stringify({ type: 'frame', data: frameData }));
  });
});

ws.on('close', () => {
  // Remove client, but DON'T destroy session
  sessions.delete(clientId);
});
```

### BrowserAPI REST Client (`skills/lib/browser-api.js`)

```javascript
export class BrowserAPI {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async navigate(url) {
    return this._request('/navigate', 'POST', { url });
  }

  async _request(endpoint, method, body) {
    const response = await fetch(
      `${this.baseUrl}/api/browser${endpoint}`,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );
    return response.json();
  }
}
```

## Session-Lifecycle

```
Server Start
   │
   ├─> Create "default" session
   │   └─> Launch Chromium
   │       └─> Create Page
   │           └─> Setup CDP
   │
   ├─> WebSocket Client connects
   │   └─> Use "default" session
   │       └─> Start Screencast for client
   │
   ├─> REST API call
   │   └─> Use "default" session
   │       └─> Perform action (navigate, click, etc.)
   │
   ├─> WebSocket Client disconnects
   │   └─> Remove client
   │       └─> Keep "default" session alive!
   │
   └─> Server Shutdown
       └─> Destroy "default" session
           └─> Close browser
```

## Wichtige Unterschiede

### Vorher (Alte Implementierung)

- Jeder WebSocket-Client = Eigene Browser-Session
- Skills = Eigene Browser-Instanzen
- Resultat: Mehrere Browser-Prozesse
- Skills nicht sichtbar im Stream

### Nachher (Neue Implementierung)

- EINE "default" Session für alle
- WebSocket-Clients = Nur Screencast-Empfänger
- Skills = REST API Calls auf "default" Session
- Resultat: Ein Browser-Prozess
- Skills SICHTBAR im Stream!

## Testing

### 1. Status prüfen

```bash
# Backend Status
curl http://localhost:8080/api/browser/status

# Erwartete Antwort:
{
  "success": true,
  "data": {
    "active": true,
    "sessionId": "default",
    "url": "about:blank",
    "title": "",
    "viewport": { "width": 1920, "height": 1080 }
  }
}
```

### 2. Navigation testen

```bash
# Via REST API
curl -X POST http://localhost:8080/api/browser/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'

# Via Skill
node skills/playwright-navigate/navigate-shared.js https://github.com
```

### 3. Im Browser Stream beobachten

1. Öffne: `http://localhost:5173`
2. Führe Navigation aus (siehe oben)
3. Browser Stream zeigt Navigation LIVE!

## Troubleshooting

### "Session not found"

**Problem:** Default session wurde nicht erstellt

**Lösung:**
```bash
# Backend neu starten
cd backend
npm run dev
```

### "Connection refused"

**Problem:** Backend läuft nicht

**Lösung:**
```bash
# Prüfe ob Backend läuft
curl http://localhost:8080/health

# Falls nicht, starte Backend
cd backend
npm run dev
```

### Skills zeigen Fehler

**Problem:** BrowserAPI kann Backend nicht erreichen

**Lösung:**
```javascript
// Prüfe baseUrl in Skill
const browser = new BrowserAPI('http://localhost:8080');
// oder
const browser = new BrowserAPI(process.env.BACKEND_URL);
```

### Browser Stream zeigt keine Updates

**Problem:** WebSocket-Verbindung fehlgeschlagen

**Lösung:**
1. Prüfe ob WebSocket-Server läuft (Port 8081)
2. Prüfe Browser-Console auf Fehler
3. Stelle sicher, dass "default" Session existiert

## Erweiterungen

### Eigene Skills mit BrowserAPI erstellen

```javascript
#!/usr/bin/env node
import { BrowserAPI } from '../lib/browser-api.js';

async function myCustomSkill() {
  const browser = new BrowserAPI();

  // 1. Navigate
  await browser.navigate('https://example.com');

  // 2. Interact
  await browser.evaluate(`
    document.querySelector('button').click();
  `);

  // 3. Wait
  await browser.wait({ timeout: 2000 });

  // 4. Extract data
  const content = await browser.getContent();
  console.log(content.text);

  // 5. Screenshot
  const screenshot = await browser.screenshot({ fullPage: true });
  // screenshot.screenshot ist base64-encoded
}

myCustomSkill();
```

### Mehrere Aktionen koordinieren

```javascript
import { BrowserAPI } from '../lib/browser-api.js';

async function workflow() {
  const browser = new BrowserAPI();

  // Step 1: Login
  await browser.navigate('https://example.com/login');
  await browser.type('user@example.com', '#email');
  await browser.type('password123', '#password');
  await browser.evaluate('document.querySelector("form").submit()');
  await browser.wait({ timeout: 2000 });

  // Step 2: Navigate to dashboard
  await browser.navigate('https://example.com/dashboard');
  await browser.wait({ selector: '.dashboard-loaded' });

  // Step 3: Extract data
  const data = await browser.evaluate(`
    Array.from(document.querySelectorAll('.item'))
      .map(el => el.textContent)
  `);

  console.log('Extracted:', data);
}

workflow();
```

## Best Practices

1. **Fehlerbehandlung:** Immer try-catch verwenden
2. **Timeouts:** Realistische Timeouts setzen
3. **Status prüfen:** Vor Aktionen Status abfragen
4. **Cleanup:** Bei Fehlern aufräumen (nicht nötig für Session)
5. **Logging:** Aktionen loggen für Debugging

## Sicherheit

- REST API hat derzeit KEINE Authentifizierung
- Für Produktion: JWT-Auth hinzufügen
- Nur localhost-Zugriff in Entwicklung
- CORS konfiguriert für alle Origins (nur Dev!)

## Performance

- Ein Browser-Prozess statt mehrere
- Screencast-Optimierungen (JPEG, 75% Quality)
- Frame-Throttling für WebSocket
- Async/Await für alle Operationen

## Roadmap

- [ ] Authentication für Browser API
- [ ] Browser-Pool für Multi-User
- [ ] Session-TTL und Auto-Cleanup
- [ ] Browser-Recording/Playback
- [ ] Advanced Interactions (Drag&Drop, etc.)
- [ ] Browser-Profil-Management
- [ ] Cookie/Storage-Persistence

## Siehe auch

- `backend/browser.js` - REST API Implementation
- `backend/services/browserStreamService.js` - Session Management
- `skills/lib/browser-api.js` - Client Library
- `skills/playwright-navigate/README.md` - Skill Documentation
- `skills/browser-examples/` - Usage Examples
