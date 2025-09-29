import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface FloatingChatProps {
  apiUrl?: string;
}

export default function FloatingChat({ apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001' }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState({ width: 320, height: 384 }); // Default size
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('chatHistory');
    if (stored) {
      try {
        const parsedHistory = JSON.parse(stored);
        setMessages(parsedHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Save chat history to sessionStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  // Global mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && !isMinimized) {
        // Keep window anchored to bottom-right, just resize it
        const newWidth = Math.max(320, window.innerWidth - 24 - e.clientX);
        const newHeight = Math.max(200, window.innerHeight - 24 - e.clientY);

        setSize({
          width: Math.min(newWidth, window.innerWidth - 24),
          height: Math.min(newHeight, window.innerHeight - 24),
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'nw-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, position, size, isMinimized]);

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(`${apiUrl}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.data.message,
          role: 'assistant',
          timestamp: new Date(data.data.timestamp),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: 'Chat Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: 'Sorry, I encountered an error. Please try again later.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      // Focus input when opening
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    sessionStorage.removeItem('chatHistory');
    toast({
      title: 'History Cleared',
      description: 'Chat history has been cleared.',
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  const chatClasses = theme === 'dark'
    ? 'bg-gray-800 border-gray-600 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  const headerClasses = theme === 'dark'
    ? 'bg-primary border-gray-600'
    : 'bg-primary border-gray-200';

  const messageClasses = {
    user: 'bg-primary text-primary-foreground',
    assistant: theme === 'dark'
      ? 'bg-gray-700 text-gray-100'
      : 'bg-gray-100 text-gray-800',
  };

  const inputClasses = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-primary focus:border-gray-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-primary focus:border-primary';

  const buttonClasses = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'
    : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-600';

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 rounded-lg shadow-xl border transition-all duration-300 ease-in-out ${
        theme === 'dark' ? 'shadow-gray-900' : 'shadow-black/20'
      } ${chatClasses}`}
      style={{
        width: size.width,
        height: isMinimized ? 64 : size.height,
        left: position.x || undefined,
        top: position.y || undefined,
        bottom: position.x === 0 && position.y === 0 ? 24 : undefined,
        right: position.x === 0 && position.y === 0 ? 24 : undefined,
      }}

    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`flex items-center justify-between p-3 border-b ${headerClasses} text-primary-foreground rounded-t-lg`}>
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-semibold text-sm">AI Assistant</h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-primary/80 rounded transition-colors"
              aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={toggleChat}
              className="p-1 hover:bg-primary/80 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
              style={{ maxHeight: size.height - 140 }}
            >
              {messages.length === 0 ? (
                <div className={`text-center text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <p className="mb-2">👋 Hello! I'm your AI assistant.</p>
                  <p>Ask me questions about your store, sales trends, inventory, or any business insights!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg text-sm ${messageClasses[msg.role]}`}
                    >
                      <div className="prose dark:prose-invert prose-sm max-w-none prose-p:mb-4 prose-headings:mb-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            table: ({ children, ...props }) => (
                              <table className="border-collapse border border-gray-300 dark:border-gray-600 mb-4" {...props}>
                                {children}
                              </table>
                            ),
                            thead: ({ children, ...props }) => (
                              <thead className="bg-gray-50 dark:bg-gray-700" {...props}>
                                {children}
                              </thead>
                            ),
                            tbody: ({ children, ...props }) => (
                              <tbody {...props}>
                                {children}
                              </tbody>
                            ),
                            tr: ({ children, ...props }) => (
                              <tr className="border-b border-gray-200 dark:border-gray-600" {...props}>
                                {children}
                              </tr>
                            ),
                            th: ({ children, ...props }) => (
                              <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-semibold bg-gray-100 dark:bg-gray-600" {...props}>
                                {children}
                              </th>
                            ),
                            td: ({ children, ...props }) => (
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2" {...props}>
                                {children}
                              </td>
                            ),
                            p: ({ children, ...props }) => (
                              <p className="mb-4 last:mb-0" {...props}>
                                {children}
                              </p>
                            ),
                            br: ({ ...props }) => (
                              <br className="block" {...props} />
                            ),
                            pre: ({ children, ...props }) => (
                              <pre className="whitespace-pre-wrap break-words" {...props}>
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.role === 'user'
                            ? 'text-primary-foreground/70'
                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-lg text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-100'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          theme === 'dark' ? 'bg-gray-400' : 'bg-gray-400'
                        }`}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          theme === 'dark' ? 'bg-gray-400' : 'bg-gray-400'
                        }`} style={{ animationDelay: '0.1s' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          theme === 'dark' ? 'bg-gray-400' : 'bg-gray-400'
                        }`} style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-3 border-t ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your store..."
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${inputClasses}`}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground rounded-lg transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className={`mt-2 text-xs hover:underline transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Clear history
                </button>
              )}
            </div>
          </>
        )}

        {/* Resize Handle */}
        {!isMinimized && (
          <div
            className={`absolute top-0 left-0 w-4 h-4 cursor-nw-resize ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            onMouseDown={handleResizeMouseDown}
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
