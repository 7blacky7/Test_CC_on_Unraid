import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import './WelcomeSplash.css';

/**
 * Welcome Back Splash Screen Component
 * Full-screen overlay that appears only after login with fade-in/fade-out animations.
 * Shows user's name and auto-dismisses after 2 seconds.
 */
const WelcomeSplash = ({ onClose }) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    // Call onClose callback after fade-out animation completes
    if (!isVisible) {
      const animationTimeout = setTimeout(() => {
        onClose();
      }, 500); // Match fade-out animation duration
      return () => clearTimeout(animationTimeout);
    }
  }, [isVisible, onClose]);

  const userName = user?.username || 'Guest';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="welcome-splash"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {/* Workspace gradient background */}
          <div className="welcome-splash-bg" />

          {/* Content container */}
          <motion.div
            className="welcome-content"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            {/* Welcome heading with user name */}
            <motion.h1
              className="welcome-heading"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            >
              Welcome Back
            </motion.h1>

            {/* User name display */}
            <motion.p
              className="welcome-username"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
            >
              {userName}
            </motion.p>

            {/* Subtitle with interaction hint */}
            <motion.p
              className="welcome-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.7 }}
            >
              Click anywhere to continue
            </motion.p>
          </motion.div>

          {/* Desktop icons preview */}
          <motion.div
            className="welcome-icons-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          >
            {/* README icon */}
            <motion.div
              className="icon-item"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <div className="icon-box readme-icon">
                <span className="material-symbols-outlined">description</span>
              </div>
              <p>README.md</p>
            </motion.div>

            {/* Assets folder icon */}
            <motion.div
              className="icon-item"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <div className="icon-box assets-icon">
                <span className="material-symbols-outlined">folder</span>
              </div>
              <p>Assets</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeSplash;
