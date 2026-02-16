'use client';

import { useState, KeyboardEvent, FormEvent } from 'react';
import styles from './Chat.module.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inputContainer}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Escribe tu pregunta...'}
        className={styles.input}
        rows={1}
        disabled={isLoading}
      />
      <button
        type="submit"
        className={styles.sendButton}
        disabled={!input.trim() || isLoading}
      >
        {isLoading ? (
          <span className={styles.loadingSpinner}></span>
        ) : (
          '➤'
        )}
      </button>
    </form>
  );
}
