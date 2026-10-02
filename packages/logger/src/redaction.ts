// Explore Bharat Safar — PII & Sensitive Data Redaction Rules
// Complies with DPDP Act 2023 & Enterprise Security Blueprint (EBS-BLU-40-SEC)

export const SENSITIVE_KEYS: readonly string[] = [
  'password',
  'passwd',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'clientsecret',
  'apikey',
  'authorization',
  'cookie',
  'aadhaar',
  'aadhaarnumber',
  'pan',
  'pannumber',
  'cardnumber',
  'cvv',
  'cvc',
  'pin',
  'otp',
  'medicalnotes',
  'healthconditions',
  'phonenumber',
];

const REDACTED_MASK = '[REDACTED]';

/**
 * Recursively redacts sensitive fields in objects and arrays before emitting logs.
 */
export function redactSensitiveData<T>(input: T, depth = 0): T {
  if (depth > 6 || input === null || input === undefined) {
    return input;
  }

  if (typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(item => redactSensitiveData(item, depth + 1)) as unknown as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (SENSITIVE_KEYS.some(sensitive => normalizedKey.includes(sensitive))) {
      result[key] = REDACTED_MASK;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactSensitiveData(value, depth + 1);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
