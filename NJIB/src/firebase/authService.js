import { auth } from "./config";
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  if (!auth) return { success: false, error: 'Firebase not configured' };
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, error: error.message };
  }
};

export { auth, signInWithPhoneNumber, RecaptchaVerifier };
