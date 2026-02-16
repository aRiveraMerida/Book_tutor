'use client';

import { Source } from '@/lib/api';
import styles from './Chat.module.css';

interface SourceCardProps {
  source: Source;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const relevanceColor = source.score >= 0.7 
    ? '#22c55e' 
    : source.score >= 0.5 
      ? '#eab308' 
      : '#ef4444';

  return (
    <div className={styles.sourceCard}>
      <div className={styles.sourceHeader}>
        <span className={styles.sourceIndex}>[{index}]</span>
        <span className={styles.sourceFile}>{source.source_file}</span>
        <span 
          className={styles.sourceScore}
          style={{ backgroundColor: relevanceColor }}
        >
          {Math.round(source.score * 100)}%
        </span>
      </div>
      
      {(source.titulo || source.seccion) && (
        <div className={styles.sourceLocation}>
          {source.titulo && <span>{source.titulo}</span>}
          {source.titulo && source.seccion && <span> › </span>}
          {source.seccion && <span>{source.seccion}</span>}
        </div>
      )}
      
      <p className={styles.sourceContent}>
        {source.content.length > 200 
          ? source.content.substring(0, 200) + '...' 
          : source.content
        }
      </p>
    </div>
  );
}
