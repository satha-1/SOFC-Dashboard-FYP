/**
 * Mock Simulink Data Generator
 * 
 * Generates realistic SOFC simulation data based on typical operating parameters.
 * Used for demonstration when no real MATLAB data is available.
 */

export interface SimulinkSample {
  time: number;
  data: Record<string, number | null>;
}

/**
 * Generate realistic SOFC simulation data
 * Based on actual SOFC operating conditions:
 * - Stack voltage: 8.7V (10-cell stack, 0.87V per cell)
 * - Stack current: 5A
 * - Stack power: 4.4W
 * - Electrical efficiency: 71%
 * - Air flow: responds to current
 * - Fuel flow: responds to current
 * - Temperature: 650-800°C
 */
export function generateMockSimulinkData(time: number): SimulinkSample {
  // Base operating point (steady-state values from actual SOFC)
  const baseCellV = 0.87; // Volts per cell
  const baseStackI = 5.0; // Amps
  const baseStackP = 4.4; // Watts (total stack power)
  const baseEfficiency = 0.71; // 71%
  
  // Derived values based on relationships
  const baseAirFlow = 8.0; // L/min (scaled for 5A current)
  const baseFuelFlow = 1.8; // L/min (scaled for 5A current)
  const baseTemp = 720; // °C (typical for this operating point)
  const baseFuelUtil = 0.75; // 75% (typical for this efficiency)
  const baseLambda = 3.0; // Air excess ratio
  
  // Small load variations (slight fluctuations around base values)
  const loadVariation = Math.sin(time * 0.1) * 0.03 + Math.sin(time * 0.05) * 0.02;
  
  // Temperature dynamics (thermal inertia)
  const tempRise = time < 30 ? (time / 30) * 0.2 : 0;
  const tempVariation = Math.sin(time * 0.02) * 3;
  
  // Random noise (small variations - ±2% for voltage/current, ±1% for efficiency)
  const noise = () => (Math.random() - 0.5) * 0.02;
  const efficiencyNoise = () => (Math.random() - 0.5) * 0.01;
  
  // Calculate values with realistic relationships and slight fluctuations
  // Voltage: 0.87V per cell ± 2% variation
  const cellV = baseCellV * (1 + loadVariation * 0.5 + noise());
  const stackV = cellV * 10; // Total stack voltage
  
  // Current: 5A ± 2% variation (no startup ramp, starts at 5A)
  const stackI = baseStackI * (1 + loadVariation + noise());
  
  // Power: 4.4W ± 3% variation (fluctuates around base value)
  // Power = V × I, so we adjust to maintain ~4.4W while allowing slight variations
  const calculatedPower = stackV * stackI;
  const powerVariation = (calculatedPower / baseStackP - 1) * 0.3; // Dampen variation
  const stackP = baseStackP * (1 + powerVariation + noise() * 0.5);
  
  // Air flow responds to current (more current = more air needed)
  const airFlow = baseAirFlow * (1 + (stackI / baseStackI - 1) * 0.8 + noise());
  
  // Fuel flow responds to current
  const fuelFlow = baseFuelFlow * (1 + (stackI / baseStackI - 1) * 0.6 + noise());
  
  // Temperature increases with current (more heat generation)
  const temperature = baseTemp + tempRise * 100 + (stackI / baseStackI - 1) * 15 + tempVariation;
  
  // Efficiency: 71% ± 1% variation (slight decrease with higher current)
  const efficiency = baseEfficiency * (1 - (stackI / baseStackI - 1) * 0.05 + efficiencyNoise());
  
  // Fuel utilization increases with current
  const fuelUtil = baseFuelUtil * (1 + (stackI / baseStackI - 1) * 0.15 + noise());
  const fuelUtilPercent = Math.min(95, fuelUtil * 100);
  
  // Air excess ratio (lambda) - inverse relationship with fuel flow
  const lambda = baseLambda * (1 - (fuelFlow / baseFuelFlow - 1) * 0.2 + noise());
  
  // Cell voltage (average per cell)
  const cellVoltage = stackV / 10;
  
  // Current density (assuming 100 cm² active area per cell)
  const currentDensity = (stackI / 10) / 0.01; // A/cm²
  
  // Power density
  const powerDensity = stackP / (10 * 0.01); // W/cm²
  
  // Thermal efficiency (typically 10-30%)
  const thermalEfficiency = 0.15 + (temperature - baseTemp) / 1000 + noise() * 0.05;
  
  // Return data structure matching Simulink format
  return {
    time: time,
    data: {
      // Primary signals (most common in SOFC simulations)
      'StackVoltage': Number(stackV.toFixed(3)),
      'StackCurrent': Number(stackI.toFixed(3)),
      'StackPower': Number(stackP.toFixed(2)),
      'AirFlowRate': Number(airFlow.toFixed(3)),
      'FuelFlowRate': Number(fuelFlow.toFixed(3)),
      'CellTemperature': Number(temperature.toFixed(1)),
      
      // Performance metrics
      'ElectricalEfficiency': Number(efficiency.toFixed(4)),
      'ThermalEfficiency': Number(thermalEfficiency.toFixed(4)),
      'FuelUtilization': Number(fuelUtil.toFixed(4)),
      'FuelUtilizationPercent': Number(fuelUtilPercent.toFixed(2)),
      'AirExcessRatio': Number(lambda.toFixed(3)),
      
      // Per-cell metrics
      'CellVoltage': Number(cellVoltage.toFixed(4)),
      'CurrentDensity': Number(currentDensity.toFixed(2)),
      'PowerDensity': Number(powerDensity.toFixed(2)),
      
      // Additional common signals
      'StackVoltage_V': Number(stackV.toFixed(3)),
      'StackCurrent_A': Number(stackI.toFixed(3)),
      'StackPower_W': Number(stackP.toFixed(2)),
      'Temperature_C': Number(temperature.toFixed(1)),
      
      // Alternative naming conventions
      'V_stack': Number(stackV.toFixed(3)),
      'I_stack': Number(stackI.toFixed(3)),
      'P_stack': Number(stackP.toFixed(2)),
      'T_cell': Number(temperature.toFixed(1)),
      'air_flow': Number(airFlow.toFixed(3)),
      'fuel_flow': Number(fuelFlow.toFixed(3)),
    },
  };
}

/**
 * Generate a time series of mock Simulink data
 * @param startTime - Starting time in seconds
 * @param endTime - Ending time in seconds
 * @param timeStep - Time step in seconds (default: 0.1)
 */
export function generateMockSimulinkTimeSeries(
  startTime: number = 0,
  endTime: number = 100,
  timeStep: number = 0.1
): SimulinkSample[] {
  const samples: SimulinkSample[] = [];
  
  for (let t = startTime; t <= endTime; t += timeStep) {
    samples.push(generateMockSimulinkData(t));
  }
  
  return samples;
}

/**
 * Generate a single sample at current time (for real-time demo)
 */
export function generateMockSimulinkSampleAtTime(time: number): SimulinkSample {
  return generateMockSimulinkData(time);
}

