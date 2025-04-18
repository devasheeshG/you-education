import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://you-education.devasheeshmishra.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const examId = params.examId;
    
    const response = await fetch(`${API_URL}/api/v1/exams/${examId}/references`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch references' },
      { status: 500 }
    );
  }
}