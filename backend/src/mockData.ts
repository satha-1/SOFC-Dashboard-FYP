/**
 * Mock Data Generation for SOFC Metrics
 * 
 * Generates realistic mock data for SOFC performance parameters
 * that aren't available from the Arduino sensors.
 */

import { MockSofcMetrics, SofcReading } from './types.js';

/**
 * Generate a random number within a range
 */
function randomInRange(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Generate mock SOFC performance metrics
 * Values are based on typical SOFC operating parameters
 */
export function generateMockSofcMetrics(): MockSofcMetrics {
  const stackVoltage = randomInRange(0.6, 0.9, 3);  // Single cell ~0.7-0.8V
  const stackCurrent = randomInRange(5, 25, 2);     // Amps
  const stackPower = Number((stackVoltage * stackCurrent).toFixed(2));
  
  return {
    stackVoltage: stackVoltage * 10,  // Assume 10-cell stack
    stackCurrent,
    stackPower: stackPower * 10,
    electricalEfficiency: randomInRange(0.35, 0.60, 3),
    thermalEfficiency: randomInRange(0.15, 0.28, 3),
    fuelUtilization: randomInRange(0.70, 0.85, 3),
    airExcessRatio: randomInRange(2.0, 4.0, 2),  // Lambda
    stackHealth: randomInRange(75, 98, 1),
    cellTemperature: randomInRange(650, 780, 1),  // Typical SOFC operating temp
    fuelFlowRate: randomInRange(0.5, 2.5, 2),
    airFlowRate: randomInRange(5, 15, 2),
  };
}

/**
 * Generate efficiency data based on real sensor readings
 * Uses temperature and pressure data to create correlated efficiency estimates
 */
export function generateMockEfficiency(history: SofcReading[]): {
  electricalEfficiency: number;
  thermalEfficiency: number;
  stackHealth: number;
} {
  // Base efficiencies with some randomness
  let electricalEfficiency = randomInRange(0.35, 0.58, 3);
  let thermalEfficiency = randomInRange(0.12, 0.28, 3);
  let stackHealth = randomInRange(72, 98, 1);
  
  // If we have real data, use it to slightly influence the mock values
  if (history.length > 0) {
    const latestReading = history[history.length - 1];
    
    // Higher air temp slightly reduces efficiency (simplified model)
    if (latestReading.t_air > 30) {
      electricalEfficiency *= 0.98;
    }
    
    // Stable pressure indicates good stack health
    if (history.length > 10) {
      const recentPressures = history.slice(-10).map(r => r.p_air);
      const variance = calculateVariance(recentPressures);
      if (variance < 0.1) {
        stackHealth = Math.min(98, stackHealth + 2);
      }
    }
  }
  
  return {
    electricalEfficiency: Number(electricalEfficiency.toFixed(3)),
    thermalEfficiency: Number(thermalEfficiency.toFixed(3)),
    stackHealth: Number(stackHealth.toFixed(1)),
  };
}

/**
 * Generate mock I-V curve data for fuel cell performance visualization
 * Returns arrays of current, voltage, and power for plotting
 */
export function generateMockIVCurve(): {
  current: number[];
  voltage: number[];
  power: number[];
} {
  const current: number[] = [];
  const voltage: number[] = [];
  const power: number[] = [];
  
  // Open circuit voltage
  const ocv = randomInRange(1.0, 1.1, 3);
  
  // Generate I-V curve points (typical fuel cell behavior)
  for (let i = 0; i <= 50; i++) {
    const I = i * 0.5;  // Current from 0 to 25 A
    current.push(I);
    
    // Simplified fuel cell voltage model:
    // V = OCV - activation_loss - ohmic_loss - concentration_loss
    const activationLoss = 0.05 * Math.log(I + 0.1);
    const ohmicLoss = 0.008 * I;
    const concentrationLoss = 0.02 * Math.exp(0.08 * I) - 0.02;
    
    const V = Math.max(0.3, ocv - Math.abs(activationLoss) - ohmicLoss - concentrationLoss);
    voltage.push(Number(V.toFixed(3)));
    power.push(Number((V * I).toFixed(2)));
  }
  
  return { current, voltage, power };
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Generate demo readings for when Arduino is not connected
 */
export function generateDemoReading(): SofcReading {
  return {
    ts: new Date().toISOString(),
    t_water: randomInRange(24, 32, 2),
    t_air: randomInRange(22, 30, 2),
    p_air: randomInRange(1.5, 3.5, 2),
    p_water: randomInRange(2.0, 4.0, 2),
  };
}

