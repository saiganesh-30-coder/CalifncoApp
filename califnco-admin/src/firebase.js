import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;