---
name: playwright-scrape
description: Extrahiert strukturierte Daten von Webseiten. Sammelt Text, Links, Bilder und andere Inhalte und speichert sie als JSON oder CSV.
---

# Playwright Web Scraping Skill

Dieses Skill extrahiert strukturierte Daten von Webseiten:
- Alle Links auf einer Seite
- Überschriften (H1, H2, H3)
- Bilder (URLs und Alt-Text)
- Meta-Informationen
- Tabellen → CSV
- Custom Selektoren

## Verwendung

Beispiele:
- "Extrahiere alle Links von github.com"
- "Hol mir alle Überschriften von wikipedia.org"
- "Scrape die Tabelle auf dieser Seite"
- "Sammle alle Bild-URLs von example.com"

## Was kann extrahiert werden?

1. **Links**: Alle `<a href>` Tags
2. **Überschriften**: H1-H6 mit Hierarchie
3. **Bilder**: src, alt, title
4. **Meta-Tags**: title, description, keywords
5. **Tabellen**: Als CSV oder JSON
6. **Custom**: Via CSS-Selektoren

## Output-Formate

- **JSON**: Strukturierte Daten
- **CSV**: Tabellarische Daten
- **TXT**: Reiner Text
- Alle in `/workspace/data/`

## Beispiel Output (JSON)

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "links": [
    {"text": "More information", "url": "https://..."}
  ],
  "headings": {
    "h1": ["Example Domain"],
    "h2": ["About", "Contact"]
  },
  "scraped_at": "2025-12-15T10:00:00Z"
}
```

## Technische Details

- Parser: Playwright + Cheerio-like logic
- Rate-Limiting: Respectful (1 req/sec)
- Retry: 3x bei Fehlern
- Timeout: 30s pro Seite
