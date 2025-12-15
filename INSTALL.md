# Installation Guide

## Voraussetzungen
- ✅ Unraid Server mit Docker
- ✅ Claude Max oder Claude Pro Abo

---

## Installation (5 Schritte)

### 1. Repository klonen
```bash
cd /mnt/y/appdata/
git clone https://github.com/7blacky7/Test_CC_on_Unraid.git claude-code
cd claude-code
```

### 2. Scripts ausführbar machen
```bash
chmod +x *.sh
```

### 3. Docker Image bauen
```bash
docker build -t claude-code-local .
```
⏱️ Dauert ~2-5 Minuten beim ersten Mal

### 4. Container starten
```bash
docker-compose up -d
```

### 5. Web-Terminal öffnen
Browser: `http://<deine-unraid-ip>:7681`

**Login:**
- Username: `claude`
- Password: `claude123`

---

## Claude Code nutzen

### Erste Anmeldung (einmalig)
```bash
claude auth login
```

1. Link im Browser öffnen
2. Mit Claude Max/Pro anmelden
3. Fertig!

### Claude Code starten
```bash
claude
```

### Status prüfen
```bash
claude auth status
```

---

## Häufige Befehle

```bash
# Container Management (auf Unraid)
./start.sh      # Container starten
./stop.sh       # Container stoppen
./status.sh     # Status anzeigen
./logs.sh       # Logs ansehen

# Im Web-Terminal
claude          # Claude Code starten
claude --help   # Hilfe
exit            # Terminal schließen
```

---

## Verzeichnisse

```
/mnt/y/appdata/claude-code/
├── workspace/      ← Dein Arbeitsverzeichnis (persistent)
└── claude-config/  ← Auth-Tokens (persistent)
```

**Wichtig:** Beide Verzeichnisse bleiben nach Neustart erhalten!

---

## Troubleshooting

### Container startet nicht
```bash
docker-compose logs
```

### "command not found"
```bash
# Prüfe ob Binary existiert
ls -la /usr/local/bin/claude

# Wenn nicht: Image neu bauen
docker-compose down
docker build -t claude-code-local . --no-cache
docker-compose up -d
```

### Passwort vergessen
Standard: `claude` / `claude123` (änderbar in `entrypoint.sh`)

### Port bereits belegt
Ändere in `docker-compose.yml`:
```yaml
ports:
  - "7681:7681"  # → Ersten Port ändern (z.B. 7682:7681)
```

---

## Update

```bash
cd /mnt/y/appdata/claude-code
git pull
docker build -t claude-code-local .
docker-compose up -d
```

---

## Sicherheit

⚠️ **Für Produktion:**
1. Ändere Passwort in `entrypoint.sh`
2. Nutze Reverse-Proxy mit HTTPS
3. Beschränke Port-Zugriff auf lokales Netzwerk

---

**Vollständige Doku:** [README.md](README.md)
