import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDiTln8uEkXzYJLRYGCwgPLJREkRu2MiQE",
  authDomain: "ai-flashcard-c6682.firebaseapp.com",
  projectId: "ai-flashcard-c6682",
  storageBucket: "ai-flashcard-c6682.appspot.com",
  messagingSenderId: "345722880546",
  appId: "1:345722880546:web:5084f437213e8351dd407b",
  measurementId: "G-TWXGYFZX3H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db}