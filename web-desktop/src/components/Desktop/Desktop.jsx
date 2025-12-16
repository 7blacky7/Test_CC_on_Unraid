import React from 'react';
import TopBar from './TopBar';
import Dock from './Dock';
import Workspace from './Workspace';
import WelcomeSplash from './WelcomeSplash';
import './Desktop.css';

// TODO: Implement main desktop environment with layout management
const Desktop = () => {
  const [showWelcome, setShowWelcome] = React.useState(true);

  return (
    <div className="desktop">
      <TopBar />
      <Workspace />
      <Dock />
      {showWelcome && <WelcomeSplash onClose={() => setShowWelcome(false)} />}
    </div>
  );
};

export default Desktop;
