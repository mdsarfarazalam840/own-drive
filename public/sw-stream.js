/**
 * Elite Space Drive Streaming Service Worker - Performance Edition
 * Implements Read-Ahead Buffering and Range Proxying
 */
const STREAM_PATH = '/api/stream-video/';

// Memory cache for read-ahead chunks
const chunkCache = new Map();
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB max cache to prevent memory issues
let currentCacheSize = 0;
const DEFAULT_READ_AHEAD_SIZE = 2 * 1024 * 1024; // 2MB keeps first playback responsive

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith(STREAM_PATH)) {
    event.respondWith(handleStreamRequest(event.request));
  }
});

async function handleStreamRequest(request) {
  const url = new URL(request.url);
  const fileId = url.pathname.split('/').pop();
  const rangeHeader = request.headers.get('Range');
  const fallbackMimeType = url.searchParams.get('mime') || 'video/mp4';
  
  const parts = (rangeHeader || 'bytes=0-').replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10) || 0;
  const end = parts[1] ? parseInt(parts[1], 10) : undefined;

  // 1. Check if we have this range in cache
  const cached = getFromCache(fileId, start, end);
  if (cached) {
    return createStreamResponse(cached.data, start, cached.totalSize, cached.mimeType || fallbackMimeType);
  }

  // 2. Fetch with modest read-ahead so the first frame arrives fast.
  const requestedLength = end !== undefined ? Math.max(1, end - start + 1) : DEFAULT_READ_AHEAD_SIZE;
  const targetLength = Math.max(requestedLength, DEFAULT_READ_AHEAD_SIZE);
  const fetchEnd = start + targetLength - 1;

  const result = await fetchRangeFromMain(fileId, start, fetchEnd);
  if (!result) return new Response('Range fetch timed out', { status: 504 });
  if (result.error) return new Response(result.error, { status: result.status || 500 });

  // 3. Cache the surplus for "YouTube-like" instant next-chunk
  addToCache(fileId, start, result.data, result.totalSize, result.mimeType || fallbackMimeType);

  return createStreamResponse(result.data, start, result.totalSize, result.mimeType || fallbackMimeType);
}

function createStreamResponse(data, start, totalSize, mimeType) {
  const end = start + data.byteLength - 1;
  return new Response(data, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${start}-${end}/${totalSize}`,
      'Content-Length': String(data.byteLength),
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    }
  });
}

function addToCache(fileId, start, data, totalSize, mimeType) {
  const normalizedData = data instanceof Uint8Array ? data : new Uint8Array(data);
  trimCache(normalizedData.byteLength);

  const entries = chunkCache.get(fileId) || [];
  entries.push({
    start,
    end: start + normalizedData.byteLength - 1,
    data: normalizedData,
    totalSize,
    mimeType,
    timestamp: Date.now(),
  });

  chunkCache.set(fileId, entries);
  currentCacheSize += normalizedData.byteLength;
}

function getFromCache(fileId, start, end) {
  const entries = chunkCache.get(fileId);
  if (!entries) return null;

  const match = entries.find((entry) => {
    if (start < entry.start || start > entry.end) return false;
    if (end === undefined) return true;
    return end <= entry.end;
  });

  if (!match) return null;

  const sliceStart = start - match.start;
  const sliceEnd = end === undefined ? match.data.byteLength : (end - match.start + 1);
  return {
    data: match.data.slice(sliceStart, sliceEnd),
    totalSize: match.totalSize,
    mimeType: match.mimeType,
  };
}

function trimCache(incomingBytes) {
  while (currentCacheSize + incomingBytes > MAX_CACHE_SIZE) {
    let oldestFileId = null;
    let oldestIndex = -1;
    let oldestTimestamp = Infinity;

    for (const [fileId, entries] of chunkCache.entries()) {
      entries.forEach((entry, index) => {
        if (entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
          oldestFileId = fileId;
          oldestIndex = index;
        }
      });
    }

    if (oldestFileId === null || oldestIndex < 0) break;

    const entries = chunkCache.get(oldestFileId);
    const [removed] = entries.splice(oldestIndex, 1);
    currentCacheSize -= removed.data.byteLength;

    if (entries.length === 0) {
      chunkCache.delete(oldestFileId);
    }
  }
}

async function fetchRangeFromMain(fileId, start, end) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  const client = clients.find((candidate) => candidate.visibilityState === 'visible') || clients[0];
  if (!client) return null;

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    client.postMessage({
      type: 'GET_RANGE',
      fileId,
      start,
      end
    }, [channel.port2]);
    
    // Timeout safety
    setTimeout(() => resolve(null), 120000);
  });
}
