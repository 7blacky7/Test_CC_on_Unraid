# Terminal Window Component - Quick Reference

## Files Location

```
web-desktop/
├── src/
│   └── components/
│       └── Windows/
│           ├── TerminalWindow.jsx      [UPDATED] Component implementation
│           ├── TerminalWindow.css      [UPDATED] Component styles
│           ├── Window.jsx              [EXISTING] Base window component
│           ├── Window.css              [EXISTING] Base window styles
│           ├── BrowserWindow.jsx       [EXISTING] Reference implementation
│           ├── FileExplorer.jsx        [EXISTING] Reference implementation
│           └── ...
├── TERMINAL_WINDOW_USAGE.md            [NEW] Usage guide
└── ...
```

## Component Quick Start

### Import
```jsx
import TerminalWindow from '../components/Windows/TerminalWindow';
```

### Render Single Terminal
```jsx
<TerminalWindow 
  id="terminal-1"
  title="Terminal"
/>
```

### Render from Window Store
```jsx
import { useWindowStore } from '../store/windowStore';

function Desktop() {
  const { windows } = useWindowStore();
  
  return (
    <div className="desktop">
      {windows.map(window => 
        window.type === 'terminal' && (
          <TerminalWindow key={window.id} id={window.id} />
        )
      )}
    </div>
  );
}
```

### Open New Terminal Window
```jsx
import { useWindowStore } from '../store/windowStore';

function Taskbar() {
  const { openWindow } = useWindowStore();
  
  return (
    <button onClick={() => openWindow('terminal')}>
      Open Terminal
    </button>
  );
}
```

## Key Properties

| Property | Value | Notes |
|----------|-------|-------|
| Default Width | 800px | Can be overridden with initialSize |
| Default Height | 600px | Can be overridden with initialSize |
| Default Position | Centered | Automatically calculated |
| Terminal URL | /terminal/ | Proxied by Nginx to ttyd:7681 |
| Background | #000 (Black) | Proper terminal display |
| Iframe Border | None | Seamless integration |

## Window Controls

Inherited from Window component:
- **Drag**: Click and drag the title bar to move
- **Resize**: Drag window edges to resize
- **Minimize**: Click the `_` button to minimize
- **Maximize**: Click the `□` button to maximize
- **Close**: Click the `×` button to close

## CSS Classes

### Terminal Container
```css
.terminal-container {
  width: 100%;
  height: 100%;
  background: #000;
  /* ... */
}
```

### Terminal IFrame
```css
.terminal-iframe {
  width: 100%;
  height: 100%;
  border: none;
  /* ... */
}
```

## Store Integration

### Opening Window
```javascript
openWindow('terminal', {
  title: 'Terminal',
  position: { x: 100, y: 100 },
  size: { width: 800, height: 600 }
})
```

### Closing Window
```javascript
closeWindow('window-1')
```

### Focusing Window
```javascript
focusWindow('window-1')
```

## Nginx Configuration

Add to nginx.conf:
```nginx
location /terminal/ {
  proxy_pass http://ttyd:7681/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
}
```

## API Endpoint

- **Route**: `/terminal/`
- **Backend**: ttyd service on port 7681
- **Protocol**: WebSocket + HTTP
- **Authentication**: Inherited from application

## React Hooks Used

- `useState`: Via useWindow hook
- `useEffect`: For lifecycle management
- `useMemo`: For optimized position calculation
- `useCallback`: Via useWindow hook

## Props Interface

```typescript
{
  id?: string                     // Window ID
  windowId?: string               // Alternative to id
  title?: string                  // Default: "Terminal"
  initialPosition?: {x, y}        // Optional initial position
  initialSize?: {width, height}   // Default: {800, 600}
  [key: string]: any              // Other Window props
}
```

## State Management

### Component Level
- Uses `useWindowStore` from Zustand
- Subscribes to windows state
- Uses `useMemo` for performance

### Store Level
- Manages all open windows
- Tracks focus, position, size
- Handles minimize/restore

## Error Handling

### Terminal Not Loading
Check:
1. Nginx proxy configuration
2. ttyd service status
3. Port 7681 is accessible
4. Network connectivity

### Sandbox Restrictions
If features not working:
- Verify sandbox attributes in component
- Check browser console for violations
- Verify iframe permissions

## Performance Notes

- Memoized position calculations
- Efficient store subscriptions
- No unnecessary re-renders
- Optimized iframe rendering

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (14+)
- Mobile: Limited (small screen)

## Accessibility

- Keyboard navigation via terminal
- Title bar for identification
- Window controls visible and labeled
- Focus states properly styled

## Testing Checklist

- [ ] Window opens centered on screen
- [ ] Drag window around desktop
- [ ] Resize window edges
- [ ] Minimize/restore functionality
- [ ] Maximize to full screen
- [ ] Close window
- [ ] Keyboard input in terminal
- [ ] Copy/paste operations
- [ ] Multiple terminal windows
- [ ] Terminal commands execute
- [ ] Responsive on different screen sizes

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Terminal blank | Check Nginx proxy config and ttyd status |
| Can't type | Verify iframe focus and sandbox permissions |
| Ctrl+C not working | Check browser keyboard event handling |
| Copy/paste not working | Verify clipboard permissions in sandbox |
| Window stuck | Check z-index and focus state in store |
| Poor performance | Clear browser cache, restart services |

## Related Components

- `Window.jsx`: Base window component
- `BrowserWindow.jsx`: Similar iframe wrapper for VNC
- `FileExplorer.jsx`: Alternative window implementation
- `useWindow.js`: Window state management hook
- `windowStore.js`: Zustand store for windows

## Documentation

- Full guide: `TERMINAL_WINDOW_USAGE.md`
- Implementation details: `TERMINAL_WINDOW_IMPLEMENTATION.md`
- This file: `TERMINAL_WINDOW_QUICK_REFERENCE.md`
