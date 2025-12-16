import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// TODO: Implement Zustand store for authentication state
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      /**
       * Set the current user
       * @param {Object} user - User object
       */
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      /**
       * Clear the current user (logout)
       */
      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      /**
       * Set loading state
       * @param {boolean} loading
       */
      setLoading: (loading) => {
        set({ loading });
      },

      /**
       * Set error message
       * @param {string|null} error
       */
      setError: (error) => {
        set({ error });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Update user data
       * @param {Object} updates - Partial user object
       */
      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...updates },
          });
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist user and isAuthenticated
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
