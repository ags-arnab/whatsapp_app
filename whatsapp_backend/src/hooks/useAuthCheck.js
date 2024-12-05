// src/hooks/useAuthCheck.js
import { useEffect, useState } from 'react';

export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (token && user) {
        setIsAuthenticated(true);
        setUserRole(user.role);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return { isAuthenticated, userRole, loading };
};