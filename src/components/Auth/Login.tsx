'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Key, Hash, Cloud, Lock, Zap, Shield } from 'lucide-react';

interface LoginProps {
    onSendCode: (phone: string, apiId: number, apiHash: string) => void;
    isLoading: boolean;
}

export default function Login({ onSendCode, isLoading }: LoginProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [apiId, setApiId] = useState('');
    const [apiHash, setApiHash] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber || !apiId || !apiHash) {
            alert("Please fill in all fields");
            return;
        }
        if (isNaN(Number(apiId))) {
            alert("API ID must be a number");
            return;
        }
        onSendCode(phoneNumber, parseInt(apiId), apiHash);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-8 py-6 bg-black w-full">
            <div className="w-full max-w-7xl mx-auto">
                <div className="flex rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10">
                    {/* Left Side - Hero Section */}
                    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                        {/* Animated Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tNiAwdi0ySDBoMnYyaC0yem0tNiAwdi0ySDBoMnYyaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

                        {/* Content Container */}
                        <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                {/* Logo/Brand */}
                                <div className="mb-12">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                                            <Cloud className="w-8 h-8" />
                                        </div>
                                        <h1 className="text-4xl font-bold">Space Drive</h1>
                                    </div>
                                    <p className="text-white/80 text-lg">
                                        Your files, securely stored in Telegram
                                    </p>
                                </div>

                                {/* Features List */}
                                <div className="space-y-6 mb-12">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">Secure Storage</h3>
                                            <p className="text-white/70">End-to-end encrypted storage powered by Telegram</p>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">Lightning Fast</h3>
                                            <p className="text-white/70">Upload and access your files instantly</p>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                            <Cloud className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">Unlimited Space</h3>
                                            <p className="text-white/70">Store as much as you want with no limits</p>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Stats/Trust Indicators */}
                                <div className="flex gap-8 pt-8 border-t border-white/20">
                                    <div>
                                        <div className="text-3xl font-bold">2B+</div>
                                        <div className="text-sm text-white/70">Active Telegram Users</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">100%</div>
                                        <div className="text-sm text-white/70">Secure & Private</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mb-48"></div>
                        <div className="absolute top-1/4 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -ml-32"></div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-black relative">
                        {/* Mobile Logo */}
                        <div className="lg:hidden absolute top-8 left-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Cloud className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">Space Drive</span>
                        </div>

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
                                    {/* Header */}
                                    <div className="mb-8">
                                        <h1 className="text-3xl font-bold mb-2 text-white">Welcome Back</h1>
                                        <p className="text-gray-400">
                                            Sign in to access your secure cloud storage
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Phone Number */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300 ml-1">
                                                Phone Number
                                            </label>
                                            <div className="relative group">
                                                {!phoneNumber && (
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                                                )}
                                                <input
                                                    type="tel"
                                                    placeholder="+1 (234) 567-8900"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className={`glass-input focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all ${phoneNumber ? 'pl-4' : 'pl-12'}`}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* API ID */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300 ml-1">
                                                API ID
                                            </label>
                                            <div className="relative group">
                                                {!apiId && (
                                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                                                )}
                                                <input
                                                    type="text"
                                                    placeholder="123456"
                                                    value={apiId}
                                                    onChange={(e) => setApiId(e.target.value)}
                                                    className={`glass-input focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all ${apiId ? 'pl-4' : 'pl-12'}`}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* API Hash */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300 ml-1">
                                                API Hash
                                            </label>
                                            <div className="relative group">
                                                {!apiHash && (
                                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                                                )}
                                                <input
                                                    type="password"
                                                    placeholder="Your API Hash"
                                                    value={apiHash}
                                                    onChange={(e) => setApiHash(e.target.value)}
                                                    className={`glass-input focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all ${apiHash ? 'pl-4' : 'pl-12'}`}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Help Text */}
                                        <div className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                            <Lock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                            <p className="text-xs text-gray-300">
                                                Don't have API keys? Get them from{' '}
                                                <a
                                                    href="https://my.telegram.org"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 underline font-medium"
                                                >
                                                    my.telegram.org
                                                </a>
                                            </p>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full mt-6 glass-button justify-center gap-2 group relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed py-4"
                                        >
                                            <span className="relative font-semibold tracking-wide">
                                                {isLoading ? 'Connecting to Telegram...' : 'Continue to Space'}
                                            </span>
                                            {!isLoading && (
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                                            )}
                                            {isLoading && (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            )}
                                        </button>
                                    </form>

                                    {/* Footer */}
                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <p className="text-center text-xs text-gray-500">
                                            By signing in, you agree to our Terms of Service and Privacy Policy
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
