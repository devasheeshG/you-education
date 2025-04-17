import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'https://you-education.devasheeshmishra.com';

export async function PUT(
  request: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  try {
    const subjectId = params.subjectId;
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/api/v1/subjects/${subjectId}`, {
      method: 'PUT',
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
      { error: 'Failed to update subject' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  try {
    const subjectId = params.subjectId;
    
    const response = await fetch(`${API_URL}/api/v1/subjects/${subjectId}`, {
      method: 'DELETE',
    });

    // For DELETE operations with 204 No Content response
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json().catch(() => ({}));
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 }
    );
  }
}