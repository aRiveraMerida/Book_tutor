import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api/v1';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ subject: string }> }
) {
  const { subject } = await params;
  const body = await request.json();

  try {
    const response = await fetch(`${BACKEND_URL}/chat/${subject}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: detail },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'No se pudo conectar con el backend' },
      { status: 502 }
    );
  }
}
