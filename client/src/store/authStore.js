// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('http://localhost:5097/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            token: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return data;
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
            user: null,
            token: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },
      
      clearError: () => set({ error: null }),
      
      // Helper functions
      hasRole: (roleName) => {
        const { user } = get();
        return user?.userRoles?.some(role => role.roleName === roleName) || false;
      },
      
      hasAnyRole: (roleNames) => {
        const { user } = get();
        return user?.userRoles?.some(role => roleNames.includes(role.roleName)) || false;
      },
      
      isAdmin: () => {
        return get().hasRole('Admin');
      },
      
      isManager: () => {
        return get().hasAnyRole(['Admin', 'Manager']);
      },
      
      isAgent: () => {
        return get().hasAnyRole(['Admin', 'Manager', 'Agent']);
      },
      
      getUserDepartments: () => {
        const { user } = get();
        return user?.userRoles?.map(role => ({
          id: role.departmentId,
          name: role.departmentName,
        })).filter(dept => dept.id) || [];
      },
      
      getUserTeams: () => {
        const { user } = get();
        return user?.userRoles?.map(role => ({
          id: role.teamId,
          name: role.teamName,
        })).filter(team => team.id) || [];
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;