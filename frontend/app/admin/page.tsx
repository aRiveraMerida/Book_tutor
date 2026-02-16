'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAsignaturas, Asignatura } from '@/lib/api';

export default function AdminDashboard() {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAsignaturas();
  }, []);

  const loadAsignaturas = async () => {
    try {
      const data = await getAsignaturas();
      setAsignaturas(data);
    } catch (err) {
      setError('Error al cargar asignaturas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalChunks = asignaturas.reduce((sum, a) => sum + a.chunks_count, 0);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>Bienvenido al panel de administración de BookTutor</p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📚</div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{asignaturas.length}</span>
            <span className="admin-stat-label">Asignaturas</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📄</div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{totalChunks}</span>
            <span className="admin-stat-label">Chunks indexados</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">
              {asignaturas.filter(a => a.status === 'ready').length}
            </span>
            <span className="admin-stat-label">Listas para usar</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h2>Acciones rápidas</h2>
        <div className="admin-actions-grid">
          <Link href="/admin/asignaturas/nueva" className="admin-action-card">
            <span className="admin-action-icon">➕</span>
            <span className="admin-action-title">Nueva Asignatura</span>
            <span className="admin-action-desc">Sube una nueva asignatura con sus documentos</span>
          </Link>

          <Link href="/admin/asignaturas" className="admin-action-card">
            <span className="admin-action-icon">📋</span>
            <span className="admin-action-title">Gestionar</span>
            <span className="admin-action-desc">Ver y administrar asignaturas existentes</span>
          </Link>

          <Link href="/" className="admin-action-card">
            <span className="admin-action-icon">👁️</span>
            <span className="admin-action-title">Ver Plataforma</span>
            <span className="admin-action-desc">Ir a la vista de estudiante</span>
          </Link>
        </div>
      </div>

      {/* Recent Asignaturas */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Asignaturas recientes</h2>
          <Link href="/admin/asignaturas" className="admin-link">
            Ver todas →
          </Link>
        </div>

        {loading ? (
          <div className="admin-loading-inline">
            <div className="spinner"></div>
          </div>
        ) : asignaturas.length === 0 ? (
          <div className="admin-empty">
            <p>No hay asignaturas todavía.</p>
            <Link href="/admin/asignaturas/nueva" className="btn btn-primary">
              Crear primera asignatura
            </Link>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Asignatura</th>
                  <th>Estado</th>
                  <th>Chunks</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asignaturas.slice(0, 5).map(asignatura => (
                  <tr key={asignatura.slug}>
                    <td>
                      <div className="admin-table-name">
                        <span className="admin-table-icon">{asignatura.icon}</span>
                        <span>{asignatura.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status admin-status-${asignatura.status}`}>
                        {asignatura.status}
                      </span>
                    </td>
                    <td>{asignatura.chunks_count}</td>
                    <td>
                      <Link 
                        href={`/asignatura/${asignatura.slug}`} 
                        className="admin-table-action"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
