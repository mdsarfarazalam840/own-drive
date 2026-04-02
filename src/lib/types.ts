// ─── Telegram Message Types ─────────────────────────────────────────────────
// Replaces all `any` usage across components with proper type definitions.

export interface DocumentAttribute {
  fileName?: string;
  [key: string]: unknown;
}

export interface TelegramDocument {
  mimeType?: string;
  size?: number | bigint;
  attributes?: DocumentAttribute[];
}

export interface PhotoSize {
  size?: number;
  [key: string]: unknown;
}

export interface TelegramPhoto {
  sizes?: PhotoSize[];
}

export interface TelegramMedia {
  [key: string]: unknown;
}

export interface TelegramMessage {
  id: number;
  date: number;
  message?: string;
  media?: TelegramMedia;
  document?: TelegramDocument;
  photo?: TelegramPhoto;
  video?: TelegramDocument;
  audio?: TelegramDocument;
  voice?: unknown;
}

export type FileType = 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'file';

export interface DownloadState {
  isDownloading: boolean;
  progress: number;
  messageId: number | null;
}

export type AuthStep = 'login' | 'otp' | 'password' | 'drive';
