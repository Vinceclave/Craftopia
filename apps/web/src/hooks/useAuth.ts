// apps/web/src/hooks/useAuth.ts - COMPLETE WITH REFRESH TOKEN
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authAPI, IUser } from '@/lib/api';

export const useAuth = () => {
  const { user, isAuthenticated, isAdmin, setAuth, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // ✅ Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        console.log('🔄 Initializing auth state...');
        
        const token = localStorage.getItem('adminToken');
        const refreshToken = localStorage.getItem('adminRefreshToken');
        const storedUser = localStorage.getItem('adminUser');
        
        if (token && refreshToken && storedUser) {
          const user = JSON.parse(storedUser) as IUser;
          console.log('✅ Restored auth from localStorage:', user.username);
          setAuth(user, token);
        } else {
          console.log('ℹ️ No stored auth found');
        }
      } catch (err) {
        console.error('❌ Error initializing auth:', err);
        // Clear corrupted data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUser');
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [setAuth]);

  // ✅ Login function
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔑 Starting login process for:', email);
      
      // Call API login
      const { accessToken, refreshToken, user: userData } = await authAPI.login(email, password);
      
      console.log('📦 Login data received:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUser: !!userData,
        userRole: userData?.role
      });
      
      // ✅ Check admin role
      if (userData.role !== 'admin') {
        const msg = 'Access denied. Admin privileges required.';
        setError(msg);
        throw new Error(msg);
      }

      // ✅ Normalize user data
      const normalizedUser: IUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        isEmailVerified: userData.isEmailVerified
      };

      console.log('✅ Normalized user:', normalizedUser);

      // ✅ Save to localStorage (tokens already saved by authAPI.login)
      localStorage.setItem('adminUser', JSON.stringify(normalizedUser));

      // ✅ Update Zustand store
      setAuth(normalizedUser, accessToken);

      console.log('✅ Login successful, navigating to dashboard');
      navigate('/admin/dashboard');
      
    } catch (err: any) {
      console.error('❌ Login error:', err);
      
      // Clear storage on error
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');

      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout function
  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      setLoading(true);
      
      // Call backend logout
      await authAPI.logout();
      
      // Clear Zustand store
      storeLogout();
      
      // Navigate to login
      navigate('/admin/login');
      
      console.log('✅ Logout successful');
    } catch (err) {
      console.error('❌ Logout error:', err);
      // Even if backend logout fails, clear local state
      storeLogout();
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check token validity
  const checkAuth = (): boolean => {
    const hasToken = authAPI.hasValidToken();
    const hasUser = !!authAPI.getCurrentUser();
    return hasToken && hasUser;
  };

  // ✅ Force refresh token (manual refresh)
  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('🔄 Manually refreshing token...');
      
      const { accessToken, refreshToken: newRefreshToken } = await authAPI.refreshToken();
      
      // Update localStorage
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminRefreshToken', newRefreshToken);
      
      // Update store if we have user
      const currentUser = authAPI.getCurrentUser();
      if (currentUser) {
        setAuth(currentUser, accessToken);
      }
      
      console.log('✅ Token refreshed successfully');
      return true;
    } catch (err) {
      console.error('❌ Token refresh failed:', err);
      
      // Clear auth and redirect to login
      storeLogout();
      authAPI.logout();
      navigate('/admin/login');
      
      return false;
    }
  };

  return {
    // State
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    isInitializing,
    
    // Actions
    login,
    logout,
    checkAuth,
    refreshToken,
  };
};