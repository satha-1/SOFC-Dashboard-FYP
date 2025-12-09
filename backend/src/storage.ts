/**
 * In-Memory Storage for SOFC Readings
 * 
 * Simple circular buffer that stores the last N readings.
 * No database required - data is held in memory.
 */

import { SofcReading } from './types.js';

const MAX_READINGS = 500;
const readings: SofcReading[] = [];

/**
 * Add a new reading to storage
 * Maintains a maximum of MAX_READINGS entries (FIFO)
 */
export function addReading(reading: SofcReading): void {
  readings.push(reading);
  
  // Remove oldest readings if we exceed the limit
  while (readings.length > MAX_READINGS) {
    readings.shift();
  }
}

/**
 * Get the most recent reading
 */
export function getLatestReading(): SofcReading | null {
  return readings.length > 0 ? readings[readings.length - 1] : null;
}

/**
 * Get recent readings history
 * @param limit - Maximum number of readings to return (default: 100)
 */
export function getReadingsHistory(limit: number = 100): SofcReading[] {
  const count = Math.min(limit, readings.length);
  return readings.slice(-count);
}

/**
 * Clear all readings (useful for testing or reset)
 */
export function clearReadings(): void {
  readings.length = 0;
}

/**
 * Get total number of readings in storage
 */
export function getReadingsCount(): number {
  return readings.length;
}

