#!/bin/bash

echo "🚀 Starte Claude Code Container..."
docker-compose up -d --build

echo ""
echo "✓ Container läuft!"
echo ""
echo "📡 Web-Terminal: http://$(hostname -I | awk '{print $1}'):7681"
echo "   Login: claude / claude123"
echo ""
echo "📝 Logs ansehen: ./logs.sh"
echo "🛑 Stoppen: ./stop.sh"
