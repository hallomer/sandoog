import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const refreshToken = useCallback(async () => {
    try {
      const newToken = await userService.refreshToken();
      setUser((prevUser) => ({ ...prevUser, token: newToken }));
    } catch (error) {
      console.error('Failed to refresh token:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user) {
        refreshToken();
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, refreshToken]);

  return (
    <UserContext.Provider value={{ user, setUser, refreshToken }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};