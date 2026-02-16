'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAsignaturas, Asignatura, getAccessToken } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function AdminAsignaturasPage() {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadAsignaturas();
  }, []);

  const loadAsignaturas = async () => {
    try {
      setLoading(true);
      const data = await getAsignaturas();
      setAsignaturas(data);
      setError('');
    } catch (err) {
      setError('Error al cargar asignaturas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`¿Estás seguro de eliminar la asignatura "${slug}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeleting(slug);
    try {
      const token = getAccessToken();
      const response = await fetch(`${API_URL}/asignaturas/${slug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      // Reload list
      await loadAsignaturas();
    } catch (err) {
      setError('Error al eliminar la asignatura');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Asignaturas</h1>
          <p>Gestiona las asignaturas y sus documentos</p>
        </div>
        <Link href="/admin/asignaturas/nueva" className="btn btn-primary">
          ➕ Nueva Asignatura
        </Link>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading-inline">
          <div className="spinner"></div>
          <p>Cargando asignaturas...</p>
        </div>
      ) : asignaturas.length === 0 ? (
        <div className="admin-empty-large">
          <div className="admin-empty-icon">📚</div>
          <h3>No hay asignaturas</h3>
          <p>Crea tu primera asignatura para comenzar</p>
          <Link href="/admin/asignaturas/nueva" className="btn btn-primary">
            Crear asignatura
          </Link>
        </div>
      ) : (
        <div className="admin-cards-grid">
          {asignaturas.map(asignatura => (
            <div key={asignatura.slug} className="admin-asignatura-card">
              <div className="admin-asignatura-header">
                <span className="admin-asignatura-icon">{asignatura.icon}</span>
                <span className={`admin-status admin-status-${asignatura.status}`}>
                  {asignatura.status}
                </span>
              </div>

              <h3 className="admin-asignatura-name">{asignatura.name}</h3>
              <p className="admin-asignatura-slug">/{asignatura.slug}</p>

              <div className="admin-asignatura-stats">
                <div className="admin-asignatura-stat">
                  <span className="admin-asignatura-stat-value">{asignatura.chunks_count}</span>
                  <span className="admin-asignatura-stat-label">chunks</span>
                </div>
              </div>

              <div className="admin-asignatura-actions">
                <Link 
                  href={`/asignatura/${asignatura.slug}`}
                  className="admin-card-btn"
                >
                  👁️ Ver
                </Link>
                <button
                  onClick={() => handleDelete(asignatura.slug)}
                  className="admin-card-btn admin-card-btn-danger"
                  disabled={deleting === asignatura.slug}
                >
                  {deleting === asignatura.slug ? '...' : '🗑️ Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
