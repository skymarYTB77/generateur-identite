import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCToIgs3Cj8bNvJB6aqmRCK88CaPjx69W4",
  projectId: "identite-8a08e",
  authDomain: "identite-8a08e.firebaseapp.com",
  storageBucket: "identite-8a08e.appspot.com"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);