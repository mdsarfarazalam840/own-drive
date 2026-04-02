# 🌌 Space Drive: Neo-Orbital Edition

Space Drive is an elite, futuristic file management dashboard powered by Telegram's cloud infrastructure. It transforms your Telegram storage into a high-performance "Neural Command Center" with instant video streaming and mission-critical reliability.

![License](https://img.shields.io/badge/Status-Ultra--Performance-blueviolet?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-Next.js%2014%20|%20Tailwind-blue?style=for-the-badge)

## 🚀 Key Innovations

### ⚡ Ultra-High-Performance Streaming (v4)
Experience "YouTube-like" instant playback. Our custom **Neural Streaming Logic** saturates your connection for maximum speed:
- **16-Worker Parallelism**: Pulls file segments using 16 concurrent threads for 16x faster retrieval.
- **Service Worker Read-Ahead**: A proactive 16MB caching layer that fetches video data before the browser even asks for it.
- **Direct DC Handshake**: Bypasses connection discovery by connecting directly to the specific Telegram Data Center hosting your media.
- **Zero-Latency Seeking**: Native `Range` request support allows for instant seeking anywhere in a video.

### 🎨 Neo-Orbital Command Center
A premium UI designed for the future:
- **Holographic Textures**: Glassmorphism and deep-space gradients for a high-end aesthetic.
- **Micro-Animations**: Powered by **Framer Motion** for silky-smooth transitions and orbital interactions.
- **Mission Feedback Audio**: Integrated **Web Audio API** synthesis provides futuristic auditory confirmation ("Mission Complete" blip) for all successful uploads.

### 🛡️ Secure & Robust Pipeline
- **Chunked Upload Handles**: Re-engineered upload logic using `uploadFile` handles for failure-proof ingestion of large files.
- **Space Guard Security**: Strict Content Security Policy (CSP) headers and optimized authentication flows including **Two-Step Verification (2FA)** support.
- **TypeScript Core**: Enforced type safety across the entire orbital codebase.

## 🛠️ Integrated Technology
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom Orbit Keyframes
- **Core Engine**: Gram.js (Performance Tuned)
- **Animations**: Framer Motion
- **Streaming**: Custom Proxy Service Worker (sw-stream.js)

## 🛡️ Troubleshooting Registry

- **2FA Login Loop**: Resolved the "Bytes or str expected" error and implemented comprehensive **Two-Step Verification (2FA)** support.
- **21s Streaming Latency**: Eliminated extreme buffering delays by transitioning from `MediaSource` to a custom **Service Worker Range Proxy** with **Direct DC Handshake** logic.
- **Large File Ingestion**: Fixed server-side timeouts by refactoring linear buffer uploads to a robust **chunked `uploadFile` handle** pattern.
- **SSR Hydration Sync**: Resolved Next.js hydration mismatches and "gram.js on server" errors via selective **dynamic imports**.

## 🗺️ Future Mission Roadmap

- **Nested Orbital Folders**: Full support for hierarchical directory navigation and recursive structure mapping.
- **Batch Neural Operations**: Multi-selection for bulk move, delete, and download actions across the command center.
- **Universal Transcoding**: Integrated **WebAssembly (WASM)** client-side transcoding for broader container support (MKV, AVI) without server overhead.
- **Deep Space Search**: Instant, high-granularity indexing and full-text search across the entire Telegram media archive.
- **Off-grid Metadata**: Advanced **IndexedDB caching** for near-instant file list initialization even in offline scenarios.

## 📡 Deployment & Installation

### Local Command Initialization
```bash
# Clone the orbital repository
git clone [repository-url]

# Initialize neural dependencies
npm install

# Launch command center
npm run dev
```

### Authentication
Login with your Telegram credentials (API ID, API Hash, and Phone Number). Space Drive supports secure session persistence and 2FA recovery.

## ⚖️ License
Internal Edition - Optimize for Space.
