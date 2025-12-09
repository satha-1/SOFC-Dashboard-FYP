import { Droplets, Wind, Gauge, Thermometer, Activity } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface SchematicProps {
  p_water: number | null;
  p_air: number | null;
  connectionStatus: ConnectionStatus;
}

export function Schematic({ p_water, p_air, connectionStatus }: SchematicProps) {
  const isConnected = connectionStatus === 'live' || connectionStatus === 'demo';

  return (
    <div className="schematic-container">
      <div className="flex flex-col items-center">
        {/* Main flow diagram */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Reservoir */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-24 bg-sofc-secondary/20 dark:bg-sofc-secondary/30 rounded-lg border-2 border-sofc-secondary flex items-center justify-center relative">
              <Droplets className="w-8 h-8 text-sofc-primary" />
              <div className="absolute -bottom-1 left-1/2 w-4 h-4 bg-sofc-bg dark:bg-sofc-dark-card rounded-full border-2 border-sofc-secondary transform -translate-x-1/2" />
            </div>
            <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">Reservoir</span>
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-sofc-primary" />
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-sofc-primary" />
          </div>

          {/* Pump */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-sofc-primary/20 dark:bg-sofc-primary/30 rounded-full border-2 border-sofc-primary flex items-center justify-center">
              <Activity className="w-6 h-6 text-sofc-primary animate-pulse" />
            </div>
            <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">Pump</span>
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-sofc-primary" />
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-sofc-primary" />
          </div>

          {/* Heat Exchanger Module */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg border-2 border-amber-400 flex items-center justify-center">
              <Thermometer className="w-8 h-8 text-amber-600" />
            </div>
            <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">Heat Module</span>
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-sofc-primary" />
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-sofc-primary" />
          </div>

          {/* SOFC Stack */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-24 bg-gradient-to-br from-sofc-primary/20 to-sofc-secondary/20 dark:from-sofc-primary/30 dark:to-sofc-secondary/30 rounded-xl border-2 border-sofc-primary flex flex-col items-center justify-center relative">
              <span className="text-lg font-bold text-sofc-primary">SOFC</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Stack</span>
              {/* Status indicator */}
              <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}>
                {isConnected && <div className="w-full h-full rounded-full bg-green-500 animate-ping opacity-75" />}
              </div>
            </div>
            <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">Fuel Cell</span>
          </div>

          {/* Return arrow */}
          <div className="hidden lg:flex items-center">
            <div className="w-8 h-0.5 bg-sofc-secondary" />
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-sofc-secondary" />
          </div>
        </div>

        {/* Air line (below main flow) */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
            <Wind className="w-5 h-5 text-sky-500" />
            <span className="text-sm font-medium text-sky-700 dark:text-sky-300">Air Line</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <div className="w-4 h-0.5 bg-current" />
            <div className="w-4 h-0.5 bg-current" />
            <div className="w-4 h-0.5 bg-current" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-sofc-dark-card rounded-lg shadow-sm">
            <Gauge className="w-4 h-4 text-sofc-primary" />
            <span className="text-sm font-mono font-medium text-sofc-text dark:text-white">
              {p_air !== null ? p_air.toFixed(2) : '—'} V
            </span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-lg">
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-sofc-dark-card rounded-lg shadow-sm">
            <Droplets className="w-5 h-5 text-sofc-secondary" />
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Fuel Loop</span>
              <p className="text-sm font-mono font-semibold text-sofc-text dark:text-white">
                {p_water !== null ? p_water.toFixed(2) : '—'} V
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-sofc-dark-card rounded-lg shadow-sm">
            <Wind className="w-5 h-5 text-sky-500" />
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Air Line</span>
              <p className="text-sm font-mono font-semibold text-sofc-text dark:text-white">
                {p_air !== null ? p_air.toFixed(2) : '—'} V
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-sofc-dark-card rounded-lg shadow-sm col-span-2 md:col-span-1">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Arduino</span>
              <p className="text-sm font-semibold text-sofc-text dark:text-white">
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

