/**
 * Sekhar Teaching Hub - Progressive Service Worker
 * 30-Day Offline Caching Engine for Simulations, Static Assets & Curriculum Data
 */

const CACHE_NAME = "teaching-hub-simulations-v1";
const OFFLINE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days in milliseconds

// Core assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/login",
  "/signup",
  "/class-11",
  "/simulations/projectile-motion.html",
  "/simulations/harmonic-oscillator.html",
  "/simulations/gpu-particle-benchmark.html",
  "/simulations/gpu-compute-benchmark.html",
  "/simulations/ui-design-showcase.html",
  "/simulations/uidesign.html",
];

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
    console.warn("[SW] Error sweeping expired cache entries:", err);
  }
}

// 1. Install Event: Pre-cache core simulation files & routes
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await Promise.allSettled(
          PRECACHE_ASSETS.map(async (url) => {
            try {
              const res = await fetch(url);
              if (res.ok) {
                const expiringRes = await createExpiringResponse(res);
                await cache.put(url, expiringRes);
              }
            } catch (err) {
              console.warn(`[SW] Pre-cache skip for ${url}:`, err);
            }
          })
        );
      } catch (err) {
        console.warn("[SW] Cache open failed on install:", err);
      }
      await self.skipWaiting();
    })()
  );
});

// 2. Activate Event: Clean up old caches and sweep expired items
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      for (const key of cacheKeys) {
        if (key !== CACHE_NAME) {
          await caches.delete(key);
        }
      }
      await sweepExpiredCacheEntries();
      await self.clients.claim();
    })()
  );
});

// 3. Fetch Handler: Stale-While-Revalidate with 30-Day Expiration
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from the same origin
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Strictly bypass Next.js runtime chunks, HMR, Turbopack, and router RSC requests
  if (
    url.pathname.startsWith("/_next/") ||
    url.searchParams.has("_rsc") ||
    url.pathname.includes("webpack") ||
    url.pathname.includes("turbopack") ||
    url.pathname.includes("hot-update")
  ) {
    return;
  }

  // Determine if this is a simulation file or static font/media asset
  const isSimulation = url.pathname.startsWith("/simulations/");
  const isStaticFontOrMedia =
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico");

  if (!isSimulation && !isStaticFontOrMedia) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);

      // A. If cached response exists and is within 30 days TTL:
      if (cachedResponse && !isCacheExpired(cachedResponse)) {
        // In background, perform conditional revalidation if online
        event.waitUntil(
          (async () => {
            try {
              const headers = new Headers();
              const etag = cachedResponse.headers.get("etag");
              const lastModified = cachedResponse.headers.get("last-modified");
              if (etag) headers.set("If-None-Match", etag);
              if (lastModified) headers.set("If-Modified-Since", lastModified);

              const networkResponse = await fetch(request, { headers });

              if (networkResponse.status === 200) {
                const newExpiringResponse = await createExpiringResponse(networkResponse);
                await cache.put(request, newExpiringResponse);

                if (isSimulation) {
                  const clients = await self.clients.matchAll();
                  clients.forEach((client) => {
                    client.postMessage({
                      type: "SIMULATION_CACHE_UPDATED",
                      url: url.pathname,
                      updatedAt: Date.now(),
                    });
                  });
                }
              } else if (networkResponse.status === 304) {
                const refreshedResponse = await createExpiringResponse(cachedResponse);
                await cache.put(request, refreshedResponse);
              }
            } catch {
              // Device is offline or server unreachable - silent fallback to valid cache
            }
          })()
        );

        // Serve cached version immediately for 0ms instant load
        return cachedResponse;
      }

      // B. If not in cache or expired, fetch from network and store in cache
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const expiringResponse = await createExpiringResponse(networkResponse);
          await cache.put(request, expiringResponse);
          return networkResponse;
        }
        return networkResponse;
      } catch (networkError) {
        if (cachedResponse) {
          return cachedResponse;
        }
        if (isPageRoute) {
          const rootFallback = await cache.match("/");
          if (rootFallback) return rootFallback;
        }
        throw networkError;
      }
    })()
  );
});

// 4. Message Handler for Cache Management
self.addEventListener("message", (event) => {
  const { data } = event;
  if (!data) return;

  if (data.type === "SW_PRECACHE_ALL") {
    event.waitUntil(
      (async () => {
        try {
          const cache = await caches.open(CACHE_NAME);
          const urls = Array.isArray(data.urls) ? data.urls : PRECACHE_ASSETS;
          let count = 0;
          for (const url of urls) {
            try {
              const res = await fetch(url);
              if (res.ok) {
                const expiringRes = await createExpiringResponse(res);
                await cache.put(url, expiringRes);
                count++;
              }
            } catch (err) {
              console.warn(`[SW] Precache failed for ${url}:`, err);
            }
          }
          if (event.source) {
            event.source.postMessage({
              type: "SW_PRECACHE_COMPLETE",
              successCount: count,
              totalCount: urls.length,
            });
          }
        } catch (err) {
          console.error("[SW] Precache all failed:", err);
        }
      })()
    );
  }

  if (data.type === "SW_CLEAR_CACHE") {
    event.waitUntil(
      (async () => {
        await caches.delete(CACHE_NAME);
        if (event.source) {
          event.source.postMessage({ type: "SW_CACHE_CLEARED" });
        }
      })()
    );
  }
});
