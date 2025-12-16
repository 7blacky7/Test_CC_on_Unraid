# Terminal Window Component Usage Guide

## Overview

The `TerminalWindow` component is a React component that provides a ttyd terminal interface wrapped in a draggable, resizable desktop window. It integrates with the web-desktop application's window management system.

## Implementation Details

### Component Location
- **JSX**: `src/components/Windows/TerminalWindow.jsx`
- **CSS**: `src/components/Windows/TerminalWindow.css`

### Features

1. **Base Window Integration**
   - Wraps the `Window` component for drag, resize, and window controls
   - Inherits focus, minimize, and maximize functionality
   - Integrated with `useWindowStore` for state management

2. **TTyd Terminal Access**
   - Displays terminal via iframe pointing to `/terminal/` endpoint
   - Proxied by Nginx to ttyd service running on port 7681
   - Clipboard operations enabled for copy/paste

3. **Responsive Design**
   - Default size: 800x600 pixels
   - Default position: center of viewport
   - Seamless iframe integration (no borders)
   - Fills entire window content area

4. **Window State Management**
   - Subscribes to `useWindowStore` for this window's state
   - Handles focus, close, minimize, maximize through Window component
   - Maintains position and size state via store

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` or `windowId` | string | required | Unique identifier for the window |
| `title` | string | "Terminal" | Window title displayed in titlebar |
| `initialPosition` | object | centered | Initial {x, y} position of window |
| `initialSize` | object | {800,600} | Initial {width, height} of window |
| `...props` | any | - | Additional window props passed to Window component |

## Usage Example

### Basic Usage in Desktop Component

```jsx
import TerminalWindow from '../components/Windows/TerminalWindow';
import { useWindowStore } from '../store/windowStore';

function Desktop() {
  const { openWindow } = useWindowStore();

  const handleOpenTerminal = () => {
    openWindow('terminal', {
      title: 'Terminal',
      size: { width: 800, height: 600 }
    });
  };

  return (
    <div className="desktop">
      <button onClick={handleOpenTerminal}>Open Terminal</button>
      {/* Render open windows */}
    </div>
  );
}
```

### Advanced Usage with Custom Position

```jsx
import TerminalWindow from '../components/Windows/TerminalWindow';

function Desktop({ windows }) {
  return (
    <div className="desktop">
      {windows.map(window => (
        window.type === 'terminal' && (
          <TerminalWindow
            key={window.id}
            id={window.id}
            title={window.title}
            initialPosition={window.position}
            initialSize={window.size}
          />
        )
      ))}
    </div>
  );
}
```

## Integration with Window Store

The component automatically subscribes to window state through `useWindowStore`:

```jsx
const { windows } = useWindowStore();
const currentWindow = useMemo(
  () => windows.find(w => w.id === effectiveId),
  [windows, effectiveId]
);
```

### Window Store Interface

The window store provides:

```javascript
{
  openWindow(type, options)      // Open new window
  closeWindow(windowId)          // Close window
  focusWindow(windowId)          // Focus window
  minimizeWindow(windowId)       // Minimize window
  restoreWindow(windowId)        // Restore minimized window
  updateWindowPosition(id, pos)  // Update position
  updateWindowSize(id, size)     // Update size
}
```

## Nginx Configuration

The terminal is proxied by Nginx. Ensure your nginx.conf includes:

```nginx
location /terminal/ {
  proxy_pass http://ttyd:7681/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Styling

The component uses Tailwind CSS through the base `Window` component and custom CSS for terminal-specific styling.

### CSS Classes

- `.terminal-container`: Main container, black background
- `.terminal-iframe`: Iframe element, fills content area

### Dark Terminal Theme

The terminal uses a black background (`#000`) for proper terminal display. The iframe inherits this styling for seamless integration.

## Security Considerations

1. **Iframe Sandbox**: Configured with minimal permissions
   - `allow-same-origin`: Access same-origin resources
   - `allow-scripts`: Execute scripts
   - `allow-popups`: Open popups (for terminal links)
   - `allow-forms`: Form submission

2. **Clipboard Access**: Enabled for terminal functionality
   - `clipboard-read`: Paste from system clipboard
   - `clipboard-write`: Copy to system clipboard

## Responsive Behavior

- Minimum window size: 400x300 (inherited from Window component)
- Scales responsively with viewport
- Maintains aspect ratio through CSS flex layout
- Maximized state removes border-radius and expands to viewport

## Browser Compatibility

- Modern browsers with ES6+ support
- WebSocket support (required for ttyd)
- Iframe sandbox attribute support

## Troubleshooting

### Terminal Not Loading
- Verify Nginx proxy configuration
- Check ttyd service is running on port 7681
- Verify `/terminal/` endpoint is accessible

### Iframe Content Not Displaying
- Check browser console for CSP violations
- Verify sandbox attributes allow required permissions
- Check Origin headers

### Clipboard Not Working
- Verify `allow-clipboard-read` and `allow-clipboard-write` permissions
- Note: Clipboard access requires user gesture in browser

## Performance Optimization

- Component uses `useMemo` to prevent unnecessary recalculations
- Position calculation only updates when dependencies change
- Iframe is not recreated on re-renders
- Store subscription is optimized with memoization

## Future Enhancements

Potential improvements:
- Multiple terminal tabs within one window
- Terminal session management
- Command history across sessions
- Custom shell selection
- Font size adjustment
- Color scheme customization
