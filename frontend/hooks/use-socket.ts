import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Custom hook for Socket.io connection
 * Handles connection lifecycle and cleanup
 */
export function useSocket(url?: string): Socket | null {
  const socketRef = useRef<Socket | null>(null);
  const urlToUse = url || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(urlToUse, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        // Connection established
      });

      socketRef.current.on('disconnect', () => {
        // Connection lost
      });

      socketRef.current.on('error', (error) => {
        // TODO: Replace with proper error logging service
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Socket error:', error);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [urlToUse]);

  return socketRef.current;
}

