import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWindowStore } from '../../store/windowStore';
import './Dock.css';

const Dock = () => {
  const { windows, openWindow, focusWindow, restoreWindow } = useWindowStore();
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const applications = [
    {
      id: 'terminal',
      name: 'Terminal',
      icon: 'terminal',
      type: 'terminal'
    },
    {
      id: 'browser',
      name: 'Browser',
      icon: 'language',
      type: 'browser'
    },
    {
      id: 'files',
      name: 'Files',
      icon: 'folder',
      type: 'files'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: 'settings',
      type: 'settings'
    },
  ];

  const handleAppClick = (app) => {
    // Find if there's already a window of this type
    const existingWindow = windows.find(w => w.type === app.type && !w.isMinimized);
    const minimizedWindow = windows.find(w => w.type === app.type && w.isMinimized);

    if (minimizedWindow) {
      // Restore minimized window
      restoreWindow(minimizedWindow.id);
    } else if (existingWindow) {
      // Focus existing window
      focusWindow(existingWindow.id);
    } else {
      // Open new window
      openWindow(app.type, { title: app.name });
    }
  };

  const handleAddWindow = () => {
    // Open a new terminal window as default
    openWindow('terminal', { title: 'Terminal' });
  };

  // Check if an app has an active or minimized window
  const isAppActive = (appType) => {
    return windows.some(w => w.type === appType);
  };

  // Check if an app has a focused window
  const isAppFocused = (appType) => {
    return windows.some(w => w.type === appType && w.isFocused && !w.isMinimized);
  };

  // Get notification badge count (can be extended later)
  const getNotificationCount = (appType) => {
    // Placeholder for future notification system
    return 0;
  };

  return (
    <div className="dock">
      <motion.div
        className="dock-container"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {applications.map((app) => {
          const isActive = isAppActive(app.type);
          const isFocused = isAppFocused(app.type);
          const notificationCount = getNotificationCount(app.type);

          return (
            <motion.div
              key={app.id}
              className="dock-icon-wrapper"
              onMouseEnter={() => setHoveredIcon(app.id)}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              <motion.button
                className={`dock-icon ${isActive ? 'active' : ''} ${isFocused ? 'focused' : ''}`}
                onClick={() => handleAppClick(app)}
                title={app.name}
                whileHover={{
                  scale: 1.2,
                  y: -10,
                }}
                whileTap={{ scale: 1.1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17
                }}
              >
                <span className="material-symbols-outlined icon">
                  {app.icon}
                </span>

                {notificationCount > 0 && (
                  <motion.span
                    className="notification-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </motion.span>
                )}
              </motion.button>

              {isActive && (
                <motion.div
                  className="active-indicator"
                  layoutId={`indicator-${app.id}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {hoveredIcon === app.id && (
                <motion.div
                  className="dock-tooltip"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  {app.name}
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* Separator */}
        <div className="dock-separator" />

        {/* Add Window Button */}
        <motion.div
          className="dock-icon-wrapper"
          onMouseEnter={() => setHoveredIcon('add')}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <motion.button
            className="dock-icon add-button"
            onClick={handleAddWindow}
            title="New Window"
            whileHover={{
              scale: 1.2,
              y: -10,
            }}
            whileTap={{ scale: 1.1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17
            }}
          >
            <span className="material-symbols-outlined icon">
              add
            </span>
          </motion.button>

          {hoveredIcon === 'add' && (
            <motion.div
              className="dock-tooltip"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              New Window
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dock;
