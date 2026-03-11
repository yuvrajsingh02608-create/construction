import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { USERS } from '../data/mockData';
import { onAuthStateChanged, signOut, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, FIREBASE_CONFIGURED } from '../firebase/config';
import { loginWithGoogle } from '../firebase/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('buildtrack_user');
    try { return saved ? JSON.parse(saved) : null; } catch(e) { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (FIREBASE_CONFIGURED && auth) {
      console.log('Firebase Context Init:', {
        projectId: auth.app.options.projectId,
        apiKeySuffix: auth.app.options.apiKey.slice(-4)
      });
    }
  }, []);

  const demoLogin = (identifier, password) => {
    const user = USERS.find(u => (u.email === identifier || u.phone === identifier) && u.password === password);
    if (user) {
      const { password: _, ...safe } = user;
      const userObj = { ...safe, isDemo: true };
      setCurrentUser(userObj);
      localStorage.setItem('buildtrack_fb_token', 'demo-token'); 
      localStorage.setItem('buildtrack_user', JSON.stringify(userObj));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const initTimeout = setTimeout(() => {
      setLoading(false);
    }, 6000);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      clearTimeout(initTimeout);
      
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          localStorage.setItem('buildtrack_fb_token', token);
          const mongoUser = await api.syncUser({ 
            token, 
            name: fbUser.displayName || '',
            phone: fbUser.phoneNumber || ''
          });
          const userObj = { ...fbUser, ...mongoUser, id: mongoUser._id };
          setCurrentUser(userObj);
          localStorage.setItem('buildtrack_user', JSON.stringify(userObj));
        } catch (err) {
          console.error('Failed to sync user with MongoDB:', err);
          setCurrentUser(null);
        }
      } else {
        const saved = localStorage.getItem('buildtrack_user');
        if (!saved || !JSON.parse(saved).isDemo) {
          setCurrentUser(null);
          localStorage.removeItem('buildtrack_fb_token');
          localStorage.removeItem('buildtrack_user');
        }
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(initTimeout);
      unsubscribe();
    };
  }, []);

  const setupRecaptcha = (containerId) => {
    if (!auth) return null;
    
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (e) {}
    }
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = "";

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'normal', 
        'callback': (response) => {
          console.log('Captcha solved');
        }
      });
      return window.recaptchaVerifier;
    } catch (e) {
      console.error('Recaptcha setup error:', e);
      alert('Recaptcha Error: ' + e.message);
      return null;
    }
  };

  const sendOtp = async (phoneNumber, containerId) => {
    if (!FIREBASE_CONFIGURED || !auth) return { success: false, error: 'Firebase not ready' };
    try {
      const verifier = setupRecaptcha(containerId);
      if (!verifier) throw new Error('Recaptcha initialization failed');
      
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      // DIAGNOSTIC ALERT
      const suffix = auth.app.options.apiKey.slice(-4);
      console.log(`Sending OTP with key ending in ${suffix}`);

      // Adding a small delay to ensure Recaptcha is fully mounted
      await new Promise(resolve => setTimeout(resolve, 500));

      const result = await signInWithPhoneNumber(auth, formattedNumber, verifier);
      setConfirmationResult(result);
      return { success: true };
    } catch (e) {
      console.error('Send OTP error:', e);
      const usedKey = auth.app.options.apiKey.slice(-4);
      const msg = `ERROR: ${e.code}\nMSG: ${e.message}\nKEY: ${usedKey}\n\nPlease check if "Identity Toolkit API" is ENABLED and Phone Auth is enabled in Firebase.`;
      alert(msg);
      return { success: false, error: e.message };
    }
  };

  const verifyOtp = async (otp) => {
    if (!confirmationResult) return { success: false, error: 'No pending verification' };
    try {
      await confirmationResult.confirm(otp);
      return { success: true };
    } catch (e) {
      console.error('Verify OTP error:', e);
      alert('Code entry failed: ' + e.message);
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('buildtrack_fb_token');
    localStorage.removeItem('buildtrack_user');
    localStorage.clear();
    if (auth) {
      try { await signOut(auth); } catch (e) { console.error('Signout error:', e); }
    }
    window.location.href = '/'; 
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile: currentUser,
      loading,
      isAuthenticated: !!currentUser,
      demoLogin,
      sendOtp,
      verifyOtp,
      logout,
      loginWithGoogle: () => loginWithGoogle().then(r => { if(r.success) window.location.href='/'; return r; }),
      role: currentUser?.role,
      companyId: currentUser?.companyId || 'demo',
      FIREBASE_CONFIGURED,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
