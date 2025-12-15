---
name: playwright-navigate
description: Navigiert zu Webseiten, führt Aktionen aus (klicken, scrollen, suchen) und macht Screenshots. Perfekt für Web-Automatisierung und Testing.
---

# Playwright Navigate & Interact Skill

Dieses Skill ermöglicht komplexe Browser-Automatisierung mit Playwright:
- Webseiten besuchen
- Auf Elemente klicken
- Formulare ausfüllen
- Scrollen
- Screenshots machen
- Text extrahieren

## Verwendung

Beispiele:
- "Gehe auf google.de, suche nach 'Giga' und mach einen Screenshot"
- "Öffne github.com und klicke auf Sign In"
- "Besuche amazon.de und scrolle nach unten"

## Was kann ich damit machen?

1. **Navigation**: Webseiten öffnen
2. **Interaktion**: Klicken, tippen, scrollen
3. **Formulare**: Eingaben ausfüllen, absenden
4. **Screenshots**: Vor/nach Aktionen
5. **Content**: Text und Daten extrahieren

## Output

- Screenshots: `/workspace/screenshots/`
- Logs: `/workspace/playwright-logs/`
- Extracted Data: `/workspace/data/`

## Technische Details

- Browser: Chromium headless
- Viewport: 1920x1080
- JavaScript: Aktiviert
- Cookies: Unterstützt
- Timeout: 30s pro Aktion

## Beispiel Node.js Code

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://google.com');
  await page.fill('input[name="q"]', 'Giga');
  await page.click('input[type="submit"]');
  await page.screenshot({ path: '/workspace/screenshots/result.png' });
  await browser.close();
})();
```
