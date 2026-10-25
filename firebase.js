
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD4cbHnzghv8hQLefffmQh9hsZt_-z5vVw',
  authDomain: 'califnco-app-e1266.firebaseapp.com',
  projectId: 'califnco-app-e1266',
  storageBucket: 'califnco-app-e1266.firebasestorage.app',
  messagingSenderId: '203582221070',
  appId: '1:203582221070:web:c157fa1c22109310cc055f',
  measurementId: 'G-0HY89YKK9R',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  if (error.code !== 'auth/already-initialized') {
    throw error;
  }
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { auth };

export default app;
