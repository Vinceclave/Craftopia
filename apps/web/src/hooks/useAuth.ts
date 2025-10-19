// apps/web/src/hooks/useAuth.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI, IUser } from '../lib/api';

export const useAuth = () => {
  const { user, isAuthenticated, isAdmin, setAuth, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(email, password);
      // response is already response.data thanks to interceptor
      if (response.user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Save token and user in localStorage
      localStorage.setItem('adminToken', response.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(response.user));

      // Update store
      setAuth(response.user, response.accessToken);

      navigate('/admin/dashboard');

      return response;
    } catch (err: any) {
      const message = err.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
    authAPI.logout();
    navigate('/admin/login');
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    logout,
  };
};
