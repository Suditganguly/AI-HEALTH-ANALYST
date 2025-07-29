import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAUjsIKr-Hi8_IRFjXE6i8VZ6-okUmLGGE",
    authDomain: "healthai-3046.firebaseapp.com",
    projectId: "healthai-3046",
    storageBucket: "healthai-3046.firebasestorage.app",
    messagingSenderId: "55110825429",
    appId: "1:55110825429:web:cb0aea97dcbfaf42cdb95c",
    measurementId: "G-7DXMNNL5JW"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);