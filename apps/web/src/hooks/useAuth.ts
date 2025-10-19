import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authAPI, LoginResponse, ApiResponse, IUser } from '@/lib/api';

export const useAuth = () => {
  const { user, isAuthenticated, isAdmin, setAuth, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔑 Starting login process...');
      
      const response: ApiResponse<LoginResponse> = await authAPI.login(email, password);
      
      console.log('📦 Login response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      const { accessToken, refreshToken, user: userData } = response.data;
      
      if (!accessToken) {
        throw new Error('No access token received');
      }
      
      if (!userData) {
        throw new Error('No user data received');
      }
      
      console.log('👤 User data:', userData);
      
      if (userData.role !== 'admin') {
        const msg = 'Access denied. Admin privileges required.';
        setError(msg);
        throw new Error(msg);
      }

      const normalizedUser: IUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        isEmailVerified: userData.isEmailVerified
      };

      console.log('✅ Normalized user:', normalizedUser);

      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminUser', JSON.stringify(normalizedUser));

      setAuth(normalizedUser, accessToken);

      console.log('✅ Login successful, navigating to dashboard...');
      
      navigate('/admin/dashboard');
      
    } catch (err: any) {
      console.error('❌ Login error:', err);
      
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');

      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('👋 Logging out...');
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