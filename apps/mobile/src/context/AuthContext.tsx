// apps/mobile/src/context/AuthContext.tsx - FIXED AUTHENTICATION LOGIC
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest, UserProfileResponse } from '../config/api';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  register: (credentials: RegisterRequest) => Promise<void>;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const normalizeUser = (data: UserProfileResponse): User => ({
  id: data.user_id,
  username: data.username,
  email: data.email,
  role: data.role as 'user' | 'admin',
  created_at: data.created_at,
  is_email_verified: data.is_email_verified,
  isEmailVerified: data.is_email_verified,
  profile: data.profile,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const clearError = () => setError(null);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = await authService.getToken();
      if (token) {
        const currentUser = await authService.getCurrentUser(token);
        const normalizedUser = normalizeUser(currentUser);
        setUser(normalizedUser);
        // ✅ FIXED: User is authenticated if they have a valid token, 
        // regardless of email verification status
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.error('Auth check failed:', err);
      // ✅ FIXED: Clear tokens on auth failure
      await authService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setError(null);
      await authService.register(userData);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      const { accessToken, refreshToken } = response;
      if (!accessToken) throw new Error('Login failed, no access token returned');

      const currentUser = await authService.getCurrentUser(accessToken);
      const normalizedUser = normalizeUser(currentUser);

      setUser(normalizedUser);
      
      // ✅ FIXED: Always save tokens and set authenticated on successful login
      await authService.saveTokens(accessToken, refreshToken);
      setIsAuthenticated(true);

      // ✅ IMPROVED: Handle email verification separately from authentication
      if (!normalizedUser.is_email_verified) {
        // User is logged in but needs email verification
        // You can handle this in the UI by showing a verification prompt
        console.log('User logged in but email not verified');
      }

      return normalizedUser;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshAuth = async () => await checkAuthStatus();

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        isAuthenticated,
        error,
        register,
        login,
        logout,
        clearError,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};