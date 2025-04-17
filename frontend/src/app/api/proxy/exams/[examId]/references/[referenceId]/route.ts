import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'https://you-education.devasheeshmishra.com';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { examId: string, referenceId: string } }
) {
  try {
    const { examId, referenceId } = params;
    
    const response = await fetch(
      `${API_URL}/api/v1/exams/${examId}/references/${referenceId}`,
      {
        method: 'DELETE',
      }
    );

    // For DELETE operations with 204 No Content response
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json().catch(() => ({}));
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to delete reference' },
      { status: 500 }
    );
  }
}