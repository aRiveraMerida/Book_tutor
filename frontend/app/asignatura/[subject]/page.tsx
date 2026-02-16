'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { FloatingChat } from '@/components/chat';
import styles from './subject.module.css';

interface FileItem {
  id: string;
  filename: string;
  title: string;
}

interface FileContent {
  content: string;
  title: string;
  filename: string;
}

export default function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [document, setDocument] = useState<FileContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const [docSearch, setDocSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  // Cargar lista de documentos
  useEffect(() => {
    fetch(`/api/subjects/${subject}`)
      .then(res => res.json())
      .then(data => {
        const fileList = Array.isArray(data) ? data : [];
        setFiles(fileList);
        // Auto-seleccionar el primer documento
        if (fileList.length > 0) {
          setSelectedFile(fileList[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subject]);

  // Cargar contenido del documento seleccionado
  useEffect(() => {
    if (!selectedFile) return;
    
    setDocLoading(true);
    fetch(`/api/subjects/${subject}/${selectedFile}`)
      .then(res => res.json())
      .then(data => {
        setDocument(data);
        setDocLoading(false);
      })
      .catch(() => setDocLoading(false));
  }, [subject, selectedFile]);

  // Filtrar documentos
  const filteredFiles = files.filter(file =>
    file.title.toLowerCase().includes(docSearch.toLowerCase()) ||
    file.filename.toLowerCase().includes(docSearch.toLowerCase())
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+B toggle sidebar
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      setSidebarOpen(prev => !prev);
    }
    // Ctrl+P buscar documento
    if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
      e.preventDefault();
      searchRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Navegación entre documentos con teclado
  const navigateDoc = useCallback((direction: 'prev' | 'next') => {
    if (!selectedFile || files.length === 0) return;
    const currentIndex = files.findIndex(f => f.id === selectedFile);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < files.length) {
      setSelectedFile(files[newIndex].id);
    }
  }, [selectedFile, files]);

  const subjectName = subject.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Obtener índice actual del documento
  const currentDocIndex = files.findIndex(f => f.id === selectedFile);
  const hasPrev = currentDocIndex > 0;
  const hasNext = currentDocIndex < files.length - 1;

  return (
    <div className={styles.layout}>
      {/* Header con breadcrumbs */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.logo}>
            <Image src="/prometeo.webp" alt="Prometeo" width={40} height={40} />
          </Link>
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbs}>
            <Link href="/" className={styles.breadcrumbLink}>Inicio</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>{subjectName}</span>
            {document && (
              <>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={styles.breadcrumbDoc}>{document.title}</span>
              </>
            )}
          </nav>
        </div>
        <button 
          className={styles.sidebarToggle}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle sidebar (⌘B)"
        >
          {sidebarOpen ? '☰' : '☰'}
        </button>
      </header>

      <div className={styles.container}>
        {/* Sidebar con documentos */}
        <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarHidden : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3>📄 Documentos</h3>
            <span className={styles.docCount}>{files.length}</span>
          </div>
          
          {/* Buscador de documentos */}
          {files.length > 3 && (
            <div className={styles.docSearchWrapper}>
              <input
                ref={searchRef}
                type="text"
                className={styles.docSearch}
                placeholder="Buscar documento..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
              />
            </div>
          )}
          
          {loading ? (
            <div className={styles.sidebarLoading}>
              <div className="spinner"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className={styles.sidebarEmpty}>
              <p>{docSearch ? 'Sin resultados' : 'No hay documentos'}</p>
            </div>
          ) : (
            <nav className={styles.docList}>
              {filteredFiles.map((file, index) => (
                <button
                  key={file.id}
                  className={`${styles.docItem} ${selectedFile === file.id ? styles.docItemActive : ''}`}
                  onClick={() => setSelectedFile(file.id)}
                >
                  <span className={styles.docIndex}>{index + 1}</span>
                  <span className={styles.docTitle}>{file.title}</span>
                </button>
              ))}
            </nav>
          )}

          <div className={styles.sidebarFooter}>
            <Link href="/" className={styles.backLink}>
              ← Todas las asignaturas
            </Link>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className={`${styles.main} ${!sidebarOpen ? styles.mainFull : ''}`}>
          {docLoading ? (
            <div className={styles.docLoading}>
              <div className="spinner"></div>
              <p>Cargando documento...</p>
            </div>
          ) : document ? (
            <article className={styles.document}>
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {document.content}
                </ReactMarkdown>
              </div>
              
              {/* Navegación entre documentos */}
              <div className={styles.docNav}>
                <button
                  className={styles.docNavBtn}
                  onClick={() => navigateDoc('prev')}
                  disabled={!hasPrev}
                >
                  ← Anterior
                </button>
                <span className={styles.docNavInfo}>
                  {currentDocIndex + 1} / {files.length}
                </span>
                <button
                  className={styles.docNavBtn}
                  onClick={() => navigateDoc('next')}
                  disabled={!hasNext}
                >
                  Siguiente →
                </button>
              </div>
            </article>
          ) : (
            <div className={styles.noDoc}>
              <span>📚</span>
              <p>Selecciona un documento para comenzar</p>
            </div>
          )}
        </main>
      </div>

      {/* Chat flotante - funciona con toda la asignatura */}
      <FloatingChat 
        slug={subject} 
        title={subjectName}
      />
    </div>
  );
}
