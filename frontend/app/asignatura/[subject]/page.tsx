'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { getAccessToken } from '@/lib/api';

interface FileItem {
  id: string;
  filename: string;
  title: string;
}

const subjectNames: Record<string, string> = {
  'programacion': 'Programación',
  'bases-de-datos': 'Bases de Datos',
  'sistemas-informaticos': 'Sistemas Informáticos',
  'entornos-de-desarrollo': 'Entornos de Desarrollo',
  'lenguajes-de-marcas': 'Lenguajes de Marcas',
  'Implantacion-de-sistemas-operativos': 'Implantación de Sistemas Operativos',
};

export default function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const token = getAccessToken();
    const url = token 
      ? `/api/subjects/${subject}?token=${encodeURIComponent(token)}` 
      : `/api/subjects/${subject}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setFiles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isAuthenticated, router, subject]);

  if (!isAuthenticated) {
    return null;
  }

  const subjectName = subjectNames[subject] || subject;

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo">
              <Image src="/prometeo.webp" alt="Prometeo" width={50} height={50} />
            </Link>
            <p className="subtitle">Temario Digital</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container view">
          <div className="breadcrumb">
            <Link href="/">Inicio</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{subjectName}</span>
          </div>

          <h2 className="section-title">{subjectName}</h2>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="empty-state">
              <p>No hay documentos disponibles en esta asignatura</p>
              <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Volver al inicio
              </Link>
            </div>
          ) : (
            <div className="books-list">
              {files.map(file => (
                <Link
                  key={file.id}
                  href={`/asignatura/${subject}/${file.id}`}
                  className="book-item"
                >
                  <span className="book-icon">📄</span>
                  <span className="book-title">{file.title}</span>
                </Link>
              ))}
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <Link href="/" className="btn btn-back">
              ← Volver a asignaturas
            </Link>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>FP Prometeo - Plataforma de Libros © 2024</p>
        </div>
      </footer>
    </>
  );
}
