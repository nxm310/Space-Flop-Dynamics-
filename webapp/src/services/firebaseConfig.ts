import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FirebaseConfigState } from '../types';

const STORAGE_KEY = 'sc_firebase_config';

export const getSavedFirebaseConfig = (): FirebaseConfigState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return { ...parsed, isConfigured: true };
      }
    }
  } catch (e) {
    console.warn('Could not read firebase config from storage', e);
  }

  // Fallback / default dummy or unconfigured
  return {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    isConfigured: false,
  };
};

export const saveFirebaseConfig = (config: FirebaseConfigState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Firebase config', e);
  }
};

export const initFirebaseApp = (config?: FirebaseConfigState) => {
  const currentConfig = config || getSavedFirebaseConfig();
  
  if (!currentConfig.isConfigured || !currentConfig.apiKey) {
    return { app: null, auth: null, db: null, isLive: false };
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp({
      apiKey: currentConfig.apiKey,
      authDomain: currentConfig.authDomain,
      projectId: currentConfig.projectId,
      storageBucket: currentConfig.storageBucket,
      messagingSenderId: currentConfig.messagingSenderId,
      appId: currentConfig.appId,
    });

    const auth = getAuth(app);
    const db = getFirestore(app);

    return { app, auth, db, isLive: true };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, auth: null, db: null, isLive: false };
  }
};
