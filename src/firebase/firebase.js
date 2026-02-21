// Firebase Configuration - E-Grocery Platform
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDkMZWatBvZ7B34TE98IvAs50x8DQ9soqo",
    authDomain: "srs-grocery-50d1b.firebaseapp.com",
    databaseURL: "https://srs-grocery-50d1b-default-rtdb.firebaseio.com",
    projectId: "srs-grocery-50d1b",
    storageBucket: "srs-grocery-50d1b.firebasestorage.app",
    messagingSenderId: "465305310573",
    appId: "1:465305310573:web:e5465dd736c105c0f23664",
    measurementId: "G-J9XD1J51RY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
