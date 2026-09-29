// context/AuthContext.jsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth, signInWithGoogle, logoutUser } from "@/lib/firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Function to refresh token
  const refreshToken = useCallback(async () => {
    if (user) {
      try {
        const idToken = await getIdToken(auth.currentUser);
        setToken(idToken);
        return idToken;
      } catch (err) {
        console.error("Error refreshing token:", err);
        return null;
      }
    }
    return null;
  }, [user]);

  useEffect(() => {
    // Check localStorage first for immediate user data
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing stored user:", err);
        localStorage.removeItem("user");
      }
    }

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get fresh token
        const idToken = await getIdToken(firebaseUser);
        
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          phoneNumber: firebaseUser.phoneNumber,
          providerId: firebaseUser.providerData[0]?.providerId,
          createdAt: firebaseUser.metadata?.creationTime,
          lastLoginAt: firebaseUser.metadata?.lastSignInTime
        };
        
        setUser(userData);
        setToken(idToken);
        
        // Store in localStorage with timestamp
        const storageData = {
          ...userData,
          _timestamp: Date.now()
        };
        localStorage.setItem("user", JSON.stringify(storageData));
        
        // Clear any previous errors
        setError(null);
      } else {
        // User is signed out
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("currentChat");
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Token refresh interval (refresh every 50 minutes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      await refreshToken();
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(interval);
  }, [user, refreshToken]);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGoogle();
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || "Failed to sign in";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await logoutUser();
      
      if (!result.success) {
        setError(result.error);
      }
      
      // Clear all stored data
      localStorage.removeItem("user");
      localStorage.removeItem("currentChat");
      sessionStorage.clear();
      
      return result;
    } catch (err) {
      const errorMessage = err.message || "Failed to logout";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  // Helper function to get user display name or email
  const getUserDisplayName = useCallback(() => {
    if (!user) return "";
    return user.displayName || user.email?.split('@')[0] || "User";
  }, [user]);

  // Helper function to get user initials
  const getUserInitials = useCallback(() => {
    if (!user) return "";
    
    if (user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      } else if (names.length === 1) {
        return names[0][0].toUpperCase();
      }
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return "U";
  }, [user]);

  const value = {
    // State
    user,
    loading,
    error,
    token,
    
    // Auth methods
    signIn,
    logout,
    refreshToken,
    
    // Helper functions
    isAuthenticated,
    getUserDisplayName,
    getUserInitials,
    
    // Convenience flags
    isLoggedIn: !!user,
    isEmailVerified: user?.emailVerified || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};