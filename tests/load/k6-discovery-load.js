// Explore Bharat Safar — k6 Distributed Discovery Search Load Test
// Simulates 2,500 Virtual Users (VUs) querying places, villages, and autocomplete
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 500 },   // Ramp up
    { duration: '5m', target: 2500 },  // Sustained peak load
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<500'], // 95% of queries < 300ms
    http_req_failed: ['rate<0.01'],                 // Error rate < 1%
  },
};

const BASE_URL = __ENV.API_URL || 'https://api.explorebharatsafar.in';

const SEARCH_TERMS = [
  'Sinhagad',
  'Mawlynnong',
  'Kedarkantha',
  'Raigad',
  'Hampi',
  'Dhodhad',
  'Mandir',
  '793110',
];

export default function () {
  const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];

  // 1. Autocomplete typeahead prefix test (<50ms target)
  const autoRes = http.get(`${BASE_URL}/api/v1/search/autocomplete?q=${term.substring(0, 3)}&limit=5`);
  check(autoRes, {
    'autocomplete status is 200': (r) => r.status === 200,
    'autocomplete latency < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(0.5);

  // 2. Global search query execution
  const searchRes = http.get(`${BASE_URL}/api/v1/search?q=${encodeURIComponent(term)}&context=global&limit=10`);
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search returns payload': (r) => r.json('results') !== undefined,
  });

  sleep(1);
}
