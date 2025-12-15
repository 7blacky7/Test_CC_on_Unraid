# Playwright Skills für Claude Code im Docker

Diese Skills ermöglichen Playwright-Browser-Automatisierung direkt in Claude Code - ohne MCP-Server-Probleme!

## 📦 Enthaltene Skills

### 1. playwright-screenshot
Erstellt Screenshots von Webseiten

**Verwendung in Claude Code:**
> "Mach einen Screenshot von google.com"

**Manuell:**
```bash
bash ~/.claude/skills/playwright-screenshot/screenshot.sh https://example.com
```

---

### 2. playwright-navigate
Komplexe Browser-Automatisierung mit Interaktionen

**Verwendung in Claude Code:**
> "Gehe auf google.de, such nach 'Giga' und mach einen Screenshot"

**Manuell:**
```bash
node ~/.claude/skills/playwright-navigate/navigate.js https://google.com screenshot
node ~/.claude/skills/playwright-navigate/navigate.js https://example.com title content
```

---

### 3. playwright-scrape
Web Scraping - extrahiert strukturierte Daten

**Verwendung in Claude Code:**
> "Extrahiere alle Links von github.com"

**Manuell:**
```bash
node ~/.claude/skills/playwright-scrape/scrape.js https://github.com links
node ~/.claude/skills/playwright-scrape/scrape.js https://example.com all
```

---

## 🎯 Wie funktioniert es?

1. **Claude Code erkennt automatisch** wann ein Skill gebraucht wird
2. **Führt das passende Script aus**
3. **Speichert Outputs** in `/workspace/` (persistent auf Unraid)

## 📁 Output-Verzeichnisse

- **Screenshots**: `/workspace/screenshots/`
- **Scraped Data**: `/workspace/data/`
- **Logs**: `/workspace/playwright-logs/`

Auf Unraid: `/mnt/y/appdata/claude-code/workspace/`

## 🔧 Technische Details

- **Browser**: Chromium headless (optimal für Docker)
- **Keine GUI nötig**: Alles headless
- **Kein MCP-Lock-Problem**: Direkte Script-Ausführung
- **Auto-wait**: Playwright wartet auf fertig geladene Seiten
- **Persistent**: Alle Outputs bleiben erhalten

## 🚀 Vorteile gegenüber MCP

| Feature | MCP Playwright | Diese Skills |
|---------|---------------|--------------|
| Lock-Probleme | ❌ Ja | ✅ Nein |
| Setup | ❌ Komplex | ✅ Automatisch |
| Debugging | ❌ Schwer | ✅ Einfach |
| Logs | ❌ Versteckt | ✅ Sichtbar |
| Flexibilität | ❌ Eingeschränkt | ✅ Voll |

## 📚 Beispiele

### Screenshot einer Webseite
```
Du: Mach einen Screenshot von wikipedia.org
Claude: [Nutzt playwright-screenshot skill]
Output: /workspace/screenshots/wikipedia-org-2025-12-15-*.png
```

### Web Scraping
```
Du: Hol mir alle Überschriften von github.com
Claude: [Nutzt playwright-scrape skill]
Output: /workspace/data/scrape-github-com-*.json
```

### Navigation & Interaktion
```
Du: Gehe auf google.com und zeig mir den Titel
Claude: [Nutzt playwright-navigate skill]
Output: Title: Google
```

## 🛠️ Entwicklung

Skills liegen in `/home/claude/.claude/skills/`

Neue Skills hinzufügen:
1. Ordner erstellen: `.claude/skills/my-skill/`
2. `SKILL.md` mit YAML frontmatter erstellen
3. Script erstellen (`.sh` oder `.js`)
4. Ausführbar machen: `chmod +x script.sh`

## 🔍 Debugging

Logs ansehen:
```bash
tail -f /workspace/playwright-logs/*.log
```

Letzten Screenshot ansehen:
```bash
ls -lt /workspace/screenshots/ | head -1
```

## 💡 Tipps

1. **Screenshots gehen nach /workspace/** - du kannst sie direkt auf Unraid ansehen
2. **Scraped Data ist JSON** - einfach zu verarbeiten
3. **Logs helfen bei Problemen** - immer mal reinschauen
4. **Skills sind modular** - jeder macht genau eine Sache gut

---

Entwickelt für Claude Code auf Unraid 🐳
