/**
 * WebSocket Server Module
 * 
 * Handles WebSocket connections for real-time data streaming.
 * Broadcasts new readings to all connected clients and handles
 * status updates.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { SofcReading, WsMessage } from './types.js';
import { getReadingsHistory } from './storage.js';

let wss: WebSocketServer | null = null;

/**
 * Initialize WebSocket server attached to HTTP server
 */
export function initWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('[WebSocket] Client connected');
    
    // Send current history to new client
    const history = getReadingsHistory(100);
    const historyMessage: WsMessage = {
      type: 'history',
      data: history,
    };
    ws.send(JSON.stringify(historyMessage));
    
    // Send welcome status
    const statusMessage: WsMessage = {
      type: 'status',
      level: 'info',
      message: 'Connected to SOFC monitoring server',
    };
    ws.send(JSON.stringify(statusMessage));
    
    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
    });
    
    ws.on('error', (err) => {
      console.error('[WebSocket] Client error:', err.message);
    });
  });
  
  wss.on('error', (err) => {
    console.error('[WebSocket] Server error:', err.message);
  });
  
  console.log('[WebSocket] Server initialized');
  return wss;
}

/**
 * Broadcast a new reading to all connected clients
 */
export function broadcastReading(reading: SofcReading): void {
  if (!wss) return;
  
  const message: WsMessage = {
    type: 'reading',
    data: reading,
  };
  const messageStr = JSON.stringify(message);
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

/**
 * Broadcast a status message to all connected clients
 */
export function broadcastStatus(level: 'info' | 'warning' | 'error', message: string): void {
  if (!wss) return;
  
  const statusMessage: WsMessage = {
    type: 'status',
    level,
    message,
  };
  const messageStr = JSON.stringify(statusMessage);
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

/**
 * Get number of connected clients
 */
export function getConnectedClients(): number {
  return wss ? wss.clients.size : 0;
}

/**
 * Close WebSocket server
 */
export function closeWebSocket(): Promise<void> {
  return new Promise((resolve) => {
    if (wss) {
      wss.close(() => {
        console.log('[WebSocket] Server closed');
        wss = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

