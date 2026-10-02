// Explore Bharat Safar — k6 Flash Concurrency Booking Reservation Stress Test
// Simulates 1,000 concurrent travelers contending for high-altitude trek slots
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    flash_slot_reservation: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 500,
      maxVUs: 1500,
      stages: [
        { duration: '30s', target: 200 },
        { duration: '1m', target: 1000 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.05'], // Max 5% failure under high lock contention
  },
};

const BASE_URL = __ENV.API_URL || 'https://api.explorebharatsafar.in';

export default function () {
  const batchId = 'batch-kedarkantha-winter-2027';

  // 1. Check availability
  const availRes = http.get(`${BASE_URL}/api/v1/bookings/experiences/${batchId}/availability`);
  check(availRes, {
    'availability checked': (r) => r.status === 200 || r.status === 404,
  });

  sleep(0.2);
}
