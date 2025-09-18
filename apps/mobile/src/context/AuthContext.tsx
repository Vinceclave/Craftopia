// apps/mobile/src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
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
    try {
      const token = await authService.getToken();
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
          console.log('Auth check: User authenticated', userData.username);
        } catch (tokenError) {
          console.warn('Token invalid, clearing auth:', tokenError);
          await authService.clearTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setError(null);
      console.log('Starting registration...');
      
      const response = await authService.register(userData);
      console.log(response);

      Alert.alert(
        'Registration Successful! 🎉',
        'Please check your email for a verification link to complete your account setup.',
        [{ text: 'OK' }]
      );

      console.log('Registration successful, awaiting email verification');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);
      console.log('Starting login...');

      const response = await authService.login(credentials);
      
      // If user is not verified, throw simple error
      if (!response.user.is_email_verified) {
        throw new Error('Please verify your email first');
      }

      // Save tokens and login user
      await authService.saveTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      setIsAuthenticated(true);

      console.log('Login successful:', response.user.username);
      return response.user;
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    await checkAuthStatus();
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    register,
    login,
    logout,
    clearError,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};