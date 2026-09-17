import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (verify JWT token)
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authAPI.verify();
      setAdmin(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('token');
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setAdmin(userData);
    setIsAuthenticated(true);
    // Token is already stored in the login API call
  };

  const logout = () => {
    setAdmin(null);
    setIsAuthenticated(false);
    authAPI.logout(); // This removes token from localStorage and API headers
  };

  const value = {
    isAuthenticated,
    admin,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
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