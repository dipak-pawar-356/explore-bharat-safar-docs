// Cloudflare Edge Worker — Geo-Header Injection & Static Vector Tile Cache Route
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const country = request.headers.get('cf-ipcountry') || 'IN';

    // Inject sovereign geolocation header
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set('x-ebs-geo-country', country);

    // Vector tile caching header (30 days immutable at edge)
    if (url.pathname.startsWith('/api/v1/discovery/tiles/')) {
      const response = await fetch(request, { headers: modifiedHeaders });
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Cache-Control', 'public, max-age=2592000, immutable');
      return newResponse;
    }

    return fetch(request, { headers: modifiedHeaders });
  },
};
