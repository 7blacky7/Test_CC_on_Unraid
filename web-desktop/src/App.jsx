import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Desktop from './pages/Desktop';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/desktop" element={<Desktop />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
