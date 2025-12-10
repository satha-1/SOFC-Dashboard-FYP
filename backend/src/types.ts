/**
 * SOFC Monitoring System - Type Definitions
 * 
 * These types define the data structures used throughout the application
 * for Arduino sensor readings, WebSocket messages, and mock SOFC metrics.
 */

// Raw reading from Arduino (4 sensor values)
export interface ArduinoReading {
  t_water: number;  // Water temperature in °C
  t_air: number;    // Air temperature in °C
  p_air: number;    // Air pressure (0-5V or mapped units)
  p_water: number;  // Water pressure (0-5V or mapped units)
}

// Reading with server-added timestamp
export interface SofcReading extends ArduinoReading {
  ts: string;  // ISO timestamp added by server
}

// WebSocket message types
export type WsMessageType = 'reading' | 'status' | 'history' | 'simulink-sample';

// WebSocket message for new readings
export interface WsReadingMessage {
  type: 'reading';
  data: SofcReading;
}

// WebSocket status message (connection status, errors, etc.)
export interface WsStatusMessage {
  type: 'status';
  level: 'info' | 'warning' | 'error';
  message: string;
}

// WebSocket history message (initial batch of readings)
export interface WsHistoryMessage {
  type: 'history';
  data: SofcReading[];
}

// WebSocket message for Simulink samples
export interface WsSimulinkMessage {
  type: 'simulink-sample';
  payload: {
    time: number;
    data: Record<string, number | null>;
  };
}

export type WsMessage = WsReadingMessage | WsStatusMessage | WsHistoryMessage | WsSimulinkMessage;

// Mock SOFC performance metrics
export interface MockSofcMetrics {
  stackVoltage: number;        // Volts
  stackCurrent: number;        // Amps
  stackPower: number;          // Watts
  electricalEfficiency: number; // 0-1 (30-65%)
  thermalEfficiency: number;   // 0-1 (10-30%)
  fuelUtilization: number;     // 0-1 (typically 70-85%)
  airExcessRatio: number;      // Lambda (typically 2-4)
  stackHealth: number;         // Percentage 70-100%
  cellTemperature: number;     // °C (typically 600-800°C for SOFC)
  fuelFlowRate: number;        // L/min
  airFlowRate: number;         // L/min
}

// Serial port configuration
export interface SerialConfig {
  port: string;
  baudRate: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

