# Pfad-Konfiguration für verschiedene Unraid-Setups

Dieses Setup ist für ZFS mit separaten Labels konfiguriert.

## Deine aktuelle Konfiguration (ZFS):

```
Label Y: /mnt/y/
Label Z: /mnt/z/
Docker appdata: /mnt/y/appdata/
```

### Installation:
```bash
cd /mnt/y/appdata/
git clone https://github.com/7blacky7/Test_CC_on_Unraid.git claude-code
```

### Docker Volumes (in docker-compose.yml):
```yaml
volumes:
  - ./workspace:/workspace
  - ./claude-config:/home/claude/.config/claude-code
```

Da du im Verzeichnis `/mnt/y/appdata/claude-code/` bist, werden die Volumes automatisch dort erstellt:
- `/mnt/y/appdata/claude-code/workspace/`
- `/mnt/y/appdata/claude-code/claude-config/`

---

## Andere Unraid-Konfigurationen:

### Standard Unraid (ohne ZFS):
```bash
cd /mnt/user/appdata/
git clone https://github.com/7blacky7/Test_CC_on_Unraid.git claude-code
```

### Absolute Pfade verwenden:

Falls du absolute Pfade bevorzugst, ändere in `docker-compose.yml`:

```yaml
volumes:
  - /mnt/y/appdata/claude-code/workspace:/workspace
  - /mnt/y/appdata/claude-code/claude-config:/home/claude/.config/claude-code
```

---

## Wenn du Label Z nutzen möchtest:

Einfach alle Vorkommen von `/mnt/y/` durch `/mnt/z/` ersetzen:

```bash
# In README.md, QUICKSTART.md, unraid-template.xml
sed -i 's|/mnt/y/|/mnt/z/|g' README.md QUICKSTART.md unraid-template.xml
```

---

## Volume-Überprüfung:

Nach dem Start prüfen wo die Daten liegen:

```bash
docker inspect claude-code | grep -A 10 Mounts
```
