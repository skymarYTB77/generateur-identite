import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCToIgs3Cj8bNvJB6aqmRCK88CaPjx69W4",
  authDomain: "identite-8a08e.firebaseapp.com",
  projectId: "identite-8a08e",
  storageBucket: "identite-8a08e.appspot.com",
  messagingSenderId: "568516405611",
  appId: "1:568516405611:web:f5e7b9b5b5b5b5b5b5b5b5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);