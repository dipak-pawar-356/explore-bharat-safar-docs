// Explore Bharat Safar — Cloudflare Edge Security Headers Worker
// Enforces HSTS, CSP, X-Frame-Options, and Sovereign Boundary Policies

export interface Env {
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const response = await fetch(request);

    // Clone headers to mutate response
    const newHeaders = new Headers(response.headers);

    // 1. Strict Transport Security (HSTS) - 2 Years with preload
    newHeaders.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // 2. Strict Content Security Policy (CSP)
    newHeaders.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://api.explorebharatsafar.in wss://api.explorebharatsafar.in https://challenges.cloudflare.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    );

    // 3. Clickjacking and MIME-sniffing protection
    newHeaders.set('X-Frame-Options', 'DENY');
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-XSS-Protection', '1; mode=block');

    // 4. Privacy & Referrer Controls
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newHeaders.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(self), payment=(self)',
    );

    // 5. Cloudflare edge trace telemetry
    newHeaders.set('X-EBS-Edge-Node', 'in-bom-01');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
