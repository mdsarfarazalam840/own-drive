'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, ArrowLeft, MessageCircle } from 'lucide-react';

interface OTPProps {
    phoneNumber: string;
    onVerify: (code: string) => void;
    isLoading: boolean;
    onBack: () => void;
}

export default function OTP({ phoneNumber, onVerify, isLoading, onBack }: OTPProps) {
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify(code);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
        >
            <div className="glass-panel p-10 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

                <div className="relative z-10">
                    {/* Header with Icon */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 text-white">Verification Code</h1>
                        <p className="text-gray-400">
                            Check your Telegram app for the code sent to
                        </p>
                        <p className="text-purple-400 font-medium mt-1">{phoneNumber}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Code Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">
                                Telegram Code
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="12345"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="glass-input pl-12 text-center text-3xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                    maxLength={5}
                                    required
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Enter the 5-digit code from your Telegram app
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || code.length !== 5}
                            className="w-full glass-button justify-center gap-2 group relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed py-4"
                        >
                            <span className="relative font-semibold tracking-wide">
                                {isLoading ? 'Verifying Code...' : 'Access My Space'}
                            </span>
                            {!isLoading && (
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                            )}
                            {isLoading && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            )}
                        </button>

                        {/* Back Button */}
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-3 hover:bg-white/5 rounded-lg"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Change Phone Number
                        </button>
                    </form>

                    {/* Help Text */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-center text-xs text-gray-500">
                            Didn't receive a code? Check your Telegram app or try again
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
