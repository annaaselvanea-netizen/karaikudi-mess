'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, UserRole } from '@/types';
import { INITIAL_USERS } from '@/lib/sample-data';
import { dbService } from '@/lib/db-service';

interface AuthContextType {
  currentUser: AppUser | null;
  users: AppUser[];
  loginAs: (role: UserRole) => void;
  loginWithEmail: (email: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isCashier: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(INITIAL_USERS[0]); // default to Admin for easy initial access
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);

  useEffect(() => {
    // Load persisted user if any
    const saved = localStorage.getItem('km_current_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        setCurrentUser(INITIAL_USERS[0]);
      }
    }
  }, []);

  const loginAs = (role: UserRole) => {
    const user = users.find((u) => u.role === role) || {
      id: `user-${role}`,
      username: role,
      name: `${role.toUpperCase()} User`,
      email: `${role}@karaikudimess.in`,
      role,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
    localStorage.setItem('km_current_user', JSON.stringify(user));
  };

  const loginWithEmail = (email: string): boolean => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('km_current_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('km_current_user');
  };

  const isAdmin = currentUser?.role === 'admin';
  const isCashier = currentUser?.role === 'cashier' || isAdmin;
  const isStaff = currentUser?.role === 'staff' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loginAs,
        loginWithEmail,
        logout,
        isAdmin,
        isCashier,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
