'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TelegramAuth } from '@/lib/telegram';

// Dynamic imports with ssr: false
const Login = dynamic(() => import('@/components/Auth/Login'), { ssr: false });
const OTP = dynamic(() => import('@/components/Auth/OTP'), { ssr: false });
const PasswordInput = dynamic(() => import('@/components/Auth/PasswordInput'), { ssr: false });
const Upload = dynamic(() => import('@/components/Drive/Upload'), { ssr: false });
const FileList = dynamic(() => import('@/components/Drive/FileList'), { ssr: false });

// Separate Drive wrapper to keep clean
const Drive = ({ auth }: { auth: TelegramAuth }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('telegram_session');
    localStorage.removeItem('telegram_api_id');
    localStorage.removeItem('telegram_api_hash');
    window.location.reload();
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 px-6">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">
          My Space
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-300 hover:text-red-100 transition-colors bg-white/5 px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </header>

      <Upload auth={auth} onUploadComplete={handleUploadComplete} />
      <FileList auth={auth} refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default function Home() {
  const [step, setStep] = useState<'login' | 'otp' | 'password' | 'drive'>('login');
  const [loading, setLoading] = useState(false);

  // Auth State
  const [tgAuth, setTgAuth] = useState<TelegramAuth | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');

  // Hydration check effectively
  const [mounted, setMounted] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      const storedSession = localStorage.getItem('telegram_session');
      const storedApiId = localStorage.getItem('telegram_api_id');
      const storedApiHash = localStorage.getItem('telegram_api_hash');

      if (storedSession && storedApiId && storedApiHash) {
        try {
          const auth = new TelegramAuth(Number(storedApiId), storedApiHash, storedSession);
          await auth.init();
          setTgAuth(auth);
          setStep('drive');
        } catch (e) {
          console.error("Failed to restore session:", e);
          localStorage.clear(); // Clear invalid session
        }
      }
    };
    checkSession();
  }, []);

  const handleSendCode = async (phoneNumber: string, apiId: number, apiHash: string) => {
    setLoading(true);
    try {
      // Save credentials temporarily (or permanently if we want to auto-fill, but we'll specificialy save session later)
      // For now just init auth
      const auth = new TelegramAuth(apiId, apiHash);
      await auth.init();

      const result = await auth.sendCode(phoneNumber);
      // @ts-ignore
      if (result && result.phoneCodeHash) {
        setPhoneCodeHash(result.phoneCodeHash);
        setPhone(phoneNumber);
        setTgAuth(auth);
        setStep('otp');
      } else {
        console.error(result);
        alert('Failed to send code. Check console. Ensure API ID/Hash are correct.');
      }
    } catch (e: any) {
      console.error(e);
      alert('Error sending code: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    if (!tgAuth || !phoneCodeHash) return;
    setLoading(true);
    try {
      await tgAuth.signIn(phone, phoneCodeHash, code);
      const session = tgAuth.getSession();
      console.log("Session String:", session);

      // Save session to localStorage
      // We need to access the private apiId/hash, or pass them through. 
      // Since they are on the instance, we can access them if we made them public, 
      // OR we can just grab them from the instance if we assume TS won't complain (using any)
      // OR better, we know them from handleSendCode scope? No, scope is different.
      // Let's rely on the fact that tgAuth was created with them.
      // We'll cast to any to access private props for saving, or simple:
      // We can just ask the user to re-login once to save, or...
      // Actually, let's just use the `apiId` from the auth instance properly.
      // Since they are private in the class, let's modify the class? No, let's just hack it for now or assume properties exist.
      // Wait, I can't access private properties. 
      // I should update TelegramAuth class to have getters updates? 
      // Or easier: I can just store them in state `apiId` `apiHash` in Home component?
      // But `handleSendCode` has them. `tgAuth` is state.
      // I don't have them in `handleVerify` scope.
      // I'll update TelegramAuth being passed credentials to `handleSendCode` to also save them in component state if needed,
      // but simpler: I'll use `@ts-ignore` to access them from `tgAuth` or modify `TelegramAuth` class.
      // Actually, looking at `telegram.ts` I can add getters.
      // But let's just access them via `(tgAuth as any).apiId`.

      localStorage.setItem('telegram_session', session);
      localStorage.setItem('telegram_api_id', (tgAuth as any).apiId);
      localStorage.setItem('telegram_api_hash', (tgAuth as any).apiHash);

      setStep('drive');
    } catch (e: any) {
      console.error(e);
      if (e.message && e.message.includes("SESSION_PASSWORD_NEEDED")) {
        // Transition to Password step
        setStep('password');
      } else {
        alert('Error logging in: ' + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordVerify = async (password: string) => {
    if (!tgAuth) return;
    setLoading(true);
    try {
      await tgAuth.signInWithPassword(password);
      const session = tgAuth.getSession();
      console.log("Session String:", session);

      localStorage.setItem('telegram_session', session);
      localStorage.setItem('telegram_api_id', (tgAuth as any).apiId);
      localStorage.setItem('telegram_api_hash', (tgAuth as any).apiHash);

      setStep('drive');
    } catch (e: any) {
      console.error(e);
      alert('Error with password: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {step === 'login' && (
        <Login onSendCode={handleSendCode} isLoading={loading} />
      )}

      {(step === 'otp' || step === 'password') && (
        <div className="flex justify-center items-center min-h-screen p-6">
          {step === 'otp' && (
            <OTP
              phoneNumber={phone}
              onVerify={handleVerify}
              isLoading={loading}
              onBack={() => setStep('login')}
            />
          )}

          {step === 'password' && (
            <PasswordInput
              onVerify={handlePasswordVerify}
              isLoading={loading}
            />
          )}
        </div>
      )}

      {step === 'drive' && tgAuth && (
        <div className="flex justify-center items-start min-h-screen p-6 pt-12">
          <Drive auth={tgAuth} />
        </div>
      )}
    </>
  );
}
