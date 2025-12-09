import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const storedUser = localStorage.getItem('finmarket_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password, role = 'student') => {
    // Simulación de login - en producción esto iría a un backend
    const user = {
      id: email, // Usar email como ID
      email: email,
      name: email.split('@')[0],
      role: role, // 'student' o 'teacher'
      balance: 50000,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('finmarket_user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const register = (name, email, password, role = 'student') => {
    // Simulación de registro
    const user = {
      id: email, // Usar email como ID
      email: email,
      name: name,
      role: role,
      balance: 50000, // Capital inicial
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('finmarket_user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('finmarket_user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}