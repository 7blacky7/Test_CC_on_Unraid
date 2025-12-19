#!/bin/bash
# Fix: Port 60000 bereits belegt

echo "=========================================="
echo "  Port 60000 Problem beheben"
echo "=========================================="
echo ""

echo "🔍 Suche alle Container die Port 60000 nutzen..."
docker ps -a | grep "60000"

echo ""
echo "🛑 Stoppe ALLE Container die Port 60000 nutzen..."
docker stop $(docker ps -a | grep "60000" | awk '{print $1}') 2>/dev/null

echo ""
echo "🗑️ Lösche ALLE alten Container..."
docker rm $(docker ps -a | grep "60000" | awk '{print $1}') 2>/dev/null
docker rm claude-code-desktop 2>/dev/null
docker rm claude-code-web-desktop 2>/dev/null

echo ""
echo "✅ Alle alten Container entfernt!"
echo ""

echo "🚀 Starte NEUEN Container..."
cd /mnt/y/appdata/claude-code-web-desktop

docker run -d \
  --name claude-code-desktop \
  -p 60000:3000 \
  -v /mnt/y/appdata/claude-code-web-desktop:/app \
  -v /mnt/y/appdata/claude-code-web-desktop/workspace:/workspace \
  --shm-size 4gb \
  --privileged \
  claude-code-desktop

echo ""
echo "⏳ Warte 15 Sekunden..."
sleep 15

echo ""
echo "📦 Installiere Dependencies..."
docker exec claude-code-desktop bash -c "cd /app/backend && npm install"

echo ""
echo "🔄 Starte Container neu..."
docker restart claude-code-desktop

echo ""
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
echo "🌐 Browser öffnen: http://DEINE-UNRAID-IP:60000"
echo ""
