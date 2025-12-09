import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Card({ children, className = '', title, subtitle, action }: CardProps) {
  return (
    <div className={`card p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-sofc-text dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'normal' | 'warning' | 'critical';
  icon?: ReactNode;
}

export function StatCard({ label, value, unit, trend, trendValue, status = 'normal', icon }: StatCardProps) {
  const getStatusColors = () => {
    switch (status) {
      case 'warning':
        return 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10';
      case 'critical':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10';
      default:
        return 'border-l-sofc-primary';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    const colors = {
      up: 'text-green-500',
      down: 'text-red-500',
      stable: 'text-gray-400',
    };
    const icons = {
      up: '↑',
      down: '↓',
      stable: '–',
    };
    return (
      <span className={`flex items-center gap-1 text-xs font-medium ${colors[trend]}`}>
        {icons[trend]} {trendValue}
      </span>
    );
  };

  return (
    <div className={`card p-5 border-l-4 ${getStatusColors()} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-sofc-text dark:text-white tabular-nums">
              {typeof value === 'number' ? value.toFixed(2) : value}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          </div>
          <div className="mt-2">
            {getTrendIcon()}
          </div>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-sofc-primary/10 dark:bg-sofc-primary/20 text-sofc-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

