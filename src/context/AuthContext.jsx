import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { churchService } from '../services/churchService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Obtener el perfil del usuario con su churchId
        const profile = await churchService.getUserProfile(firebaseUser.uid);
        
        setUser({
          ...firebaseUser,
          churchId: profile?.churchId,
          churchName: profile?.churchName,
          role: profile?.role,
        });
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = async (email, password, churchData) => {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Crear iglesia y perfil de usuario
      const churchId = await churchService.createChurch(userId, email, churchData);

      return { userId, churchId };
    } catch (error) {
      console.error('Error in register:', error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  const value = { 
    user, 
    userProfile,
    loading, 
    login, 
    register, 
    logout 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
