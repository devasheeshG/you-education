import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://you-education.devasheeshmishra.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { examId: string, referenceId: string } }
) {
  try {
    const { examId, referenceId } = params;
    
    const response = await fetch(
      `${API_URL}/api/v1/exams/${examId}/references/${referenceId}/download`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}