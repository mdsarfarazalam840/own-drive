'use client';

import { useState, useEffect, useRef } from 'react';
import { TelegramAuth } from '@/lib/telegram';
import { X } from 'lucide-react';

interface VideoPlayerProps {
    auth: TelegramAuth;
    file: any;
    onClose: () => void;
}

export default function VideoPlayer({ auth, file, onClose }: VideoPlayerProps) {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);

    useEffect(() => {
        let active = true;
        // Use a balanced chunk size
        const CHUNK_SIZE = 1024 * 1024; // 1MB chunks for smoother initial playback

        const initPlayer = async () => {
            if (!videoRef.current) return;

            const mimeType = file.document?.mimeType || 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

            if (!MediaSource.isTypeSupported(mimeType)) {
                console.warn("MIME type not supported for streaming, falling back to full download");
                downloadAndPlay();
                return;
            }

            const mediaSource = new MediaSource();
            videoRef.current.src = URL.createObjectURL(mediaSource);
            mediaSourceRef.current = mediaSource;

            mediaSource.addEventListener('sourceopen', async () => {
                try {
                    const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
                    sourceBufferRef.current = sourceBuffer;

                    const client = await auth.init();
                    if (!client) return;

                    const fileSize = Number(file.document?.size || 0);
                    let processedBytes = 0;

                    // Sequential Streaming using a single iterator
                    // This is more stable than parallel fetching for MSE
                    const streamVideo = async () => {
                        try {
                            const chunkIterator = client.iterDownload(file, {
                                requestSize: CHUNK_SIZE,
                            });

                            for await (const chunk of chunkIterator) {
                                if (!active) break;

                                // Buffer management: Wait if too much buffered
                                if (sourceBuffer.buffered.length > 0) {
                                    const bufferedEnd = sourceBuffer.buffered.end(sourceBuffer.buffered.length - 1);
                                    if (videoRef.current && bufferedEnd - videoRef.current.currentTime > 30) {
                                        // Simple wait loop
                                        while (videoRef.current && (sourceBuffer.buffered.end(sourceBuffer.buffered.length - 1) - videoRef.current.currentTime > 30) && active) {
                                            await new Promise(r => setTimeout(r, 500));
                                        }
                                    }
                                }

                                // Wait for previous update
                                while (sourceBuffer.updating && active) {
                                    await new Promise(r => setTimeout(r, 50));
                                }
                                if (!active) break;

                                // Append
                                try {
                                    sourceBuffer.appendBuffer(chunk);
                                    // Wait for this append to finish
                                    while (sourceBuffer.updating && active) {
                                        await new Promise(r => setTimeout(r, 10));
                                    }

                                    processedBytes += chunk.length;
                                    setProgress(Math.round((processedBytes / fileSize) * 100));

                                    if (loading && processedBytes > 0) setLoading(false);

                                } catch (appendError) {
                                    console.error("Append error", appendError);
                                    // If quota exceeded, we might need to remove old buffer, 
                                    // but for now let's just break or try to continue
                                    break;
                                }
                            }

                            if (active && mediaSource.readyState === 'open' && !sourceBuffer.updating) {
                                mediaSource.endOfStream();
                            }

                        } catch (streamErr) {
                            console.error("Streaming error:", streamErr);
                        }
                    };

                    streamVideo();

                } catch (e: any) {
                    console.error("MSE Error:", e);
                    setError("Playback error: " + e.message);
                }
            });
        };

        const downloadAndPlay = async () => {
            try {
                const client = await auth.init();
                const buffer = await client.downloadMedia(file, {
                    progressCallback: (transferred: any, total: any) => {
                        if (active) {
                            const percent = Math.round((Number(transferred) / Number(total)) * 100);
                            setProgress(percent);
                        }
                    }
                });
                if (active && buffer) {
                    const blob = new Blob([buffer], { type: file.document?.mimeType || 'video/mp4' });
                    if (videoRef.current) {
                        videoRef.current.src = URL.createObjectURL(blob);
                        setLoading(false);
                    }
                }
            } catch (e: any) {
                setError(e.message);
            }
        };

        initPlayer();

        return () => {
            active = false;
            // Clean up
            if (videoRef.current?.src) {
                URL.revokeObjectURL(videoRef.current.src);
            }
        };
    }, [auth, file]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
            <div className="relative w-full max-w-6xl aspect-video bg-black rounded-sm overflow-hidden shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all transform hover:scale-110"
                >
                    <X className="w-6 h-6" />
                </button>

                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-black/50">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-medium">Buffering {progress}%...</p>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 z-10 bg-black/80 p-6 text-center">
                        <p className="text-xl mb-4">{error}</p>
                        <button onClick={onClose} className="px-4 py-2 bg-white/10 rounded">Close</button>
                    </div>
                )}

                <video
                    ref={videoRef}
                    controls
                    autoPlay
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}
