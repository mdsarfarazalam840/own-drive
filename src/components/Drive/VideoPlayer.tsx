'use client';

import { useState, useEffect, useRef } from 'react';
import { TelegramAuth } from '@/lib/telegram';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
    auth: TelegramAuth;
    file: any;
    onClose: () => void;
}

/**
 * Elite Video Player for Space Drive
 * Uses Service Worker Streaming to provide a "YouTube-like" experience
 * with native seeking, buffering, and broad format support.
 */
export default function VideoPlayer({ auth, file, onClose }: VideoPlayerProps) {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let active = true;
        const STREAM_PATH = '/api/stream-video/';

        const setupStreaming = async () => {
            if (!('serviceWorker' in navigator)) {
                setError('Service Workers not supported. Please use a modern browser.');
                return;
            }

            try {
                // 1. Pre-warm the Telegram Connection to the correct DC
                const client = await auth.init(file.document?.dcId);
                if (!active) return;

                // 2. Register and Wait for the Streaming Service Worker
                await navigator.serviceWorker.register('/sw-stream.js');
                await navigator.serviceWorker.ready;

                // 3. Setup Message Handler for Range Requests
                const handleMessage = async (event: MessageEvent) => {
                    if (!active) return;
                    const { type, fileId, start, end } = event.data;

                    if (type === 'GET_RANGE') {
                        try {
                            const fileSize = Number(file.document?.size || 0);
                            
                            // Browser asks for specific bytes, proxy the request to Telegram
                            const requestedLimit = end ? (end - start + 1) : (1024 * 1024 * 4); // 4MB default
                            const limit = Math.min(requestedLimit, fileSize - start);

                            const chunk = await client.downloadMedia(file, {
                                offset: BigInt(start),
                                limit: limit,
                                workers: 16, // EXTREME PARALLELISM
                                dcId: file.document?.dcId,
                                progressCallback: (total: bigint | number) => {
                                    if (!active) return;
                                    const percent = Math.round((Number(total) / limit) * 100);
                                    setProgress(Math.min(percent, 99));
                                }
                            });

                            if (event.ports[0] && active) {
                                setProgress(100);
                                event.ports[0].postMessage({
                                    type: 'STREAM_DATA',
                                    data: chunk,
                                    totalSize: fileSize,
                                    mimeType: file.document?.mimeType || 'video/mp4'
                                });
                            }
                        } catch (err) {
                            console.error('Stream chunk fetch failed:', err);
                        }
                    }
                };

                navigator.serviceWorker.addEventListener('message', handleMessage);

                // 3. Set the video source to the Service Worker proxy URL
                if (videoRef.current) {
                    const uniqueId = file.id || Date.now();
                    videoRef.current.src = `${STREAM_PATH}${uniqueId}`;
                    
                    // Native event: hide loading when first frame is ready
                    videoRef.current.onloadeddata = () => {
                        if (active) setLoading(false);
                    };

                    videoRef.current.onerror = () => {
                        if (active) setError('Browser codec error: This format might not be supported natively.');
                    };
                }

                return () => {
                    navigator.serviceWorker.removeEventListener('message', handleMessage);
                };
            } catch (err) {
                console.error('Elite Streaming Init Error:', err);
                setError('Streaming initialization failed. Please refresh the page.');
            }
        };

        setupStreaming();

        return () => {
            active = false;
        };
    }, [auth, file]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
        >
            <div className="relative w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/[0.06]"
                 style={{ boxShadow: '0 0 60px rgba(124,58,237,0.1)' }}>
                
                {/* Header / Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2.5 bg-black/60 hover:bg-white/[0.12] rounded-full text-white transition-all hover:rotate-90 border border-white/[0.08]"
                    aria-label="Close video player"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Loading Overlay */}
                {loading && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-black/60">
                        <div className="w-14 h-14 border-3 border-[var(--neon-violet)] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium font-mono text-[var(--neon-violet)] animate-pulse">
                            Establishing Neural Stream... {progress}%
                        </p>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--neon-rose)] z-10 bg-black/90 p-6 text-center">
                        <p className="text-lg mb-4 font-medium">{error}</p>
                        <button
                            onClick={onClose}
                            className="glass-button px-8 py-2.5"
                        >
                            Return to Command
                        </button>
                    </div>
                )}

                {/* Native Video Element - SW handles the rest */}
                <video
                    ref={videoRef}
                    controls
                    autoPlay
                    className="w-full h-full"
                />
            </div>
        </motion.div>
    );
}
