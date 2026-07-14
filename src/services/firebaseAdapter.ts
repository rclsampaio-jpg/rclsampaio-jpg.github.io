/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MissionDay, HookModel, SosModel, UserProgress, UserSettings } from '../types';

/**
 * RenaSer Firebase Adapter
 * 
 * This adapter prepares the application for full-stack backend integration 
 * (Firebase Auth, Firestore, Cloud Storage, Analytics, and Push Notifications)
 * without requiring major refactoring in component views.
 * 
 * By default, this adapter operates in OFFLINE-FIRST mode utilizing LocalStorage.
 * To activate live Firebase, define your Firebase configuration in environment variables
 * and toggle `USE_FIREBASE_BACKEND = true`.
 */

export const USE_FIREBASE_BACKEND = false; // Toggle to true when Firebase is provisioned

// Placeholder for Firebase SDK initialization
// import { initializeApp } from 'firebase/app';
// import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore';
// import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "renaser-app.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "renaser-app",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "renaser-app.appspot.com",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:123:web:abc",
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || "G-XYZ123"
};

/**
 * 1. FIREBASE AUTHENTICATION INTERFACE
 */
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

/**
 * Authenticates user anonymously or via Google.
 * Fallbacks to offline user profile when Firebase is disabled.
 */
export async function authenticateUser(provider: 'google' | 'anonymous' = 'anonymous'): Promise<UserProfile> {
  if (USE_FIREBASE_BACKEND) {
    // Real Firebase SDK flow:
    // const auth = getAuth();
    // if (provider === 'google') {
    //   const result = await signInWithPopup(auth, new GoogleAuthProvider());
    //   return {
    //     uid: result.user.uid,
    //     displayName: result.user.displayName,
    //     email: result.user.email,
    //     photoURL: result.user.photoURL,
    //     isAnonymous: false
    //   };
    // } else {
    //   const result = await signInAnonymously(auth);
    //   return { uid: result.user.uid, displayName: 'Anonymous Explorer', email: null, photoURL: null, isAnonymous: true };
    // }
  }

  // Offline default fallback profile
  return {
    uid: "offline_user_rena_ser",
    displayName: "Visibilidade Explorer",
    email: "rcl.sampaio@gmail.com",
    photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=renaser",
    isAnonymous: false
  };
}

/**
 * 2. FIRESTORE SYNCHRONIZATION ENGINE
 */
export class FirestoreRepository {
  
  /**
   * Saves user progress state to Firestore/LocalStorage
   */
  static async saveProgress(userId: string, progress: UserProgress): Promise<void> {
    if (USE_FIREBASE_BACKEND) {
      // Real Firestore sync:
      // const db = getFirestore();
      // await setDoc(doc(db, "users", userId, "progress", "current"), {
      //   ...progress,
      //   updatedAt: new Date().toISOString()
      // }, { merge: true });
    }
    
    // Offline Storage Backup
    localStorage.setItem(`renaser_progress_${userId}`, JSON.stringify(progress));
  }

  /**
   * Retrieves user progress state
   */
  static async getProgress(userId: string): Promise<UserProgress | null> {
    if (USE_FIREBASE_BACKEND) {
      // const db = getFirestore();
      // const snap = await getDoc(doc(db, "users", userId, "progress", "current"));
      // if (snap.exists()) return snap.data() as UserProgress;
    }

    const local = localStorage.getItem(`renaser_progress_${userId}`);
    if (local) {
      try { return JSON.parse(local); } catch (e) { return null; }
    }
    return null;
  }

  /**
   * Syncs custom admin day curriculum edits
   */
  static async saveCurriculum(days: MissionDay[]): Promise<void> {
    if (USE_FIREBASE_BACKEND) {
      // const db = getFirestore();
      // await setDoc(doc(db, "curriculum", "30-day-journey"), { days, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem('renaser_days', JSON.stringify(days));
  }

  /**
   * Loads hooks repository dynamically
   */
  static async fetchHooks(language: string): Promise<HookModel[]> {
    // For now, load default local ones or simulated from Days curriculum
    const stored = localStorage.getItem('renaser_days');
    if (stored) {
      try {
        const days = JSON.parse(stored) as MissionDay[];
        return days
          .filter(d => d.content[language as any]?.hook)
          .map((d, index) => ({
            id: `hook_${d.dayNumber}`,
            category: d.dayNumber % 3 === 0 ? 'Provocação' : d.dayNumber % 3 === 1 ? 'Conexão Rápida' : 'Educativo',
            language: language as any,
            title: `Dia ${d.dayNumber} Hook`,
            body: d.content[language as any].hook,
            favorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}

/**
 * 3. CLOUD STORAGE AUDIO AND VIDEO HANDLERS
 */
export class CloudStorageRepository {
  
  /**
   * Uploads mentor audio file or user video stories
   */
  static async uploadFile(path: string, fileBlob: Blob): Promise<string> {
    if (USE_FIREBASE_BACKEND) {
      // const storage = getStorage();
      // const fileRef = ref(storage, path);
      // await uploadBytes(fileRef, fileBlob);
      // return await getDownloadURL(fileRef);
    }
    
    // Default mock data-url for local simulation
    return "https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg";
  }
}

/**
 * 4. PUSH NOTIFICATIONS CONTROLLER
 */
export class PushNotificationService {
  static async requestPermissionAndRegister(): Promise<string | null> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        // If FCM is loaded, fetch registration token:
        // const messaging = getMessaging();
        // return await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
        return 'mock-fcm-token-12345';
      }
    }
    return null;
  }
}

/**
 * 5. REMOTE CONFIG AND ANALYTICS LOGGING
 */
export class AnalyticsService {
  static logEvent(eventName: string, params?: Record<string, any>): void {
    console.log(`[Analytics Event] ${eventName}`, params);
    if (USE_FIREBASE_BACKEND) {
      // const analytics = getAnalytics();
      // logEvent(analytics, eventName, params);
    }
  }

  static logJourneyProgress(dayNumber: number, action: 'start' | 'complete' | 'listen_audio'): void {
    this.logEvent(`journey_day_${action}`, {
      day: dayNumber,
      timestamp: new Date().toISOString()
    });
  }
}
