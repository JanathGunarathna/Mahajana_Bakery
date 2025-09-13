import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA66E5mTIWHHlIws7O5quqxG5N56XfQ3RE",
  authDomain: "mahajana-bakery.firebaseapp.com",
  projectId: "mahajana-bakery",
  storageBucket: "mahajana-bakery.firebasestorage.app",
  messagingSenderId: "860431103941",
  appId: "1:860431103941:web:858d24164b7c5f1a743dac",
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
