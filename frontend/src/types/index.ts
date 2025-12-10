/**
 * SOFC Monitoring System - Frontend Type Definitions
 */

// Reading from Arduino (with timestamp)
export interface SofcReading {
  ts: string;
  t_water: number;
  t_air: number;
  p_air: number;
  p_water: number;
}

// WebSocket message types
export interface WsReadingMessage {
  type: 'reading';
  data: SofcReading;
}

export interface WsStatusMessage {
  type: 'status';
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface WsHistoryMessage {
  type: 'history';
  data: SofcReading[];
}

export interface WsSimulinkMessage {
  type: 'simulink-sample';
  payload: {
    time: number;
    data: Record<string, number | null>;
  };
}

export type WsMessage = WsReadingMessage | WsStatusMessage | WsHistoryMessage | WsSimulinkMessage;

// Connection status
export type ConnectionStatus = 'connecting' | 'live' | 'disconnected' | 'demo';

// Mock SOFC metrics
export interface MockSofcMetrics {
  stackVoltage: number;
  stackCurrent: number;
  stackPower: number;
  electricalEfficiency: number;
  thermalEfficiency: number;
  fuelUtilization: number;
  airExcessRatio: number;
  stackHealth: number;
  cellTemperature: number;
  fuelFlowRate: number;
  airFlowRate: number;
}

// I-V Curve data
export interface IVCurveData {
  current: number[];
  voltage: number[];
  power: number[];
}

// User type for auth
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Operator' | 'Student';
}

// Thresholds for warnings
export interface Thresholds {
  maxWaterTemp: number;
  maxAirTemp: number;
  minAirPressure: number;
  maxAirPressure: number;
  minWaterPressure: number;
  maxWaterPressure: number;
}

// Mock user activity
export interface UserActivity {
  id: string;
  username: string;
  role: 'Admin' | 'Operator' | 'Student';
  lastLogin: string;
  sessions: number;
  lastAction: string;
}

// Report form data
export interface ReportFormData {
  startDate: string;
  endDate: string;
  reportType: 'daily' | 'experiment' | 'maintenance';
  notes: string;
}

