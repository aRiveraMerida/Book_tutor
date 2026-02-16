'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useAuth } from '../../../context/AuthContext';
import { FloatingChat } from '@/components/chat';
import { getAccessToken } from '@/lib/api';

interface FileContent {
  content: string;
  title: string;
  filename: string;
}

const subjectNames: Record<string, string> = {
  'programacion': 'Programación',
  'bases-de-datos': 'Bases de Datos',
  'sistemas-informaticos': 'Sistemas Informáticos',
  'entornos-de-desarrollo': 'Entornos de Desarrollo',
  'lenguajes-de-marcas': 'Lenguajes de Marcas',
  'Implantacion-de-sistemas-operativos': 'Implantación de Sistemas Operativos',
};

export default function DocumentPage({ 
  params 
}: { 
  params: Promise<{ subject: string; file: string }> 
}) {
  const { subject, file } = use(params);
  const [document, setDocument] = useState<FileContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const token = getAccessToken();
    const url = token 
      ? `/api/subjects/${subject}/${file}?token=${encodeURIComponent(token)}` 
      : `/api/subjects/${subject}/${file}`;
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Documento no encontrado');
        return res.json();
      })
      .then(data => {
        setDocument(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [isAuthenticated, router, subject, file]);

  if (!isAuthenticated) {
    return null;
  }

  const subjectName = subjectNames[subject] || subject;

  return (
    <>
      {/* Header */}
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

      {/* Main content */}
      <main className="main-content">
        <div className="container view">
          <div className="breadcrumb">
            <Link href="/">Inicio</Link>
            <span className="breadcrumb-separator">›</span>
            <Link href={`/asignatura/${subject}`}>{subjectName}</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{document?.title || 'Documento'}</span>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="empty-state">
              <p>{error}</p>
              <Link href={`/asignatura/${subject}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Volver a la asignatura
              </Link>
            </div>
          ) : document && (
            <div className="markdown-container">
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {document.content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href={`/asignatura/${subject}`} className="btn btn-back">
              ← Volver a {subjectName}
            </Link>
            <Link href="/" className="btn btn-secondary">
              🏠 Inicio
            </Link>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>FP Prometeo - Plataforma de Libros © 2024</p>
        </div>
      </footer>

      {/* Floating Chat */}
      <FloatingChat 
        slug={subject} 
        title={document?.title || subjectName}
      />
    </>
  );
}
