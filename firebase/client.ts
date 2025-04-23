// Firebase client configuration for a React app
import { initializeApp, getApp, getApps} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD41ZusOLDiDEauwNWw80OBygAyQa3wjgY",
    authDomain: "studybuddy-6ee80.firebaseapp.com",
    projectId: "studybuddy-6ee80",
    storageBucket: "studybuddy-6ee80.firebasestorage.app",
    messagingSenderId: "418677374923",
    appId: "1:418677374923:web:64d0234bde4f8b83d8004e"
};

// Initialize Firebase
const app = !getApps.length ?  initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);