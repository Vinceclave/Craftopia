// apps/mobile/src/context/AuthContext.tsx - FIXED WITH PROPER PROFILE STRUCTURE
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../config/api';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  register: (credentials: RegisterRequest) => Promise<void>;
  login: (credentials: LoginRequest) => Promise<User | void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();  
    console.log(user)
  }, []);

  console.log(user)

  const clearError = () => setError(null);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = await authService.getToken();
      if (token) {
        // getCurrentUser returns the full user profile structure
        const userProfile = await authService.getCurrentUser();

        console.log(userProfile)
        
        // Transform the profile structure to match our User interface
        const normalizedUser = {
          id: userProfile.user_id,
          username: userProfile.username,
          email: userProfile.email,
          role: userProfile.role,
          created_at: userProfile.created_at,
          is_email_verified: userProfile.is_email_verified,
          // Add the profile data
          profile: userProfile.profile ? {
            user_id: userProfile.profile.user_id,
            bio: userProfile.profile.bio,
            profile_picture_url: userProfile.profile.profile_picture_url,
            points: userProfile.profile.points,
            home_dashboard_layout: userProfile.profile.home_dashboard_layout,
            full_name: userProfile.profile.full_name,
            location: userProfile.profile.location,
          } : undefined,
          // Keep the isEmailVerified for backward compatibility
          isEmailVerified: userProfile.is_email_verified,
        };

        console.log(normalizedUser)

        if (normalizedUser && normalizedUser.is_email_verified) {
          setUser(normalizedUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      // Don't show modal here - let the screen handle it
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      const { user: loggedInUser, accessToken, refreshToken } = response;

      if (!loggedInUser) throw new Error('Login response missing user data.');

      // Transform login response to match our User interface
      const normalizedUser = {
        ...loggedInUser,
        isEmailVerified: loggedInUser?.isEmailVerified ?? loggedInUser?.is_email_verified,
      };

      setUser(normalizedUser);
      setIsAuthenticated(!!normalizedUser.isEmailVerified);

      if (normalizedUser.isEmailVerified) {
        await authService.saveTokens(accessToken, refreshToken);
      }

      return normalizedUser;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

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