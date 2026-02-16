'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Subject {
  id: string;
  name: string;
  icon: string;
  fileCount: number;
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => {
        setSubjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtrar asignaturas según búsqueda
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset selected index cuando cambia la búsqueda
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+K o Cmd+K para enfocar búsqueda
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Navegación con teclado en resultados
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (filteredSubjects.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filteredSubjects.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filteredSubjects.length) % filteredSubjects.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredSubjects[selectedIndex]) {
          router.push(`/asignatura/${filteredSubjects[selectedIndex].id}`);
        }
        break;
      case 'Escape':
        setSearchQuery('');
        searchInputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="home-layout">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-content">
          <Image src="/prometeo.webp" alt="Prometeo" width={60} height={60} className="home-logo" />
          <div>
            <h1 className="home-title">Temario Digital</h1>
            <p className="home-subtitle">Estudia y pregunta a tu tutor IA</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="home-main">
        <div className="home-container">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="home-empty">
              <span className="home-empty-icon">📚</span>
              <h2>No hay asignaturas disponibles</h2>
              <p>Coloca carpetas con archivos .md en la carpeta docs/ del backend</p>
            </div>
          ) : (
            <>
              {/* Buscador */}
              <div className="home-search">
                <div className="home-search-box">
                  <span className="home-search-icon">🔍</span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="home-search-input"
                    placeholder="Buscar asignatura..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                  <kbd className="home-search-kbd">⌘K</kbd>
                </div>
                {searchQuery && (
                  <p className="home-search-results">
                    {filteredSubjects.length} resultado{filteredSubjects.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {filteredSubjects.length === 0 ? (
                <div className="home-no-results">
                  <span>🔍</span>
                  <p>No se encontraron asignaturas para &ldquo;{searchQuery}&rdquo;</p>
                  <button 
                    className="home-clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              ) : (
                <div className="home-grid">
                  {filteredSubjects.map((subject, index) => (
                    <Link
                      key={subject.id}
                      href={`/asignatura/${subject.id}`}
                      className={`home-card ${index === selectedIndex && searchQuery ? 'home-card-selected' : ''}`}
                    >
                      <div className="home-card-icon">{subject.icon}</div>
                      <div className="home-card-content">
                        <h3 className="home-card-title">{subject.name}</h3>
                        <div className="home-card-meta">
                          <span>📄 {subject.fileCount} doc(s)</span>
                          <span>🤖 Chat IA</span>
                        </div>
                      </div>
                      <span className="home-card-arrow">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>FP Prometeo - Plataforma Educativa © 2024</p>
      </footer>
    </div>
  );
}
