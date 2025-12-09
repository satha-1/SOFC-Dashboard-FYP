import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: User['role']) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'sofc_auth_user';
const USERS_KEY = 'sofc_users';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Get stored users
  const getStoredUsers = (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user exists in stored users
    const users = getStoredUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingUser));
      return true;
    }
    
    // Demo user for easy testing
    if (email && password) {
      const demoUser: User = {
        id: 'demo-' + Date.now(),
        name: 'Demo User',
        email,
        role: 'Operator',
      };
      setUser(demoUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      return true;
    }
    
    return false;
  };

  const register = async (
    name: string,
    email: string,
    _password: string,
    role: User['role']
  ): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getStoredUsers();
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      return false;
    }
    
    const newUser: User = {
      id: 'user-' + Date.now(),
      name,
      email,
      role,
    };
    
    // Store new user
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

