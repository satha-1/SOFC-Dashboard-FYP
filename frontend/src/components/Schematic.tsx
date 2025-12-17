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
            <div className="w-20 h-24 bg-sofc-secondary/20 dark:bg-sofc-secondary/30 rounded-lg border-2 border-sofc-secondary flex items-center justify-center relative animate-breathe overflow-hidden">
              <Droplets className="w-8 h-8 text-sofc-primary animate-pulse" />
              {/* Animated water level effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-sofc-secondary/30 animate-shimmer" />
              <div className="absolute -bottom-1 left-1/2 w-4 h-4 bg-sofc-bg dark:bg-sofc-dark-card rounded-full border-2 border-sofc-secondary transform -translate-x-1/2" />
            </div>
            <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">Reservoir</span>
          </div>

          {/* Arrow with flow animation */}
          <div className="flex items-center relative">
            <div className="w-8 h-0.5 bg-sofc-primary relative overflow-hidden">
              {/* Flow particles */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle" />
                <div className="absolute top-0 left-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-0 left-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle" style={{ animationDelay: '1s' }} />
              </div>
            </div>
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-sofc-primary" />
          </div>

          {/* Pump */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-sofc-primary/20 dark:bg-sofc-primary/30 rounded-full border-2 border-sofc-primary flex items-center justify-center relative animate-glow">
              <Activity className="w-6 h-6 text-sofc-primary animate-rotate-slow" />
              {/* Rotating ring effect */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sofc-primary/50 animate-rotate-slow" style={{ animationDuration: '2s' }} />
            </div>
            <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">Pump</span>
          </div>

          {/* Arrow with flow animation */}
          <div className="flex items-center relative">
            <div className="w-8 h-0.5 bg-sofc-primary relative overflow-hidden">
              {/* Flow particles */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle" />
                <div className="absolute top-0 left-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-0 left-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle" style={{ animationDelay: '1s' }} />
              </div>
            </div>
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-sofc-primary" />
          </div>

          {/* Heat Exchanger Module */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg border-2 border-amber-400 flex items-center justify-center relative animate-shimmer overflow-hidden">
              <Thermometer className="w-8 h-8 text-amber-600 animate-pulse" />
              {/* Heat wave effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent animate-flow" style={{ width: '50%' }} />
            </div>
            <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">Heat Module</span>
          </div>

          {/* Arrow with flow animation */}
          <div className="flex items-center relative">
            <div className="w-8 h-0.5 bg-sofc-primary relative overflow-hidden">
              {/* Flow particles */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle" />
                <div className="absolute top-0 left-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-0 left-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle" style={{ animationDelay: '1s' }} />
              </div>
            </div>
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-sofc-primary" />
          </div>

          {/* SOFC Stack */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-24 bg-gradient-to-br from-sofc-primary/20 to-sofc-secondary/20 dark:from-sofc-primary/30 dark:to-sofc-secondary/30 rounded-xl border-2 border-sofc-primary flex flex-col items-center justify-center relative animate-glow">
              <span className="text-lg font-bold text-sofc-primary relative z-10">SOFC</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 relative z-10">Stack</span>
              {/* Pulsing energy effect */}
              {isConnected && (
                <div className="absolute inset-0 rounded-xl bg-sofc-primary/10 animate-pulse-slow" />
              )}
              {/* Status indicator */}
              <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} shadow-lg z-20`}>
                {isConnected && <div className="w-full h-full rounded-full bg-green-500 animate-ping opacity-75" />}
              </div>
            </div>
            <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">Fuel Cell</span>
          </div>

          {/* Return arrow with reverse flow */}
          <div className="hidden lg:flex items-center relative">
            <div className="w-8 h-0.5 bg-sofc-secondary relative overflow-hidden">
              {/* Reverse flow particles */}
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle-reverse" />
                <div className="absolute top-0 right-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle-reverse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-0 right-0 w-2 h-0.5 bg-white/80 rounded-full animate-particle-reverse" style={{ animationDelay: '1s' }} />
              </div>
            </div>
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-sofc-secondary" />
          </div>
        </div>

        {/* Air line (below main flow) */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
            <Wind className="w-5 h-5 text-sky-500 animate-pulse" />
            <span className="text-sm font-medium text-sky-700 dark:text-sky-300">Air Line</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 relative">
            {/* Animated flow indicators */}
            <div className="w-4 h-0.5 bg-current relative overflow-hidden">
              <div className="absolute inset-0 bg-sky-400 animate-flow" style={{ width: '50%' }} />
            </div>
            <div className="w-4 h-0.5 bg-current relative overflow-hidden">
              <div className="absolute inset-0 bg-sky-400 animate-flow" style={{ width: '50%', animationDelay: '0.3s' }} />
            </div>
            <div className="w-4 h-0.5 bg-current relative overflow-hidden">
              <div className="absolute inset-0 bg-sky-400 animate-flow" style={{ width: '50%', animationDelay: '0.6s' }} />
            </div>
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

