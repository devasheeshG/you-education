import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'https://you-education.devasheeshmishra.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_URL}/api/v1/metadata/youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video metadata' },
      { status: 500 }
    );
  }
}
