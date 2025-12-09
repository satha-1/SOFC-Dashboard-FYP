/**
 * Serial Port Communication Module
 * 
 * Handles communication with Arduino over serial port.
 * Reads JSON lines, parses them, validates the data, and
 * broadcasts to WebSocket clients.
 */

import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { ArduinoReading, SofcReading, SerialConfig } from './types.js';
import { addReading } from './storage.js';

type BroadcastFn = (reading: SofcReading) => void;
type StatusFn = (level: 'info' | 'warning' | 'error', message: string) => void;

let port: SerialPort | null = null;
let parser: ReadlineParser | null = null;
let broadcastReading: BroadcastFn | null = null;
let broadcastStatus: StatusFn | null = null;
let currentConfig: SerialConfig = { port: 'COM8', baudRate: 9600 };
let reconnectTimer: NodeJS.Timeout | null = null;

/**
 * Validate that received data has all required fields with correct types
 */
function validateReading(data: unknown): data is ArduinoReading {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.t_water === 'number' &&
    typeof obj.t_air === 'number' &&
    typeof obj.p_air === 'number' &&
    typeof obj.p_water === 'number' &&
    !isNaN(obj.t_water) &&
    !isNaN(obj.t_air) &&
    !isNaN(obj.p_air) &&
    !isNaN(obj.p_water)
  );
}

/**
 * Extract JSON object from a line that may contain other text
 * Handles cases like: "DEBUG: info here  {"t_water":27.5,...}"
 */
function extractJson(line: string): string | null {
  // Find the first '{' and last '}' to extract JSON
  const startIdx = line.indexOf('{');
  const endIdx = line.lastIndexOf('}');
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return line.substring(startIdx, endIdx + 1);
  }
  return null;
}

/**
 * Process a line received from Arduino
 */
function processLine(line: string): void {
  const trimmedLine = line.trim();
  if (!trimmedLine) return;
  
  // Try to extract JSON from the line (handles debug prefixes)
  const jsonStr = extractJson(trimmedLine);
  
  if (!jsonStr) {
    // No JSON found - might be a pure debug line, ignore silently
    if (trimmedLine.startsWith('DEBUG') || trimmedLine.startsWith('//')) {
      return; // Silently ignore debug lines
    }
    console.warn('[Serial] No JSON found in line:', trimmedLine);
    return;
  }
  
  try {
    const data = JSON.parse(jsonStr);
    
    if (validateReading(data)) {
      // Create reading with server timestamp
      const reading: SofcReading = {
        ...data,
        ts: new Date().toISOString(),
      };
      
      // Store in memory
      addReading(reading);
      
      // Broadcast to WebSocket clients
      if (broadcastReading) {
        broadcastReading(reading);
      }
      
      console.log(`[Serial] Reading: T_water=${reading.t_water}°C, T_air=${reading.t_air}°C, P_air=${reading.p_air}, P_water=${reading.p_water}`);
    } else {
      console.warn('[Serial] Invalid reading format:', jsonStr);
    }
  } catch (err) {
    // JSON parse error - log and ignore this line
    console.warn('[Serial] Failed to parse JSON:', jsonStr);
  }
}

/**
 * Initialize serial port connection
 */
export async function initSerial(
  config: SerialConfig,
  onReading: BroadcastFn,
  onStatus: StatusFn
): Promise<boolean> {
  broadcastReading = onReading;
  broadcastStatus = onStatus;
  currentConfig = config;
  
  return connectSerial();
}

/**
 * Connect to serial port
 */
async function connectSerial(): Promise<boolean> {
  // Close existing connection if any
  await closeSerial();
  
  console.log(`[Serial] Attempting to connect to ${currentConfig.port} at ${currentConfig.baudRate} baud...`);
  
  try {
    port = new SerialPort({
      path: currentConfig.port,
      baudRate: currentConfig.baudRate,
      autoOpen: false,
    });
    
    // Set up line parser (Arduino sends JSON lines terminated with newline)
    parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    
    // Handle incoming data
    parser.on('data', (line: string) => {
      processLine(line);
    });
    
    // Handle errors
    port.on('error', (err) => {
      console.error('[Serial] Port error:', err.message);
      if (broadcastStatus) {
        broadcastStatus('error', `Serial error: ${err.message}`);
      }
      scheduleReconnect();
    });
    
    // Handle port close
    port.on('close', () => {
      console.log('[Serial] Port closed');
      if (broadcastStatus) {
        broadcastStatus('warning', 'Serial port closed');
      }
      scheduleReconnect();
    });
    
    // Open the port
    return new Promise((resolve) => {
      port!.open((err) => {
        if (err) {
          console.error('[Serial] Failed to open port:', err.message);
          if (broadcastStatus) {
            broadcastStatus('error', `Serial port not available: ${err.message}`);
          }
          scheduleReconnect();
          resolve(false);
        } else {
          console.log(`[Serial] Connected to ${currentConfig.port}`);
          if (broadcastStatus) {
            broadcastStatus('info', `Connected to ${currentConfig.port}`);
          }
          resolve(true);
        }
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Serial] Connection failed:', message);
    if (broadcastStatus) {
      broadcastStatus('error', `Serial port not available: ${message}`);
    }
    scheduleReconnect();
    return false;
  }
}

/**
 * Schedule a reconnection attempt
 */
function scheduleReconnect(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  
  console.log('[Serial] Scheduling reconnect in 5 seconds...');
  reconnectTimer = setTimeout(() => {
    connectSerial();
  }, 5000);
}

/**
 * Close serial port connection
 */
export async function closeSerial(): Promise<void> {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  if (port && port.isOpen) {
    return new Promise((resolve) => {
      port!.close((err) => {
        if (err) {
          console.error('[Serial] Error closing port:', err.message);
        }
        port = null;
        parser = null;
        resolve();
      });
    });
  }
  
  port = null;
  parser = null;
}

/**
 * Update serial configuration and reconnect
 */
export async function updateSerialConfig(config: SerialConfig): Promise<boolean> {
  console.log(`[Serial] Updating config: port=${config.port}, baudRate=${config.baudRate}`);
  currentConfig = config;
  return connectSerial();
}

/**
 * Check if serial port is currently connected
 */
export function isSerialConnected(): boolean {
  return port !== null && port.isOpen;
}

/**
 * Get current serial configuration
 */
export function getSerialConfig(): SerialConfig {
  return { ...currentConfig };
}

/**
 * List available serial ports
 */
export async function listSerialPorts(): Promise<string[]> {
  try {
    const ports = await SerialPort.list();
    return ports.map(p => p.path);
  } catch (err) {
    console.error('[Serial] Failed to list ports:', err);
    return [];
  }
}

