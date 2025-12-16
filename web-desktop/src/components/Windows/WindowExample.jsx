import React, { useState } from 'react';
import Window from './Window';

/**
 * Example usage of the Window component
 * This demonstrates how to use the Window component with all its features
 */
const WindowExample = () => {
  const [windows, setWindows] = useState([
    {
      id: 1,
      title: 'Example Window',
      icon: 'folder',
      focused: true,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 }
    }
  ]);

  const [focusedWindowId, setFocusedWindowId] = useState(1);

  const handleFocus = (id) => {
    setFocusedWindowId(id);
  };

  const handleClose = (id) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const handleMinimize = (id) => {
    console.log('Minimize window:', id);
    // Implement minimize logic here
  };

  const handleMaximize = (id) => {
    console.log('Maximize window:', id);
    // Implement maximize logic here
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {windows.map(window => (
        <Window
          key={window.id}
          title={window.title}
          icon={window.icon}
          focused={focusedWindowId === window.id}
          position={window.position}
          size={window.size}
          onFocus={() => handleFocus(window.id)}
          onClose={() => handleClose(window.id)}
          onMinimize={() => handleMinimize(window.id)}
          onMaximize={() => handleMaximize(window.id)}
        >
          <div style={{ padding: '20px' }}>
            <h2>Window Content</h2>
            <p>This is the content area of the window.</p>
            <p>You can put any React components here.</p>
          </div>
        </Window>
      ))}
    </div>
  );
};

export default WindowExample;
