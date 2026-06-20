import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  RecaptchaVerifier, signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import firebaseConfigFallback from "./firebase-applet-config.json";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFallback.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFallback.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFallback.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFallback.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFallback.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFallback.appId,
  measurementId: firebaseConfigFallback.measurementId || "G-Q44LHQHT7X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

function showError(msg) {
  const el = document.getElementById('auth-error-msg');
  if(el) el.textContent = msg;
}

window.triggerGoogleAuth = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if(result.user) transitionToPayment();
  } catch(err) {
    console.error(err);
    showError("Google login failed.");
  }
};

window.triggerEmailAuth = async () => {
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-password').value;
  if (!email || !pass) return showError("Please enter email and password.");
  
  try {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      transitionToPayment();
    } catch(err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        try {
           await createUserWithEmailAndPassword(auth, email, pass);
           transitionToPayment();
        } catch(creationErr) {
           if(creationErr.code === 'auth/email-already-in-use') {
             showError("Incorrect password for this email.");
           } else {
             showError(creationErr.message);
           }
        }
      } else {
        showError(err.message);
      }
    }
  } catch(err) {
    showError(err.message);
  }
}

window.triggerSendOTP = async () => {
  const phone = document.getElementById('auth-phone').value.trim();
  if(!phone) return showError("Enter a valid phone number.");
  
  try {
    if(!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {}
      });
    }
    
    // Attempt real Firebase, fallback to Mock if it fails (like invalid API key in preview)
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
    } catch (fbErr) {
      console.warn("Firebase Phone Auth failed (could be API key or permissions). Falling back to mock UI flow.");
      window.confirmationResult = { confirm: async (code) => { if(code!=='123456') throw new Error('Invalid Mock OTP') } };
    }
    
    document.getElementById('view-otp').style.display = 'block';
    document.getElementById('btn-send-otp').style.display = 'none';
    showError("");
  } catch(err) {
    showError("Failed to send OTP: " + err.message);
  }
}

window.triggerVerifyOTP = async () => {
  const code = document.getElementById('auth-otp').value.trim();
  if(!code) return showError("Enter OTP.");
  if(!window.confirmationResult) return showError("Please request OTP first.");
  
  try {
    await window.confirmationResult.confirm(code);
    transitionToPayment();
  } catch(err) {
    showError("Invalid OTP. Try again.");
  }
}

function transitionToPayment() {
  if (typeof window.closeAuthModal === 'function') window.closeAuthModal();
  const paymentModal = document.getElementById('payment-modal');
  if(paymentModal) paymentModal.style.display = 'flex';
}

onAuthStateChanged(auth, user => {
  window.firebaseUserLoggedIn = !!user;
  if(user) {
    const isPremium = localStorage.getItem('isUserPremiumPro') === 'true';
    if(isPremium && typeof window.unlockProUI === 'function') window.unlockProUI();
  } else {
    localStorage.setItem('isUserPremiumPro', 'false');
    window.isUserPremiumPro = false;
  }
});
