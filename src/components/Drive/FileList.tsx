'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { TelegramAuth } from '@/lib/telegram';
import type { TelegramMessage, FileType } from '@/lib/types';
import {
    File,
    Image as ImageIcon,
    Music,
    Video,
    Download,
    Eye,
    X,
    FileText,
    Inbox,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import streamSaver from 'streamsaver';
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false });

interface FileListProps {
    auth: TelegramAuth;
    refreshTrigger: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getFileType(msg: TelegramMessage): FileType {
    if (msg.photo) return 'image';
    if (msg.video) return 'video';
    if (msg.audio || msg.voice) return 'audio';
    if (msg.document) {
        const mime = msg.document.mimeType || '';
        if (mime.startsWith('image/')) return 'image';
        if (mime.startsWith('video/')) return 'video';
        if (mime.startsWith('audio/')) return 'audio';
        if (mime.includes('pdf')) return 'pdf';
        return 'document';
    }
    return 'file';
}

function getMimeType(msg: TelegramMessage): string {
    if (msg.document?.mimeType) return msg.document.mimeType;
    if (msg.photo) return 'image/jpeg';
    if (msg.video) return 'video/mp4';
    return 'application/octet-stream';
}

function getFileName(msg: TelegramMessage): string {
    if (msg.document?.attributes) {
        const attr = msg.document.attributes.find((a) => a.fileName);
        if (attr?.fileName) return attr.fileName;
    }
    return msg.message || 'Untitled File';
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

const FILE_ICON_MAP: Record<FileType, { Icon: typeof File; className: string; badge: string }> = {
    image: { Icon: ImageIcon, className: 'file-icon-image', badge: 'badge-violet' },
    video: { Icon: Video, className: 'file-icon-video', badge: 'badge-cyan' },
    audio: { Icon: Music, className: 'file-icon-audio', badge: 'badge-rose' },
    pdf: { Icon: FileText, className: 'file-icon-pdf', badge: 'badge-amber' },
    document: { Icon: File, className: 'file-icon-doc', badge: '' },
    file: { Icon: File, className: 'file-icon-doc', badge: '' },
};

// ─── FileCard (Memoized) ────────────────────────────────────────────────────

interface FileCardProps {
    msg: TelegramMessage;
    onPreview: (msg: TelegramMessage) => void;
    onDownload: (msg: TelegramMessage) => void;
    isDownloading: boolean;
    downloadProgress: number;
}

const FileCard = memo(function FileCard({
    msg,
    onPreview,
    onDownload,
    isDownloading,
    downloadProgress,
}: FileCardProps) {
    const fileType = getFileType(msg);
    const fileSize = Number(
        msg.document?.size || msg.photo?.sizes?.[msg.photo.sizes.length - 1]?.size || 0
    );
    const { Icon, className: iconClass, badge: badgeClass } = FILE_ICON_MAP[fileType];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
            className="glass-panel glass-panel-holo p-4 flex flex-col gap-3 cursor-pointer group relative"
            onClick={() => onPreview(msg)}
            role="button"
            tabIndex={0}
            aria-label={`Open ${getFileName(msg)}`}
            onKeyDown={(e) => { if (e.key === 'Enter') onPreview(msg); }}
        >
            {/* File Icon Area */}
            <div className="flex items-center justify-center p-7 bg-[var(--bg-void)]/60 rounded-xl relative overflow-hidden">
                <Icon className={`w-10 h-10 ${iconClass}`} />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[var(--bg-void)]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDownload(msg);
                        }}
                        disabled={isDownloading}
                        className="p-3 bg-white/[0.08] rounded-full hover:bg-white/[0.15] border border-white/[0.08] transition-all hover:scale-110 disabled:opacity-50"
                        title="Download"
                        aria-label="Download file"
                    >
                        {isDownloading ? (
                            <span className="text-[10px] font-bold font-mono w-5 h-5 flex items-center justify-center">
                                {downloadProgress}%
                            </span>
                        ) : (
                            <Download className="w-5 h-5" />
                        )}
                    </button>

                    {(fileType === 'image' || fileType === 'video') && (
                        <button
                            className="p-3 bg-white/[0.08] rounded-full hover:bg-white/[0.15] border border-white/[0.08] transition-all hover:scale-110"
                            title="Preview"
                            aria-label="Preview file"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* File Info */}
            <div className="flex flex-col gap-1.5 relative z-10">
                <span className="text-sm font-medium truncate">{getFileName(msg)}</span>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] font-mono">
                        {new Date(msg.date * 1000).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                        {fileSize > 0 && (
                            <span className="text-[var(--text-muted)] font-mono">
                                {formatFileSize(fileSize)}
                            </span>
                        )}
                        {badgeClass && (
                            <span className={`badge ${badgeClass}`}>
                                {fileType}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Download progress bar */}
            {isDownloading && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--bg-void)] rounded-b-xl overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[var(--neon-violet)] to-[var(--neon-cyan)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                </div>
            )}
        </motion.div>
    );
});

// ─── Skeleton Loader ────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="glass-panel p-4 flex flex-col gap-3">
            <div className="skeleton h-28 rounded-xl" />
            <div className="skeleton h-4 w-3/4 rounded-lg" />
            <div className="flex justify-between gap-2">
                <div className="skeleton h-3 w-1/3 rounded-lg" />
                <div className="skeleton h-3 w-1/4 rounded-lg" />
            </div>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

// ─── FileList Component ─────────────────────────────────────────────────────

