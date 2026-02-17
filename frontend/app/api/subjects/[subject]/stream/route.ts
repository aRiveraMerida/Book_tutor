const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api/v1';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ subject: string }> }
) {
  const { subject } = await params;
  const body = await request.json();

  try {
    const response = await fetch(`${BACKEND_URL}/chat/${subject}/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text();
      return new Response(JSON.stringify({ error: detail }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ error: 'No se pudo conectar con el backend' })}\n\n`,
      {
        headers: { 'Content-Type': 'text/event-stream' },
      }
    );
  }
}
