#!/bin/bash
# Unraid Update Script - Browser Live Integration
# Erstellt: 2025-12-19
# Branch: browser-live-integration

echo "=========================================="
echo "  Browser Live Integration Update"
echo "=========================================="
echo ""

# Schritt 1: Git Update
echo "📥 Schritt 1: Neuen Branch herunterladen..."
cd /mnt/y/appdata/claude-code-web-desktop || exit 1

git fetch origin
git checkout browser-live-integration
git pull origin browser-live-integration

echo "✅ Git Update fertig!"
echo ""

# Schritt 2: Alten Container stoppen
echo "🛑 Schritt 2: Alten Container stoppen..."
docker stop claude-code-desktop 2>/dev/null
docker rm claude-code-desktop 2>/dev/null
echo "✅ Container gestoppt!"
echo ""

# Schritt 3: Neues Image bauen
echo "🔨 Schritt 3: Docker Image bauen (dauert 2-3 Minuten)..."
docker build -f Dockerfile.desktop -t claude-code-desktop .
echo "✅ Image gebaut!"
echo ""

# Schritt 4: Container starten
echo "🚀 Schritt 4: Container starten..."
docker run -d \
  --name claude-code-desktop \
  -p 60000:3000 \
  -v /mnt/y/appdata/claude-code-web-desktop:/app \
  -v /mnt/y/appdata/claude-code-web-desktop/workspace:/workspace \
  --shm-size 4gb \
  --privileged \
  claude-code-desktop

echo "✅ Container gestartet!"
echo ""

# Schritt 5: Warten bis Container läuft
echo "⏳ Warte 15 Sekunden bis Container hochgefahren ist..."
sleep 15

# Schritt 6: NPM Dependencies installieren
echo "📦 Schritt 5: Backend Dependencies installieren..."
docker exec claude-code-desktop bash -c "cd /app/backend && npm install"
echo "✅ Dependencies installiert!"
echo ""

# Schritt 7: Container neu starten
echo "🔄 Schritt 6: Container neu starten..."
docker restart claude-code-desktop
echo "✅ Container neu gestartet!"
echo ""

# Schritt 8: Status checken
echo "⏳ Warte 10 Sekunden..."
sleep 10

echo ""
echo "=========================================="
echo "  Status Check"
echo "=========================================="
docker ps | grep claude-code-desktop

echo ""
echo "✅ FERTIG!"
echo ""
echo "🌐 Öffne deinen Browser:"
echo "   http://DEINE-UNRAID-IP:60000"
echo ""
echo "🔍 Logs anschauen:"
echo "   docker logs -f claude-code-desktop"
echo ""
echo "🐛 Services checken:"
echo "   docker exec claude-code-desktop supervisorctl status"
echo ""
