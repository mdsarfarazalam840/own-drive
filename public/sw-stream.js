/**
 * Elite Space Drive Streaming Service Worker - Performance Edition
 * Implements Read-Ahead Buffering and Range Proxying
 */
const STREAM_PATH = '/api/stream-video/';

// Memory cache for read-ahead chunks
const chunkCache = new Map();
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB max cache to prevent memory issues
let currentCacheSize = 0;

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
  
  const parts = (rangeHeader || 'bytes=0-').replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : undefined;

  // 1. Check if we have this range in cache
  const cached = getFromCache(fileId, start);
  if (cached) {
    return createStreamResponse(cached.data, start, cached.totalSize, fileId);
  }

  // 2. Fetch with Read-Ahead (e.g., ask for 16MB instead of just what browser wants)
  const readAheadSize = 16 * 1024 * 1024; 
  const fetchEnd = end ? Math.max(end, start + readAheadSize) : (start + readAheadSize);

  const result = await fetchRangeFromMain(fileId, start, fetchEnd);
  if (!result) return new Response('Range fetch failed', { status: 504 });

  // 3. Cache the surplus for "YouTube-like" instant next-chunk
  addToCache(fileId, start, result.data, result.totalSize);

  return createStreamResponse(result.data, start, result.totalSize, fileId);
}

function createStreamResponse(data, start, totalSize, fileId) {
  const end = start + data.byteLength - 1;
  return new Response(data, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${start}-${end}/${totalSize}`,
      'Content-Length': data.byteLength,
      'Access-Control-Allow-Origin': '*',
    }
  });
}

function addToCache(fileId, start, data, totalSize) {
  // Clear old cache if getting too big
  if (currentCacheSize + data.byteLength > MAX_CACHE_SIZE) {
    const firstKey = chunkCache.keys().next().value;
    if (firstKey) {
      const entry = chunkCache.get(firstKey);
      currentCacheSize -= entry.data.byteLength;
      chunkCache.delete(firstKey);
    }
  }

  const key = `${fileId}-${start}`;
  chunkCache.set(key, { data, totalSize, timestamp: Date.now() });
  currentCacheSize += data.byteLength;
}

function getFromCache(fileId, start) {
  // Simple exact match or subset match logic could go here
  const key = `${fileId}-${start}`;
  return chunkCache.get(key);
}

async function fetchRangeFromMain(fileId, start, end) {
  const clients = await self.clients.matchAll();
  const client = clients[0];
  if (!client) return null;

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      if (event.data.type === 'STREAM_DATA') {
        resolve(event.data);
      }
    };

    client.postMessage({
      type: 'GET_RANGE',
      fileId,
      start,
      end
    }, [channel.port2]);
    
    // Timeout safety
    setTimeout(() => resolve(null), 30000);
  });
}
