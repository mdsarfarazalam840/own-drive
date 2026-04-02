'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Shield, Eye, EyeOff } from 'lucide-react';

interface PasswordProps {
    onVerify: (password: string) => void;
    isLoading: boolean;
}

export default function PasswordInput({ onVerify, isLoading }: PasswordProps) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.trim()) {
            onVerify(password);
        }
    };

    // Simple strength indicator
    const getStrength = (): { level: number; label: string; color: string } => {
        if (!password) return { level: 0, label: '', color: '' };
        if (password.length < 6) return { level: 1, label: 'Weak', color: 'var(--neon-rose)' };
        if (password.length < 10) return { level: 2, label: 'Fair', color: 'var(--neon-amber)' };
        return { level: 3, label: 'Strong', color: 'var(--neon-emerald)' };
    };

    const strength = getStrength();

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
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">2FA Required</h1>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Your account has two-step verification enabled
                        </p>
                        <p className="neon-text-cyan font-medium text-sm mt-1.5">
                            Enter your cloud password to continue
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-label ml-1" htmlFor="password-input">
                                Cloud Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5 group-focus-within:text-[var(--neon-violet)] transition-colors pointer-events-none" />
                                <input
                                    id="password-input"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="glass-input pl-12 pr-12 transition-all"
                                    required
                                    autoFocus
                                    aria-label="Two-step verification password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Strength indicator */}
                            {password && (
                                <div className="flex items-center gap-2 mt-2 px-1">
                                    <div className="flex-1 flex gap-1.5">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="h-1 flex-1 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: i <= strength.level ? strength.color : 'var(--bg-elevated)',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span
                                        className="text-xs font-mono font-medium"
                                        style={{ color: strength.color }}
                                    >
                                        {strength.label}
                                    </span>
                                </div>
                            )}

                            <p className="text-xs text-[var(--text-muted)] ml-1 mt-1">
                                This is the password you set for two-step verification
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !password.trim()}
                            className="w-full glass-button glass-button-primary justify-center py-4 group"
                            id="password-submit"
                        >
                            <span className="relative font-semibold tracking-wide">
                                {isLoading ? 'Unlocking...' : 'Unlock My Space'}
                            </span>
                            {!isLoading ? (
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                            ) : (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/[0.06]">
                        <p className="text-center text-xs text-[var(--text-muted)]">
                            Make sure you're entering the correct cloud password
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
