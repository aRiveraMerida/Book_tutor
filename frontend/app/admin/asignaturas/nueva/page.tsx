'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileUploader } from '@/components/upload';
import { getAccessToken } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const EMOJI_OPTIONS = ['📚', '💻', '🗄️', '🖥️', '⚙️', '🌐', '📊', '🔬', '📐', '🎨', '🎵', '📝'];

export default function NuevaAsignaturaPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('📚');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<string>('');

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!slug.trim()) {
      setError('El slug es obligatorio');
      return;
    }
    if (files.length === 0) {
      setError('Debes subir al menos un archivo .md');
      return;
    }

    setLoading(true);
    setProgress('Preparando archivos...');

    try {
      const token = getAccessToken();
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('slug', slug.trim());
      formData.append('icon', icon);

      files.forEach(file => {
        formData.append('files', file);
      });

      setProgress('Subiendo archivos...');

      const response = await fetch(`${API_URL}/asignaturas`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error al crear la asignatura');
      }

      setProgress('Procesando RAG...');

      const result = await response.json();

      setProgress('¡Completado!');

      // Redirect to asignaturas list
      setTimeout(() => {
        router.push('/admin/asignaturas');
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Nueva Asignatura</h1>
          <p>Crea una nueva asignatura y sube sus documentos</p>
        </div>
        <Link href="/admin/asignaturas" className="btn btn-secondary">
          ← Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {error && <div className="admin-error">{error}</div>}

        {/* Basic Info */}
        <div className="admin-form-section">
          <h2>Información básica</h2>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="name">Nombre de la asignatura *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Programación"
                disabled={loading}
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="slug">Slug (URL) *</label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="Ej: programacion"
                disabled={loading}
                required
              />
              <span className="admin-form-hint">Se usará en la URL: /asignatura/{slug || 'slug'}</span>
            </div>
          </div>

          <div className="admin-form-group">
            <label>Icono</label>
            <div className="admin-emoji-picker">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`admin-emoji-btn ${icon === emoji ? 'selected' : ''}`}
                  onClick={() => setIcon(emoji)}
                  disabled={loading}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Files Upload */}
        <div className="admin-form-section">
          <h2>Documentos</h2>
          <p className="admin-form-desc">
            Sube los archivos Markdown (.md) que formarán el contenido de la asignatura.
            Estos archivos serán procesados para crear el tutor RAG.
          </p>

          <FileUploader
            onFilesChange={setFiles}
            accept=".md"
            maxFiles={20}
            maxSizeMB={10}
          />
        </div>

        {/* Progress */}
        {progress && (
          <div className="admin-progress">
            <div className="admin-progress-spinner"></div>
            <span>{progress}</span>
          </div>
        )}

        {/* Actions */}
        <div className="admin-form-actions">
          <Link href="/admin/asignaturas" className="btn btn-secondary">
            Cancelar
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || files.length === 0}
          >
            {loading ? 'Creando...' : 'Crear Asignatura'}
          </button>
        </div>
      </form>
    </div>
  );
}
