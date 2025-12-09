/**
 * useLiveSOFC Hook
 * 
 * Manages WebSocket connection to the backend for real-time SOFC data.
 * Handles connection status, incoming readings, and maintains a local buffer
 * of historical data for charts.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SofcReading, WsMessage, ConnectionStatus } from '../types';

const MAX_HISTORY = 500;
const WS_URL = `ws://${window.location.hostname}:3001/ws`;
const RECONNECT_DELAY = 3000;

interface UseLiveSOFCReturn {
  latestReading: SofcReading | null;
  history: SofcReading[];
  connectionStatus: ConnectionStatus;
  statusMessage: string;
  reconnect: () => void;
}

export function useLiveSOFC(): UseLiveSOFCReturn {
  const [latestReading, setLatestReading] = useState<SofcReading | null>(null);
  const [history, setHistory] = useState<SofcReading[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [statusMessage, setStatusMessage] = useState('Connecting...');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    setConnectionStatus('connecting');
    setStatusMessage('Connecting to server...');

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setConnectionStatus('live');
        setStatusMessage('Connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'reading':
              setLatestReading(message.data);
              setHistory(prev => {
                const newHistory = [...prev, message.data];
                // Keep only the last MAX_HISTORY readings
                return newHistory.slice(-MAX_HISTORY);
              });
              break;

            case 'history':
              // Initial batch of historical data
              setHistory(message.data);
              if (message.data.length > 0) {
                setLatestReading(message.data[message.data.length - 1]);
              }
              break;

            case 'status':
              setStatusMessage(message.message);
              if (message.level === 'warning' && message.message.includes('demo')) {
                setConnectionStatus('demo');
              } else if (message.level === 'error') {
                setConnectionStatus('demo');
              }
              break;
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setStatusMessage('Connection error');
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setConnectionStatus('disconnected');
        setStatusMessage('Disconnected from server');
        wsRef.current = null;

        // Schedule reconnection
        reconnectTimerRef.current = setTimeout(() => {
          console.log('[WebSocket] Attempting reconnection...');
          connect();
        }, RECONNECT_DELAY);
      };
    } catch (err) {
      console.error('[WebSocket] Failed to create connection:', err);
      setConnectionStatus('disconnected');
      setStatusMessage('Failed to connect');
      
      // Schedule reconnection
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, RECONNECT_DELAY);
    }
  }, []);

  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  // Connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [connect]);

  return {
    latestReading,
    history,
    connectionStatus,
    statusMessage,
    reconnect,
  };
}

/**
 * Hook to get the last N minutes of readings from history
 */
export function useRecentHistory(history: SofcReading[], minutes: number): SofcReading[] {
  const cutoffTime = Date.now() - minutes * 60 * 1000;
  return history.filter(reading => new Date(reading.ts).getTime() > cutoffTime);
}

