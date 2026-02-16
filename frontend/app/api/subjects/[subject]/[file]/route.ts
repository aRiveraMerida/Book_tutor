import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api/v1';
const TEMARIO_PATH = path.join(process.cwd(), 'temario');

// Fallback: read from local temario directory
function getLocalContent(subject: string, file: string) {
  try {
    const filePath = path.join(TEMARIO_PATH, subject, `${file}.md`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const firstLine = content.split('\n')[0];
    const title = firstLine.replace(/^#\s*/, '') || file;

    return { 
      content,
      title,
      filename: `${file}.md`
    };
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subject: string; file: string }> }
) {
  const { subject, file } = await params;

  // Get token from header or query param
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');

  if (!token) {
    const url = new URL(request.url);
    token = url.searchParams.get('token') || '';
  }

  // Try backend first
  if (token) {
    try {
      const response = await fetch(`${BACKEND_URL}/asignaturas/${subject}/documents/${file}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          content: data.content,
          title: data.title,
          filename: data.filename,
        });
      }
    } catch (error) {
      console.log('Backend not available for document, using local files');
    }
  }

  // Fallback to local files
  const content = getLocalContent(subject, file);
  if (content === null) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
  }
  return NextResponse.json(content);
}
