// src/config/firebase.js
import { initializeApp, getApps } from '@react-native-firebase/app';
import '@react-native-firebase/auth';

console.log("🔥 Starting Firebase initialization...");
console.log("Current apps:", getApps().length);

// Force initialize Firebase manually with explicit name
const firebaseConfig = {
  projectId: 'app-idea-48f7b',
  appId: '1:326978844574:android:c4e238eeaf169f7b10488f',
  apiKey: 'AIzaSyC5F_hVkEVuOb9FwWd225YVFmqvuRJrpVw',
  storageBucket: 'app-idea-48f7b.firebasestorage.app',
};

try {
  if (getApps().length === 0) {
    console.log("🔥 Initializing Firebase manually...");
    const app = initializeApp(firebaseConfig, '[DEFAULT]');
    console.log("✅ Firebase initialized successfully:", app.name);
  } else {
    console.log("🔥 Firebase already initialized");
  }
} catch (error) {
  console.log("❌ Firebase initialization error:", error);
}