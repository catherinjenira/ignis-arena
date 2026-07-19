import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { User, UserRole } from "../types";

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: metaEnv.VITE_FIREBASE_APP_ID,
};

// Check if Firebase configuration is provided
export const isFirebaseConfigured = !!metaEnv.VITE_FIREBASE_API_KEY;

let app;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    console.log("[Firebase] Successfully initialized Firebase authentication");
  } catch (err) {
    console.error("[Firebase] Initialization error:", err);
  }
}

// Map Firebase User to our app's custom User format
export function mapFirebaseUser(fbUser: FirebaseUser, customRole: UserRole = "fan"): User {
  return {
    id: fbUser.uid,
    username: fbUser.displayName || fbUser.email?.split("@")[0] || "Firebase User",
    email: fbUser.email || "",
    role: customRole,
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
  };
}

// Wrapper function to sign in with Firebase or fallback to local Express Server Auth
export async function authenticateWithFirebase(email: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Retrieve stored role from localStorage or default to "fan". 
      // In production Firebase apps, roles can be managed via custom claims or Firestore.
      // We will allow selecting role on register and remember it, or store a mock mapped role.
      const savedRole = localStorage.getItem(`firebase_role_${userCredential.user.uid}`) as UserRole || "fan";
      const user = mapFirebaseUser(userCredential.user, savedRole);
      const token = await userCredential.user.getIdToken();
      return { success: true, user, token };
    } catch (err: any) {
      console.error("[Firebase] Sign-in error:", err);
      return { success: false, error: err.message || "Firebase Sign-In failed" };
    }
  } else {
    // Fallback to local server API auth
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Authentication failed" };
      }
      return { success: true, user: data.user, token: data.token };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to reach local auth server" };
    }
  }
}

// Wrapper function to register with Firebase or fallback to local Express Server Auth
export async function registerWithFirebase(username: string, email: string, password: string, role: UserRole = "fan"): Promise<{ success: boolean; user?: User; error?: string }> {
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      // Keep track of the role locally or in standard claims
      localStorage.setItem(`firebase_role_${userCredential.user.uid}`, role);
      const user = mapFirebaseUser(userCredential.user, role);
      return { success: true, user };
    } catch (err: any) {
      console.error("[Firebase] Registration error:", err);
      return { success: false, error: err.message || "Firebase Registration failed" };
    }
  } else {
    // Fallback to local server API register
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to reach local auth server" };
    }
  }
}

// Wrapper function for logout
export async function logoutUserFromFirebase(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}
