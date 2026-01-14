import { useState } from 'react';
import { Card } from '../../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, Zap, Activity } from 'lucide-react';

// Physical Constants
const F = 96485.0;        // Faraday constant (C/mol)
const R = 8.314;          // Gas constant (J/mol·K)

// Electrolyte Properties
interface ElectrolyteProps {
  sigma_ref: number;  // S/cm
  Ea_eV: number;      // eV
  thickness: number;   // m
}

const electrolytes: Record<string, ElectrolyteProps> = {
  'YSZ':  { sigma_ref: 0.10, Ea_eV: 1.00, thickness: 0.0005 },
  'GDC':  { sigma_ref: 0.12, Ea_eV: 0.75, thickness: 0.0005 },
  'SCSZ': { sigma_ref: 0.09, Ea_eV: 0.90, thickness: 0.0005 },
  'LSGM': { sigma_ref: 0.11, Ea_eV: 0.85, thickness: 0.0005 },
};

interface SOFCResult {
  voltage: number;
  power: number;
  e_nernst: number;
}

function runSOFC(
  electrolyte: string,
  T: number,
  i: number,
  p_H2: number,
  p_H2O: number,
  p_O2: number
): SOFCResult {
  const props = electrolytes[electrolyte];
  const sigma_ref = props.sigma_ref;       // S/cm
  const Ea = props.Ea_eV * 96485;         // Convert eV → J/mol
  const L = props.thickness;               // m
  const Tref = 1073.15;                    // K

  // Nernst Voltage (open-circuit potential)
  const E_nernst = 1.253 + (R * T / (2 * F)) * Math.log(p_H2 * Math.sqrt(p_O2) / p_H2O);

  // Ionic Conductivity (Arrhenius)
  let sigma = sigma_ref * Math.exp(-Ea / R * (1 / T - 1 / Tref));
  sigma *= 100;  // Convert S/cm to S/m

  // Polarization Losses
  // Activation overpotential
  const i0 = 1e4;  // Exchange current density (A/m²)
  const alpha = 0.5;
  const eta_act = (R * T / (alpha * F)) * Math.log((i / i0) + 1e-9);

  // Ohmic overpotential
  const eta_ohm = (i * L) / sigma;

  // Concentration (mass transport) overpotential
  const i_lim = 2e4;  // Limiting current density (A/m²)
  const eta_conc = -(R * T / (2 * F)) * Math.log(1 - (i / i_lim));

  // Cell Voltage
  let V = E_nernst - eta_act - eta_ohm - eta_conc;
  V = Math.max(V, 0);

  // Power density (W/m²)
  const P = i * V;

  return { voltage: V, power: P, e_nernst: E_nernst };
}

