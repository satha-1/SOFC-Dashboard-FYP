import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { SofcReading } from '../types';

interface TemperatureChartProps {
  data: SofcReading[];
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const chartData = data.map((reading) => ({
    time: new Date(reading.ts).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    t_water: reading.t_water,
    t_air: reading.t_air,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4A70A9" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4A70A9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorAir" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8FABD4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8FABD4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 11 }} 
          stroke="#9ca3af"
          interval="preserveStartEnd"
        />
        <YAxis 
          tick={{ fontSize: 11 }} 
          stroke="#9ca3af"
          domain={['auto', 'auto']}
          label={{ value: '°C', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
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
        <Area
          type="monotone"
          dataKey="t_water"
          name="Water Temp"
          stroke="#4A70A9"
          strokeWidth={2}
          fill="url(#colorWater)"
        />
        <Area
          type="monotone"
          dataKey="t_air"
          name="Air Temp"
          stroke="#8FABD4"
          strokeWidth={2}
          fill="url(#colorAir)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface PressureChartProps {
  data: SofcReading[];
}

export function PressureChart({ data }: PressureChartProps) {
  const chartData = data.map((reading) => ({
    time: new Date(reading.ts).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    p_air: reading.p_air,
    p_water: reading.p_water,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 11 }} 
          stroke="#9ca3af"
          interval="preserveStartEnd"
        />
        <YAxis 
          tick={{ fontSize: 11 }} 
          stroke="#9ca3af"
          domain={['auto', 'auto']}
          label={{ value: 'V', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
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
          dataKey="p_air"
          name="Air Pressure"
          stroke="#4A70A9"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="p_water"
          name="Water Pressure"
          stroke="#8FABD4"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface IVCurveChartProps {
  data: { current: number[]; voltage: number[]; power: number[] };
}

export function IVCurveChart({ data }: IVCurveChartProps) {
  const chartData = data.current.map((c, i) => ({
    current: c,
    voltage: data.voltage[i],
    power: data.power[i],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="current"
          tick={{ fontSize: 11 }}
          stroke="#9ca3af"
          label={{ value: 'Current (A)', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11 }}
          stroke="#4A70A9"
          label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11 }}
          stroke="#8FABD4"
          label={{ value: 'Power (W)', angle: 90, position: 'insideRight' }}
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
          yAxisId="left"
          type="monotone"
          dataKey="voltage"
          name="Voltage"
          stroke="#4A70A9"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="power"
          name="Power"
          stroke="#8FABD4"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface HistogramChartProps {
  data: { range: string; count: number }[];
  color?: string;
}

export function HistogramChart({ data, color = '#4A70A9' }: HistogramChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface UserActivityChartProps {
  data: { hour: string; users: number }[];
}

export function UserActivityChart({ data }: UserActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4A70A9" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4A70A9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Area
          type="monotone"
          dataKey="users"
          name="Active Users"
          stroke="#4A70A9"
          strokeWidth={2}
          fill="url(#colorUsers)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

