'use client';

import { useState, useCallback, memo } from 'react';
import { TelegramAuth } from '@/lib/telegram';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Cloud, LogOut, HardDrive } from 'lucide-react';

const Upload = dynamic(() => import('./Upload'), { ssr: false });
const FileList = dynamic(() => import('./FileList'), { ssr: false });

interface DashboardProps {
    auth: TelegramAuth;
}

const DashboardHeader = memo(function DashboardHeader({ onLogout }: { onLogout: () => void }) {
    return (
        <header className="flex justify-between items-center py-5 px-1">
            <div className="flex items-center gap-4">
                <div className="orbital-ring">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Cloud className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">My Space</h1>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <HardDrive className="w-3 h-3" />
                        <span className="font-mono">Unlimited Storage</span>
                    </div>
                </div>
            </div>
            <button
                onClick={onLogout}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--neon-rose)] transition-colors bg-white/[0.03] hover:bg-[var(--neon-rose)]/[0.06] px-4 py-2.5 rounded-xl border border-white/[0.06] hover:border-[var(--neon-rose)]/20"
                id="logout-button"
                aria-label="Sign out"
            >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
            </button>
        </header>
    );
});

export default function Dashboard({ auth }: DashboardProps) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadComplete = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('telegram_session');
        localStorage.removeItem('telegram_api_id');
        localStorage.removeItem('telegram_api_hash');
        window.location.reload();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
            className="w-full max-w-7xl mx-auto flex flex-col gap-6 px-4 sm:px-6"
        >
            <DashboardHeader onLogout={handleLogout} />

            <Upload auth={auth} onUploadComplete={handleUploadComplete} />
            <FileList auth={auth} refreshTrigger={refreshTrigger} />
        </motion.div>
    );
}
