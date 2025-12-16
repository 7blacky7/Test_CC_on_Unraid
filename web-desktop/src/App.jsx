import { Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/Login/LoginScreen';
import Desktop from './components/Desktop/Desktop';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route path="/desktop" element={<Desktop />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
