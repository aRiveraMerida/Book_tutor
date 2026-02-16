'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { askQuestion, streamAnswer, Source } from '@/lib/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
  timestamp: Date;
}

interface UseChatOptions {
  slug: string;
  useStreaming?: boolean;
  onError?: (error: Error) => void;
}

export function useChat({ slug, useStreaming = true, onError }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`chat_${slug}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp),
          isStreaming: false,
        })));
      } catch {
        // Ignore invalid data
      }
    }
  }, [slug]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${slug}`, JSON.stringify(messages));
    }
  }, [messages, slug]);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Create assistant message placeholder
    const assistantId = generateId();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      sources: [],
      isStreaming: useStreaming,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      if (useStreaming) {
        // Streaming mode
        let fullContent = '';
        let sources: Source[] = [];

        for await (const event of streamAnswer(slug, content)) {
          if (event.type === 'sources') {
            sources = event.data as Source[];
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId ? { ...m, sources } : m
              )
            );
          } else if (event.type === 'token') {
            const tokenData = event.data as { token: string };
            fullContent += tokenData.token;
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId ? { ...m, content: fullContent } : m
              )
            );
          } else if (event.type === 'done') {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId ? { ...m, isStreaming: false } : m
              )
            );
          } else if (event.type === 'error') {
            throw new Error((event.data as { error: string }).error);
          }
        }
      } else {
        // Non-streaming mode
        const response = await askQuestion(slug, content);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? {
                  ...m,
                  content: response.answer,
                  sources: response.sources,
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));

      // Update message with error
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content: `Error: ${errorMessage}`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [slug, isLoading, useStreaming, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(`chat_${slug}`);
  }, [slug]);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setMessages(prev =>
      prev.map(m => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    stopStreaming,
  };
}
