import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';

// TODO: Implement authentication state management
export const useAuth = () => {
  const { user, isAuthenticated, setUser, clearUser, loading, error, setLoading, setError } = useAuthStore();

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Call auth service to perform login
      const response = await authService.login(username, password);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Call auth service to perform logout
      await authService.logout();
      clearUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, [clearUser, setLoading]);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Check if user is authenticated via token
      const user = await authService.checkAuth();
      if (user) {
        setUser(user);
      }
    } catch (err) {
      clearUser();
    } finally {
      setLoading(false);
    }
  }, [setUser, clearUser, setLoading]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkAuth,
  };
};
