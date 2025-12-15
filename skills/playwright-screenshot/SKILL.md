---
name: playwright-screenshot
description: Macht Screenshots von Webseiten mit Playwright im Docker-Container. Speichert Bilder in /workspace/ für persistenten Zugriff.
---

# Playwright Screenshot Skill

Dieses Skill nutzt Playwright headless im Docker-Container um Screenshots von Webseiten zu erstellen.

## Verwendung

Sage mir einfach von welcher Webseite du einen Screenshot möchtest, z.B.:
- "Mach einen Screenshot von google.com"
- "Screenshot von https://github.com"
- "Zeig mir wie wikipedia.org aussieht"

## Was passiert

1. Playwright startet einen headless Browser
2. Navigiert zur gewünschten URL
3. Macht einen Screenshot
4. Speichert das Bild in `/workspace/screenshots/`
5. Gibt dir den Pfad zurück

## Output

Screenshots landen in:
- Im Container: `/workspace/screenshots/`
- Auf Unraid: `/mnt/y/appdata/claude-code/workspace/screenshots/`

## Technische Details

- Browser: Chromium headless
- Format: PNG
- Viewport: 1920x1080 (Desktop)
- Timeout: 30 Sekunden
- Auto-wait: Ja (wartet bis Seite geladen)

## Beispiel

```bash
# Intern wird ausgeführt:
npx playwright screenshot https://example.com /workspace/screenshots/example-com.png
```
