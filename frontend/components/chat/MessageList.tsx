'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/hooks/useChat';
import { SourceCard } from './SourceCard';
import styles from './Chat.module.css';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage?: (message: string) => void;
}

const SUGGESTIONS = [
  '¿De qué trata esta asignatura?',
  'Explícame los conceptos clave',
  'Dame un ejemplo práctico',
  'Hazme un resumen',
];

export function MessageList({ messages, isLoading, onSendMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSuggestionClick = (suggestion: string) => {
    if (onSendMessage && !isLoading) {
      onSendMessage(suggestion);
    }
  };

  if (messages.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🤖</div>
        <p className={styles.emptyText}>
          ¡Hola! Soy tu tutor IA
        </p>
        <p className={styles.emptySubtext}>
          Pregúntame sobre el contenido de esta asignatura
        </p>
        <div className={styles.suggestionList}>
          {SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              className={styles.suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
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
              {message.content ? (
                message.role === 'assistant' ? (
                  <div className={styles.markdown}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )
              ) : (
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
            
            {message.sources && message.sources.length > 0 && (
              <div className={styles.sourcesContainer}>
                <details className={styles.sourcesDetails}>
                  <summary className={styles.sourcesSummary}>
                    📚 {message.sources.length} fuente(s)
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
