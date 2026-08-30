/**
 * Sekhar Teaching Hub - Progressive Service Worker
 * 30-Day Offline Caching Engine for Dynamic Content, Static Assets & Curriculum Data
 */

const CACHE_NAME = "teaching-hub-v3";
const OFFLINE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days in milliseconds

// Do not precache HTML shell pages on install to avoid locking stale chunk hashes
const PRECACHE_ASSETS = [];

// Helper: Check if response has expired (> 30 days old)
function isCacheExpired(response) {
  if (!response) return true;
  const cachedAtHeader = response.headers.get("x-cached-at");
  if (!cachedAtHeader) return false;
  const cachedAt = parseInt(cachedAtHeader, 10);
  if (isNaN(cachedAt)) return false;
  return Date.now() - cachedAt > OFFLINE_CACHE_TTL_MS;
}

// Helper: Attach 30-day cache timestamp headers to response clone
async function createExpiringResponse(response) {
  const cloned = response.clone();
  const body = await cloned.blob();
  const headers = new Headers(cloned.headers);
  headers.set("x-cached-at", Date.now().toString());
  headers.set("x-expires-at", (Date.now() + OFFLINE_CACHE_TTL_MS).toString());
  return new Response(body, {
    status: cloned.status,
    statusText: cloned.statusText,
    headers,
  });
}

// Helper: Clean up expired cache entries (> 30 days old)
async function sweepExpiredCacheEntries() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cachedAtStr = response.headers.get("x-cached-at");
        if (cachedAtStr) {
          const cachedAt = parseInt(cachedAtStr, 10);
          if (!isNaN(cachedAt) && now - cachedAt > OFFLINE_CACHE_TTL_MS) {
            await cache.delete(request);
          }
        }
      }
    }
  } catch (err) {
    console.debug("[SW] Error sweeping expired cache entries:", err);
  }
}

// 1. Install Event: Fast install without static HTML pinning
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        if (PRECACHE_ASSETS.length > 0) {
          const cache = await caches.open(CACHE_NAME);
          await Promise.allSettled(
            PRECACHE_ASSETS.map(async (url) => {
              try {
                const res = await fetch(new Request(url, { cache: "reload" }));
                if (res && res.ok) {
                  const expiringRes = await createExpiringResponse(res);
                  await cache.put(url, expiringRes);
                }
              } catch (err) {
                console.debug(`[SW] Pre-cache skip for ${url}:`, err);
              }
            })
          );
        }
      } catch (err) {
        console.debug("[SW] Cache open notice on install:", err);
      }
      await self.skipWaiting();
    })()
  );
});

// 2. Activate Event: Clean up old caches and sweep expired items
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
        await sweepExpiredCacheEntries();
      } catch (err) {
        console.debug("[SW] Error during activation cleanup:", err);
      }
      await self.clients.claim();
    })()
  );
});

// 3. Fetch Event: Network-First for Navigation, Cache-First with 30-Day TTL for Assets & Media
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and Firebase/Google APIs
  if (
    request.method !== "GET" ||
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("identitytoolkit") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("gstatic.com")
  ) {
    return;
  }

  // Strategy A: Navigation & HTML Pages -> Strict Network-First (never serve stale HTML online)
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request, { cache: "no-cache" });
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            const expiring = await createExpiringResponse(networkResponse);
            cache.put(request, expiring);
          }
          return networkResponse;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(request);
          if (cached) return cached;
          const fallback = (await cache.match("./index.html")) || (await cache.match("./"));
          if (fallback) return fallback;
          return new Response("Offline page unavailable", { status: 503 });
        }
      })()
    );
    return;
  }

  // Strategy B: Next.js Static JS/CSS/Fonts Chunks -> Cache-First
  if (
    url.pathname.includes("/_next/static/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached && !isCacheExpired(cached)) {
          return cached;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const expiring = await createExpiringResponse(networkResponse);
            cache.put(request, expiring);
          }
          return networkResponse;
        } catch {
          return cached || new Response("Offline resource unavailable", { status: 503 });
        }
      })()
    );
    return;
  }

  // Strategy C: Default Stale-While-Revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      const fetchPromise = fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse.ok) {
            const expiring = await createExpiringResponse(networkResponse);
            cache.put(request, expiring);
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached && !isCacheExpired(cached) ? cached : fetchPromise;
    })()
  );
});
