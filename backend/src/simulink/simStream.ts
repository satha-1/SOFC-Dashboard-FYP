/**
 * Simulink Data Streaming Module
 * 
 * Handles incoming Simulink simulation data from MATLAB via HTTP POST.
 * Stores samples in memory and broadcasts to WebSocket clients.
 */

export interface SimulinkSample {
  time: number;  // scalar, seconds
  data: Record<string, number | null>;  // keys come from safeLabels (MATLAB scope signals)
}

export interface SimulinkStreamState {
  samples: SimulinkSample[];
  maxSamples: number;
}

// In-memory storage for Simulink samples
export const simState: SimulinkStreamState = {
  samples: [],
  maxSamples: 2000,
};

// Callback function for broadcasting new samples via WebSocket
let broadcastFn: ((sample: SimulinkSample) => void) | null = null;

/**
 * Set the broadcast function for WebSocket updates
 */
export function setBroadcastFunction(fn: (sample: SimulinkSample) => void): void {
  broadcastFn = fn;
}

/**
 * Add a new Simulink sample to storage
 * Maintains a maximum of maxSamples entries (FIFO ring buffer)
 */
export function addSimulinkSample(sample: SimulinkSample): void {
  // Validate sample
  if (typeof sample.time !== 'number' || !sample.data || typeof sample.data !== 'object') {
    console.warn('[Simulink] Invalid sample format:', sample);
    return;
  }

  // Add to storage
  simState.samples.push(sample);

  // Remove oldest samples if we exceed the limit
  while (simState.samples.length > simState.maxSamples) {
    simState.samples.shift();
  }

  // Broadcast to WebSocket clients
  if (broadcastFn) {
    broadcastFn(sample);
  }

  console.log(`[Simulink] Sample added: time=${sample.time}s, signals=${Object.keys(sample.data).length}`);
}

/**
 * Get historical Simulink samples
 * @param limit - Maximum number of samples to return (default: all)
 */
export function getSimulinkHistory(limit?: number): SimulinkSample[] {
  if (limit === undefined) {
    return [...simState.samples];
  }
  const count = Math.min(limit, simState.samples.length);
  return simState.samples.slice(-count);
}

/**
 * Get the most recent Simulink sample
 */
export function getLatestSimulinkSample(): SimulinkSample | null {
  return simState.samples.length > 0 
    ? simState.samples[simState.samples.length - 1] 
    : null;
}

/**
 * Get all unique field names (signal names) from stored samples
 */
export function getSimulinkFields(): string[] {
  const fieldSet = new Set<string>();
  simState.samples.forEach(sample => {
    Object.keys(sample.data).forEach(key => fieldSet.add(key));
  });
  return Array.from(fieldSet).sort();
}

/**
 * Clear all Simulink samples (useful for testing or reset)
 */
export function clearSimulinkSamples(): void {
  simState.samples.length = 0;
}

/**
 * Get total number of samples in storage
 */
export function getSimulinkSampleCount(): number {
  return simState.samples.length;
}

