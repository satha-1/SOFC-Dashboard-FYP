import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Zap, Flame, Battery, Percent, Activity } from 'lucide-react';
import { Card, StatCard } from '../../components/Card';
import { IVCurveChart, HistogramChart } from '../../components/Charts';
import { LayoutContext } from '../../components/Layout';

// Mock data generation
function generateMockEfficiency() {
  return {
    electricalEfficiency: 0.35 + Math.random() * 0.25,
    thermalEfficiency: 0.12 + Math.random() * 0.16,
    stackHealth: 72 + Math.random() * 26,
  };
}

function generateMockIVCurve() {
  const current: number[] = [];
  const voltage: number[] = [];
  const power: number[] = [];
  
  const ocv = 1.0 + Math.random() * 0.1;
  
  for (let i = 0; i <= 50; i++) {
    const I = i * 0.5;
    current.push(I);
    
    const activationLoss = 0.05 * Math.log(I + 0.1);
    const ohmicLoss = 0.008 * I;
    const concentrationLoss = 0.02 * Math.exp(0.08 * I) - 0.02;
    
    const V = Math.max(0.3, ocv - Math.abs(activationLoss) - ohmicLoss - concentrationLoss);
    voltage.push(Number(V.toFixed(3)));
    power.push(Number((V * I).toFixed(2)));
  }
  
  return { current, voltage, power };
}

function generateTempHistogram(history: { t_water: number; t_air: number }[]) {
  const bins: Record<string, number> = {
    '20-22': 0,
    '22-24': 0,
    '24-26': 0,
    '26-28': 0,
    '28-30': 0,
    '30-32': 0,
    '32-34': 0,
    '34+': 0,
  };
  
  history.forEach(r => {
    const temp = (r.t_water + r.t_air) / 2;
    if (temp < 22) bins['20-22']++;
    else if (temp < 24) bins['22-24']++;
    else if (temp < 26) bins['24-26']++;
    else if (temp < 28) bins['26-28']++;
    else if (temp < 30) bins['28-30']++;
    else if (temp < 32) bins['30-32']++;
    else if (temp < 34) bins['32-34']++;
    else bins['34+']++;
  });
  
  // Add some mock data if history is small
  if (history.length < 50) {
    bins['24-26'] += 15;
    bins['26-28'] += 25;
    bins['28-30'] += 20;
    bins['30-32'] += 10;
  }
  
  return Object.entries(bins).map(([range, count]) => ({ range, count }));
}

export default function Analytics() {
  const { history } = useOutletContext<LayoutContext>();
  const [timeRange, setTimeRange] = useState('10min');
  const [efficiency, setEfficiency] = useState(generateMockEfficiency);
  const [ivCurve] = useState(generateMockIVCurve);

  // Regenerate efficiency data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setEfficiency(generateMockEfficiency());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const histogramData = generateTempHistogram(history);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Date Range
          </label>
          <input
            type="date"
            className="px-3 py-2 text-sm"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Aggregation
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-sm min-w-32"
          >
            <option value="10min">Last 10 min</option>
            <option value="1hour">Last hour</option>
            <option value="today">Today</option>
          </select>
        </div>
      </div>

      {/* Efficiency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Zap className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Electrical Efficiency
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {(efficiency.electricalEfficiency * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                Typical: 35-60%
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                Thermal Efficiency
              </p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {(efficiency.thermalEfficiency * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                Typical: 12-28%
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Battery className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Stack Health
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {efficiency.stackHealth.toFixed(1)}%
              </p>
              <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                Good condition
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Temperature Distribution" subtitle="Histogram of average temperatures">
          <div className="chart-container">
            <HistogramChart data={histogramData} color="#4A70A9" />
          </div>
        </Card>

        <Card title="I-V Polarization Curve" subtitle="Voltage and power vs current (mock data)">
          <div className="chart-container">
            <IVCurveChart data={ivCurve} />
          </div>
        </Card>
      </div>

      {/* Additional Mock Metrics */}
      <Card title="Performance Metrics" subtitle="Estimated SOFC operating parameters">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-sofc-dark-bg rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-sofc-primary" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Fuel Utilization</span>
            </div>
            <p className="text-2xl font-bold text-sofc-text dark:text-white">
              {(70 + Math.random() * 15).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-sofc-dark-bg rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-sofc-primary" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Air Excess (λ)</span>
            </div>
            <p className="text-2xl font-bold text-sofc-text dark:text-white">
              {(2 + Math.random() * 2).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-sofc-dark-bg rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-sofc-primary" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Stack Power</span>
            </div>
            <p className="text-2xl font-bold text-sofc-text dark:text-white">
              {(50 + Math.random() * 100).toFixed(1)} W
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-sofc-dark-bg rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-sofc-primary" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Cell Temp</span>
            </div>
            <p className="text-2xl font-bold text-sofc-text dark:text-white">
              {(650 + Math.random() * 130).toFixed(0)} °C
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

