# Explore Bharat Safar — Search Architecture Summary
## Reference: EBS-DOC-18-SEARCH, EBS-DOC-02-SPEC, EBS-DOC-09-API

---

## 1. Domain Ingress Routing & Isolation

Explore Bharat Safar manages vast datasets spanning geological GIS landmarks, 650,000+ rural villages, commercial adventure batches, social traveler profiles, and governance audit records. 

Per **EBS-DOC-18-SEARCH Section 2**, search requests must avoid a monolithic, indiscriminate database query. Instead, incoming requests route through the **Context Ingress Router**:

```
                       [ Incoming Search Request ]
                                   │
                                   ▼
                       [ Context Ingress Router ]
                                   │
     ┌──────────────┬──────────────┼──────────────┬──────────────┐
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼
[DISCOVERY]     [VILLAGES]    [BOOKINGS]       [SOCIAL]       [ADMIN]
  Places          Villages     Expeditions      Users       Audit Logs
  Forts           Panchayats   Trek Batches     Guilds      System Config
  Peaks           LGD/PIN      Departures       Profiles    Moderation
  Waterfalls      Talukas
```

### Domain Routing Invariants:
1. **Discovery Scope**: Searches geographic places and heritage points of interest. Prohibits returning user accounts or admin audit logs.
2. **Villages Scope**: Searches cadastral records, Census LGD codes, local Devanagari village names, and postal PIN codes. Firewalled from commercial booking records.
3. **Bookings Scope**: Searches active expedition batches, difficulty levels, and seasonal schedules.
4. **Social Scope**: Searches public traveler explorer profiles and community guilds.
5. **Admin Scope**: Requires verified session tokens with `ADMIN` or `SUPER_ADMIN` roles. Searches system audit events and internal user registries.
6. **Global Scope**: Queries all public domains simultaneously with a uniform result format and score normalization.

---

## 2. Regional Indic Travel Synonym Dictionary

Travelers in India frequently use colloquial regional terminology interchangeably with standard English:
- *Fort* is commonly searched as *Gad* (Marathi/Hindi), *Durg* (Sanskrit/Hindi), or *Kila* (Urdu/Hindi).
- *Temple* is searched as *Mandir*, *Devalaya*, *Kovil*, or *Gudi*.
- *Waterfall* is searched as *Dhodhad*, *Chhapar*, *Fall*, or *Jalprapat*.
- *Peak* is searched as *Shikhar*, *Top*, *Choti*, or *Matha*.
- *Pass* is searched as *Ghat*, *La*, or *Darra*.

The `SynonymDictionaryEngine` automatically expands user queries bidirectionally:
- Input: `"Sinhagad"` → Canonical: `"sinhagad fort"` → Expansions: `["sinhagad", "sinhagad fort", "sinhagad gad", "sinhagad durg", "sinhagad kila"]`.
- Queries are normalized using Unicode NFC decomposition to treat combined Indic vowels consistently across keyboards.

---

## 3. Dynamic Typo Tolerance Engine

Typing on mobile devices in rugged travel environments leads to typos (e.g., `"snahagad"`, `"kedar nath"`). 

The `TypoToleranceEngine` applies dynamic Levenshtein edit distance constrained by query length:
- **Length < 4 characters**: Maximum edit distance = 0 (exact match only). Prevents false positives on abbreviations and short names.
- **Length 4–7 characters**: Maximum edit distance = 1.
- **Length > 7 characters**: Maximum edit distance = 2.

If the original query produces zero direct hits, the engine calculates the closest known dictionary term and returns a `"Did you mean: ...?"` recommendation in the search response envelope.

---

## 4. Multi-Factor Scoring & Spatial Ranking

Search ranking combines textual relevance with physical spatial proximity:

$$\text{Final Score} = \min\left(1.0, S_{\text{text}} + S_{\text{spatial}} + S_{\text{tier}}\right)$$

1. **Textual Relevance ($S_{\text{text}}$)**:
   - Exact string match = `1.0`
   - Prefix match = `0.7`
   - Token trigram similarity = $[0.0, 0.4]$
2. **Spatial Proximity Boost ($S_{\text{spatial}}$)**:
   When user coordinates (latitude, longitude) are provided, results within 50 km receive a logarithmic distance boost:
   $$S_{\text{spatial}} = 0.2 \times \max\left(0, 1 - \frac{\ln(1 + \text{distanceKm})}{\ln(51)}\right)$$
3. **Heritage Tier Boost ($S_{\text{tier}}$)**:
   - High-elevation peaks (>2,000m) or National Heritage sites receive an additional $+0.05$ prominence weight.

---

## 5. Multi-Tier Caching & Invalidation

The `SearchCacheService` implements an enterprise 2-tier caching hierarchy:
1. **L1 In-Memory LRU**: Stores hot queries with sub-millisecond retrieval (1,000 entries max, 60s TTL).
2. **L2 Redis Cache**: Stores serialized search responses (300s TTL). Configured with `retryStrategy: () => null` for graceful offline development fallback.
3. **Stale-While-Revalidate (SWR)**: High-traffic queries serve cached data immediately while an asynchronous worker warms updated facets in the background.
