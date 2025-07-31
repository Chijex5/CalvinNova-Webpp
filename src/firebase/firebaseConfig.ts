// firebase.js - Firebase configuration file
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyA8kwllnlMQw7_2yE-LZyg2wyLmdOtHIoY",
  authDomain: "calvinnova-a6871.firebaseapp.com",
  projectId: "calvinnova-a6871",
  storageBucket: "calvinnova-a6871.firebasestorage.app",
  messagingSenderId: "225387270738",
  appId: "1:225387270738:web:2dae9de614ba7cebc5058b",
  measurementId: "G-SCZ8T50S5P"
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
setPersistence(auth, browserLocalPersistence);