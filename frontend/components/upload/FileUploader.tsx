'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import styles from './Upload.module.css';

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function FileUploader({
  onFilesChange,
  accept = '.md',
  maxFiles = 20,
  maxSizeMB = 10,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFiles = (newFiles: File[]): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      // Check extension
      if (!file.name.endsWith('.md')) {
        errors.push(`${file.name}: Solo se permiten archivos .md`);
        continue;
      }

      // Check size
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name}: Excede el tamaño máximo de ${maxSizeMB}MB`);
        continue;
      }

      // Check duplicates
      if (files.some(f => f.name === file.name) || validFiles.some(f => f.name === file.name)) {
        errors.push(`${file.name}: Archivo duplicado`);
        continue;
      }

      validFiles.push(file);
    }

    // Check total count
    const totalCount = files.length + validFiles.length;
    if (totalCount > maxFiles) {
      errors.push(`Máximo ${maxFiles} archivos permitidos`);
      validFiles.splice(maxFiles - files.length);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError('');
    }

    return validFiles;
  };

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles = validateFiles(Array.from(newFiles));
    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setError('');
  };

  const clearFiles = () => {
    setFiles([]);
    onFilesChange([]);
    setError('');
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // Reset input to allow selecting same file again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={styles.uploaderContainer}>
      {/* Drop Zone */}
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${files.length > 0 ? styles.hasFiles : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleInputChange}
          className={styles.hiddenInput}
        />

        <div className={styles.dropZoneContent}>
          <div className={styles.dropZoneIcon}>📄</div>
          <p className={styles.dropZoneText}>
            {isDragging
              ? 'Suelta los archivos aquí'
              : 'Arrastra archivos .md aquí o haz clic para seleccionar'}
          </p>
          <p className={styles.dropZoneHint}>
            Máximo {maxFiles} archivos, {maxSizeMB}MB cada uno
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.error}>
          {error.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className={styles.fileList}>
          <div className={styles.fileListHeader}>
            <span>{files.length} archivo(s) seleccionado(s)</span>
            <button onClick={clearFiles} className={styles.clearBtn}>
              Limpiar todo
            </button>
          </div>

          <div className={styles.files}>
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className={styles.fileItem}>
                <span className={styles.fileIcon}>📄</span>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className={styles.removeBtn}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
