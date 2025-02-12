import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC9Ku3PeLhtfEs-bHttJhpp77ptr3mXFmE",
    authDomain: "chat0-9420d.firebaseapp.com",
    projectId: "chat0-9420d",
    storageBucket: "chat0-9420d.firebasestorage.app",
    messagingSenderId: "506706492412",
    appId: "1:506706492412:web:735df0ab84c5fedbb6d079"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);