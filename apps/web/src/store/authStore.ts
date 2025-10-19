// apps/web/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      setAuth: (user, token) => {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: user.role === 'admin'
        });
      },

      logout: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false
        });
      },

      checkAuth: () => {
        const token = localStorage.getItem('adminToken');
        const userStr = localStorage.getItem('adminUser');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          set({
            user,
            token,
            isAuthenticated: true,
            isAdmin: user.role === 'admin'
          });
          return true;
        }
        
        return false;
      }
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);