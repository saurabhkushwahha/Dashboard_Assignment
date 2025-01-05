import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: "AIzaSyBRzph5PJxdTV605fITaK4zY1_MfcmOWKc",
//   authDomain: "new-dashboard-ea317.firebaseapp.com",
//   projectId: "new-dashboard-ea317",
//   storageBucket: "new-dashboard-ea317.firebasestorage.app",
//   messagingSenderId: "350293935040",
//   appId: "1:350293935040:web:5740309439be57c2c3be25"
// };
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;