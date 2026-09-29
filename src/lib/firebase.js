// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithRedirect,
  getRedirectResult,
  isSignInWithEmailLink
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCwoQ4hnxM6pbKF3aL9OaioLoIzeNUjeMQ",
  authDomain: "codementor-f6d93.firebaseapp.com",
  projectId: "codementor-f6d93",
  storageBucket: "codementor-f6d93.firebasestorage.app",
  messagingSenderId: "407727601383",
  appId: "1:407727601383:web:dbbf3afd90c0fcc69b9442",
  measurementId: "G-3V603VMCWN"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Sign in with Google (popup)
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Get user info
    const user = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      emailVerified: result.user.emailVerified,
      providerId: result.providerId,
    };
    
    // Store minimal user data
    localStorage.setItem("user", JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    
    // Handle specific error codes
    let errorMessage = error.message;
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in popup was closed before completing';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Sign-in was cancelled';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your connection';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked by your browser';
    }
    
    return { success: false, error: errorMessage, code: error.code };
  }
};

// Alternative: Sign in with redirect (useful for mobile)
export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error("Google Redirect Error:", error);
    return { success: false, error: error.message };
  }
};

// Handle redirect result
export const getRedirectResult_ = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
      };
      localStorage.setItem("user", JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false };
  } catch (error) {
    console.error("Redirect Result Error:", error);
    return { success: false, error: error.message };
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("user");
    localStorage.removeItem("currentChat");
    sessionStorage.clear();
    return { success: true };
  } catch (error) {
    console.error("Logout Error:", error);
    return { success: false, error: error.message };
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem("user") && !!auth.currentUser;
};

// Get auth token
export const getAuthToken = async () => {
  try {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export default app;