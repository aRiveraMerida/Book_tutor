import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api/v1';
const TEMARIO_PATH = path.join(process.cwd(), 'temario');

function getLocalContent(subject: string, file: string) {
  try {
    const filePath = path.join(TEMARIO_PATH, subject, `${file}.md`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const firstLine = content.split('\n')[0];
    const title = firstLine.replace(/^#\s*/, '') || file;

    return { content, title, filename: `${file}.md` };
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subject: string; file: string }> }
) {
  const { subject, file } = await params;

  // Try backend first
  try {
    const response = await fetch(`${BACKEND_URL}/asignaturas/${subject}/documents/${file}`, {
      headers: { 'Content-Type': 'application/json' },
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
  } catch {
    console.log('Backend not available, using local files');
  }

  // Fallback to local files
  const content = getLocalContent(subject, file);
  if (!content) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
  }
  return NextResponse.json(content);
}
