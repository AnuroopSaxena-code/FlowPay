import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh();
          setCurrentUser(pb.authStore.model);
        } catch (error) {
          pb.authStore.clear();
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password);
    
    // Check if email is verified
    // We only enforce this if VITE_PB_URL is set (meaning we are in production)
    // AND if the user didn't register with an admin email (for your testing)
    const isProd = import.meta.env.PROD || !!import.meta.env.VITE_PB_URL;
    if (isProd && !authData.record.verified && !email.includes('admin')) {
      pb.authStore.clear();
      throw new Error('Please verify your email before logging in.');
    }
    
    return authData;
  };

  const loginWithGoogle = async () => {
    const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
    return authData;
  };

  const signup = async (data) => {
    const record = await pb.collection('users').create({
      ...data,
      emailVisibility: true,
    });
    
    // Trigger verification email
    try {
      await pb.collection('users').requestVerification(data.email);
    } catch (e) {
      console.error('Failed to send verification email:', e);
    }
    
    return record;
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    loginWithGoogle,
    signup,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};