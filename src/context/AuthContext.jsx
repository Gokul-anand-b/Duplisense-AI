import { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check localStorage for saved auth
  useEffect(() => {
    const savedUser = localStorage.getItem('duplisense_user');
    const savedToken = localStorage.getItem('duplisense_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('duplisense_user');
        localStorage.removeItem('duplisense_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userObj = await authApi.login(email, password);
    const token = 'jwt_token_' + userObj.id + '_' + Date.now();
    
    // Normalize properties (firstName/first_name)
    const formattedUser = {
      ...userObj,
      firstName: userObj.firstName || userObj.first_name || 'User',
      lastName: userObj.lastName || userObj.last_name || '',
    };

    localStorage.setItem('duplisense_user', JSON.stringify(formattedUser));
    localStorage.setItem('duplisense_token', token);
    setUser(formattedUser);
    return formattedUser;
  };

  const register = async (userData) => {
    const userObj = await authApi.register(userData);
    const token = 'jwt_token_' + userObj.id + '_' + Date.now();

    const formattedUser = {
      ...userObj,
      firstName: userObj.firstName || userObj.first_name || 'User',
      lastName: userObj.lastName || userObj.last_name || '',
    };

    localStorage.setItem('duplisense_user', JSON.stringify(formattedUser));
    localStorage.setItem('duplisense_token', token);
    setUser(formattedUser);
    return formattedUser;
  };

  const logout = () => {
    localStorage.removeItem('duplisense_user');
    localStorage.removeItem('duplisense_token');
    setUser(null);
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    const roleHierarchy = { developer: 1, user: 1, manager: 2, admin: 3 };
    return (roleHierarchy[user.role] || 0) >= (roleHierarchy[requiredRole] || 0);
  };

  const switchRole = (newRole) => {
    if (!user) {
      const defaultUser = {
        id: newRole === 'admin' ? 1 : 3,
        firstName: newRole === 'admin' ? 'Admin' : 'Developer',
        lastName: newRole === 'admin' ? 'Manager' : 'User',
        email: newRole === 'admin' ? 'admin@duplisense.ai' : 'dev@duplisense.ai',
        role: newRole,
      };
      localStorage.setItem('duplisense_user', JSON.stringify(defaultUser));
      setUser(defaultUser);
      return;
    }
    const updated = {
      ...user,
      role: newRole,
      firstName: newRole === 'admin' ? 'Admin' : (user.firstName === 'Admin' ? 'Developer' : user.firstName),
    };
    localStorage.setItem('duplisense_user', JSON.stringify(updated));
    setUser(updated);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasRole,
    switchRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
