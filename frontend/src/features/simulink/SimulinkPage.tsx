import { useMemo } from 'react';
import { TrendingUp, Activity, Zap, Wind, Gauge, AlertCircle, Thermometer } from 'lucide-react';
import { Card, StatCard } from '../../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSimulinkStream } from './useSimulinkStream';

export default function SimulinkPage() {
  const { samples, fields, latest, isLoading, error, connectionStatus, isDemoMode } = useSimulinkStream();

  // Build chart data
  const chartData = useMemo(() => {
    return samples.map(sample => ({
      time: sample.time,
      ...sample.data,
    }));
  }, [samples]);

  // Get status badge
  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'live':
        return (
          <span className="badge-live">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        );
      case 'idle':
        return (
          <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            IDLE
          </span>
        );
      default:
        return (
          <span className="badge-disconnected">
            <AlertCircle className="w-3 h-3" />
            NO DATA
          </span>
        );
    }
  };

  // Find common signal names (case-insensitive)
  const stackV = fields.find(f => 
    f.toLowerCase().includes('stackv') || 
    f.toLowerCase().includes('voltage') ||
    f.toLowerCase().includes('v_stack')
  );
  const stackI = fields.find(f => 
    f.toLowerCase() === 'stackcurrent' ||
    f.toLowerCase() === 'i_stack' ||
    f.toLowerCase().includes('stackcurrent') ||
    f.toLowerCase().includes('stack_i') ||
    (f.toLowerCase().includes('current') && !f.toLowerCase().includes('density'))
  );
  const airFlow = fields.find(f => 
    f.toLowerCase().includes('airflow') || 
    f.toLowerCase().includes('air_flow') ||
    f.toLowerCase().includes('airflowrate')
  );
  const fuelFlow = fields.find(f => 
    f.toLowerCase().includes('fuelflow') || 
    f.toLowerCase().includes('fuel_flow') ||
    f.toLowerCase().includes('fuelflowrate')
  );
  const power = fields.find(f => 
    f.toLowerCase().includes('power') || 
    f.toLowerCase().includes('p_stack')
  );
  const temperature = fields.find(f => 
    f.toLowerCase().includes('temperature') || 
    f.toLowerCase().includes('temp') ||
    f.toLowerCase().includes('t_cell')
  );
  const efficiency = fields.find(f => 
    f.toLowerCase().includes('efficiency') && 
    !f.toLowerCase().includes('thermal')
  );
  const fuelUtil = fields.find(f => 
    f.toLowerCase().includes('fuelutil') || 
    f.toLowerCase().includes('fuel_util')
  );
  const lambda = fields.find(f => 
    f.toLowerCase().includes('lambda') || 
    f.toLowerCase().includes('airexcess') ||
    f.toLowerCase().includes('air_excess')
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sofc-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sofc-text dark:text-white">
            Simulink SOFC Model
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Streaming Simulink scope data into the dashboard
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Stats Cards - Row 1: Primary Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Last Time Step"
          value={latest?.time !== undefined ? latest.time.toFixed(2) : '—'}
          unit="s"
          icon={<Activity className="w-6 h-6" />}
        />
        {stackV && (
          <StatCard
            label="Stack Voltage"
            value={latest?.data[stackV] !== null && latest?.data[stackV] !== undefined 
              ? latest.data[stackV]!.toFixed(2) 
              : '—'}
            unit="V"
            icon={<Zap className="w-6 h-6" />}
          />
        )}
        {stackI && (
          <StatCard
            label="Stack Current"
            value={latest?.data[stackI] !== null && latest?.data[stackI] !== undefined 
              ? latest.data[stackI]!.toFixed(2) 
              : '—'}
            unit="A"
            icon={<TrendingUp className="w-6 h-6" />}
          />
        )}
        {power && (
          <StatCard
            label="Stack Power"
            value={latest?.data[power] !== null && latest?.data[power] !== undefined 
              ? latest.data[power]!.toFixed(2) 
              : '—'}
            unit="W"
            icon={<Gauge className="w-6 h-6" />}
          />
        )}
      </div>

      {/* Stats Cards - Row 2: Performance & Flow Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {temperature && (
          <StatCard
            label="Cell Temperature"
            value={latest?.data[temperature] !== null && latest?.data[temperature] !== undefined 
              ? latest.data[temperature]!.toFixed(1) 
              : '—'}
            unit="°C"
            icon={<Thermometer className="w-6 h-6" />}
          />
        )}
        {efficiency && (
          <StatCard
            label="Electrical Efficiency"
            value={latest?.data[efficiency] !== null && latest?.data[efficiency] !== undefined 
              ? (latest.data[efficiency]! * 100).toFixed(1) 
              : '—'}
            unit="%"
            icon={<TrendingUp className="w-6 h-6" />}
          />
        )}
        {fuelUtil && (
          <StatCard
            label="Fuel Utilization"
            value={latest?.data[fuelUtil] !== null && latest?.data[fuelUtil] !== undefined 
              ? (latest.data[fuelUtil]! * 100).toFixed(1) 
              : '—'}
            unit="%"
            icon={<Gauge className="w-6 h-6" />}
          />
        )}
        {lambda && (
          <StatCard
            label="Air Excess Ratio (λ)"
            value={latest?.data[lambda] !== null && latest?.data[lambda] !== undefined 
              ? latest.data[lambda]!.toFixed(2) 
              : '—'}
            unit=""
            icon={<Activity className="w-6 h-6" />}
          />
        )}
      </div>

      {/* Stats Cards - Row 3: Flow Rates */}
      {(airFlow || fuelFlow) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {airFlow && (
            <StatCard
              label="Air Flow Rate"
              value={latest?.data[airFlow] !== null && latest?.data[airFlow] !== undefined 
                ? latest.data[airFlow]!.toFixed(2) 
                : '—'}
              unit="L/min"
              icon={<Wind className="w-6 h-6" />}
            />
          )}
          {fuelFlow && (
            <StatCard
              label="Fuel Flow Rate"
              value={latest?.data[fuelFlow] !== null && latest?.data[fuelFlow] !== undefined 
                ? latest.data[fuelFlow]!.toFixed(2) 
                : '—'}
              unit="L/min"
              icon={<Gauge className="w-6 h-6" />}
            />
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stack Voltage Chart */}
        {stackV && (
          <Card title="Stack Voltage" subtitle="Voltage vs time">
            <div className="chart-container">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 11 }} 
                      stroke="#9ca3af"
                      label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }} 
                      stroke="#9ca3af"
                      label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={stackV}
                      name="Stack Voltage"
                      stroke="#4A70A9"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Waiting for data...
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Current, Power, and Efficiency Chart */}
        {(stackI || power || efficiency) && (
          <Card title="Current, Power & Efficiency" subtitle="Stack current, power, and electrical efficiency vs time">
            <div className="chart-container">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 11 }} 
                      stroke="#9ca3af"
                      label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 11 }} 
                      stroke="#4A70A9"
                      label={{ value: 'Current (A) / Power (W)', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }} 
                      stroke="#8FABD4"
                      label={{ value: 'Efficiency (%)', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name.includes('Efficiency')) {
                          return [(value * 100).toFixed(2) + '%', name];
                        }
                        return [value.toFixed(3), name];
                      }}
                    />
                    <Legend />
                    {stackI && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey={stackI}
                        name="Stack Current"
                        stroke="#4A70A9"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                    {power && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey={power}
                        name="Stack Power"
                        stroke="#8FABD4"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                    {efficiency && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey={efficiency}
                        name="Electrical Efficiency"
                        stroke="#FF6B6B"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Waiting for data...
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* All Signals Chart (if we have many signals) */}
      {fields.length > 2 && (
        <Card title="All Signals" subtitle={`${fields.length} signals from Simulink model`}>
          <div className="chart-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10 }} 
                    stroke="#9ca3af"
                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    stroke="#9ca3af"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  {fields.slice(0, 10).map((field, idx) => (
                    <Line
                      key={field}
                      type="monotone"
                      dataKey={field}
                      name={field}
                      stroke={idx % 2 === 0 ? '#4A70A9' : '#8FABD4'}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Waiting for data...
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Signals Table */}
      {samples.length > 0 && (
        <Card title="Recent Samples" subtitle={`Last ${Math.min(100, samples.length)} samples`}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="rounded-tl-lg">Time (s)</th>
                  {fields.slice(0, 8).map(field => (
                    <th key={field}>{field}</th>
                  ))}
                  {fields.length > 8 && <th className="rounded-tr-lg">...</th>}
                </tr>
              </thead>
              <tbody>
                {samples.slice(-100).reverse().map((sample, idx) => (
                  <tr key={idx}>
                    <td className="font-mono text-sm">{sample.time.toFixed(3)}</td>
                    {fields.slice(0, 8).map(field => (
                      <td key={field} className="font-mono text-sm">
                        {sample.data[field] !== null && sample.data[field] !== undefined
                          ? sample.data[field]!.toFixed(3)
                          : '—'}
                      </td>
                    ))}
                    {fields.length > 8 && <td className="text-gray-400">...</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Demo Mode - Showing Mock SOFC Simulation Data
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Run your Simulink model and execute <code className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded text-xs">data_extract_YSZ</code> in MATLAB to see real data
            </p>
          </div>
        </div>
      )}

      {/* Info Card */}
      {samples.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <Wind className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Simulink Data Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Run your Simulink model and execute <code className="bg-gray-100 dark:bg-sofc-dark-bg px-2 py-1 rounded">data_extract_YSZ</code> in MATLAB
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Data will appear here once MATLAB starts sending POST requests to <code>/data</code>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

