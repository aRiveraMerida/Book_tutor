import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api/v1';
const TEMARIO_PATH = path.join(process.cwd(), 'temario');

// Fallback: read from local temario directory
function getLocalFiles(subject: string) {
  try {
    const subjectPath = path.join(TEMARIO_PATH, subject);
    if (!fs.existsSync(subjectPath)) {
      return null;
    }

    return fs.readdirSync(subjectPath)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const filePath = path.join(subjectPath, f);
        const content = fs.readFileSync(filePath, 'utf-8');
        const firstLine = content.split('\n')[0];
        const title = firstLine.replace(/^#\s*/, '') || f.replace('.md', '');
        
        return {
          id: f.replace('.md', ''),
          filename: f,
          title,
        };
      });
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subject: string }> }
) {
  const { subject } = await params;

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
      const response = await fetch(`${BACKEND_URL}/asignaturas/${subject}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend response - documents is list of filenames
        const files = (data.documents || []).map((filename: string) => {
          const id = filename.replace('.md', '');
          return {
            id,
            filename,
            title: id.replace(/-/g, ' ').replace(/_/g, ' '),
          };
        });
        return NextResponse.json(files);
      }
    } catch (error) {
      console.log('Backend not available for subject, using local files');
    }
  }

  // Fallback to local files
  const files = getLocalFiles(subject);
  if (files === null) {
    return NextResponse.json({ error: 'Asignatura no encontrada' }, { status: 404 });
  }
  return NextResponse.json(files);
}
