'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { SEED_USERS } from '@/data/seed-data';

export type { UserRole };

interface AuthContextType {
  user: UserProfile | null;
  login: (user: UserProfile) => void;
  signInWithCredentials: (email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => void;
  isOfficial: boolean;
  isSuperAdmin: boolean;
  isDistrictCollector: boolean;
  isDepartmentEngineer: boolean;
  assignedDistrict?: string;
  assignedDepartment?: string;
  switchRole: (email: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  signInWithCredentials: async () => ({ success: false, error: 'Auth context not initialized' }),
  logout: () => {},
  isOfficial: false,
  isSuperAdmin: false,
  isDistrictCollector: false,
  isDepartmentEngineer: false,
  switchRole: () => false,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session in localStorage
    try {
      const saved = localStorage.getItem('civicpulse_auth_user');
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // Default to Central Super Admin for immediate full preview
        const defaultUser = SEED_USERS.find(u => u.email === 'gautamkr192007@gmail.com') || SEED_USERS[0];
        setUser(defaultUser);
        localStorage.setItem('civicpulse_auth_user', JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.error('Failed to load saved session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem('civicpulse_auth_user', JSON.stringify(userData));
  };

  const signInWithCredentials = async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Authentication failed. Please verify credentials.',
        };
      }

      login(data.user);
      return {
        success: true,
        user: data.user,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error connecting to GovTech authentication gateway.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civicpulse_auth_user');
  };

  const switchRole = (email: string): boolean => {
    const target = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (target) {
      login(target);
      return true;
    }
    return false;
  };

  const isOfficial = !!user && user.role !== 'citizen';
  const isSuperAdmin = !!user && user.role === 'super_admin';
  const isDistrictCollector = !!user && user.role === 'district_collector';
  const isDepartmentEngineer = !!user && user.role === 'department_engineer';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signInWithCredentials,
      logout,
      isOfficial,
      isSuperAdmin,
      isDistrictCollector,
      isDepartmentEngineer,
      assignedDistrict: user?.assignedDistrict,
      assignedDepartment: user?.assignedDepartment,
      switchRole,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

