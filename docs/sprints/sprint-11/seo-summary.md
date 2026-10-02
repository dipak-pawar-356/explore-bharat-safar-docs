# Explore Bharat Safar — Structured SEO & Metadata Summary
## Reference: Schema.org, Google Search Central, Next.js 14 App Router

---

## 1. Overview & Strategy

Explore Bharat Safar indexes more than 650,000 rural villages, thousands of historic forts, mountain peaks, and cultural experiences. The SEO subsystem is engineered to maximize organic discovery, Google Rich Results eligibility, and sovereign cultural archiving.

---

## 2. Structured Data (JSON-LD) Schemas

Implemented in `apps/web/src/lib/seo/metadata.helper.ts`:

### A. WebSite with Sitelinks SearchBox
Enables users to search Explore Bharat Safar directly from Google's SERP:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Explore Bharat Safar",
  "url": "https://explorebharatsafar.in",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://explorebharatsafar.in/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### B. TouristAttraction Schema
Applied to historical forts, shrines, waterfalls, and mountain passes:
- Attributes: `name`, `description`, `image`, `geo` (coordinates + elevation), `aggregateRating`, `address`.

### C. AdministrativeArea Schema
Applied to India's 650,000+ villages:
- Attributes: `name` (English), `alternateName` (Local vernacular), `identifier` (Census LGD Code), `address` (PIN code, District, State), `geo`.

### D. BreadcrumbList Schema
Provides clear hierarchical trails for search crawlers:
`Home > Maharashtra > Pune > Sinhagad Fort`

---

## 3. Dynamic XML Sitemap (`sitemap.ts`)

Located at `apps/web/src/app/sitemap.ts`:
- Returns an XML sitemap generated dynamically using the Next.js `MetadataRoute.Sitemap` API.
- Priority and frequency allocation:
  - Homepage (`/`): Priority `1.0`, daily refresh.
  - Discovery & Villages hubs (`/explore`, `/villages`): Priority `0.9`, daily refresh.
  - Search & Expeditions hubs (`/search`, `/expeditions`): Priority `0.8`, weekly refresh.
  - Community hub (`/community`): Priority `0.7`, weekly refresh.
  - High-traffic heritage monuments and sample villages: Priority `0.85`, weekly refresh.

---

## 4. Crawl Control & Privacy (`robots.ts`)

Located at `apps/web/src/app/robots.ts`:
- **Allowed**: All public discovery paths (`/`, `/explore/`, `/villages/`, `/search/`).
- **Disallowed**:
  - `/admin/`, `/super-admin/`, `/village-admin/` (Administrative panels)
  - `/api/` (Direct backend API endpoints)
  - `/checkout/`, `/auth/` (Sensitive user workflows)
  - `/profile/settings` (Personal accounts)
- Explicit Googlebot-Image crawler rules protecting internal assets while allowing public gallery indexing.
