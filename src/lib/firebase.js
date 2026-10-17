
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const missingFirebaseConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value || !String(value).trim())
  .map(([key]) => key);

if (missingFirebaseConfig.length > 0 && typeof window !== "undefined") {
  console.warn(
    "Firebase config is incomplete. Add the missing NEXT_PUBLIC_FIREBASE_* values to .env.local and restart the app.",
    missingFirebaseConfig
  );
}

const app = getApps().some((existingApp) => existingApp.name === "[DEFAULT]")
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");

const getUserData = (user, providerId = null) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
  ...(providerId ? { providerId } : {}),
});

const saveUser = (user) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = getUserData(result.user, result.providerId);
    saveUser(user);

    return { success: true, user };
  } catch (error) {
    const messages = {
      "auth/popup-closed-by-user":
        "Sign-in popup was closed before completing.",
      "auth/cancelled-popup-request": "Sign-in was cancelled.",
      "auth/network-request-failed":
        "Network error. Please check your connection.",
      "auth/popup-blocked": "Your browser blocked the sign-in popup.",
    };
    const errorMessage = error.code?.includes("api-key-not-valid")
      ? "Firebase rejected the API key. Set NEXT_PUBLIC_FIREBASE_API_KEY in .env.local to the Web API key from your Firebase project settings, then restart the development server."
      : messages[error.code] || "Google sign-in failed.";

    console.error("Google Sign-In Error:", error.code);

    return {
      success: false,
      error: errorMessage,
      code: error.code,
    };
  }
};

export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
    return { success: true };
  } catch (error) {
    console.error("Google Redirect Error:", error.code);
    return {
      success: false,
      error: "Google redirect sign-in failed.",
      code: error.code,
    };
  }
};

export const getRedirectResult_ = async () => {
  try {
    const result = await getRedirectResult(auth);

    if (!result) {
      return { success: false };
    }

    const user = getUserData(result.user);
    saveUser(user);

    return { success: true, user };
  } catch (error) {
    console.error("Redirect Result Error:", error.code);

    return {
      success: false,
      error: "Unable to complete Google sign-in.",
      code: error.code,
    };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);

    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("currentChat");
      sessionStorage.clear();
    }

    return { success: true };
  } catch (error) {
    console.error("Logout Error:", error.code);

    return {
      success: false,
      error: "Logout failed.",
      code: error.code,
    };
  }
};

export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const value = localStorage.getItem("user");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () =>
  typeof window !== "undefined" && !!auth.currentUser;

export const getAuthToken = async () => {
  try {
    return auth.currentUser
      ? await auth.currentUser.getIdToken()
      : null;
  } catch (error) {
    console.error("Error getting auth token:", error.code);
    return null;
  }
};

export default app;
