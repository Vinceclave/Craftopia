import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthStatus, useLogin, useLogout, useRegister } from '~/hooks/useAuth';
import { LoginRequest, RegisterRequest } from '~/config/api';

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  
  // Loading states
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isRegistering: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get auth status from TanStack Query
  const { data: authStatus, isLoading } = useAuthStatus();
  
  // Get mutations
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();

  // Wrapper functions
  const login = async (credentials: LoginRequest) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const register = async (userData: RegisterRequest) => {
    await registerMutation.mutateAsync(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        // State
        isAuthenticated: authStatus?.isAuthenticated ?? false,
        isLoading,
        
        // Actions
        login,
        logout,
        register,
        
        // Loading states
        isLoggingIn: loginMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        isRegistering: registerMutation.isPending,
      }}
    >
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