# Window Component

A fully-featured, draggable, and resizable window component with macOS-style controls and glassmorphism design.

## Features

- **Drag & Drop**: Draggable via title bar using react-rnd
- **Resizable**: Resizable from all edges and corners with minimum constraints (400x300)
- **macOS-style Controls**: Red (close), Yellow (minimize), Green (maximize) buttons on the left
- **Focus Management**: Yellow glow effect when focused, integrated with windowStore
- **Maximize/Restore**: Click green button to toggle fullscreen mode
- **Glass Effect**: Semi-transparent background with backdrop blur
- **Smooth Animations**: Open/close animations powered by Framer Motion
- **Workspace Bounds**: Constrains window movement within workspace boundaries
- **Custom Scrollbar**: Styled scrollbar for content area

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | required | Unique window identifier (from windowStore) |
| `title` | string | required | Window title displayed in title bar |
| `icon` | string | 'window' | Material Symbol icon name |
| `isFocused` | boolean | false | Whether window has focus |
| `zIndex` | number | 10 | z-index stack order |
| `position` | object | {x:100, y:100} | Window position {x, y} |
| `size` | object | {width:800, height:600} | Window size {width, height} |
| `workspaceBounds` | object | null | Workspace dimensions for constraining movement |
| `onFocus` | function | undefined | Callback when window receives focus |
| `onClose` | function | undefined | Callback when close button clicked |
| `onMinimize` | function | undefined | Callback when minimize button clicked |
| `onMaximize` | function | undefined | Callback when maximize button clicked |
| `children` | ReactNode | required | Window content |

## Usage

### Basic Example

```jsx
import Window from './components/Windows/Window';
import { useWindowStore } from './store/windowStore';

function MyApp() {
  const { windows, focusWindow } = useWindowStore();

  return (
    <div className="workspace">
      {windows.map(win => (
        <Window
          key={win.id}
          id={win.id}
          title={win.title}
          icon={win.icon}
          isFocused={win.isFocused}
          zIndex={win.zIndex}
          position={win.position}
          size={win.size}
          onFocus={() => focusWindow(win.id)}
        >
          <div className="p-4">
            <h2>Window Content</h2>
            <p>Your content here...</p>
          </div>
        </Window>
      ))}
    </div>
  );
}
```

### With Custom Callbacks

```jsx
<Window
  id="my-window"
  title="My Application"
  icon="settings"
  isFocused={true}
  position={{ x: 200, y: 150 }}
  size={{ width: 900, height: 700 }}
  workspaceBounds={{
    top: 40,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight - 80
  }}
  onFocus={() => console.log('Window focused')}
  onClose={() => console.log('Window closed')}
  onMinimize={() => console.log('Window minimized')}
  onMaximize={() => console.log('Window maximized')}
>
  <YourComponent />
</Window>
```

## Styling

The component uses a combination of Tailwind CSS and custom CSS. Key CSS classes:

- `.window-container` - Main window container with glass effect
- `.window-focused` - Applied when window has focus (yellow glow)
- `.window-maximized` - Applied when window is maximized
- `.window-titlebar` - Title bar with controls
- `.window-control-btn` - macOS-style control buttons
- `.window-content` - Content area with custom scrollbar

### Custom Styling

You can override styles by targeting these classes in your CSS:

```css
/* Custom focus color */
.window-focused {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  border-color: rgba(59, 130, 246, 0.3);
}

/* Custom title bar background */
.window-titlebar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## Integration with WindowStore

The component is designed to work seamlessly with the Zustand `windowStore`:

```jsx
const {
  focusWindow,
  closeWindow,
  minimizeWindow,
  updateWindowPosition,
  updateWindowSize
} = useWindowStore();
```

These store methods are automatically called by the Window component's internal handlers, ensuring state consistency across your application.

## Workspace Bounds

The `workspaceBounds` prop allows you to constrain window movement within a specific area (e.g., between TopBar and Dock):

```jsx
const workspaceBounds = {
  top: 40,           // TopBar height
  left: 0,
  right: window.innerWidth,
  bottom: window.innerHeight - 80  // Dock height
};

<Window workspaceBounds={workspaceBounds} {...props} />
```

## Animations

The component uses Framer Motion for smooth animations:

- **Open**: Scales from 0.9 to 1.0 with fade in (200ms)
- **Close**: Scales to 0.9 with fade out (200ms)
- **Control Buttons**: Hover effects with glow
- **Focus**: Smooth transition for yellow glow effect

## Keyboard Shortcuts

Future enhancement: Add keyboard shortcuts like:
- `Cmd/Ctrl + W` - Close window
- `Cmd/Ctrl + M` - Minimize window
- `Cmd/Ctrl + Shift + F` - Toggle fullscreen

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 75+
- Safari 14+

Requires support for:
- CSS `backdrop-filter`
- CSS Grid/Flexbox
- Modern JavaScript (ES6+)

## Dependencies

- `react` ^18.3.1
- `react-rnd` ^10.4.13 - Drag and resize functionality
- `framer-motion` ^11.12.0 - Animations
- `zustand` ^5.0.2 - State management (windowStore)

## Notes

- Minimum window size is 400x300 pixels
- Window cannot be dragged outside workspace bounds
- Maximize disables dragging and resizing
- Icons require Material Symbols font loaded in your app
- All callbacks are optional except `id`, `title`, and `children`
