import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'https://you-education.devasheeshmishra.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const examId = params.examId;
    
    // Get the refresh parameter from the URL if it exists
    const searchParams = request.nextUrl.searchParams;
    const refresh = searchParams.get('refresh') === 'true';
    
    // Construct the API URL with the refresh parameter if needed
    const apiUrl = new URL(`${API_URL}/api/v1/exams/${examId}/mindmap`);
    if (refresh) {
      apiUrl.searchParams.append('refresh', 'true');
    }
    
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    // If the mindmap is not found or no references available
    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Mindmap not found or no references available' },
        { status: 404 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mindmap' },
      { status: 500 }
    );
  }
}