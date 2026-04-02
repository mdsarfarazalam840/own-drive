'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Smartphone,
    Key,
    Hash,
    Cloud,
    Lock,
    Zap,
    Shield,
    Infinity,
} from 'lucide-react';

interface LoginProps {
    onSendCode: (phone: string, apiId: number, apiHash: string) => void;
    isLoading: boolean;
}

const features = [
    {
        icon: Shield,
        title: 'Military-Grade Encryption',
        desc: 'End-to-end encrypted with Telegram MTProto protocol',
    },
    {
        icon: Zap,
        title: 'Instant Access',
        desc: 'Stream and download at maximum speed worldwide',
    },
    {
        icon: Infinity,
        title: 'Limitless Storage',
        desc: 'No caps, no limits — store everything forever',
    },
];

const stats = [
    { value: '950M+', label: 'Active Users' },
    { value: '∞', label: 'Storage' },
    { value: '100%', label: 'Encrypted' },
];

export default function Login({ onSendCode, isLoading }: LoginProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [apiId, setApiId] = useState('');
    const [apiHash, setApiHash] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber || !apiId || !apiHash) {
            alert('Please fill in all fields');
            return;
        }
        if (isNaN(Number(apiId))) {
            alert('API ID must be a number');
            return;
        }
        onSendCode(phoneNumber, parseInt(apiId), apiHash);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-8 py-6 w-full">
            <div className="w-full max-w-6xl mx-auto">
                <div className="flex rounded-[24px] overflow-hidden shadow-2xl border border-white/[0.06]"
                     style={{ boxShadow: '0 0 80px rgba(124,58,237,0.08), 0 25px 50px rgba(0,0,0,0.5)' }}>

                    {/* ─── Left: Hero Panel ─── */}
                    <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
                        {/* Gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#0d1b3e] to-[#0a2029]" />

                        {/* Animated orbs */}
                        <div className="absolute top-20 left-10 w-48 h-48 rounded-full bg-purple-600/20 blur-[80px] animate-pulse" />
                        <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-cyan-500/15 blur-[100px]"
                             style={{ animation: 'pulse-glow 4s ease-in-out infinite' }} />

                        {/* Grid overlay */}
                        <div className="absolute inset-0 opacity-10"
                             style={{
                                 backgroundImage: 'linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)',
                                 backgroundSize: '40px 40px',
                             }} />

                        <div className="relative z-10 flex flex-col justify-between px-10 py-12 text-white w-full">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7 }}
                            >
                                {/* Brand */}
                                <div className="mb-14">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="orbital-ring">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                                <Cloud className="w-7 h-7" />
                                            </div>
                                        </div>
                                        <h1 className="text-3xl font-bold tracking-tight">
                                            Space Drive
                                        </h1>
                                    </div>
                                    <p className="text-white/60 text-lg max-w-sm leading-relaxed">
                                        Your files, securely stored in Telegram's infinite cloud.
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="space-y-5 mb-14">
                                    {features.map((f, i) => (
                                        <motion.div
                                            key={f.title}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + i * 0.12 }}
                                            className="flex items-start gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
                                                <f.icon className="w-5 h-5 text-purple-300" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[15px] mb-0.5">{f.title}</h3>
                                                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex gap-8 pt-6 border-t border-white/10"
                            >
                                {stats.map((s) => (
                                    <div key={s.label}>
                                        <div className="text-2xl font-bold font-mono tracking-tight">{s.value}</div>
                                        <div className="text-xs text-white/40 mt-0.5 uppercase tracking-wider">{s.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                    {/* ─── Right: Login Form ─── */}
                    <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#050510]/80 backdrop-blur-sm relative">
                        {/* Mobile logo */}
                        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-3">
                            <div className="orbital-ring">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                    <Cloud className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <span className="text-lg font-bold">Space Drive</span>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
                            className="w-full max-w-md mt-10 lg:mt-0"
                        >
                            <div className="glass-panel glass-panel-holo p-8 sm:p-10">
                                {/* Decorative corner glows */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/8 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

                                <div className="relative z-10">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Sign in to access your secure cloud storage
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Phone */}
                                        <div className="space-y-2">
                                            <label className="text-label ml-1" htmlFor="login-phone">Phone Number</label>
                                            <div className="relative group">
                                                {!phoneNumber && (
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5 group-focus-within:text-[var(--neon-violet)] transition-colors pointer-events-none" />
                                                )}
                                                <input
                                                    id="login-phone"
                                                    type="tel"
                                                    placeholder="+1 (234) 567-8900"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className={`glass-input transition-all ${phoneNumber ? 'pl-4' : 'pl-12'}`}
                                                    required
                                                    aria-label="Phone number with country code"
                                                    autoComplete="tel"
                                                />
                                            </div>
                                        </div>

                                        {/* API ID */}
                                        <div className="space-y-2">
                                            <label className="text-label ml-1" htmlFor="login-api-id">API ID</label>
                                            <div className="relative group">
                                                {!apiId && (
                                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5 group-focus-within:text-[var(--neon-violet)] transition-colors pointer-events-none" />
                                                )}
                                                <input
                                                    id="login-api-id"
                                                    type="text"
                                                    placeholder="123456"
                                                    value={apiId}
                                                    onChange={(e) => setApiId(e.target.value)}
                                                    className={`glass-input transition-all ${apiId ? 'pl-4' : 'pl-12'}`}
                                                    required
                                                    aria-label="Telegram API ID"
                                                    inputMode="numeric"
                                                />
                                            </div>
                                        </div>

                                        {/* API Hash */}
                                        <div className="space-y-2">
                                            <label className="text-label ml-1" htmlFor="login-api-hash">API Hash</label>
                                            <div className="relative group">
                                                {!apiHash && (
                                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5 group-focus-within:text-[var(--neon-violet)] transition-colors pointer-events-none" />
                                                )}
                                                <input
                                                    id="login-api-hash"
                                                    type="password"
                                                    placeholder="Your API Hash"
                                                    value={apiHash}
                                                    onChange={(e) => setApiHash(e.target.value)}
                                                    className={`glass-input transition-all ${apiHash ? 'pl-4' : 'pl-12'}`}
                                                    required
                                                    aria-label="Telegram API Hash"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>

                                        {/* Help */}
                                        <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl border border-[var(--neon-cyan)]/15 bg-[var(--neon-cyan)]/[0.04]">
                                            <Lock className="w-4 h-4 text-[var(--neon-cyan)] flex-shrink-0" />
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                Get API keys from{' '}
                                                <a
                                                    href="https://my.telegram.org"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[var(--neon-cyan)] hover:text-[var(--neon-violet)] underline underline-offset-2 font-medium transition-colors"
                                                >
                                                    my.telegram.org
                                                </a>
                                            </p>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full mt-2 glass-button glass-button-primary justify-center py-4 group"
                                            id="login-submit"
                                        >
                                            <span className="relative font-semibold tracking-wide">
                                                {isLoading ? 'Connecting...' : 'Launch Into Space'}
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
                                            Your credentials are stored locally and never sent to any server.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
