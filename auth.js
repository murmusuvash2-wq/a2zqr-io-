import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-Q44LHQHT7X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

window.triggerAuth = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    if(result.user) {
      localStorage.setItem('isUserPremiumPro', 'true');
      if (typeof window.unlockProUI === 'function') {
        window.unlockProUI();
      }
    }
  } catch(err) {
    console.error(err);
    alert("Login failed. Please try again.");
  }
};

onAuthStateChanged(auth, user => {
  if (user) {
    localStorage.setItem('isUserPremiumPro', 'true');
    if (typeof window.unlockProUI === 'function') {
      window.unlockProUI();
    }
  } else {
    localStorage.setItem('isUserPremiumPro', 'false');
    window.isUserPremiumPro = false;
  }
});
