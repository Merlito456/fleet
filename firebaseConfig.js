// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDlLV0mC6SoU061JNJanMX_7CMJ6dj9jFs",
  authDomain: "fleet-acd5e.firebaseapp.com",
  projectId: "fleet-acd5e",
  storageBucket: "fleet-acd5e.firebasestorage.app",
  messagingSenderId: "29073738872",
  appId: "1:29073738872:web:c944b84447a6d36e80f18d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
