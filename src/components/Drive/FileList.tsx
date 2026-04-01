'use client';

import { useState, useEffect } from 'react';
import { TelegramAuth } from '@/lib/telegram';
import { File, Image as ImageIcon, Music, Video, Download, Eye, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import streamSaver from 'streamsaver';
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false });

interface FileListProps {
    auth: TelegramAuth;
    refreshTrigger: number;
}

export default function FileList({ auth, refreshTrigger }: FileListProps) {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offsetId, setOffsetId] = useState<number>(0);
    const [hasMore, setHasMore] = useState(true);
    const [previewFile, setPreviewFile] = useState<any>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [playingVideo, setPlayingVideo] = useState<any>(null);

    const fetchFiles = async (offset = 0) => {
        if (offset === 0) setLoading(true);
        else setLoadingMore(true);

        try {
            const client = await auth.init();
            if (!client) return;

            // Fetch generic messages
            const messages = await client.getMessages('me', {
                limit: 20,
                offsetId: offset
            });

            // Filter for only messages with media
            // @ts-ignore
            const mediaMessages = messages.filter(m => m.media);

            if (mediaMessages.length === 0) {
                setHasMore(false);
            } else {
                if (offset === 0) {
                    setFiles(mediaMessages);
                } else {
                    setFiles(prev => [...prev, ...mediaMessages]);
                }

                // Set offset to the ID of the last message for next fetch
                const lastMsg = mediaMessages[mediaMessages.length - 1];
                setOffsetId(lastMsg.id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Initial load
    useEffect(() => {
        setOffsetId(0);
        setHasMore(true);
        fetchFiles(0);
    }, [auth, refreshTrigger]);

    const getFileType = (msg: any) => {
        if (msg.photo) return 'image';
        if (msg.video) return 'video';
        if (msg.audio || msg.voice) return 'audio';
        if (msg.document) {
            const mimeType = msg.document.mimeType || '';
            if (mimeType.startsWith('image/')) return 'image';
            if (mimeType.startsWith('video/')) return 'video';
            if (mimeType.startsWith('audio/')) return 'audio';
            if (mimeType.includes('pdf')) return 'pdf';
            return 'document';
        }
        return 'file';
    };

    const getMimeType = (msg: any) => {
        if (msg.document && msg.document.mimeType) {
            return msg.document.mimeType;
        }
        if (msg.photo) return 'image/jpeg'; // Photos are usually JPEGs
        if (msg.video) return 'video/mp4';  // Videos usually MP4s
        return 'application/octet-stream';
    };

    const getFileName = (msg: any) => {
        if (msg.document?.attributes) {
            const fileName = msg.document.attributes.find((attr: any) => attr.fileName);
            if (fileName) return fileName.fileName;
        }
        return msg.message || "Untitled File";
    };

    const downloadFile = async (message: any) => {
        setDownloadingId(message.id);
        setDownloadProgress(0);
        try {
            const client = await auth.init();
            if (!client) return;

            const fileName = getFileName(message);
            const fileSize = Number(message.document?.size || message.photo?.sizes?.[message.photo.sizes.length - 1]?.size || 0);
            const isLargeFile = fileSize > 50 * 1024 * 1024; // 50MB cutoff

            if (!isLargeFile) {
                // fast memory download for small files
                const buffer = await client.downloadMedia(message, {
                    progressCallback: (transferred: any, total: any) => {
                        const percent = Math.round((Number(transferred) / Number(total)) * 100);
                        setDownloadProgress(percent);
                    }
                });

                if (buffer) {
                    const blob = new Blob([buffer], { type: getMimeType(message) });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
            } else {
                // streamSaver for large files - SEQUENTIAL
                // Parallel was causing "Popup blocker" alert due to errors in promise handling or stream closure
                const fileStream = streamSaver.createWriteStream(fileName, {
                    size: fileSize
                });
                const writer = fileStream.getWriter();

                try {
                    // Use a slightly larger request size for efficiency
                    const REQUEST_SIZE = 1024 * 1024; // 1MB
                    let downloadedBytes = 0;

                    const media = message.media;
                    if (!media) throw new Error("No media found in message");

                    const iter = client.iterDownload(media, {
                        requestSize: REQUEST_SIZE,
                    });

                    for await (const chunk of iter) {
                        await writer.write(chunk);
                        downloadedBytes += chunk.length;
                        setDownloadProgress(Math.round((downloadedBytes / fileSize) * 100));
                    }

                    writer.close();
                } catch (streamError: any) {
                    console.error("Stream error in loop", streamError);
                    writer.abort(streamError);
                    throw streamError; // Propagate to outer catch
                }
            }
        } catch (e: any) {
            console.error("Download failed", e);
            // Show the actual error message
            alert(`Download failed: ${e.message || e}. \nIf using Pop-up blocker, please disable it for this site.`);
        } finally {
            setDownloadingId(null);
            setDownloadProgress(0);
        }
    };

    const previewFileHandler = async (message: any) => {
        const fileType = getFileType(message);

        // Use custom player for video
        if (fileType === 'video') {
            setPlayingVideo(message);
            return;
        }

        // Only preview images
        if (fileType !== 'image') {
            downloadFile(message);
            return;
        }

        setPreviewFile(message);

        try {
            const client = await auth.init();
            if (!client) return;

            const buffer = await client.downloadMedia(message, {});
            if (buffer) {
                const blob = new Blob([buffer], { type: getMimeType(message) });
                const url = window.URL.createObjectURL(blob);
                setPreviewUrl(url);
            }
        } catch (e) {
            console.error("Preview failed", e);
            alert("Preview failed");
        }
    };

    const closePreview = () => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewFile(null);
        setPreviewUrl(null);
    };

    const getIcon = (msg: any) => {
        const type = getFileType(msg);
        const iconClass = "w-10 h-10";

        switch (type) {
            case 'image':
                return <ImageIcon className={`${iconClass} text-purple-400`} />;
            case 'video':
                return <Video className={`${iconClass} text-blue-400`} />;
            case 'audio':
                return <Music className={`${iconClass} text-pink-400`} />;
            case 'pdf':
                return <FileText className={`${iconClass} text-red-400`} />;
            default:
                return <File className={`${iconClass} text-gray-400`} />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="glass-panel p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your space...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-6 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {files.map((msg) => {
                        const fileType = getFileType(msg);
                        const fileSize = msg.document?.size || msg.photo?.sizes?.[msg.photo.sizes.length - 1]?.size || 0;

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                                className="glass-panel p-4 flex flex-col gap-3 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden"
                                onClick={() => previewFileHandler(msg)}
                            >
                                {/* Hover gradient effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                {/* File Icon/Preview */}
                                <div className="flex items-center justify-center p-8 bg-black/30 rounded-xl relative z-10">
                                    {getIcon(msg)}

                                    {/* Hover overlay with actions */}
                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadFile(msg);
                                            }}
                                            disabled={downloadingId === msg.id}
                                            className="p-3 bg-white/20 rounded-full hover:bg-white/40 backdrop-blur-md transition-all hover:scale-110 disabled:opacity-50"
                                            title="Download"
                                        >
                                            {downloadingId === msg.id ? (
                                                <div className="flex items-center justify-center">
                                                    <span className="text-[10px] font-bold">{downloadProgress}%</span>
                                                </div>
                                            ) : (
                                                <Download className="w-5 h-5" />
                                            )}
                                        </button>

                                        {(fileType === 'image' || fileType === 'video') && (
                                            <button
                                                className="p-3 bg-white/20 rounded-full hover:bg-white/40 backdrop-blur-md transition-all hover:scale-110"
                                                title="Preview"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* File Info */}
                                <div className="flex flex-col gap-1 relative z-10">
                                    <span className="text-sm font-medium truncate text-white">
                                        {getFileName(msg)}
                                    </span>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">
                                            {new Date(msg.date * 1000).toLocaleDateString()}
                                        </span>
                                        {fileSize > 0 && (
                                            <span className="text-gray-500">
                                                {formatFileSize(fileSize)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {files.length === 0 && (
                        <div className="col-span-full">
                            <div className="glass-panel p-20 text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                                        <File className="w-10 h-10 text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-white">No files yet</h3>
                                    <p className="text-gray-500">
                                        Upload your first file to get started!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Load More Button */}
                {files.length > 0 && hasMore && (
                    <div className="flex justify-center mt-4 pb-8">
                        <button
                            onClick={() => fetchFiles(offsetId)}
                            disabled={loadingMore}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loadingMore ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Loading...
                                </>
                            ) : (
                                'Load More'
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={closePreview}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel p-6 max-w-4xl w-full max-h-[90vh] overflow-auto relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={closePreview}
                                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Preview Content */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-xl font-semibold pr-12 truncate">
                                    {getFileName(previewFile)}
                                </h3>

                                {previewUrl && (
                                    <div className="bg-black/30 rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]">
                                        {getFileType(previewFile) === 'image' ? (
                                            <img
                                                src={previewUrl}
                                                alt={getFileName(previewFile)}
                                                className="max-w-full max-h-[70vh] object-contain"
                                            />
                                        ) : getFileType(previewFile) === 'video' ? (
                                            <video
                                                src={previewUrl}
                                                controls
                                                className="max-w-full max-h-[70vh]"
                                            />
                                        ) : null}
                                    </div>
                                )}

                                {!previewUrl && (
                                    <div className="flex items-center justify-center min-h-[400px]">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                                    </div>
                                )}

                                {/* Download Button */}
                                <button
                                    onClick={() => downloadFile(previewFile)}
                                    className="glass-button w-full mt-4"
                                >
                                    <Download className="w-5 h-5" />
                                    Download File
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Player Modal */}
            {playingVideo && (
                <VideoPlayer
                    auth={auth}
                    file={playingVideo}
                    onClose={() => setPlayingVideo(null)}
                />
            )}
        </>
    );
}
