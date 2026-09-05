import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  {
    key: 'manager',
    label: 'Sarah Jenkins (Manager)',
    email: 'sarah.jenkins@company.com',
    role: 'Manager',
    badgeColor: '#8b5cf6',
  },
  {
    key: 'alice',
    label: 'Alice Chen (Senior Frontend)',
    email: 'alice.chen@company.com',
    role: 'TeamMember',
    badgeColor: '#3b82f6',
  },
  {
    key: 'bob',
    label: 'Bob Miller (Backend)',
    email: 'bob.miller@company.com',
    role: 'TeamMember',
    badgeColor: '#10b981',
  },
  {
    key: 'charlie',
    label: 'Charlie Davis (Full Stack)',
    email: 'charlie.davis@company.com',
    role: 'TeamMember',
    badgeColor: '#f59e0b',
  },
  {
    key: 'diana',
    label: 'Diana Prince (QA / Automation)',
    email: 'diana.prince@company.com',
    role: 'TeamMember',
    badgeColor: '#ec4899',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      if (token) {
        try {
          const freshUser = await api.auth.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    return res.user;
  };

  const quickLogin = async (userKey) => {
    const demo = DEMO_USERS.find((u) => u.key === userKey);
    if (!demo) return;
    return await login(demo.email, 'Password123!');
  };

  const register = async (formData) => {
    const res = await api.auth.register(formData);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isManager = user?.role === 'Manager';
  const isTeamMember = user?.role === 'TeamMember';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        quickLogin,
        register,
        logout,
        isManager,
        isTeamMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
