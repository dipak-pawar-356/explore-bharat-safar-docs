import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      authenticated: false,
      user: null,
      message: 'BFF Session Gateway Placeholder',
    },
    { status: 200 },
  );
}
