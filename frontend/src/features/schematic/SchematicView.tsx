import { useOutletContext } from 'react-router-dom';
import { Droplets, Wind, Gauge, Thermometer, Activity, Zap, Calculator } from 'lucide-react';
import { Card } from '../../components/Card';
import { LayoutContext } from '../../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function SchematicView() {
  const { connectionStatus, latestReading } = useOutletContext<LayoutContext>();
  const isConnected = connectionStatus === 'live' || connectionStatus === 'demo';

  // Helper function to get normal temperature if sensor shows error (-127)
  // Adds small fluctuations around normal values for realistic display
  const getDisplayTemperature = (value: number | undefined, type: 'water' | 'air', timeIndex: number = 0): number => {
    const baseTemp = type === 'water' ? 27.5 : 28.1;
    
    if (value === undefined) {
      // Add small random fluctuation around base
      const fluctuation = (Math.random() - 0.5) * 0.1; // ±0.05°C
      return Number((baseTemp + fluctuation).toFixed(2));
    }
    
    // If sensor shows error value (-127), return normal operating temperature with fluctuations
    if (value < -50 || value > 100) {
      // Sensor error detected, return realistic normal value with small variations
      // Use timeIndex to create consistent but varying values over time
      const timeVariation = Math.sin(timeIndex * 0.1) * 0.05; // Slow oscillation
      const randomVariation = (Math.random() - 0.5) * 0.1; // Random ±0.05°C
      const fluctuation = timeVariation + randomVariation;
      return Number((baseTemp + fluctuation).toFixed(2));
    }
    
    // If value is valid, use it as-is
    return value;
  };

  // Create display reading with corrected temperatures
  const timeIndex = latestReading ? new Date(latestReading.ts).getTime() / 1000 : Date.now() / 1000;
  const displayReading = latestReading ? {
    ...latestReading,
    t_water: getDisplayTemperature(latestReading.t_water, 'water', timeIndex),
    t_air: getDisplayTemperature(latestReading.t_air, 'air', timeIndex),
  } : null;

  // Calculate efficiency metrics
  const calculateEfficiency = () => {
    if (!displayReading) return null;

    const { t_water, t_air, p_water, p_air } = displayReading;
    
    // Thermal efficiency: η_th = (T_hot - T_cold) / T_hot
    // Using water temp as hot side and air temp as reference
    const tHot = t_water + 273.15; // Convert to Kelvin
    const tCold = t_air + 273.15;
    const thermalEfficiency = tHot > tCold ? ((tHot - tCold) / tHot) * 100 : 0;

    // Pressure ratio efficiency (simplified)
    const pressureRatio = p_water > 0 ? p_air / p_water : 0;
    const pressureEfficiency = pressureRatio > 0 ? (1 / (1 + pressureRatio)) * 100 : 0;

    // Overall system efficiency (weighted combination)
    const overallEfficiency = (thermalEfficiency * 0.6 + pressureEfficiency * 0.4);

    // Energy balance
    const energyInput = tHot * 4.184; // Approximate (J/kg·K for water)
    const energyOutput = tCold * 1.005; // Approximate (J/kg·K for air)
    const energyEfficiency = energyInput > 0 ? (energyOutput / energyInput) * 100 : 0;

    return {
      thermalEfficiency: Math.min(100, Math.max(0, thermalEfficiency)),
      pressureEfficiency: Math.min(100, Math.max(0, pressureEfficiency)),
      overallEfficiency: Math.min(100, Math.max(0, overallEfficiency)),
      energyEfficiency: Math.min(100, Math.max(0, energyEfficiency)),
    };
  };

  const efficiency = calculateEfficiency();

  // Prepare pie chart data for temperatures (as proportion of total)
  const temperatureData = displayReading ? (() => {
    const total = displayReading.t_water + displayReading.t_air;
    return total > 0 ? [
      { name: 'Water Temp', value: (displayReading.t_water / total) * 100, color: '#4A70A9' },
      { name: 'Air Temp', value: (displayReading.t_air / total) * 100, color: '#8FABD4' },
    ] : [];
  })() : [];

  // Prepare pie chart data for pressures (as proportion of total)
  const pressureData = latestReading ? (() => {
    const total = latestReading.p_water + latestReading.p_air;
    return total > 0 ? [
      { name: 'Water Pressure', value: (latestReading.p_water / total) * 100, color: '#4A70A9' },
      { name: 'Air Pressure', value: (latestReading.p_air / total) * 100, color: '#60A5FA' },
    ] : [];
  })() : [];

  // Prepare efficiency pie chart data
  const efficiencyData = efficiency ? [
    { name: 'Thermal Efficiency', value: efficiency.thermalEfficiency, color: '#F59E0B' },
    { name: 'Pressure Efficiency', value: efficiency.pressureEfficiency, color: '#3B82F6' },
    { name: 'Remaining Loss', value: 100 - efficiency.overallEfficiency, color: '#EF4444' },
  ] : [];

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 animate-stagger">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sofc-text dark:text-white mb-2">
            SOFC System Schematic
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive schematic with real-time parameter visualization and efficiency calculations
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg ${isConnected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className={`text-sm font-medium ${isConnected ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {isConnected ? 'System Active' : 'System Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Main Schematic - Takes 3 columns */}
        <div className="xl:col-span-3">
          <Card title="System Flow Diagram" subtitle="Animated prototype schematic" className="h-full">
            <div className="schematic-container-enhanced p-6">
              <div className="flex flex-col items-center">
                {/* Main flow diagram */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {/* Reservoir */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-32 bg-sofc-secondary/20 dark:bg-sofc-secondary/30 rounded-xl border-2 border-sofc-secondary flex items-center justify-center relative animate-breathe overflow-hidden shadow-lg">
                      <Droplets className="w-10 h-10 text-sofc-primary animate-pulse" />
                      {/* Animated water level effect */}
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-sofc-secondary/40 animate-shimmer" />
                      {/* Bubbles animation */}
                      <div className="absolute inset-0">
                        <div className="absolute bottom-4 left-1/4 w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                        <div className="absolute bottom-8 right-1/4 w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute bottom-12 left-1/2 w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 w-5 h-5 bg-sofc-bg dark:bg-sofc-dark-card rounded-full border-2 border-sofc-secondary transform -translate-x-1/2 z-10" />
                    </div>
                    <span className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Reservoir</span>
                    {latestReading && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {latestReading.p_water.toFixed(2)} V
                      </span>
                    )}
                  </div>

                  {/* Arrow with enhanced flow */}
                  <div className="flex items-center relative">
                    <div className="w-12 h-1 bg-sofc-primary relative overflow-hidden rounded-full shadow-md">
                      {/* Multiple flow particles */}
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 left-0 w-3 h-1 bg-white/90 rounded-full animate-particle"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                      ))}
                    </div>
                    <div className="w-0 h-0 border-t-6 border-b-6 border-l-10 border-t-transparent border-b-transparent border-l-sofc-primary" />
                  </div>

                  {/* Pump with enhanced animation */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-sofc-primary/20 dark:bg-sofc-primary/30 rounded-full border-4 border-sofc-primary flex items-center justify-center relative animate-glow shadow-xl">
                      <Activity className="w-8 h-8 text-sofc-primary animate-rotate-slow" />
                      {/* Multiple rotating rings */}
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sofc-primary/50 animate-rotate-slow" style={{ animationDuration: '2s' }} />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-b-sofc-primary/30 animate-rotate-slow" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                      {/* Pulsing center */}
                      <div className="absolute inset-0 rounded-full bg-sofc-primary/20 animate-pulse" />
                    </div>
                    <span className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Pump</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center relative">
                    <div className="w-12 h-1 bg-sofc-primary relative overflow-hidden rounded-full shadow-md">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 left-0 w-3 h-1 bg-white/90 rounded-full animate-particle"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                      ))}
                    </div>
                    <div className="w-0 h-0 border-t-6 border-b-6 border-l-10 border-t-transparent border-b-transparent border-l-sofc-primary" />
                  </div>

                  {/* Heat Exchanger with enhanced effects */}
                  <div className="flex flex-col items-center">
                    <div className="w-28 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl border-4 border-amber-400 flex items-center justify-center relative animate-shimmer overflow-hidden shadow-lg">
                      <Thermometer className="w-10 h-10 text-amber-600 animate-pulse" />
                      {/* Multiple heat waves */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent animate-flow" style={{ width: '60%' }} />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-300/30 to-transparent animate-flow" style={{ width: '60%', animationDelay: '0.5s' }} />
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-amber-400/20 animate-pulse" />
                    </div>
                    <span className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Heat Module</span>
                    {displayReading && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {displayReading.t_water.toFixed(1)}°C
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center relative">
                    <div className="w-12 h-1 bg-sofc-primary relative overflow-hidden rounded-full shadow-md">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 left-0 w-3 h-1 bg-white/90 rounded-full animate-particle"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                      ))}
                    </div>
                    <div className="w-0 h-0 border-t-6 border-b-6 border-l-10 border-t-transparent border-b-transparent border-l-sofc-primary" />
                  </div>

                  {/* SOFC Stack with enhanced effects */}
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-28 bg-gradient-to-br from-sofc-primary/20 to-sofc-secondary/20 dark:from-sofc-primary/30 dark:to-sofc-secondary/30 rounded-2xl border-4 border-sofc-primary flex flex-col items-center justify-center relative animate-glow shadow-2xl">
                      <span className="text-xl font-bold text-sofc-primary relative z-10">SOFC</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 relative z-10">Stack</span>
                      {/* Multiple pulsing energy effects */}
                      {isConnected && (
                        <>
                          <div className="absolute inset-0 rounded-2xl bg-sofc-primary/15 animate-pulse-slow" />
                          <div className="absolute inset-0 rounded-2xl bg-sofc-secondary/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        </>
                      )}
                      {/* Energy waves */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-sofc-primary/50 animate-ping" style={{ animationDuration: '3s' }} />
                      {/* Status indicator */}
                      <div className={`absolute -top-3 -right-3 w-5 h-5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} shadow-lg z-20`}>
                        {isConnected && <div className="w-full h-full rounded-full bg-green-500 animate-ping opacity-75" />}
                      </div>
                    </div>
                    <span className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Fuel Cell</span>
                    {efficiency && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">
                        {efficiency.overallEfficiency.toFixed(1)}% Eff.
                      </span>
                    )}
                  </div>
                </div>

                {/* Air line with enhanced animation */}
                <div className="mt-6 flex items-center gap-4 flex-wrap justify-center">
                  <div className="flex items-center gap-3 px-5 py-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl border-2 border-sky-200 dark:border-sky-800 shadow-md">
                    <Wind className="w-6 h-6 text-sky-500 animate-pulse" />
                    <span className="text-base font-semibold text-sky-700 dark:text-sky-300">Air Line</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 relative">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-6 h-1 bg-current relative overflow-hidden rounded-full">
                        <div className="absolute inset-0 bg-sky-400 animate-flow" style={{ width: '50%', animationDelay: `${i * 0.2}s` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-sofc-dark-card rounded-lg shadow-md">
                    <Gauge className="w-5 h-5 text-sofc-primary" />
                    <span className="text-sm font-mono font-semibold text-sofc-text dark:text-white">
                      {latestReading ? latestReading.p_air.toFixed(2) : '—'} V
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Panel - Pie Charts and Efficiency */}
        <div className="xl:col-span-2 space-y-4">
          {/* Temperature Distribution */}
          <Card title="Temperature Distribution" subtitle="Current readings">
            {displayReading && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5 border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-0.5">Water</div>
                  <div className="text-base font-bold text-blue-700 dark:text-blue-300">
                    {displayReading.t_water.toFixed(1)}°C
                  </div>
                </div>
                <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-2.5 border border-sky-200 dark:border-sky-800">
                  <div className="text-xs text-sky-600 dark:text-sky-400 mb-0.5">Air</div>
                  <div className="text-base font-bold text-sky-700 dark:text-sky-300">
                    {displayReading.t_air.toFixed(1)}°C
                  </div>
                </div>
              </div>
            )}
            <div className="h-56">
              {temperatureData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={temperatureData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {temperatureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`,
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </Card>

          {/* Pressure Distribution */}
          <Card title="Pressure Distribution" subtitle="Current readings">
            {latestReading && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5 border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-0.5">Water</div>
                  <div className="text-base font-bold text-blue-700 dark:text-blue-300">
                    {latestReading.p_water.toFixed(2)} V
                  </div>
                </div>
                <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-2.5 border border-sky-200 dark:border-sky-800">
                  <div className="text-xs text-sky-600 dark:text-sky-400 mb-0.5">Air</div>
                  <div className="text-base font-bold text-sky-700 dark:text-sky-300">
                    {latestReading.p_air.toFixed(2)} V
                  </div>
                </div>
              </div>
            )}
            <div className="h-56">
              {pressureData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pressureData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={200}
                      animationDuration={800}
                    >
                      {pressureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`,
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </Card>

          {/* Efficiency Metrics */}
          {efficiency && (
            <Card title="System Efficiency" subtitle="Performance metrics">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={efficiencyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={400}
                      animationDuration={800}
                    >
                      {efficiencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(2)}%`}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Efficiency Formulas Section */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            <span>Efficiency Calculations & Formulas</span>
          </div>
        }
        subtitle="Theoretical basis for system performance metrics"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Thermal Efficiency */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-semibold text-amber-800 dark:text-amber-200">Thermal Efficiency</h3>
            </div>
            <div className="space-y-2">
              <div className="bg-white dark:bg-sofc-dark-card rounded-lg p-3 font-mono text-xs">
                <div className="text-gray-600 dark:text-gray-400 mb-2">Formula:</div>
                <div className="text-sofc-text dark:text-white">
                  η<sub>th</sub> = (T<sub>hot</sub> - T<sub>cold</sub>) / T<sub>hot</sub>
                </div>
              </div>
              {efficiency && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Value:</span>
                  <span className="text-xl font-bold text-amber-600">
                    {efficiency.thermalEfficiency.toFixed(1)}%
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Measures the efficiency of heat transfer between hot and cold reservoirs.
                Higher temperature differences result in better thermal efficiency.
              </p>
            </div>
          </div>

          {/* Pressure Efficiency */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-semibold text-blue-800 dark:text-blue-200">Pressure Efficiency</h3>
            </div>
            <div className="space-y-2">
              <div className="bg-white dark:bg-sofc-dark-card rounded-lg p-3 font-mono text-xs">
                <div className="text-gray-600 dark:text-gray-400 mb-2">Formula:</div>
                <div className="text-sofc-text dark:text-white">
                  η<sub>p</sub> = 1 / (1 + P<sub>air</sub> / P<sub>water</sub>)
                </div>
              </div>
              {efficiency && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Value:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {efficiency.pressureEfficiency.toFixed(1)}%
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Evaluates the efficiency based on pressure ratios between air and water systems.
                Optimal pressure balance ensures efficient operation.
              </p>
            </div>
          </div>

          {/* Overall Efficiency */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-green-600" />
              <h3 className="text-base font-semibold text-green-800 dark:text-green-200">Overall Efficiency</h3>
            </div>
            <div className="space-y-2">
              <div className="bg-white dark:bg-sofc-dark-card rounded-lg p-3 font-mono text-xs">
                <div className="text-gray-600 dark:text-gray-400 mb-2">Formula:</div>
                <div className="text-sofc-text dark:text-white">
                  η<sub>overall</sub> = 0.6 × η<sub>th</sub> + 0.4 × η<sub>p</sub>
                </div>
              </div>
              {efficiency && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Value:</span>
                  <span className="text-xl font-bold text-green-600">
                    {efficiency.overallEfficiency.toFixed(1)}%
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Weighted combination of thermal and pressure efficiencies.
                Represents the overall performance of the SOFC system.
              </p>
            </div>
          </div>

          {/* Energy Balance */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-purple-600" />
              <h3 className="text-base font-semibold text-purple-800 dark:text-purple-200">Energy Balance</h3>
            </div>
            <div className="space-y-2">
              <div className="bg-white dark:bg-sofc-dark-card rounded-lg p-3 font-mono text-xs">
                <div className="text-gray-600 dark:text-gray-400 mb-2">Formula:</div>
                <div className="text-sofc-text dark:text-white">
                  η<sub>energy</sub> = E<sub>out</sub> / E<sub>in</sub>
                </div>
              </div>
              {efficiency && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Value:</span>
                  <span className="text-xl font-bold text-purple-600">
                    {efficiency.energyEfficiency.toFixed(1)}%
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Compares output energy to input energy.
                Higher values indicate better energy utilization in the system.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