export default function ElectrolyteComparison() {
  const [temperature, setTemperature] = useState(800);
  const [p_H2, setP_H2] = useState(1.0);
  const [p_H2O, setP_H2O] = useState(0.3);
  const [p_O2, setP_O2] = useState(0.21);

  const T = temperature + 273.15;
  const currentDensity = Array.from({ length: 200 }, (_, i) => 100 + (i * (20000 - 100) / 199));

  // Generate data for all electrolytes
  const chartData = currentDensity.map(i => {
    const dataPoint: Record<string, number | string> = {
      currentDensity: i / 10000, // Convert to A/cm² for display
    };

    let e_nernst_value = 0;

    Object.keys(electrolytes).forEach(name => {
      const result = runSOFC(name, T, i, p_H2, p_H2O, p_O2);
      dataPoint[`${name}_voltage`] = Number(result.voltage.toFixed(4));
      dataPoint[`${name}_power`] = Number((result.power / 10000).toFixed(4)); // Convert to W/cm²
      if (e_nernst_value === 0) {
        e_nernst_value = result.e_nernst;
      }
    });

    return dataPoint;
  });

  // Get E_nernst for display (using first calculation)
  const sampleResult = runSOFC('YSZ', T, 1000, p_H2, p_H2O, p_O2);
  const e_nernst = sampleResult.e_nernst;

  const colors = {
    'YSZ': '#4A70A9',
    'GDC': '#10B981',
    'SCSZ': '#F59E0B',
    'LSGM': '#8B5CF6',
  };

  return (
    <div className="space-y-6 animate-stagger">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-sofc-text dark:text-white mb-2">
          SOFC Electrolyte Comparison
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare performance of different electrolyte materials (YSZ, GDC, SCSZ, LSGM)
        </p>
      </div>

      {/* Parameters Card */}
      <Card title="Simulation Parameters" subtitle="Adjust parameters to see their effect on performance">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Temperature */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Thermometer className="w-4 h-4" />
              Temperature (°C)
            </label>
            <input
              type="range"
              min="600"
              max="1000"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>600</span>
              <span className="font-semibold text-sofc-primary">{temperature}°C</span>
              <span>1000</span>
            </div>
          </div>

          {/* p_H2 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Activity className="w-4 h-4" />
              p_H₂ (atm)
            </label>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.01"
              value={p_H2}
              onChange={(e) => setP_H2(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.2</span>
              <span className="font-semibold text-sofc-primary">{p_H2.toFixed(2)}</span>
              <span>1.0</span>
            </div>
          </div>

          {/* p_H2O */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Zap className="w-4 h-4" />
              p_H₂O (atm)
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={p_H2O}
              onChange={(e) => setP_H2O(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.1</span>
              <span className="font-semibold text-sofc-primary">{p_H2O.toFixed(2)}</span>
              <span>1.0</span>
            </div>
          </div>

          {/* p_O2 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Activity className="w-4 h-4" />
              p_O₂ (atm)
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={p_O2}
              onChange={(e) => setP_O2(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.1</span>
              <span className="font-semibold text-sofc-primary">{p_O2.toFixed(2)}</span>
              <span>1.0</span>
            </div>
          </div>
        </div>

        {/* E_nernst Display */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Open-Circuit Voltage (Eₙₑᵣₙₛₜ):
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {e_nernst.toFixed(3)} V
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Calculated at {temperature}°C with current partial pressures
          </p>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* I-V Curve */}
        <Card title="I–V Curve" subtitle="Voltage vs Current Density">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="currentDensity"
                  label={{ value: 'Current Density (A/cm²)', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value.toFixed(3)} V`}
                />
                <Legend />
                {Object.keys(electrolytes).map(name => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={`${name}_voltage`}
                    name={name}
                    stroke={colors[name as keyof typeof colors]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Power Curve */}
        <Card title="Power Curve" subtitle="Power Density vs Current Density">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="currentDensity"
                  label={{ value: 'Current Density (A/cm²)', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  label={{ value: 'Power Density (W/cm²)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value.toFixed(3)} W/cm²`}
                />
                <Legend />
                {Object.keys(electrolytes).map(name => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={`${name}_power`}
                    name={name}
                    stroke={colors[name as keyof typeof colors]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Electrolyte Properties Table */}
      <Card title="Electrolyte Properties" subtitle="Physical and electrical properties of each material">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sofc-dark-bg">
                  Electrolyte
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sofc-dark-bg">
                  σ_ref (S/cm)
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sofc-dark-bg">
                  Ea (eV)
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-sofc-dark-bg">
                  Thickness (mm)
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(electrolytes).map(([name, props], index) => (
                <tr
                  key={name}
                  className={`border-b border-gray-100 dark:border-gray-800 ${
                    index % 2 === 0 ? 'bg-white dark:bg-sofc-dark-card' : 'bg-gray-50 dark:bg-sofc-dark-bg'
                  }`}
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: colors[name as keyof typeof colors] }}>
                    {name}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{props.sigma_ref.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{props.Ea_eV.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{(props.thickness * 1000).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
