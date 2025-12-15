#!/bin/bash

# Willkommensnachricht im MOTD erstellen
cat > /etc/motd << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                   Claude Code Docker Container                 ║
║                                                                ║
║  ERSTE SCHRITTE:                                              ║
║  1. claude-code auth login                                    ║
║     -> Öffne den Link im Browser deines Computers            ║
║     -> Melde dich mit deinem Claude Max Konto an             ║
║                                                                ║
║  2. claude-code                                               ║
║     -> Claude Code starten und nutzen                         ║
║                                                                ║
║  WEITERE BEFEHLE:                                             ║
║    claude-code auth status  - Login Status prüfen            ║
║    claude-code auth logout  - Abmelden                        ║
║    playwright               - Browser Testing                 ║
║                                                                ║
║  Workspace: /workspace (persistent)                           ║
╚═══════════════════════════════════════════════════════════════╝

EOF

# Berechtigungen sicherstellen
chown -R claude:claude /workspace
chown -R claude:claude /home/claude/.config 2>/dev/null || true

# Claude Code Version anzeigen
echo "Claude Code Version:"
su - claude -c "claude-code --version" 2>/dev/null || echo "  (Fehler beim Abrufen der Version)"
echo ""

# Auth Status prüfen
echo "Authentifizierungs-Status:"
if su - claude -c "claude-code auth status" &>/dev/null; then
    echo "  ✓ Du bist angemeldet!"
else
    echo "  ✗ Nicht angemeldet"
    echo ""
    echo "👉 Führe aus: claude-code auth login"
    echo "   und folge den Anweisungen im Browser"
fi
echo ""

# ttyd starten als root, aber Shell als claude User
# -W: read-write Modus
# -p 7681: Port
# -c: Credentials (optional, für Basic Auth)
echo "🚀 Starte Web Terminal auf Port 7681..."
ttyd -W -p 7681 -c claude:claude123 su - claude

# Falls ttyd beendet wird, Container am Leben halten
tail -f /dev/null
