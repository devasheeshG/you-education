import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://you-education.devasheeshmishra.com/api';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/v1/exams`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/v1/exams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.ok ? 201 : response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to create exam' },
      { status: 500 }
    );
  }
}