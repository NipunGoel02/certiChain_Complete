import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Backend base URL — prefer .env value, fallback to localhost
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://nft-project-2y3b.onrender.com";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Signup function with role parameter
  async function signup(email, password, name, role = 'user') {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      await fetchUserProfile(data.token);
    } else {
      throw new Error(data.message || 'Signup failed');
    }
  }

  // Login function
  async function login(email, password) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      const user = await fetchUserProfile(data.token);
      return user;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  }

  // Logout function
  function logout() {
    localStorage.removeItem('token');
    setCurrentUser(null);
  }

  // Fetch user profile
  async function fetchUserProfile(token) {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const user = await res.json();
      setCurrentUser(user);
      setLoading(false);
      return user;
    } else {
      setCurrentUser(null);
      setLoading(false);
      return null;
    }
  }

  // On mount, check for token and fetch user
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    fetchUserProfile,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
