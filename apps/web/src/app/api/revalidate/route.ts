import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (!secret || secret !== process.env.ISR_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid revalidation secret' }, { status: 401 });
  }

  return NextResponse.json({ revalidated: true, timestamp: Date.now() }, { status: 200 });
}
