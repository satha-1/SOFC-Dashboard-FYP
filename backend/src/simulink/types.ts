/**
 * Type definitions for Simulink data streaming
 */

export interface SimulinkSample {
  time: number;
  data: Record<string, number | null>;
}

export interface SimulinkWebSocketMessage {
  type: 'simulink-sample';
  payload: SimulinkSample;
}

