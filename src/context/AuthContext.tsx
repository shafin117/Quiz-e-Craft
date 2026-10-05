import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import {
  initStorage,
  getCurrentUser,
  setCurrentUser,
  getUserByEmail,
  saveUser,
  getUsers,
} from '../services/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  loginAsDemoAdmin: () => void;
  loginAsDemoStudent: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initStorage();
    const stored = getCurrentUser();
    if (stored) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const existing = getUserByEmail(email);
    if (!existing) {
      throw new Error('No account found with this email address.');
    }
    if (existing.password && existing.password !== password) {
      throw new Error('Invalid password provided.');
    }
    setUser(existing);
    setCurrentUser(existing);
    return true;
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: Role
  ): Promise<boolean> => {
    const existing = getUserByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setUser(newUser);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
  };

  const loginAsDemoAdmin = () => {
    const admin = getUserByEmail('admin@demo.com') || {
      id: 'user_admin_1',
      name: 'Sarah Connor (Admin)',
      email: 'admin@demo.com',
      role: 'admin' as Role,
      createdAt: new Date().toISOString(),
    };
    setUser(admin);
    setCurrentUser(admin);
  };

  const loginAsDemoStudent = () => {
    const student = getUserByEmail('student@demo.com') || {
      id: 'user_student_1',
      name: 'Alex Johnson (Student)',
      email: 'student@demo.com',
      role: 'student' as Role,
      createdAt: new Date().toISOString(),
    };
    setUser(student);
    setCurrentUser(student);
  };

  const updateUser = (updated: Partial<User>) => {
    if (!user) return;
    const merged: User = { ...user, ...updated };
    setUser(merged);
    setCurrentUser(merged);
    saveUser(merged);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        loginAsDemoAdmin,
        loginAsDemoStudent,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
