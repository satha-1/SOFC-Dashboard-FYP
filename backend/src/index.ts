/**
 * SOFC Monitoring Backend Server
 * 
 * Main entry point for the backend application.
 * Sets up Express HTTP API, WebSocket server, and Serial port communication.
 * 
 * Data Flow:
 * Arduino (Serial) --> Backend --> WebSocket --> React Frontend
 *                  --> REST API (for historical data)
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';

import { initWebSocket, broadcastReading, broadcastStatus, broadcastSimulinkSample } from './websocket.js';
import { initSerial, updateSerialConfig, isSerialConnected, getSerialConfig, listSerialPorts } from './serial.js';
import { getLatestReading, getReadingsHistory } from './storage.js';
import { generateMockSofcMetrics, generateMockIVCurve, generateDemoReading } from './mockData.js';
import { SofcReading, SerialConfig, ApiResponse } from './types.js';
import {
  addSimulinkSample,
  getSimulinkHistory,
  getLatestSimulinkSample,
  getSimulinkFields,
  getSimulinkSampleCount,
  setBroadcastFunction,
} from './simulink/simStream.js';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const SERIAL_PORT = process.env.SERIAL_PORT || 'COM8';
const SERIAL_BAUD = parseInt(process.env.SERIAL_BAUD || '9600', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Initialize Express app
const app = express();
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket
initWebSocket(server);

// Demo mode interval (generates fake readings when Arduino not connected)
let demoInterval: NodeJS.Timeout | null = null;

function startDemoMode(): void {
  if (demoInterval) return;
  
  console.log('[Demo] Starting demo mode - generating fake readings');
  broadcastStatus('warning', 'Running in demo mode - no Arduino connected');
  
  demoInterval = setInterval(() => {
    if (!isSerialConnected()) {
      const reading = generateDemoReading();
      broadcastReading(reading);
    }
  }, 1000);
}

function stopDemoMode(): void {
  if (demoInterval) {
    clearInterval(demoInterval);
    demoInterval = null;
    console.log('[Demo] Demo mode stopped');
  }
}

// ============ REST API Routes ============

/**
 * GET /api/readings/latest
 * Returns the most recent reading
 */
app.get('/api/readings/latest', (_req: Request, res: Response) => {
  const reading = getLatestReading();
  const response: ApiResponse<SofcReading | null> = {
    success: true,
    data: reading,
  };
  res.json(response);
});

/**
 * GET /api/readings/history
 * Returns historical readings
 * Query params: limit (default 100)
 */
app.get('/api/readings/history', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const history = getReadingsHistory(limit);
  const response: ApiResponse<SofcReading[]> = {
    success: true,
    data: history,
  };
  res.json(response);
});

/**
 * GET /api/mock-sofc-metrics
 * Returns mock SOFC performance metrics
 */
app.get('/api/mock-sofc-metrics', (_req: Request, res: Response) => {
  const metrics = generateMockSofcMetrics();
  res.json({ success: true, data: metrics });
});

/**
 * GET /api/mock-iv-curve
 * Returns mock I-V curve data for fuel cell
 */
app.get('/api/mock-iv-curve', (_req: Request, res: Response) => {
  const curve = generateMockIVCurve();
  res.json({ success: true, data: curve });
});

/**
 * GET /api/status
 * Returns server status including serial connection
 */
app.get('/api/status', async (_req: Request, res: Response) => {
  const ports = await listSerialPorts();
  res.json({
    success: true,
    data: {
      serialConnected: isSerialConnected(),
      serialConfig: getSerialConfig(),
      availablePorts: ports,
      demoMode: !isSerialConnected(),
    },
  });
});

/**
 * POST /api/settings/serial
 * Update serial port configuration
 */
