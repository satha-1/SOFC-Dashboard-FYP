/**
 * useThresholds Hook
 * 
 * Manages threshold values for sensor warnings.
 * Persists to localStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import { Thresholds, SofcReading } from '../types';

const STORAGE_KEY = 'sofc_thresholds';

const DEFAULT_THRESHOLDS: Thresholds = {
  maxWaterTemp: 35,
  maxAirTemp: 35,
  minAirPressure: 1.0,
  maxAirPressure: 4.5,
  minWaterPressure: 1.5,
  maxWaterPressure: 4.5,
};

interface UseThresholdsReturn {
  thresholds: Thresholds;
  setThresholds: (thresholds: Thresholds) => void;
  resetThresholds: () => void;
  checkReading: (reading: SofcReading) => ThresholdAlerts;
}

export interface ThresholdAlerts {
  t_water: 'normal' | 'warning' | 'critical';
  t_air: 'normal' | 'warning' | 'critical';
  p_air: 'normal' | 'warning' | 'critical';
  p_water: 'normal' | 'warning' | 'critical';
}

export function useThresholds(): UseThresholdsReturn {
  const [thresholds, setThresholdsState] = useState<Thresholds>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_THRESHOLDS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_THRESHOLDS;
      }
    }
    return DEFAULT_THRESHOLDS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds));
  }, [thresholds]);

  const setThresholds = useCallback((newThresholds: Thresholds) => {
    setThresholdsState(newThresholds);
  }, []);

  const resetThresholds = useCallback(() => {
    setThresholdsState(DEFAULT_THRESHOLDS);
  }, []);

  const checkReading = useCallback((reading: SofcReading): ThresholdAlerts => {
    const getStatus = (value: number, min: number | null, max: number): 'normal' | 'warning' | 'critical' => {
      if (min !== null && value < min * 0.9) return 'critical';
      if (value > max * 1.1) return 'critical';
      if (min !== null && value < min) return 'warning';
      if (value > max) return 'warning';
      return 'normal';
    };

    return {
      // Always show normal for temperatures (no warnings/critical)
      t_water: 'normal',
      t_air: 'normal',
      // Pressure sensors still use thresholds
      p_air: getStatus(reading.p_air, thresholds.minAirPressure, thresholds.maxAirPressure),
      p_water: getStatus(reading.p_water, thresholds.minWaterPressure, thresholds.maxWaterPressure),
    };
  }, [thresholds]);

  return {
    thresholds,
    setThresholds,
    resetThresholds,
    checkReading,
  };
}

