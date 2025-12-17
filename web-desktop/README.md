# Web Desktop OS

Ein modernes Web-basiertes Desktop-Betriebssystem mit Glassmorphism-Design, gebaut mit React 18 und Vite.

![Web Desktop Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## ✨ Features

### 🎨 Design
- **Glassmorphism UI** - Moderne, durchscheinende Benutzeroberfläche
- **Gelbes Primary Theme** (#f9f506) - Auffälliges Farbschema
- **Material Symbols Icons** - Google's moderne Icon-Font
- **Spline Sans Font** - Klare, moderne Typografie
- **Responsive Layout** - Funktioniert auf allen Bildschirmgrößen

### 🪟 Window Management
- **Draggable Windows** - Fenster frei verschieben
- **Resizable Windows** - Größe anpassen
- **Window Focus System** - Automatisches z-Index Management
- **Minimize/Maximize/Close** - Vollständige Fensterkontrolle
- **Cascade Positioning** - Neue Fenster werden automatisch versetzt positioniert
- **macOS-Style Controls** - Vertraute Bedienelemente (links oben)

### 🖥️ Desktop Environment
- **Top Bar** - System-Status und Zeit-Anzeige
- **Dock** - Schnellzugriff auf Anwendungen
- **Workspace** - Fenster-Container mit Bounds-Management
- **Welcome Splash** - Begrüßungsbildschirm beim Login
- **System Metrics** - CPU & RAM Anzeige

### 🔐 Login System
- **Glassmorphism Login Screen** - Moderner Login-Bildschirm
- **OAuth Integration** - Bereit für Authentifizierung
- **Power Controls** - Shutdown & Restart Buttons
- **Live Time Display** - Aktuelle Uhrzeit in der Top Bar

### 📦 Integrierte Anwendungen
- **Terminal** - Web-basiertes Terminal (ttyd integration)
- **Browser** - noVNC Desktop-Browser
- **File Explorer** - Datei-Manager mit Workspace/Container Navigation
- **Settings** - Systemeinstellungen

## 🛠️ Tech Stack

- **React 18.3** - Moderne React-Architektur mit Hooks
- **Vite 5.4** - Blitzschneller Build-Tool und Dev-Server
- **Zustand** - Leichtgewichtige State-Management-Lösung
- **React Router DOM** - Client-seitiges Routing
- **react-rnd** - Drag & Resize für Fenster
- **Framer Motion** - Flüssige Animationen
- **Tailwind CSS** - Utility-First CSS Framework
- **Material Symbols** - Icon-System
- **date-fns** - Datum/Zeit-Formatierung

## 📁 Projekt-Struktur

```
web-desktop/
├── src/
│   ├── components/
│   │   ├── Desktop/
│   │   │   ├── Desktop.jsx          # Haupt-Desktop-Container
│   │   │   ├── TopBar.jsx           # Obere Statusleiste
│   │   │   ├── Dock.jsx             # Anwendungs-Dock
│   │   │   ├── Workspace.jsx        # Fenster-Workspace
│   │   │   └── WelcomeSplash.jsx    # Willkommens-Screen
│   │   ├── Windows/
│   │   │   ├── Window.jsx           # Basis-Fenster-Komponente
│   │   │   ├── TerminalWindow.jsx   # Terminal-Fenster
│   │   │   ├── BrowserWindow.jsx    # Browser-Fenster
│   │   │   └── FileExplorer.jsx     # Datei-Explorer
│   │   └── Login/
│   │       ├── LoginScreen.jsx      # Login-Bildschirm
│   │       └── LoginForm.jsx        # Login-Formular
│   ├── store/
│   │   ├── windowStore.js           # Zustand Store für Fenster
│   │   └── authStore.js             # Zustand Store für Auth
│   ├── services/
│   │   ├── auth.js                  # Auth-Services
│   │   └── api.js                   # API-Services
│   ├── hooks/
│   │   └── useAuth.js               # Auth-Hook
│   ├── App.jsx                      # Haupt-App mit Routing
│   ├── main.jsx                     # React Entry-Point
│   └── index.css                    # Globale Styles
├── public/                          # Statische Assets
├── index.html                       # HTML Entry-Point
├── vite.config.js                   # Vite-Konfiguration
├── tailwind.config.js               # Tailwind-Konfiguration
├── postcss.config.js                # PostCSS-Konfiguration
└── package.json                     # Dependencies
```

## 🚀 Entwicklung

### Abhängigkeiten installieren

```bash
cd web-desktop
npm install
```

### Development Server starten

```bash
npm run dev
```

Server läuft auf `http://localhost:3000`

### Production Build erstellen

```bash
npm run build
```

Output wird im `dist/` Verzeichnis erstellt.

### Production Build testen

```bash
npm run preview
```

## 🐳 Docker Integration

Das Projekt ist für Docker optimiert:
- **Host:** `0.0.0.0` (von außerhalb des Containers erreichbar)
- **Port:** `3000`
- **HMR:** Hot Module Replacement aktiviert
- **File Watching:** Polling für Docker-Volumes aktiviert

### Docker Commands

```bash
# Container bauen und starten
docker-compose up -d --build

# Logs ansehen
docker-compose logs -f

# Container stoppen
docker-compose down
```

## 🎯 Routing

| Route | Komponente | Beschreibung |
|-------|-----------|--------------|
| `/` | LoginScreen | Login-Bildschirm |
| `/desktop` | Desktop | Desktop-Umgebung |
| `*` | Redirect | Weiterleitung zu `/` |

## 🎨 Design-System

### Farben

```css
--primary: #f9f506;           /* Gelb - Hauptfarbe */
--primary-hover: #e6e605;     /* Gelb - Hover */
--bg-dark: #050505;           /* Dunkel - Hintergrund */
--glass-bg: rgba(255, 255, 255, 0.05);  /* Glassmorphism */
```

### Glassmorphism-Effekt

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## 📝 Window Store API

```javascript
import { useWindowStore } from './store/windowStore';

// Fenster öffnen
const windowId = openWindow('terminal', {
  title: 'Terminal',
  position: { x: 100, y: 100 },
  size: { width: 800, height: 600 }
});

// Fenster fokussieren
focusWindow(windowId);

// Fenster minimieren
minimizeWindow(windowId);

// Fenster schließen
closeWindow(windowId);

// Fenster-Position aktualisieren
updateWindowPosition(windowId, { x: 200, y: 200 });

// Fenster-Größe aktualisieren
updateWindowSize(windowId, { width: 1000, height: 700 });
```

## 🔧 Konfiguration

### Vite Config

```javascript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true
    }
  }
});
```

### Tailwind Config

Custom Farben und Utilities sind in `tailwind.config.js` definiert.

## 📸 Screenshots

### Login Screen
- Glassmorphism-Design mit Live-Zeit
- Power Controls (Shutdown/Restart)
- Gelber Login-Button

### Desktop
- Top Bar mit System-Status
- Dock mit Anwendungen
- Mehrere Fenster gleichzeitig
- Drag & Resize Funktionalität

## 🐛 Bekannte Issues

Keine bekannten kritischen Bugs. Siehe [GitHub Issues](https://github.com/7blacky7/Test_CC_on_Unraid/issues) für Feature-Requests.

## 🤝 Beiträge

Dieses Projekt wurde mit [Claude Code](https://claude.com/claude-code) entwickelt.

## 📄 Lizenz

Siehe Haupt-Repository Lizenz.

## 🔗 Links

- [GitHub Repository](https://github.com/7blacky7/Test_CC_on_Unraid)
- [Claude Code](https://claude.com/claude-code)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
