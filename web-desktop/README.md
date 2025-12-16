# Web Desktop

A modern web-based desktop environment built with React 18 and Vite.

## Tech Stack

- **React 18.3+** - Modern React with hooks
- **Vite 5+** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Material Symbols** - Google's icon font
- **Spline Sans** - Modern Google Font

## Project Structure

```
web-desktop/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Login page component
│   │   ├── Login.css          # Login page styles
│   │   ├── Desktop.jsx        # Desktop environment component
│   │   └── Desktop.css        # Desktop environment styles
│   ├── App.jsx                # Main app component with routing
│   ├── App.css                # App-level styles
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── index.html                 # HTML entry point
├── vite.config.js             # Vite configuration
├── package.json               # Dependencies and scripts
└── .gitignore                 # Git ignore rules
```

## Routes

- `/` - Login screen (public)
- `/desktop` - Desktop environment (protected)
- `*` - Redirects to login

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Docker Configuration

The Vite dev server is configured to work with Docker:
- Host: `0.0.0.0` (accessible from outside container)
- Port: `3000`
- HMR enabled with client port configuration
- File watching with polling enabled

## Features

- Modern React 18 with functional components and hooks
- Client-side routing with React Router DOM
- Responsive design with flexbox
- Material Symbols icons
- Custom fonts (Spline Sans)
- Hot Module Replacement (HMR) for fast development
- Production-ready build configuration

## TODO

- [ ] Add authentication logic
- [ ] Implement protected route wrapper
- [ ] Build desktop environment UI
- [ ] Add window management system
- [ ] Integrate with backend API
