# Playwright Navigate Skills

Dieses Verzeichnis enthält zwei Versionen des Navigate-Skills:

## 1. navigate.js (Original)
**Eigenständiger Browser**

Startet eine eigene Browser-Instanz für die Navigation.

**Verwendung:**
```bash
node navigate.js <url> [actions...]
```

**Vorteile:**
- Unabhängig vom Browser Stream
- Funktioniert auch wenn Backend offline ist
- Eigene Browser-Konfiguration möglich

**Nachteile:**
- Navigation NICHT im Browser Stream sichtbar
- Startet zusätzliche Browser-Instanz
- Ressourcen-intensiver

---

## 2. navigate-shared.js (Shared Browser)
**Geteilte Browser-Instanz via REST API**

Nutzt den Browser Stream Service über REST API.

**Verwendung:**
```bash
node navigate-shared.js <url> [actions...]
```

**Vorteile:**
- Navigation IM Browser Stream sichtbar
- Nutzt bestehende Browser-Instanz
- Ressourcen-schonend
- Integration mit Desktop UI

**Nachteile:**
- Benötigt laufendes Backend (Port 8080)
- Abhängig vom Browser Stream Service

---

## Welche Version verwenden?

### Verwende `navigate-shared.js` wenn:
- Du die Navigation live im Browser-Fenster sehen willst
- Du mit Claude Code Desktop arbeitest
- Du den Browser Stream bereits nutzt
- Du mehrere Skills koordinieren willst

### Verwende `navigate.js` wenn:
- Du unabhängig vom Browser Stream arbeiten willst
- Du eine isolierte Browser-Umgebung brauchst
- Das Backend nicht verfügbar ist

---

## Beispiele

### Einfache Navigation
```bash
# Original (eigener Browser)
node navigate.js https://github.com

# Shared (Browser Stream)
node navigate-shared.js https://github.com
```

### Mit Screenshot
```bash
# Original
node navigate.js https://google.com screenshot

# Shared (mit Live-Ansicht!)
node navigate-shared.js https://google.com screenshot
```

### Content extrahieren
```bash
# Original
node navigate.js https://example.com title content html

# Shared
node navigate-shared.js https://example.com title content html
```

---

## Integration mit anderen Skills

Mit der Shared-Version können mehrere Skills den gleichen Browser steuern:

```bash
# 1. Navigiere zu einer Seite
node navigate-shared.js https://github.com/login

# 2. Nutze anderen Skill für Login (zukünftig)
# node login-skill.js --username user --password pass

# Beide Skills sehen und nutzen die gleiche Browser-Session!
```

---

## Output-Verzeichnisse

Beide Versionen speichern Daten in:
- Screenshots: `/workspace/screenshots/`
- Logs: `/workspace/playwright-logs/`
- Extracted Data: `/workspace/data/`

---

## Backend Requirements (für navigate-shared.js)

```bash
# Backend muss laufen:
cd backend
npm run dev

# Oder:
node server.js

# Überprüfe Status:
curl http://localhost:8080/api/browser/status
```

---

## Migration Guide

Um von der alten Version zur Shared-Version zu wechseln:

1. **Backend starten:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Browser Stream öffnen:**
   ```
   http://localhost:5173 (oder Desktop URL)
   ```

3. **Shared-Version nutzen:**
   ```bash
   node navigate-shared.js https://example.com
   ```

4. **Im Browser Stream beobachten:**
   Die Navigation ist LIVE sichtbar!

---

## Troubleshooting

### "Connection refused" Error
```
❌ Fehler: fetch failed
```

**Lösung:** Backend ist nicht gestartet
```bash
cd backend
npm run dev
```

### "Browser not active" Warning
```
⚠️ Browser nicht aktiv, wird beim Navigieren gestartet
```

**Lösung:** Normal! Browser wird automatisch gestartet.

### Screenshots werden nicht gespeichert
**Lösung:** Verzeichnis erstellen
```bash
mkdir -p /workspace/screenshots
```

---

## API Referenz (Shared Version)

Die Shared-Version nutzt die BrowserAPI Library (`../lib/browser-api.js`):

```javascript
import { BrowserAPI } from '../lib/browser-api.js';

const browser = new BrowserAPI('http://localhost:8080');

// Navigation
await browser.navigate('https://example.com');

// Screenshot
const result = await browser.screenshot({ fullPage: true });

// Content
const content = await browser.getContent();
console.log(content.title, content.url, content.text);

// Status
const status = await browser.getStatus();
console.log(status.active, status.url);
```

Weitere Methoden siehe `../lib/browser-api.js`.
