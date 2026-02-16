import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api/v1';
const TEMARIO_PATH = path.join(process.cwd(), 'temario');

const subjectIcons: Record<string, string> = {
  'programacion': '💻',
  'bases-de-datos': '🗄️',
  'sistemas-informaticos': '🖥️',
  'entornos-de-desarrollo': '⚙️',
  'lenguajes-de-marcas': '🌐',
  'Implantacion-de-sistemas-operativos': '🖥️',
};

const subjectNames: Record<string, string> = {
  'programacion': 'Programación',
  'bases-de-datos': 'Bases de Datos',
  'sistemas-informaticos': 'Sistemas Informáticos',
  'entornos-de-desarrollo': 'Entornos de Desarrollo',
  'lenguajes-de-marcas': 'Lenguajes de Marcas',
  'Implantacion-de-sistemas-operativos': 'Implantación de Sistemas Operativos',
};

// Fallback: read from local temario directory
function getLocalSubjects() {
  try {
    if (!fs.existsSync(TEMARIO_PATH)) {
      return [];
    }
    return fs.readdirSync(TEMARIO_PATH, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        const subjectPath = path.join(TEMARIO_PATH, dirent.name);
        const files = fs.readdirSync(subjectPath).filter(f => f.endsWith('.md'));
        
        return {
          id: dirent.name,
          name: subjectNames[dirent.name] || dirent.name,
          icon: subjectIcons[dirent.name] || '📖',
          fileCount: files.length,
        };
      });
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  // Get token from Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');

  if (!token) {
    // Try to get from localStorage (passed as query param for server-side)
    const url = new URL(request.url);
    token = url.searchParams.get('token') || '';
  }

  // Try backend first if token available
  if (token) {
    try {
      const response = await fetch(`${BACKEND_URL}/asignaturas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend response to frontend format
        const subjects = data.map((a: { slug: string; name: string; icon: string; chunks_count: number }) => ({
          id: a.slug,
          name: a.name,
          icon: a.icon,
          fileCount: a.chunks_count > 0 ? 1 : 0, // Simplified
        }));

        // Also include local subjects for development
        const localSubjects = getLocalSubjects();
        const backendIds = new Set(subjects.map((s: { id: string }) => s.id));
        const combined = [
          ...subjects,
          ...localSubjects.filter(s => !backendIds.has(s.id)),
        ];

        return NextResponse.json(combined);
      }
    } catch (error) {
      console.log('Backend not available, using local files');
    }
  }

  // Fallback to local files
  const subjects = getLocalSubjects();
  return NextResponse.json(subjects);
}
