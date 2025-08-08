import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
const token = localStorage.getItem('token');



export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUser({ ...decoded });
    }
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    setUser(jwtDecode(data.token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
