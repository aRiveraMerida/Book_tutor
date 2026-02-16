'use client';

import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import styles from './Chat.module.css';

interface ChatPanelProps {
  slug: string;
  title?: string;
}

export function ChatPanel({ slug, title }: ChatPanelProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  } = useChat({ slug, useStreaming: false }); // Streaming disabled for now

  return (
    <div className={styles.chatPanel}>
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderInfo}>
          <span className={styles.chatIcon}>🤖</span>
          <div>
            <h3 className={styles.chatTitle}>Tutor IA</h3>
            {title && <span className={styles.chatSubtitle}>{title}</span>}
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className={styles.clearButton}
            title="Limpiar conversación"
          >
            🗑️
          </button>
        )}
      </div>

      <MessageList messages={messages} isLoading={isLoading} />

      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}

      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        placeholder="Pregunta sobre el contenido..."
      />
    </div>
  );
}
