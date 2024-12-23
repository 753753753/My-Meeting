// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCM13mzrMxyjgYYzIrvjiuvbFVDKJ6V758",
  authDomain: "zoom-clone-88822.firebaseapp.com",
  projectId: "zoom-clone-88822",
  storageBucket: "zoom-clone-88822.firebasestorage.app",
  messagingSenderId: "949789075651",
  appId: "1:949789075651:web:2e0537267dcc83d47fda76",
  measurementId: "G-0ZC3Z8DGZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const firebaseDB = getFirestore(app);
export const usersRef = collection(firebaseDB, "users");
export const meetingsRef = collection(firebaseDB, "meetings");
export const notesRef = collection(firebaseDB, "notes");