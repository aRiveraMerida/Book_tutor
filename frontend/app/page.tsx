'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './context/AuthContext';
import { isUserAdmin, getAccessToken } from '@/lib/api';

interface Subject {
  id: string;
  name: string;
  icon: string;
  fileCount: number;
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isUserAdmin());
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const token = getAccessToken();
    const url = token ? `/api/subjects?token=${encodeURIComponent(token)}` : '/api/subjects';
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setSubjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isAuthenticated, router]);

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="logo">
                <Image src="/prometeo.webp" alt="Prometeo" width={50} height={50} />
              </div>
              <p className="subtitle">Temario Digital</p>
            </div>
            {isAdmin && (
              <Link href="/admin" className="header-admin-link">
                ⚙️ Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container view">
          <h2 className="section-title">Asignaturas</h2>
          
          <div className="search-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar asignatura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron asignaturas</p>
            </div>
          ) : (
            <div className="subjects-grid">
              {filteredSubjects.map(subject => (
                <Link
                  key={subject.id}
                  href={`/asignatura/${subject.id}`}
                  className="subject-card"
                >
                  <div className="subject-icon">{subject.icon}</div>
                  <h3 className="subject-name">{subject.name}</h3>
                  <p className="subject-info">{subject.fileCount} documento(s)</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>FP Prometeo - Plataforma de Libros © 2024</p>
          <button onClick={logout} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Cerrar sesión
          </button>
        </div>
      </footer>
    </>
  );
}
