import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { auth } from '../config';

const googleProvider = new GoogleAuthProvider();

const formatAuthError = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No user found with this email address';
    case 'auth/wrong-password':
      return 'Invalid password';
    case 'auth/email-already-in-use':
      return 'Email already registered';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/popup-closed-by-user':
      return 'Sign in popup was closed before completion';
    default:
      return error.message;
  }
};

export const AuthService = {
  // Sign up with email and password
  async registerWithEmailAndPassword(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(formatAuthError(error));
    }
  },

  // Sign in with email and password
  async loginWithEmailAndPassword(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(formatAuthError(error));
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      throw new Error(formatAuthError(error));
    }
  },

  // Sign out
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(formatAuthError(error));
    }
  },

  // Get current user
  getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      }, reject);
    });
  }
};