const CACHE_NAME = 'cocuk-dunyasi-v16';
const VIDEO_CACHE_NAME = 'cocuk-dunyasi-videos-v10';

const ASSETS = [
  'index.html',
  'style.css',
  'video_data.js',
  'app.js',
  'games.js',
  'videos.js',
  'icon.svg',
  'manifest.json',
  'bg-music.mp3'
];

// In-Memory Set to track cached videos synchronously for immediate fetch decision
let cachedVideoUrls = new Set();
let isInitialized = false;

// Helper to clean URL strings (removes query parameters for perfect matching)
function getCleanUrl(url) {
  return url ? url.split('?')[0] : '';
}

const initPromise = caches.open(VIDEO_CACHE_NAME).then((cache) => {
  return cache.keys();
}).then((requests) => {
  cachedVideoUrls = new Set(requests.map(r => getCleanUrl(r.url)));
  isInitialized = true;
  console.log('[Service Worker] Initialized cached video URLs Set:', cachedVideoUrls.size);
}).catch((err) => {
  console.error('[Service Worker] Failed to pre-populate cached video URLs:', err);
});

// Install Event - Pre-cache the shell & games & videos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell and Static Assets');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches & initialize cachedVideoUrls
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key !== VIDEO_CACHE_NAME) {
              console.log('[Service Worker] Removing old cache:', key);
              return caches.delete(key);
            }
          })
        );
      }),
      initPromise
    ]).then(() => self.clients.claim())
  );
});

// Message Event - Listen for cache changes from the client to keep our Set updated
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'VIDEO_CACHE_UPDATED') {
    const { action, url } = event.data;
    const cleanUrl = getCleanUrl(url);
    if (action === 'add') {
      cachedVideoUrls.add(cleanUrl);
      console.log('[Service Worker] Video added to cache set:', cleanUrl);
    } else if (action === 'delete') {
      cachedVideoUrls.delete(cleanUrl);
      console.log('[Service Worker] Video deleted from cache set:', cleanUrl);
    } else if (action === 'clear') {
      cachedVideoUrls.clear();
      console.log('[Service Worker] Video cache set cleared');
    }
  }
});

// Fetch Event - Handle range requests for cached videos, and cache-first for assets
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Handle Video Requests (.mp4 files)
  if (event.request.url.includes('.mp4')) {
    const cleanUrl = getCleanUrl(event.request.url);
    
    // If initialized, check cache synchronously.
    if (isInitialized) {
      if (cachedVideoUrls.has(cleanUrl)) {
        console.log('[Service Worker] Intercepting cached video:', cleanUrl);
        event.respondWith(handleVideoRangeRequest(event.request));
        return;
      } else {
        console.log('[Service Worker] Bypassing service worker for non-cached video:', cleanUrl);
        // By returning without event.respondWith(), the browser handles the stream natively via network!
        return;
      }
    }

    // Fallback if not initialized yet
    event.respondWith(
      initPromise.then(() => {
        if (cachedVideoUrls.has(cleanUrl)) {
          console.log('[Service Worker] Intercepting cached video (async fallback):', cleanUrl);
          return handleVideoRangeRequest(event.request);
        } else {
          console.log('[Service Worker] Bypassing non-cached video (async fallback):', cleanUrl);
          return fetch(event.request);
        }
      })
    );
    return;
  }

  // 2. Handle Default static assets (Cache-first, Fallback to network)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then((networkResponse) => {
        // Cache newly fetched assets dynamically if they belong to our origin
        if (networkResponse.status === 200 && requestUrl.origin === self.location.origin) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline Fallback for html pages
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('index.html');
        }
      });
    })
  );
});

/**
 * Custom Range Request Handler for Cached Videos
 * HTML5 <video> tags require HTTP 206 (Partial Content) responses to stream videos.
 * Standard service worker fetch handlers fail for range requests unless we handle them manually.
 */
async function handleVideoRangeRequest(request) {
  // Check the cache for the video
  const cachedResponse = await caches.match(request, { ignoreSearch: true });

  if (cachedResponse) {
    const rangeHeader = request.headers.get('Range');
    
    if (rangeHeader) {
      const blob = await cachedResponse.blob();
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : blob.size - 1;
      
      const chunk = blob.slice(start, end + 1);
      
      return new Response(chunk, {
        status: 206,
        statusText: 'Partial Content',
        headers: new Headers({
          'Content-Type': blob.type || 'video/mp4',
          'Content-Range': `bytes ${start}-${end}/${blob.size}`,
          'Content-Length': chunk.size,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000'
        })
      });
    }

    return cachedResponse;
  }

  // Fallback (should not be reached because we only intercept cached videos)
  return fetch(request);
}
