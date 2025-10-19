import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authAPI, LoginResponse } from '@/lib/api';

interface ApiLoginResponse {
  success: boolean;
  message: string;
  data: LoginResponse; // matches your API `data` object
}

export const useAuth = () => {
  const { user, isAuthenticated, isAdmin, setAuth, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response: ApiLoginResponse = await authAPI.login(email, password);
      const { accessToken, refreshToken, user } = response.data; // <-- Correctly destructure

      if (user.role !== 'admin') {
        const msg = 'Access denied. Admin privileges required.';
        setError(msg);
        throw new Error(msg);
      }

      // Save token and user in localStorage
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminUser', JSON.stringify(user));

      // Update auth store
      setAuth(user, accessToken);

      // Navigate to dashboard
      navigate('/admin/dashboard');

      return { accessToken, refreshToken, user };
    } catch (err: any) {
      // Clear any previous login data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');

      setError(err.message || 'Login failed');
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
