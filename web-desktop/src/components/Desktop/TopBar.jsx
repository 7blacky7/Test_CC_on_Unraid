import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import './TopBar.css';

const TopBar = ({ title = 'DockerDev OS' }) => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [systemStats, setSystemStats] = useState({
    cpu: 0,
    ram: 0,
  });
  const [containerStatus, setContainerStatus] = useState('ready'); // ready, starting, error
  const menuRef = useRef(null);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Mock system stats - replace with API call later
  useEffect(() => {
    const updateStats = () => {
      setSystemStats({
        cpu: Math.floor(Math.random() * 30 + 10), // Mock: 10-40%
        ram: Math.floor(Math.random() * 40 + 30), // Mock: 30-70%
      });
    };

    updateStats();
    const statsTimer = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(statsTimer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const getStatusColor = () => {
    switch (containerStatus) {
      case 'ready':
        return 'bg-green-500';
      case 'starting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="top-bar">
      {/* Left Section */}
      <div className="top-bar-section top-bar-left">
        <span className="top-bar-title">{title}</span>
      </div>

      {/* Center Section */}
      <div className="top-bar-section top-bar-center">
        <div className="system-stats">
          <div className="stat-item">
            <span className="material-symbols-outlined stat-icon">memory</span>
            <span className="stat-value">CPU {systemStats.cpu}%</span>
          </div>
          <div className="stat-item">
            <span className="material-symbols-outlined stat-icon">
              storage
            </span>
            <span className="stat-value">RAM {systemStats.ram}%</span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="top-bar-section top-bar-right">
        {/* Container Status */}
        <div className="status-indicator" title="Container Status">
          <div className={`status-dot ${getStatusColor()}`}></div>
          <span className="status-text">
            {containerStatus === 'ready' ? 'Ready' : containerStatus}
          </span>
        </div>

        {/* User Badge */}
        <div className="user-badge">
          <span className="material-symbols-outlined user-icon">
            account_circle
          </span>
          <span className="user-name">{user?.username || 'User'}</span>
        </div>

        {/* Clock */}
        <div className="clock">
          <span className="material-symbols-outlined clock-icon">schedule</span>
          <span className="clock-time">{format(currentTime, 'HH:mm')}</span>
        </div>

        {/* User Menu */}
        <div className="user-menu-container" ref={menuRef}>
          <button
            className="user-menu-button"
            onClick={toggleUserMenu}
            aria-label="User menu"
          >
            <span className="material-symbols-outlined">expand_more</span>
          </button>

          {showUserMenu && (
            <div className="user-menu-dropdown">
              <button className="menu-item" onClick={() => setShowUserMenu(false)}>
                <span className="material-symbols-outlined">settings</span>
                <span>Settings</span>
              </button>
              <div className="menu-divider"></div>
              <button className="menu-item menu-item-danger" onClick={handleLogout}>
                <span className="material-symbols-outlined">logout</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
