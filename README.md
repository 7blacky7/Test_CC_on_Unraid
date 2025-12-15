# Claude Code auf Unraid (Docker)

Claude Code in einem Docker-Container auf Unraid ausführen, mit Zugriff über Web-Terminal.

> **🚀 Schnellstart:** Siehe [INSTALL.md](INSTALL.md) für die 5-Schritte-Anleitung

## Voraussetzungen

- Unraid Server mit Docker
- Claude Max oder Claude Pro Abo (OAuth-Login)
- ~5 GB freier Speicher für das Image

## Features

- ✅ Claude Code mit OAuth-Login (Claude Max)
- ✅ Web-Terminal für Browser-Zugriff (ttyd)
- ✅ Playwright für Browser-Testing
- ✅ Persistentes Arbeitsverzeichnis
- ✅ Persistente Auth-Tokens (bleiben nach Neustart erhalten)

## Installation

### 1. Repository klonen oder Dateien kopieren

```bash
cd /mnt/y/appdata/
git clone https://github.com/7blacky7/Test_CC_on_Unraid.git claude-code
cd claude-code
```

Oder manuell die Dateien nach `/mnt/y/appdata/claude-code/` kopieren.

> **Hinweis:** Dieser Guide nutzt `/mnt/y/appdata/` für ZFS-Setups.
> Bei Standard-Unraid verwende `/mnt/user/appdata/` stattdessen.

### 2. Container bauen und starten

```bash
docker-compose up -d --build
```

Das erste Mal dauert es ein paar Minuten, da das Image gebaut werden muss.

### 3. Logs prüfen

```bash
docker-compose logs -f
```

Du solltest sehen:
```
🚀 Starte Web Terminal auf Port 7681...
```

## Verwendung

### Web-Terminal öffnen

Öffne in deinem Browser:
```
http://<DEINE-UNRAID-IP>:7681
```

Login-Daten für das Terminal:
- **Username:** `claude`
- **Password:** `claude123`

⚠️ **WICHTIG für Produktion:** Ändere das Passwort in `entrypoint.sh` Zeile 52!

### Claude Code authentifizieren

Beim ersten Start musst du dich mit deinem Claude Max Konto anmelden:

1. Im Web-Terminal ausführen:
   ```bash
   claude-code auth login
   ```

2. Du bekommst eine URL angezeigt wie:
   ```
   https://console.anthropic.com/authorize/device?code=XXXX-XXXX
   ```

3. **Diese URL in deinem normalen Browser öffnen** (auf deinem PC, nicht im Container)

4. Mit deinem Claude Max Konto anmelden

5. Zurück zum Terminal - nach erfolgreicher Anmeldung siehst du:
   ```
   ✓ Successfully logged in
   ```

6. Status prüfen:
   ```bash
   claude-code auth status
   ```

### Claude Code verwenden

Einfach starten:
```bash
claude-code
```

Du kannst jetzt mit Claude Code interagieren, Dateien bearbeiten, Code schreiben, etc.

## Verzeichnisstruktur

```
claude-code/
├── Dockerfile              # Container-Definition
├── docker-compose.yml      # Docker Compose Config
├── entrypoint.sh          # Startup-Script
├── workspace/             # Arbeitsverzeichnis (persistent)
└── claude-config/         # Auth-Tokens (persistent)
```

**Wichtig:**
- `workspace/` - Hier arbeitet Claude Code, alle Änderungen bleiben erhalten
- `claude-config/` - Speichert deine Login-Tokens, nach Neustart musst du dich nicht erneut anmelden

## Nützliche Befehle

### Container Management

```bash
# Container starten
docker-compose up -d

# Container stoppen
docker-compose down

# Container neu bauen
docker-compose up -d --build

# Logs ansehen
docker-compose logs -f

# In Container einloggen (alternative zu Web-Terminal)
docker exec -it claude-code su - claude
```

### Claude Code Befehle

```bash
# Status prüfen
claude-code auth status

# Abmelden
claude-code auth logout

# Claude Code starten
claude-code

# Hilfe anzeigen
claude-code --help
```

### Playwright Testing

Playwright ist bereits installiert für Browser-Tests:

```bash
# Playwright CLI
npx playwright --help

# Beispiel: Screenshot erstellen
npx playwright screenshot https://example.com screenshot.png
```

## Troubleshooting

### Container startet nicht

```bash
# Logs prüfen
docker-compose logs

# Container neu bauen
docker-compose down
docker-compose up -d --build
```

### Web-Terminal nicht erreichbar

- Prüfe ob Port 7681 in Unraid freigegeben ist
- Firewall-Regeln prüfen
- `docker ps` ausführen um zu sehen ob Container läuft

### "Not logged in" Fehler

```bash
# Login-Status prüfen
docker exec -it claude-code su - claude -c "claude-code auth status"

# Neu anmelden
docker exec -it claude-code su - claude -c "claude-code auth login"
```

### Auth-Token verloren

Falls die `claude-config/` Daten verloren gehen, einfach neu anmelden:
```bash
claude-code auth login
```

## Sicherheitshinweise

⚠️ **Für Produktion beachten:**

1. **Terminal-Passwort ändern** in `entrypoint.sh` Zeile 52
2. **Port-Zugriff einschränken** (nur lokales Netzwerk)
3. **HTTPS-Reverse-Proxy** verwenden (z.B. nginx)
4. **Firewall-Regeln** setzen

## Updates

Claude Code im Container aktualisieren:

```bash
# Container stoppen
docker-compose down

# Image neu bauen (lädt neueste Claude Code Version)
docker-compose build --no-cache

# Container starten
docker-compose up -d
```

## Unraid Template (Optional)

Du kannst auch ein Unraid Template erstellen für einfachere Installation:

1. Gehe zu Docker Tab in Unraid
2. "Add Container" → "Template repositories"
3. Füge dieses Repo hinzu oder erstelle ein Custom Template

Beispiel-Template-Config:
- **Repository:** `dein-image-name`
- **Port:** `7681:7681`
- **Volume 1:** `/workspace` → `/mnt/user/appdata/claude-code/workspace`
- **Volume 2:** `/home/claude/.config/claude-code` → `/mnt/user/appdata/claude-code/config`

## FAQ

**Q: Brauche ich einen API Key?**
A: Nein! Du meldest dich mit deinem Claude Max Abo an (OAuth).

**Q: Muss ich mich nach jedem Neustart neu anmelden?**
A: Nein, die Tokens werden in `claude-config/` gespeichert.

**Q: Kann ich mehrere Claude Code Instanzen laufen lassen?**
A: Ja, aber jede braucht einen eigenen Port und eigene Volumes.

**Q: Funktioniert das auch mit Claude Pro?**
A: Ja, Claude Pro und Max funktionieren beide mit OAuth.

## Support

- GitHub Issues: https://github.com/7blacky7/Test_CC_on_Unraid/issues
- Claude Code Docs: https://docs.anthropic.com/claude-code

## Lizenz

Siehe Claude Code Lizenz von Anthropic.
