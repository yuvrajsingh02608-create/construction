import { useState, useEffect } from 'react';
import { Eye, EyeOff, Building2, Loader2, Mail, Lock, User, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const DEMO_ACCOUNTS = [
  { label: 'Owner', identifier: '9876500001', password: 'demo123' },
  { label: 'Manager', identifier: '9876500002', password: 'demo123' },
  { label: 'Supervisor', identifier: '9876500003', password: 'demo123' },
];

export default function Login() {
  const navigate = useNavigate();
  const { demoLogin, sendOtp, verifyOtp, loginWithGoogle, FIREBASE_CONFIGURED } = useAuth();
  const { showToast } = useApp();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);
    const result = await sendOtp(phoneNumber, 'recaptcha-container');
    setLoading(false);
    if (result.success) {
      setStep('otp');
      setTimer(60);
      showToast('OTP sent successfully!', 'success');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    const result = await verifyOtp(otp);
    setLoading(false);
    if (result.success) {
      showToast('Login successful!', 'success');
      navigate('/');
    } else {
      setError(result.error || 'Invalid OTP');
    }
  };

  const handleQuickLogin = async (id, pwd) => {
    setError('');
    setLoading(true);
    const result = await demoLogin(id, pwd);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2A0000 50%, #CC0000 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white backdrop-blur mb-4 p-3 overflow-hidden shadow-xl">
            <img src="/njib-logo.png" alt="NJIB Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white">NJIB</h1>
          <p className="text-red-200 mt-1">Construction Management Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 'phone' ? 'Enter phone number to continue' : `Enter code sent to +91 ${phoneNumber}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm mb-4 flex items-start gap-2">
              <span className="flex-shrink-0">⚠️</span> {error}
            </div>
          )}

          {/* STEP 1: PHONE NUMBER */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 pr-2">
                  <span className="text-sm font-bold text-gray-500">+91</span>
                </div>
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  maxLength={10}
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="input-field pl-16 text-lg tracking-wider" 
                  required 
                  autoFocus
                />
              </div>
              
              <div id="recaptcha-container" className="flex justify-center my-4 min-h-[78px]"></div>

              <button 
                type="submit" 
                disabled={loading || phoneNumber.length < 10} 
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-lg"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <>Get OTP <ArrowRight size={20}/></>}
              </button>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-field pl-10 text-center text-2xl tracking-[0.5em] font-bold" 
                  required 
                  autoFocus
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || otp.length < 6} 
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-lg"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : 'Verify & Continue'}
              </button>

              <div className="flex items-center justify-between text-sm px-1">
                <button 
                  type="button" 
                  onClick={() => setStep('phone')} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  Change Number
                </button>
                {timer > 0 ? (
                  <span className="text-gray-400">Resend in {timer}s</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    className="text-[#CC0000] font-medium hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="relative flex items-center mb-6">
              <div className="flex-1 border-t border-gray-100 dark:border-gray-700" />
              <span className="px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">Demo Login</span>
              <div className="flex-1 border-t border-gray-100 dark:border-gray-700" />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {DEMO_ACCOUNTS.map(({ label, identifier, password }) => (
                <button 
                  key={label} 
                  onClick={() => handleQuickLogin(identifier, password)} 
                  disabled={loading}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-[#CC0000] hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-[#CC0000] group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                    <User size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">{label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <p className="mt-8 text-center text-xs text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
