import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy to the BlueprintOS API on Mac Mini.
 * Keeps the API key secret (never exposed to the browser).
 *
 * Usage from client: fetch('/api/blueprint/clients/123/metrics?days=30')
 * Proxies to: https://api.blueprintforscale.com/clients/123/metrics?days=30
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const apiBase = process.env.BLUEPRINTOS_API_URL || 'https://api.blueprintforscale.com';
  const apiKey = process.env.BLUEPRINTOS_API_KEY || '';

  const pathStr = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${apiBase}/${pathStr}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const res = await fetch(url, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'API request failed' }, { status: 502 });
  }
}
