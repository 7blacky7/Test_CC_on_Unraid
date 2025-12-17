import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';
import './LoginScreen.css';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { setUser, setLoading, setError } = useAuthStore();

  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setLoading(true);
    setError(null);

    // TEMPORARY: Bypass auth until backend is ready
    setTimeout(() => {
      setUser({ username });
      setLoading(false);
      navigate('/desktop');
    }, 500);

    // try {
    //   const { user, token } = await authService.login(username, password);
    //   setUser(user);
    //   setLoading(false);
    //   navigate('/desktop');
    // } catch (error) {
    //   const message = error.message || 'Login failed';
    //   setErrorMessage(message);
    //   setError(message);
    //   setLoading(false);
    //   setIsLoading(false);
    // }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'short' });
    const day = now.getDate();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${month} ${day} • ${time}`;
  };

  return (
    <div className="login-screen">
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#050505]"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay blur-[2px] scale-105"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4Zybcv6kQn_G_gj1_CVEaz42uZvG-aHBSR2POe344iRTOSYoeyOfqtErefY4RGGxjH5zUMcyyUBHza4kBSraTMcsP4tRVl0pyMs8tpM1IR3zLQrh610PpDMbMsFhguhK7wHv1dH1wtO62LkmYzzByz8On-owpiUdPXy1J7-rJlKUMnUybv5PCVCrCFg17Ea4Ld_IOeOXyqaXOlUNlG4i87ZfgkrVUasDfzWDakeKmBj1nQzRzgMgaA8mvkVmfmKjwWVkEGQQ_cStg')"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"></div>
      </div>

      {/* Top bar */}
      <div className="absolute top-0 w-full px-6 py-4 flex justify-between items-center z-20 text-white/50 text-xs font-medium tracking-wide">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>System Ready</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-white/80">{getCurrentDateTime()}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-full grow flex-col items-center justify-center p-4 animate-slide-up">
        <div className="w-full max-w-[340px] flex flex-col items-center">
          {/* Terminal icon */}
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="group relative cursor-default">
              <div className="h-32 w-32 rounded-full p-[2px] bg-gradient-to-b from-white/20 to-transparent shadow-2xl">
                <div className="h-full w-full rounded-full bg-[#1c1c1f] flex items-center justify-center overflow-hidden relative border border-white/5">
                  <span className="material-symbols-outlined text-6xl text-white/70 group-hover:text-primary transition-colors duration-300">
                    terminal
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Administrator</h1>
              <p className="text-white/40 text-sm">DevEnvironment Host</p>
            </div>
          </div>

          {/* Login form */}
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Error message */}
            {errorMessage && (
              <div className="glass border-red-500/20 bg-red-500/10 px-4 py-3 rounded-lg text-red-200 text-sm">
                {errorMessage}
              </div>
            )}

            {/* Username input */}
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/40 text-[20px] group-focus-within:text-white transition-colors">
                person
              </span>
              <input
                className="glass-input pl-11"
                placeholder="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Password input */}
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/40 text-[20px] group-focus-within:text-white transition-colors">
                key
              </span>
              <input
                className="glass-input pl-11 pr-11"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-1"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full h-12 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 flex items-center justify-center shadow-[0_0_25px_rgba(249,245,6,0.15)] group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 text-black text-sm font-bold tracking-wide mr-2">
                {isLoading ? 'Logging in...' : 'Log In'}
              </span>
              <span className="relative z-10 material-symbols-outlined text-black group-hover:translate-x-1 transition-transform text-[20px]">
                arrow_forward
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar - Power controls */}
      <div className="fixed bottom-8 sm:bottom-12 z-20 flex gap-6 items-center justify-center w-full">
        <button className="group relative h-12 w-12 rounded-full glass flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300">
          <span className="material-symbols-outlined">power_settings_new</span>
          <span className="absolute -top-10 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 whitespace-nowrap">
            Shut Down
          </span>
        </button>
        <button className="group relative h-12 w-12 rounded-full glass flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300">
          <span className="material-symbols-outlined">restart_alt</span>
          <span className="absolute -top-10 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 whitespace-nowrap">
            Restart
          </span>
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
