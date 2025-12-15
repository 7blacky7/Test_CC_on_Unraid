#!/bin/bash

# Playwright Screenshot Script für Docker
# Erstellt Screenshots von Webseiten und speichert sie in /workspace/

set -e

URL="$1"
OUTPUT_NAME="$2"

# Validierung
if [ -z "$URL" ]; then
    echo "❌ Fehler: URL fehlt!"
    echo "Verwendung: $0 <URL> [output-name]"
    exit 1
fi

# Screenshot-Verzeichnis erstellen
mkdir -p /workspace/screenshots

# Output-Name generieren wenn nicht angegeben
if [ -z "$OUTPUT_NAME" ]; then
    # URL zu Filename: https://example.com → example-com.png
    OUTPUT_NAME=$(echo "$URL" | sed -e 's|https\?://||' -e 's|/.*||' -e 's|[^a-zA-Z0-9-]|-|g')
fi

# Timestamp hinzufügen
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT_FILE="/workspace/screenshots/${OUTPUT_NAME}-${TIMESTAMP}.png"

echo "📸 Erstelle Screenshot von: $URL"
echo "💾 Speichere nach: $OUTPUT_FILE"

# Playwright Browser-Pfad setzen
export PLAYWRIGHT_BROWSERS_PATH=/usr/local/share/playwright

# Screenshot erstellen
npx playwright screenshot "$URL" "$OUTPUT_FILE"

echo "✅ Screenshot erstellt!"
echo "📁 Pfad im Container: $OUTPUT_FILE"
echo "📁 Pfad auf Unraid: /mnt/y/appdata/claude-code/workspace/screenshots/$(basename "$OUTPUT_FILE")"

# Datei-Info
ls -lh "$OUTPUT_FILE"
