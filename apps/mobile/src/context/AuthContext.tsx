import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { User, LoginRequest, RegisterRequest } from '../config/api';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
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
  }, []);

  const clearError = () => setError(null);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = await authService.getToken();
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          const normalizedUser = {
            ...userData,
            isEmailVerified: userData?.isEmailVerified ?? userData?.is_email_verified,
          };

          if (normalizedUser && normalizedUser.isEmailVerified) {
            setUser(normalizedUser);
            setIsAuthenticated(true);
            console.log('Auth check: User authenticated', normalizedUser.username);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            console.warn('User not authenticated or email not verified');
          }
        } catch (tokenError) {
          console.warn('Token invalid, clearing auth:', tokenError);
          await authService.clearTokens();
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
      console.log('Registration response:', response);

      Alert.alert(
        'Registration Successful 🎉',
        'Please check your email for a verification link to complete your account setup.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);

      const response = await authService.login(credentials);
      const { user: loggedInUser, accessToken, refreshToken } = response;

      if (!loggedInUser) {
        throw new Error('Login response does not include user data.');
      }

      // normalize API field
      const normalizedUser = {
        ...loggedInUser,
        isEmailVerified: loggedInUser?.isEmailVerified ?? loggedInUser?.is_email_verified,
      };

      console.log('Login processed:', normalizedUser.username);
      console.log('Email verified:', normalizedUser.isEmailVerified);

      setUser(normalizedUser);
      setIsAuthenticated(!!normalizedUser.isEmailVerified);

      if (normalizedUser.isEmailVerified) {
        await authService.saveTokens(accessToken, refreshToken);
      }

      return normalizedUser;
    } catch (err: any) {
      // detect verification error fast
      if (err.message?.toLowerCase().includes('verify your email')) {
        return { isEmailVerified: false } as User; // fake user for LoginScreen
      }

      console.error('Login error:', err);
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
      console.log('Logout successful');
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
