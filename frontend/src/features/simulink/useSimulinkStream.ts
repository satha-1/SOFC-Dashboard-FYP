/**
 * useSimulinkStream Hook
 * 
 * Manages Simulink data streaming from MATLAB via WebSocket and REST API.
 * Handles connection status, incoming samples, and maintains a local buffer
 * of historical data for charts.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { generateMockSimulinkTimeSeries, generateMockSimulinkSampleAtTime } from './mockSimulinkData';

export interface SimulinkSample {
  time: number;
  data: Record<string, number | null>;
}

export interface UseSimulinkStreamResult {
  samples: SimulinkSample[];
  fields: string[];
  latest: SimulinkSample | null;
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'live' | 'idle' | 'no-data';
  isDemoMode: boolean; // True if showing mock data instead of real data
}

const MAX_SAMPLES = 2000;

export function useSimulinkStream(): UseSimulinkStreamResult {
  const [samples, setSamples] = useState<SimulinkSample[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [latest, setLatest] = useState<SimulinkSample | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null); // Error state (setter not used, errors handled via console)
  const [connectionStatus, setConnectionStatus] = useState<'live' | 'idle' | 'no-data'>('no-data');
  
  const lastUpdateTimeRef = useRef<number>(0);

  // Extract unique field names from samples
  const updateFields = useCallback((newSamples: SimulinkSample[]) => {
    const fieldSet = new Set<string>();
    newSamples.forEach(sample => {
      Object.keys(sample.data).forEach(key => fieldSet.add(key));
    });
    const sortedFields = Array.from(fieldSet).sort();
    setFields(sortedFields);
  }, []);

  // Load initial history from REST API
  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/sim/history?limit=1000');
      const data = await response.json();
      
      if (data.status === 'ok' && Array.isArray(data.samples) && data.samples.length > 0) {
        // Real data available
        setSamples(data.samples);
        updateFields(data.samples);
        setLatest(data.samples[data.samples.length - 1]);
        setConnectionStatus('idle');
      } else {
        // No real data - generate mock demo data
        console.log('[Simulink] No real data found, generating mock SOFC simulation data...');
        const mockSamples = generateMockSimulinkTimeSeries(0, 100, 0.1);
        setSamples(mockSamples);
        updateFields(mockSamples);
        if (mockSamples.length > 0) {
          setLatest(mockSamples[mockSamples.length - 1]);
          setConnectionStatus('idle');
        }
      }
    } catch (err) {
      console.error('[Simulink] Failed to load history, using mock data:', err);
      // On error, still show mock data
      const mockSamples = generateMockSimulinkTimeSeries(0, 100, 0.1);
      setSamples(mockSamples);
      updateFields(mockSamples);
      if (mockSamples.length > 0) {
        setLatest(mockSamples[mockSamples.length - 1]);
        setConnectionStatus('idle');
      }
    } finally {
      setIsLoading(false);
    }
  }, [updateFields]);

  // Listen for Simulink samples from WebSocket (via custom event)
  useEffect(() => {
    const handleSimulinkMessage = (event: CustomEvent<SimulinkSample>) => {
      const sample = event.detail;
      setSamples(prev => {
        const newSamples = [...prev, sample];
        // Keep only last MAX_SAMPLES
        return newSamples.slice(-MAX_SAMPLES);
      });
      setLatest(sample);
      lastUpdateTimeRef.current = Date.now();
      setConnectionStatus('live');
      updateFields([sample]);
    };

    window.addEventListener('simulink-sample' as any, handleSimulinkMessage as EventListener);
    
    return () => {
      window.removeEventListener('simulink-sample' as any, handleSimulinkMessage as EventListener);
    };
  }, [updateFields]);

  // Demo mode: generate continuous mock data if no real data is coming
  useEffect(() => {
    // Check if we have real data (from WebSocket) or just mock data
    const hasRealData = lastUpdateTimeRef.current > 0;
    
    if (!hasRealData && samples.length > 0) {
      // Generate continuous mock data stream
      const demoInterval = setInterval(() => {
        const lastTime = samples.length > 0 ? samples[samples.length - 1].time : 0;
        const newTime = lastTime + 0.1; // Increment by 0.1 seconds
        const newSample = generateMockSimulinkSampleAtTime(newTime);
        
        setSamples(prev => {
          const updated = [...prev, newSample];
          // Keep last 1000 samples
          return updated.slice(-1000);
        });
        setLatest(newSample);
        updateFields([newSample]);
        setConnectionStatus('idle');
      }, 100); // Update every 100ms (10 samples per second)
      
      return () => clearInterval(demoInterval);
    }
  }, [samples.length, updateFields]);

  // Check connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdateTimeRef.current;
      if (samples.length === 0) {
        setConnectionStatus('no-data');
      } else if (timeSinceLastUpdate > 5000 && lastUpdateTimeRef.current > 0) {
        // Only set to idle if we had real data before
        setConnectionStatus('idle');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [samples.length]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Determine if we're in demo mode (no real WebSocket updates received)
  const isDemoMode = lastUpdateTimeRef.current === 0 && samples.length > 0;

  return {
    samples,
    fields,
    latest,
    isLoading,
    error,
    connectionStatus,
    isDemoMode,
  };
}

/**
 * Hook to get samples within a time range
 */
export function useSimulinkTimeRange(
  samples: SimulinkSample[],
  startTime: number,
  endTime: number
): SimulinkSample[] {
  return samples.filter(
    s => s.time >= startTime && s.time <= endTime
  );
}