export default function FileList({ auth, refreshTrigger }: FileListProps) {
    const [files, setFiles] = useState<TelegramMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offsetId, setOffsetId] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [previewFile, setPreviewFile] = useState<TelegramMessage | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [playingVideo, setPlayingVideo] = useState<TelegramMessage | null>(null);

    const fetchFiles = useCallback(async (offset = 0) => {
        if (offset === 0) setLoading(true);
        else setLoadingMore(true);

        try {
            const client = await auth.init();
            if (!client) return;

            const messages = await client.getMessages('me', {
                limit: 20,
                offsetId: offset,
            });

            const mediaMessages = (messages as TelegramMessage[]).filter(
                (m: TelegramMessage) => (m as any).media
            );

            if (mediaMessages.length === 0) {
                setHasMore(false);
            } else {
                if (offset === 0) {
                    setFiles(mediaMessages);
                } else {
                    setFiles((prev) => [...prev, ...mediaMessages]);
                }
                const lastMsg = mediaMessages[mediaMessages.length - 1];
                setOffsetId(lastMsg.id);
            }
        } catch (err) {
            console.error('Failed to fetch files:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [auth]);

    useEffect(() => {
        setOffsetId(0);
        setHasMore(true);
        fetchFiles(0);
    }, [auth, refreshTrigger, fetchFiles]);

    const downloadFile = useCallback(async (message: TelegramMessage) => {
        setDownloadingId(message.id);
        setDownloadProgress(0);
        try {
            const client = await auth.init();
            if (!client) return;

            const fileName = getFileName(message);
            const fileSize = Number(
                message.document?.size ||
                message.photo?.sizes?.[message.photo.sizes.length - 1]?.size ||
                0
            );
            const isLargeFile = fileSize > 50 * 1024 * 1024;

            if (!isLargeFile) {
                const buffer = await client.downloadMedia(message, {
                    progressCallback: (transferred: bigint | number, total: bigint | number) => {
                        const percent = Math.round(
                            (Number(transferred) / Number(total)) * 100
                        );
                        setDownloadProgress(percent);
                    },
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
                const fileStream = streamSaver.createWriteStream(fileName, {
                    size: fileSize,
                });
                const writer = fileStream.getWriter();

                try {
                    const REQUEST_SIZE = 1024 * 1024;
                    let downloadedBytes = 0;

                    const media = (message as any).media;
                    if (!media) throw new Error('No media found in message');

                    const iter = client.iterDownload(media, {
                        requestSize: REQUEST_SIZE,
                    });

                    for await (const chunk of iter) {
                        await writer.write(chunk);
                        downloadedBytes += chunk.length;
                        setDownloadProgress(
                            Math.round((downloadedBytes / fileSize) * 100)
                        );
                    }

                    writer.close();
                } catch (streamError) {
                    console.error('Stream error:', streamError);
                    writer.abort(streamError as Error);
                    throw streamError;
                }
            }
        } catch (e) {
            const message_text = e instanceof Error ? e.message : String(e);
            console.error('Download failed:', e);
            alert(`Download failed: ${message_text}`);
        } finally {
            setDownloadingId(null);
            setDownloadProgress(0);
        }
    }, [auth]);

    const previewFileHandler = useCallback(async (message: TelegramMessage) => {
        const fileType = getFileType(message);

        if (fileType === 'video') {
            setPlayingVideo(message);
            return;
        }

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
            console.error('Preview failed:', e);
            alert('Preview failed');
        }
    }, [auth, downloadFile]);

    const closePreview = useCallback(() => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewFile(null);
        setPreviewUrl(null);
    }, [previewUrl]);

    if (loading) {
        return <SkeletonGrid />;
    }

    return (
        <>
            <div className="flex flex-col gap-6 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {files.map((msg) => (
                        <FileCard
                            key={msg.id}
                            msg={msg}
                            onPreview={previewFileHandler}
                            onDownload={downloadFile}
                            isDownloading={downloadingId === msg.id}
                            downloadProgress={downloadingId === msg.id ? downloadProgress : 0}
                        />
                    ))}

                    {files.length === 0 && (
                        <div className="col-span-full">
                            <div className="glass-panel p-16 sm:p-20 text-center">
                                <div className="max-w-md mx-auto">
                                    <motion.div
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center border border-white/[0.06]"
                                    >
                                        <Inbox className="w-10 h-10 text-[var(--text-muted)]" />
                                    </motion.div>
                                    <h3 className="text-xl font-semibold mb-2">No files yet</h3>
                                    <p className="text-[var(--text-muted)] text-sm">
                                        Upload your first file to launch your space storage
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Load More */}
                {files.length > 0 && hasMore && (
                    <div className="flex justify-center mt-2 pb-8">
                        <button
                            onClick={() => fetchFiles(offsetId)}
                            disabled={loadingMore}
                            className="glass-button px-8 py-3 gap-2"
                            id="load-more"
                        >
                            {loadingMore ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
                        onClick={closePreview}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            className="glass-panel p-6 max-w-4xl w-full max-h-[90vh] overflow-auto relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closePreview}
                                className="absolute top-4 right-4 p-2 bg-white/[0.06] rounded-full hover:bg-white/[0.12] transition-all z-10 border border-white/[0.06]"
                                aria-label="Close preview"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-semibold pr-12 truncate">
                                    {getFileName(previewFile)}
                                </h3>

                                {previewUrl ? (
                                    <div className="bg-[var(--bg-void)] rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]">
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
                                ) : (
                                    <div className="flex items-center justify-center min-h-[400px]">
                                        <div className="w-12 h-12 border-3 border-[var(--neon-violet)] border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                <button
                                    onClick={() => downloadFile(previewFile)}
                                    className="glass-button w-full mt-2"
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
