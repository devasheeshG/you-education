import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://you-education.devasheeshmishra.com';

export async function POST(
  request: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const examId = params.examId;
    
    // Forward the multipart form data directly
    const formData = await request.formData();
    
    const response = await fetch(`${API_URL}/api/v1/exams/${examId}/references/upload`, {
      method: 'POST',
      // Do not set Content-Type header, it will be set automatically with boundary parameter
      body: formData,
    });

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status 
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to upload reference file' },
      { status: 500 }
    );
  }
}