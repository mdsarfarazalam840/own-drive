'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, MessageCircle } from 'lucide-react';

interface OTPProps {
    phoneNumber: string;
    onVerify: (code: string) => void;
    isLoading: boolean;
    onBack: () => void;
}

const CODE_LENGTH = 5;

export default function OTP({ phoneNumber, onVerify, isLoading, onBack }: OTPProps) {
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = useCallback((index: number, value: string) => {
        // Only accept single digits
        const digit = value.replace(/\D/g, '').slice(-1);

        setDigits((prev) => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });

        // Auto-advance to next input
        if (digit && index < CODE_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    }, []);

    const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    }, [digits]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
        if (!pastedData) return;

        const newDigits = Array(CODE_LENGTH).fill('');
        pastedData.split('').forEach((char, i) => {
            newDigits[i] = char;
        });
        setDigits(newDigits);

        // Focus the next empty or last box
        const focusIndex = Math.min(pastedData.length, CODE_LENGTH - 1);
        inputsRef.current[focusIndex]?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = digits.join('');
        if (code.length === CODE_LENGTH) {
            onVerify(code);
        }
    };

    const isComplete = digits.every((d) => d !== '');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.45, ease: [0.25, 0.8, 0.25, 1] }}
            className="w-full max-w-md"
        >
            <div className="glass-panel glass-panel-holo p-8 sm:p-10 relative overflow-hidden">
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="orbital-ring mx-auto mb-5 w-fit">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                <MessageCircle className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Verification Code</h1>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Check your Telegram app for the code sent to
                        </p>
                        <p className="neon-text-violet font-semibold font-mono text-sm mt-1.5">{phoneNumber}</p>
                    </div>

                    {/* OTP Digit Boxes */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-label ml-1 block mb-3">Enter Code</label>
                            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                                {digits.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { inputsRef.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        className={`
                                            w-14 h-16 text-center text-2xl font-bold font-mono
                                            glass-input rounded-xl transition-all
                                            ${digit ? 'border-[var(--neon-violet)] bg-[var(--neon-violet)]/[0.06]' : ''}
                                        `}
                                        aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text-muted)] text-center mt-3 font-mono">
                                {CODE_LENGTH}-digit code from Telegram
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !isComplete}
                            className="w-full glass-button glass-button-primary justify-center py-4 group"
                            id="otp-submit"
                        >
                            <span className="relative font-semibold tracking-wide">
                                {isLoading ? 'Verifying...' : 'Access My Space'}
                            </span>
                            {!isLoading ? (
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                            ) : (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                        </button>

                        {/* Back */}
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors py-3 hover:bg-white/[0.03] rounded-xl"
                            id="otp-back"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Change Phone Number
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/[0.06]">
                        <p className="text-center text-xs text-[var(--text-muted)]">
                            Didn't receive a code? Check your Telegram app or try again
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
