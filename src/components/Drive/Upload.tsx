'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { TelegramAuth } from '@/lib/telegram';

interface UploadProps {
    auth: TelegramAuth;
    onUploadComplete: () => void;
}

export default function Upload({ auth, onUploadComplete }: UploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const uploadFile = useCallback(async (file: File) => {
        setUploading(true);
        setProgress(0);
        setShowSuccess(false);
        try {
            const client = await auth.init();
            if (!client) return;

            const { Api } = await import('telegram');

            // 1. Upload the file to Telegram server directly in chunks
            const uploadResult = await client.uploadFile({
                file: file,
                workers: 4,
                onProgress: (percent: number) => {
                    setProgress(Math.round(percent * 100));
                },
            });

            // 2. Wrap the uploaded file handle into a "Media" message
            // Using the higher-level sendFile with the uploadResult handle is the most reliable way 
            // in the browser to ensure all required fields like randomId are handled correctly.
            await client.sendFile('me', {
                file: uploadResult,
                caption: '',
                forceDocument: true,
                attributes: [
                    new Api.DocumentAttributeFilename({
                        fileName: file.name,
                    }),
                ],
            });

            // Play futuristic success sound
            const { playSuccessSound } = await import('@/lib/audio');
            playSuccessSound();

            // Brief success animation
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);

            onUploadComplete();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('Upload failed:', err);
            alert(`Upload failed: ${message}`);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }, [auth, onUploadComplete]);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (e.dataTransfer.files?.[0]) {
                uploadFile(e.dataTransfer.files[0]);
            }
        },
        [uploadFile]
    );

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files?.[0]) {
                uploadFile(e.target.files[0]);
            }
        },
        [uploadFile]
    );

    return (
        <div className="w-full mb-4">
            <motion.div
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                    glass-panel p-10 sm:p-12 transition-all duration-400 border-2 border-dashed relative overflow-hidden group
                    ${isDragging
                        ? 'border-[var(--neon-violet)] bg-[var(--neon-violet)]/[0.06] scale-[1.01]'
                        : 'border-white/[0.08] hover:border-[var(--neon-violet)]/30'
                    }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {/* Hover gradient underlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--neon-violet)]/[0.04] to-[var(--neon-cyan)]/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {showSuccess ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center py-4 relative z-10"
                    >
                        <CheckCircle2 className="w-12 h-12 text-[var(--neon-emerald)] mb-3 neon-glow-cyan" />
                        <h3 className="text-lg font-semibold text-[var(--neon-emerald)]">Upload Complete!</h3>
                    </motion.div>
                ) : !uploading ? (
                    <div className="flex flex-col items-center justify-center text-center cursor-pointer relative z-10">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileSelect}
                            aria-label="Choose file to upload"
                            id="file-upload-input"
                        />
                        <motion.div
                            whileHover={{ scale: 1.08, y: -4 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="mb-5 p-5 rounded-2xl bg-[var(--bg-elevated)] border border-white/[0.06]"
                        >
                            <UploadCloud className="w-10 h-10 text-[var(--neon-violet)] neon-glow-violet" />
                        </motion.div>
                        <h3 className="text-xl font-bold mb-1.5">Upload to Space</h3>
                        <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                            Drag & drop files here or click to browse
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                            Stored forever in your Saved Messages
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4 relative z-10">
                        <div className="relative mb-5">
                            <div className="orbital-ring">
                                <UploadCloud className="w-8 h-8 text-[var(--neon-violet)]" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-4">Uploading to Cloud...</h3>
                        <div className="w-full max-w-md bg-[var(--bg-void)] h-2 rounded-full overflow-hidden border border-white/[0.04]">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[var(--neon-violet)] to-[var(--neon-cyan)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                            />
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-2 font-mono">
                            {progress}% Complete
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
