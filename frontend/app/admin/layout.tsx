'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, isLoading, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Verificando permisos...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link href="/" className="admin-logo">
            <Image src="/prometeo.webp" alt="Prometeo" width={40} height={40} />
            <span>BookTutor</span>
          </Link>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-item">
            <span className="admin-nav-icon">📊</span>
            Dashboard
          </Link>
          <Link href="/admin/asignaturas" className="admin-nav-item">
            <span className="admin-nav-icon">📚</span>
            Asignaturas
          </Link>
          <Link href="/admin/asignaturas/nueva" className="admin-nav-item">
            <span className="admin-nav-icon">➕</span>
            Nueva Asignatura
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="admin-user-avatar">👤</span>
            <span className="admin-user-name">{user?.username}</span>
          </div>
          <div className="admin-sidebar-actions">
            <Link href="/" className="admin-action-btn">
              🏠 Ir a la app
            </Link>
            <button onClick={logout} className="admin-action-btn admin-logout">
              🚪 Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
