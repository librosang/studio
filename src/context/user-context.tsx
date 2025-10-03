
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

// Mock users - in a real app, this would come from an API/Firebase Auth
const mockUsers: UserProfile[] = [
  { id: '1', name: 'Admin Manager', email: 'manager@test.com', role: 'manager' },
  { id: '2', name: 'John Cashier', email: 'john@test.com', role: 'cashier' },
];

type UserContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  React.useEffect(() => {
    // Simulate checking for a logged-in user
    const storedUserEmail = localStorage.getItem('currentUserEmail');
    if (storedUserEmail) {
      const foundUser = mockUsers.find(u => u.email === storedUserEmail);
      setUser(foundUser || null);
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      localStorage.setItem('currentUserEmail', email);
      setUser(foundUser);
      router.push('/dashboard');
    } else {
        // In a real app, you'd show an error
      alert('User not found');
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUserEmail');
    setUser(null);
    router.push('/login');
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
