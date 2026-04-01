'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Shield } from 'lucide-react';

interface PasswordProps {
    onVerify: (password: string) => void;
    isLoading: boolean;
}

export default function PasswordInput({ onVerify, isLoading }: PasswordProps) {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify(password);
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
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 text-white">2FA Required</h1>
                        <p className="text-gray-400">
                            Your account has two-step verification enabled
                        </p>
                        <p className="text-purple-400 font-medium mt-1">Enter your cloud password to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">
                                Cloud Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="glass-input pl-12 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                    required
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-gray-500 ml-1">
                                This is the password you set for two-step verification
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full glass-button justify-center gap-2 group relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed py-4"
                        >
                            <span className="relative font-semibold tracking-wide">
                                {isLoading ? 'Unlocking Your Space...' : 'Unlock My Space'}
                            </span>
                            {!isLoading && (
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                            )}
                            {isLoading && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            )}
                        </button>
                    </form>

                    {/* Help Text */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-center text-xs text-gray-500">
                            Make sure you're entering the correct cloud password, not your account password
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
