import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyASWSVgwP_YIKz0bwaDc_0tWcvZq8LlRJk",
    authDomain: "eyes-everywhere-a6633.firebaseapp.com",
    projectId: "eyes-everywhere-a6633",
    storageBucket: "eyes-everywhere-a6633.firebasestorage.app",
    messagingSenderId: "512490739650",
    appId: "1:512490739650:web:824dd9cdbdb9ac0fb9685b",
    measurementId: "G-2YGZZ2SSBR"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
