'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import styles from './FloatingChat.module.css';

interface FloatingChatProps {
  slug: string;
  title?: string;
}

export function FloatingChat({ slug, title }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  } = useChat({ slug, useStreaming: false });

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Dragging functionality
  const handleDragStart = (e: React.MouseEvent) => {
    if (isExpanded) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      setPosition({
        x: dragRef.current.initialX + deltaX,
        y: dragRef.current.initialY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className={styles.floatingButton}
          onClick={() => setIsOpen(true)}
          title="Abrir Tutor IA (⌘K)"
        >
          <span className={styles.floatingIcon}>🤖</span>
          {messages.length > 0 && (
            <span className={styles.badge}>{messages.length}</span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Backdrop for expanded mode */}
          {isExpanded && (
            <div 
              className={styles.backdrop} 
              onClick={() => setIsExpanded(false)}
            />
          )}

          <div
            className={`${styles.chatWindow} ${isExpanded ? styles.expanded : ''}`}
            style={!isExpanded ? {
              transform: `translate(${position.x}px, ${position.y}px)`,
            } : undefined}
          >
            {/* Header */}
            <div 
              className={styles.header}
              onMouseDown={handleDragStart}
              style={{ cursor: isExpanded ? 'default' : 'move' }}
            >
              <div className={styles.headerLeft}>
                <span className={styles.headerIcon}>🤖</span>
                <div className={styles.headerInfo}>
                  <h3 className={styles.headerTitle}>Tutor IA</h3>
                  {title && <span className={styles.headerSubtitle}>{title}</span>}
                </div>
              </div>
              
              <div className={styles.headerActions}>
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className={styles.actionButton}
                    title="Limpiar chat"
                  >
                    🗑️
                  </button>
                )}
                <button
                  onClick={toggleExpand}
                  className={styles.actionButton}
                  title={isExpanded ? 'Reducir' : 'Expandir'}
                >
                  {isExpanded ? '⊙' : '⤢'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={styles.actionButton}
                  title="Cerrar (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesArea}>
              <MessageList messages={messages} isLoading={isLoading} />
            </div>

            {/* Error */}
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {/* Input */}
            <div className={styles.inputArea}>
              <ChatInput
                onSend={sendMessage}
                isLoading={isLoading}
                placeholder="Pregunta al tutor..."
              />
            </div>

            {/* Keyboard hint */}
            <div className={styles.keyboardHint}>
              <kbd>⌘K</kbd> para abrir/cerrar • <kbd>Esc</kbd> para cerrar
            </div>
          </div>
        </>
      )}
    </>
  );
}
