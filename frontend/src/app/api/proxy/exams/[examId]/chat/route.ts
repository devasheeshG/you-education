import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://you-education.devasheeshmishra.com';

interface ChatRequest {
  message: string;
  reference_ids: string[];
  previous_messages?: unknown[];
  exam_id?: string; // This might be redundant since exam_id is in the path
}

export async function POST(
  request: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const examId = params.examId;
    const body: ChatRequest = await request.json();
    
    // Forward the request to the backend API
    const response = await fetch(`${API_URL}/api/v1/exams/${examId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // If the response is a streaming response, we need to forward it as-is
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      // For streaming responses, we need to create a readable stream
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // For non-streaming responses (like errors)
    const data = await response.json().catch(() => ({}));
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}