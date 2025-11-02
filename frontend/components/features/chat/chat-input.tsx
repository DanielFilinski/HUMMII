'use client';

import { useState } from 'react';
import { useProtectedAction } from '@/hooks/use-protected-action';
import { AuthModal } from '@/components/auth/auth-modal';
import { apiClient } from '@/lib/api/client';

interface ChatInputProps {
  /**
   * Order ID for the chat
   */
  orderId: string;
  /**
   * Callback when message is sent successfully
   */
  onMessageSent?: (message: string) => void;
  /**
   * Placeholder text
   */
  placeholder?: string;
}

/**
 * Protected chat input component
 * Only authenticated users can send messages
 * Shows auth modal if user is not authenticated
 * 
 * @example
 * ```tsx
 * <ChatInput 
 *   orderId="order-123"
 *   onMessageSent={(msg) => console.log('Sent:', msg)}
 * />
 * ```
 */
export function ChatInput({
  orderId,
  onMessageSent,
  placeholder = 'Type your message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { execute, showModal, closeModal } = useProtectedAction({
    reason: 'To send messages to contractors',
    action: 'Register to start chatting',
  });

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    execute(async () => {
      // This runs ONLY if authenticated
      setIsLoading(true);
      
      try {
        await apiClient.post('/messages', {
          orderId,
          content: trimmedMessage,
        });
        
        // Clear input on success
        setMessage('');
        
        // Notify parent component
        onMessageSent?.(trimmedMessage);
      } catch (error) {
        console.error('Failed to send message:', error);
        
        // Show error toast (handled by apiClient)
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className="flex gap-2 p-4 border-t border-gray-200 bg-white">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim() || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            'Send'
          )}
        </button>
      </div>

      <AuthModal
        isOpen={showModal}
        onClose={closeModal}
        reason="To send messages to contractors"
        action="Register to start chatting"
      />
    </>
  );
}

