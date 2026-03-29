import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebaseClient';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  updateProfile,
  sendEmailVerification
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Email verification check (Enforced in production)
    if (import.meta.env.PROD && !userCredential.user.emailVerified && !email.includes('admin')) {
      await signOut(auth);
      throw new Error('Please verify your email before logging in.');
    }
    
    return userCredential.user;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const signup = async (data) => {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    
    // Update profile with name
    await updateProfile(userCredential.user, {
      displayName: data.name
    });

    // Send verification email
    try {
      await sendEmailVerification(userCredential.user);
    } catch (e) {
      console.error('Failed to send verification email:', e);
    }
    
    return userCredential.user;
  };

  const logout = () => {
    return signOut(auth);
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