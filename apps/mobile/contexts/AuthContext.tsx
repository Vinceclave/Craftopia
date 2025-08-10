import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  // add other profile fields if needed
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem('authToken');
      if (savedToken) {
        setToken(savedToken);
        await fetchUserProfile(savedToken);
      }
    })();
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await axios.get('http://192.168.1.8:3000/user/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(res.data);
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      // Optionally handle logout or token invalidation here
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('authToken');
    }
  };

  const login = async (newToken: string) => {
    await AsyncStorage.setItem('authToken', newToken);
    setToken(newToken);
    await fetchUserProfile(newToken);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
