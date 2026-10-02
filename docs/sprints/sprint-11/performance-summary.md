# Explore Bharat Safar — Performance & Optimization Summary
## Reference: W3C Server-Timing, Core Web Vitals, EBS-DOC-51-TECHSTACK

---

## 1. Multi-Tier Backend Latency Optimization

To deliver high-responsiveness travel search across patchy mobile connections in remote rural regions, backend services employ several performance layers:

### A. Sub-50ms Autocomplete
- Autocomplete queries leverage in-memory keyword prefix tries and cached dictionary structures.
- Heavy database full-table scans are completely bypassed during keystroke typing.
- Database queries only trigger as a secondary fallback if the local dictionary produces fewer than 3 matches.

### B. Server-Timing Telemetry
- The `MonitoringInterceptor` injects the W3C `Server-Timing: app;dur=X.XX` HTTP header on all API responses.
- Allows edge CDNs, reverse proxies, and browser DevTools to break down server-side execution duration vs. network transit time.

### C. Cursor-Based Pagination
- Offsets (`OFFSET n LIMIT m`) degrade linearly ($O(N)$) as page numbers increase on millions of village and place records.
- Cursor pagination (`take`, `cursor: id`, `direction: forward | backward`) uses Indexed Primary Key seek operations ($O(\log N)$) guaranteeing consistent latency across arbitrary depths.

---

## 2. Frontend Performance & Core Web Vitals

### A. Next.js 14 App Router Bundle Optimization
- Code splitting and route-level lazy loading ensure client search scripts only download when the search experience is engaged.
- All SVG icons from `lucide-react` are tree-shaken.

### B. Debounced Keystroke Ingress
- Client search input employs a 200ms debounce timer to prevent redundant API queries during continuous typing.
- Unnecessary duplicate queries are discarded using React state cleanup.

### C. Accessible Loading Skeletons
- `Skeleton` components from `@ebs/ui` render pulsing placeholder cards with `aria-busy="true"` during fetch lifecycles.
- Prevents Cumulative Layout Shift (CLS) by reserving visual geometry before async payload arrival.