app.post('/api/settings/serial', async (req: Request, res: Response) => {
  const { port, baudRate } = req.body;
  
  if (!port || typeof port !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Invalid port parameter',
    });
    return;
  }
  
  const config: SerialConfig = {
    port,
    baudRate: baudRate || 9600,
  };
  
  try {
    const connected = await updateSerialConfig(config);
    
    if (connected) {
      stopDemoMode();
    } else {
      startDemoMode();
    }
    
    res.json({
      success: true,
      data: {
        connected,
        config,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

/**
 * GET /api/ports
 * List available serial ports
 */
app.get('/api/ports', async (_req: Request, res: Response) => {
  const ports = await listSerialPorts();
  res.json({
    success: true,
    data: ports,
  });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ Simulink Data Routes ============

/**
 * POST /data
 * Endpoint that MATLAB calls from data_extract_YSZ.m
 * Receives Simulink simulation data
 */
app.post('/data', (req: Request, res: Response) => {
  const body = req.body;
  
  // Validate payload structure
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof body.time !== 'number' ||
    typeof body.data !== 'object' ||
    body.data === null
  ) {
    console.warn('[Simulink] Invalid payload received:', body);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload. Expected: { time: number, data: { ... } }',
    });
  }
  
  const sample = {
    time: body.time,
    data: body.data,
  };
  
  addSimulinkSample(sample);
  
  // Log first few samples for debugging
  const sampleCount = getSimulinkSampleCount();
  if (sampleCount <= 3) {
    console.log(`[Simulink] Sample ${sampleCount}: time=${sample.time.toFixed(3)}s, signals=${Object.keys(sample.data).length}`);
    if (sampleCount === 1) {
      console.log(`[Simulink] Signal names: ${Object.keys(sample.data).slice(0, 10).join(', ')}${Object.keys(sample.data).length > 10 ? '...' : ''}`);
    }
  }
  
  return res.json({ status: 'ok' });
});

/**
 * POST /api/sim-data (alternative endpoint)
 * Same as /data but with API prefix
 */
app.post('/api/sim-data', (req: Request, res: Response) => {
  const body = req.body;
  
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof body.time !== 'number' ||
    typeof body.data !== 'object' ||
    body.data === null
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload. Expected: { time: number, data: { ... } }',
    });
  }
  
  const sample = {
    time: body.time,
    data: body.data,
  };
  
  addSimulinkSample(sample);
  
  return res.json({ status: 'ok' });
});

/**
 * GET /api/sim/history
 * Returns historical Simulink samples
 * Query params: limit (default: all)
 */
app.get('/api/sim/history', (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const samples = getSimulinkHistory(limit);
  res.json({ status: 'ok', samples });
});

/**
 * GET /api/sim/latest
 * Returns the most recent Simulink sample
 */
app.get('/api/sim/latest', (_req: Request, res: Response) => {
  const sample = getLatestSimulinkSample();
  res.json({ status: 'ok', sample });
});

/**
 * GET /api/sim/fields
 * Returns all unique field names (signal names) from Simulink data
 */
app.get('/api/sim/fields', (_req: Request, res: Response) => {
  const fields = getSimulinkFields();
  res.json({ status: 'ok', fields });
});

// ============ Start Server ============

async function start(): Promise<void> {
  // Start HTTP server
  server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         SOFC Fuel Cell Monitoring - Backend Server         ║
╠════════════════════════════════════════════════════════════╣
║  HTTP API:    http://localhost:${PORT}                       ║
║  WebSocket:   ws://localhost:${PORT}/ws                      ║
║  Serial Port: ${SERIAL_PORT.padEnd(42)}║
║  Baud Rate:   ${String(SERIAL_BAUD).padEnd(42)}║
╚════════════════════════════════════════════════════════════╝
    `);
  });
  
  // Initialize serial port connection
  const serialConfig: SerialConfig = {
    port: SERIAL_PORT,
    baudRate: SERIAL_BAUD,
  };
  
  const serialConnected = await initSerial(
    serialConfig,
    broadcastReading,
    broadcastStatus
  );
  
  // Start demo mode if serial not connected
  if (!serialConnected) {
    startDemoMode();
  }
  
  // Initialize Simulink broadcast function
  setBroadcastFunction(broadcastSimulinkSample);
  console.log('[Simulink] Data streaming endpoint ready at POST /data');
  console.log('[Simulink] MATLAB script should POST to: http://localhost:' + PORT + '/data');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down...');
  stopDemoMode();
  server.close(() => {
    console.log('[Server] Goodbye!');
    process.exit(0);
  });
});

// Start the server
start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});

