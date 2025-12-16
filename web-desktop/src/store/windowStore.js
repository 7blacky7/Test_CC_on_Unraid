import { create } from 'zustand';

// TODO: Implement Zustand store for window management
export const useWindowStore = create((set, get) => ({
  windows: [],
  nextWindowId: 1,

  /**
   * Open a new window
   * @param {string} type - Window type (terminal, browser, files)
   * @param {Object} options - Window options (title, position, size)
   */
  openWindow: (type, options = {}) => {
    const { windows, nextWindowId } = get();

    const newWindow = {
      id: `window-${nextWindowId}`,
      type,
      title: options.title || type.charAt(0).toUpperCase() + type.slice(1),
      position: options.position || { x: 100 + (nextWindowId * 30), y: 100 + (nextWindowId * 30) },
      size: options.size || { width: 800, height: 600 },
      isMinimized: false,
      isFocused: true,
      zIndex: windows.length,
      ...options,
    };

    set({
      windows: [
        ...windows.map(w => ({ ...w, isFocused: false })),
        newWindow,
      ],
      nextWindowId: nextWindowId + 1,
    });

    return newWindow.id;
  },

  /**
   * Close a window
   * @param {string} windowId
   */
  closeWindow: (windowId) => {
    set((state) => ({
      windows: state.windows.filter(w => w.id !== windowId),
    }));
  },

  /**
   * Focus a window
   * @param {string} windowId
   */
  focusWindow: (windowId) => {
    set((state) => ({
      windows: state.windows.map(w => ({
        ...w,
        isFocused: w.id === windowId,
        zIndex: w.id === windowId ? state.windows.length : w.zIndex,
      })),
    }));
  },

  /**
   * Minimize a window
   * @param {string} windowId
   */
  minimizeWindow: (windowId) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, isMinimized: true, isFocused: false } : w
      ),
    }));
  },

  /**
   * Restore a minimized window
   * @param {string} windowId
   */
  restoreWindow: (windowId) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === windowId
          ? { ...w, isMinimized: false, isFocused: true }
          : { ...w, isFocused: false }
      ),
    }));
  },

  /**
   * Update window position
   * @param {string} windowId
   * @param {Object} position - {x, y}
   */
  updateWindowPosition: (windowId, position) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, position } : w
      ),
    }));
  },

  /**
   * Update window size
   * @param {string} windowId
   * @param {Object} size - {width, height}
   */
  updateWindowSize: (windowId, size) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, size } : w
      ),
    }));
  },

  /**
   * Clear all windows
   */
  clearAllWindows: () => {
    set({ windows: [], nextWindowId: 1 });
  },
}));
