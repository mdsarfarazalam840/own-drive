'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { TelegramAuth } from '@/lib/telegram';
import type { AuthStep } from '@/lib/types';

// Dynamic imports with ssr: false
const Login = dynamic(() => import('@/components/Auth/Login'), { ssr: false });
const OTP = dynamic(() => import('@/components/Auth/OTP'), { ssr: false });
const PasswordInput = dynamic(() => import('@/components/Auth/PasswordInput'), { ssr: false });
const Dashboard = dynamic(() => import('@/components/Drive/Dashboard'), { ssr: false });

export default function Home() {
    const [step, setStep] = useState<AuthStep>('login');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Auth State
    const [tgAuth, setTgAuth] = useState<TelegramAuth | null>(null);
    const [phone, setPhone] = useState('');
    const [phoneCodeHash, setPhoneCodeHash] = useState('');

    // Check for existing session on mount
    useEffect(() => {
        setMounted(true);
        const checkSession = async () => {
            const storedSession = localStorage.getItem('telegram_session');
            const storedApiId = localStorage.getItem('telegram_api_id');
            const storedApiHash = localStorage.getItem('telegram_api_hash');

            if (storedSession && storedApiId && storedApiHash) {
                try {
                    const auth = new TelegramAuth(
                        Number(storedApiId),
                        storedApiHash,
                        storedSession
                    );
                    await auth.init();
                    const client = auth.getClient();
                    const isAuthorized = await client.isUserAuthorized();

                    if (isAuthorized) {
                        setTgAuth(auth);
                        setStep('drive');
                    } else {
                        // User exists but needs password or something else
                        setTgAuth(auth);
                        setStep('password');
                    }
                } catch (e: any) {
                    console.error('Failed to restore session:', e);
                    if (e.message?.includes('SESSION_PASSWORD_NEEDED')) {
                        setStep('password');
                    } else {
                        localStorage.removeItem('telegram_session');
                        localStorage.removeItem('telegram_api_id');
                        localStorage.removeItem('telegram_api_hash');
                    }
                }
            }
        };
        checkSession();
    }, []);

    const handleSendCode = async (phoneNumber: string, apiId: number, apiHash: string) => {
        setLoading(true);
        try {
            const auth = new TelegramAuth(apiId, apiHash);
            await auth.init();

            const result = await auth.sendCode(phoneNumber);
            if (result && result.phoneCodeHash) {
                setPhoneCodeHash(result.phoneCodeHash);
                setPhone(phoneNumber);
                setTgAuth(auth);
                setStep('otp');
            } else {
                console.error(result);
                alert('Failed to send code. Ensure API ID/Hash are correct.');
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            console.error(e);
            alert('Error sending code: ' + message);
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

            // Use public getters — no ts-ignore needed
            localStorage.setItem('telegram_session', session);
            localStorage.setItem('telegram_api_id', String(tgAuth.apiId));
            localStorage.setItem('telegram_api_hash', tgAuth.apiHash);

            setStep('drive');
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            console.error(e);
            if (message.includes('SESSION_PASSWORD_NEEDED')) {
                setStep('password');
            } else {
                alert('Error logging in: ' + message);
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

            localStorage.setItem('telegram_session', session);
            localStorage.setItem('telegram_api_id', String(tgAuth.apiId));
            localStorage.setItem('telegram_api_hash', tgAuth.apiHash);

            setStep('drive');
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            console.error(e);
            alert('Error with password: ' + message);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <AnimatePresence mode="wait">
            {step === 'login' && (
                <motion.div
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35 }}
                >
                    <Login onSendCode={handleSendCode} isLoading={loading} />
                </motion.div>
            )}

            {(step === 'otp' || step === 'password') && (
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35 }}
                    className="flex justify-center items-center min-h-screen p-6"
                >
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
                </motion.div>
            )}

            {step === 'drive' && tgAuth && (
                <motion.div
                    key="drive"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center items-start min-h-screen p-4 sm:p-6 pt-6 sm:pt-10"
                >
                    <Dashboard auth={tgAuth} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
