import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Dedicated Firebase Project Configuration for Hesham Exam
 * Project ID: hesham-exam
 * Project number: 784283537317
 * Auth domain: hesham-exam.firebaseapp.com
 * App ID: 1:784283537317:web:1f292ef9faeec63510a24c
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBrv96WO4k4pvyPDoQVPj5pvTw1b3q2oYE",
  authDomain: "hesham-exam.firebaseapp.com",
  projectId: "hesham-exam",
  storageBucket: "hesham-exam.firebasestorage.app",
  messagingSenderId: "784283537317",
  appId: "1:784283537317:web:1f292ef9faeec63510a24c",
};

// Singleton App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);

// Google Sign-In Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Cloud Firestore Database
export const db = getFirestore(app);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error("Firestore Error:", JSON.stringify(errInfo));
  throw new Error(errInfo.error);
}
