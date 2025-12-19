# Browser Sync Integration - Quick Start

## Was ist das?

Die **Browser Sync Integration** ermöglicht es Claude Code Skills, den gleichen Browser zu nutzen wie der Browser Stream. Dadurch sind alle Navigationen und Interaktionen **live im Browser-Fenster sichtbar**!

## Schnellstart

### 1. Backend starten
```bash
cd backend
npm run dev
```

### 2. Frontend starten (Browser Stream)
```bash
cd web-desktop
npm run dev
```

Öffne: http://localhost:5173

### 3. Skill ausführen
```bash
cd skills/playwright-navigate
node navigate-shared.js https://github.com
```

**Ergebnis:** Die Navigation ist **live im Browser Stream sichtbar**!

## Vorher vs. Nachher

### Vorher
```
Claude Code Skill
    ↓
Eigene Browser-Instanz (chromium.launch())
    ↓
❌ NICHT sichtbar im Browser Stream
```

### Nachher
```
Claude Code Skill
    ↓
Shared Browser Instance (via REST API)
    ↓
✅ SICHTBAR im Browser Stream!
```

## Architektur

```
┌─────────────────────┐
│  Browser Stream UI  │  ← WebSocket Client
│   (Port 5173)       │
└──────────┬──────────┘
           │
           │ WebSocket (Port 8081)
           │
┌──────────▼──────────┐
│  Backend Server     │
│   (Port 8080)       │
│  ┌──────────────┐   │
│  │   DEFAULT    │   │  ← Eine Browser-Instanz
│  │   Session    │   │     für ALLE!
│  └──────────────┘   │
│         ▲           │
│         │           │
│    REST API         │
└─────────┼───────────┘
          │
    ┌─────┴─────┐
    │           │
Skills       WebSocket
(REST)       Clients
```

## Dateien

### Neu erstellt
- `backend/browser.js` - REST API für Browser-Kontrolle
- `skills/lib/browser-api.js` - Client-Library für Skills
- `skills/playwright-navigate/navigate-shared.js` - Shared Browser Skill
- `skills/browser-examples/` - Beispiel-Skills
- `docs/BROWSER_SYNC_INTEGRATION.md` - Vollständige Dokumentation

### Modifiziert
- `backend/server.js` - Browser API Integration
- `backend/websocket/server.js` - Shared Session Management

### Unverändert
- `backend/services/browserStreamService.js` - Weiterhin verwendet
- `skills/playwright-navigate/navigate.js` - Original bleibt verfügbar

## REST API Endpoints

```
POST   /api/browser/navigate      - Navigate to URL
POST   /api/browser/click         - Click at coordinates
POST   /api/browser/screenshot    - Take screenshot
GET    /api/browser/content       - Get page content
POST   /api/browser/evaluate      - Run JavaScript
POST   /api/browser/type          - Type text
POST   /api/browser/wait          - Wait for conditions
GET    /api/browser/status        - Get browser status
```

## Beispiele

### Status prüfen
```bash
curl http://localhost:8080/api/browser/status
```

### Navigation
```bash
curl -X POST http://localhost:8080/api/browser/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'
```

### Screenshot
```bash
curl -X POST http://localhost:8080/api/browser/screenshot \
  -H "Content-Type: application/json" \
  -d '{"fullPage": true}'
```

### Skill verwenden
```bash
# Einfache Navigation
node skills/playwright-navigate/navigate-shared.js https://github.com

# Mit Screenshot
node skills/playwright-navigate/navigate-shared.js https://github.com screenshot

# Mit Content-Extraktion
node skills/playwright-navigate/navigate-shared.js https://github.com title content
```

### Eigenen Skill erstellen
```javascript
import { BrowserAPI } from '../lib/browser-api.js';

async function mySkill() {
  const browser = new BrowserAPI('http://localhost:8080');

  // Navigate
  await browser.navigate('https://example.com');

  // Get content
  const content = await browser.getContent();
  console.log(content.title);

  // Screenshot
  const screenshot = await browser.screenshot({ fullPage: true });
  // screenshot.screenshot ist base64
}

mySkill();
```

## Testing

### Automatischer Test
```bash
./test-browser-sync.sh
```

### Manueller Test
```bash
# 1. Status
node skills/browser-examples/example-status.js

# 2. Google Search
node skills/browser-examples/example-search.js "Claude AI"

# 3. Navigation
node skills/playwright-navigate/navigate-shared.js https://github.com
```

## Vorteile

✅ **Live-Sichtbarkeit** - Alle Skills-Aktionen im Browser Stream sichtbar
✅ **Ressourcen-Effizienz** - Eine Browser-Instanz statt mehrere
✅ **Synchronisation** - Mehrere Skills können koordiniert arbeiten
✅ **Debugging** - Visuelles Feedback während der Ausführung
✅ **Abwärtskompatibel** - Alte Skills funktionieren weiterhin

## Dokumentation

- **Quick Start:** Diese Datei
- **Vollständige Docs:** `docs/BROWSER_SYNC_INTEGRATION.md`
- **Skill Docs:** `skills/playwright-navigate/README.md`
- **Änderungen:** `CHANGES.md`

## Troubleshooting

### Backend startet nicht
```bash
cd backend
npm install
npm run dev
```

### "Connection refused"
Backend läuft nicht → siehe oben

### Skills zeigen keine Fehler, aber nichts passiert
1. Prüfe Backend-Logs
2. Prüfe Browser Stream Fenster
3. Führe `./test-browser-sync.sh` aus

### Browser Stream zeigt keine Updates
1. WebSocket-Verbindung prüfen (Browser Console)
2. Backend neu starten
3. Frontend neu laden

## Support

Bei Fragen siehe:
- `docs/BROWSER_SYNC_INTEGRATION.md` - Vollständige Dokumentation
- `skills/playwright-navigate/README.md` - Skill-spezifische Docs
- Backend Console Logs - Für Debugging

## Nächste Schritte

1. ✅ Backend starten
2. ✅ Frontend starten
3. ✅ Test ausführen: `./test-browser-sync.sh`
4. ✅ Skills ausprobieren
5. ✅ Eigene Skills erstellen mit BrowserAPI

Viel Erfolg!
