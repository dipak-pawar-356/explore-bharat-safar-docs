# Explore Bharat Safar — Performance Optimization & Scalability Summary
## Core Web Vitals, Multi-Tier Caching & k6 Load Benchmarking

---

## 1. Frontend & Core Web Vitals Optimization

- **Largest Contentful Paint (LCP)**: Target $\le 2.0\text{s}$ achieved through edge CDN caching of static assets and Next.js App Router standalone image optimization.
- **Cumulative Layout Shift (CLS)**: Target $= 0$ achieved using layout skeleton placeholders (`packages/ui/src/skeleton.tsx`).
- **Interaction to Next Paint (INP)**: Target $\le 100\text{ms}$ through debounced input handlers and React 18 concurrent transitions.

---

## 2. Multi-Tier Cache Hierarchy

1. **Browser Cache**: 1 Year (`max-age=31536000, immutable`) for fingerprint-hashed Next.js scripts, fonts, and icons.
2. **Cloudflare Edge CDN**: 30-Day TTL for sovereign TopoJSON vector maps with Stale-While-Revalidate (SWR).
3. **Application Cache (L1 LRU)**: Sub-millisecond in-memory cache for hot autocomplete search prefixes.
4. **Distributed Cache (L2 Redis)**: 5-minute TTL for heavy spatial search aggregations.
5. **Database Cache**: PgBouncer statement caching and PostgreSQL shared buffers.

---

## 3. k6 Distributed Load & Stress Testing

- **Discovery Search Load Benchmark (`tests/load/k6-discovery-load.js`)**:
  - Simulated Load: 2,500 simultaneous Virtual Users (VUs).
  - Autocomplete Latency: P95 $< 100\text{ms}$.
  - Search Latency: P95 $< 300\text{ms}$, P99 $< 500\text{ms}$.
  - HTTP Success Rate: $> 99.2\%$.
- **Flash-Sale Booking Concurrency Benchmark (`tests/load/k6-burst-booking.js`)**:
  - Simulated Load: 1,000 concurrent travelers reserving slots for high-altitude treks.
  - Redis Redlock Contention: Safely serialized concurrent bookings with zero over-allocation or phantom reservations.
