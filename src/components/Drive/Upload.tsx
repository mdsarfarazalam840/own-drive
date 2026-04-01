'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { TelegramAuth } from '@/lib/telegram';

interface UploadProps {
    auth: TelegramAuth;
    onUploadComplete: () => void;
}

export default function Upload({ auth, onUploadComplete }: UploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const uploadFile = async (file: File) => {
        setUploading(true);
        setProgress(0);
        try {
            const client = await auth.init();
            if (!client) return;

            // Send to "me" (Saved Messages)
            await client.sendFile("me", {
                file: file,
                forceDocument: false,
                progressCallback: (transferred: any, total: any) => {
                    const percent = Math.round((Number(transferred) / Number(total)) * 100);
                    setProgress(percent);
                }
            });

            onUploadComplete();
        } catch (err: any) {
            console.error("Upload failed details:", err);
            alert(`Upload failed: ${err.message || "Unknown error"}`);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full mb-8">
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-panel p-12 transition-all duration-300 border-2 border-dashed relative overflow-hidden group
          ${isDragging ? 'border-indigo-400 bg-white/10 scale-[1.02]' : 'border-white/20 hover:border-white/40'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {!uploading ? (
                    <div className="flex flex-col items-center justify-center text-center cursor-pointer relative z-10">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileSelect}
                        />
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 10, y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="mb-6 bg-white/10 p-6 rounded-3xl shadow-lg ring-1 ring-white/20"
                        >
                            <UploadCloud className="w-12 h-12 text-indigo-300" />
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">Upload to Space</h3>
                        <p className="text-sm text-gray-400 max-w-sm mx-auto">
                            Drag & drop files here or click to browse.
                            <br /><span className="text-xs text-gray-500">Stored forever in your Saved Messages.</span>
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4 relative z-10">
                        <h3 className="text-lg font-medium mb-4 animate-pulse">Uploading to Cloud...</h3>
                        <div className="w-full max-w-md bg-gray-800/50 h-3 rounded-full overflow-hidden mb-2 ring-1 ring-white/10">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                        </div>
                        <p className="text-xs text-gray-400">{progress}% Complete</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
