import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthStatus, useLogin, useLogout, useRegister, useCurrentUser } from '~/hooks/useAuth';
import { LoginRequest, RegisterRequest, User } from '~/config/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | undefined;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isRegistering: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get auth status from TanStack Query
  const { data: authStatus, isLoading: authLoading } = useAuthStatus();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  
  // Get mutations
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();

  // Overall loading state
  const isLoading: boolean = !!authLoading || !!(authStatus?.isAuthenticated && userLoading);
  const isAuthenticated = authStatus?.isAuthenticated ?? false;

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
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        register,
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