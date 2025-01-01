// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3geXbOjQ02rx6fBj7fijJ-KVCN-Cdyb4",
  authDomain: "syncflow-4deef.firebaseapp.com",
  projectId: "syncflow-4deef",
  storageBucket: "syncflow-4deef.firebasestorage.app",
  messagingSenderId: "807912236448",
  appId: "1:807912236448:web:47a57129875f2ce11f70c5",
  measurementId: "G-RHK69BHX1M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;
