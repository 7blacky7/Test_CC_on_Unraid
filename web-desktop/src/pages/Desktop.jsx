import { useNavigate } from 'react-router-dom';
import './Desktop.css';

function Desktop() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Add logout logic here
    navigate('/');
  };

  return (
    <div className="desktop-container">
      <div className="desktop-header">
        <div className="desktop-logo">Web Desktop</div>
        <button className="logout-button" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
      <div className="desktop-content">
        <h1>Welcome to Web Desktop</h1>
        <p>Desktop environment coming soon...</p>
      </div>
    </div>
  );
}

export default Desktop;
