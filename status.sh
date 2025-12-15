#!/bin/bash

echo "📊 Claude Code Container Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Container Status
echo "🐳 Docker Container:"
docker-compose ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Claude Auth Status
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "🔐 Claude Code Authentifizierung:"
    docker exec -it claude-code su - claude -c "claude-code auth status" 2>/dev/null

    if [ $? -ne 0 ]; then
        echo "   ✗ Nicht angemeldet"
        echo ""
        echo "💡 Zum Anmelden:"
        echo "   1. Öffne Web-Terminal: http://$(hostname -I | awk '{print $1}'):7681"
        echo "   2. Führe aus: claude-code auth login"
    fi
else
    echo ""
    echo "⚠️  Container läuft nicht!"
    echo "   Starten mit: ./start.sh"
fi

echo ""
