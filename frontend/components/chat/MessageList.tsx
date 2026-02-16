'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/hooks/useChat';
import { SourceCard } from './SourceCard';
import styles from './Chat.module.css';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>💬</div>
        <p className={styles.emptyText}>
          ¡Hola! Soy tu tutor virtual.
        </p>
        <p className={styles.emptySubtext}>
          Pregúntame cualquier cosa sobre el contenido de este documento.
        </p>
        <div className={styles.suggestionList}>
          <span className={styles.suggestionLabel}>Sugerencias:</span>
          <button className={styles.suggestion}>
            ¿De qué trata este tema?
          </button>
          <button className={styles.suggestion}>
            Explícame los conceptos clave
          </button>
          <button className={styles.suggestion}>
            Dame un ejemplo práctico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messageList}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`${styles.message} ${
            message.role === 'user' ? styles.userMessage : styles.assistantMessage
          }`}
        >
          <div className={styles.messageAvatar}>
            {message.role === 'user' ? '👤' : '🤖'}
          </div>
          <div className={styles.messageContent}>
            <div className={styles.messageText}>
              {message.content || (
                <span className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              )}
              {message.isStreaming && (
                <span className={styles.cursor}>▋</span>
              )}
            </div>
            
            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className={styles.sourcesContainer}>
                <details className={styles.sourcesDetails}>
                  <summary className={styles.sourcesSummary}>
                    📚 {message.sources.length} fuente(s) consultada(s)
                  </summary>
                  <div className={styles.sourcesList}>
                    {message.sources.map((source, idx) => (
                      <SourceCard key={idx} source={source} index={idx + 1} />
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className={`${styles.message} ${styles.assistantMessage}`}>
          <div className={styles.messageAvatar}>🤖</div>
          <div className={styles.messageContent}>
            <div className={styles.messageText}>
              <span className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
