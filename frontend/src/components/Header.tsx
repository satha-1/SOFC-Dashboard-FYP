import { Bell, Moon, Sun, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ConnectionStatus } from '../types';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  statusMessage: string;
}

export default function Header({ connectionStatus, statusMessage }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'live':
        return (
          <span className="badge-live">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        );
      case 'demo':
        return (
          <span className="badge-demo">
            <Wifi className="w-3 h-3" />
            DEMO
          </span>
        );
      case 'connecting':
        return (
          <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            CONNECTING
          </span>
        );
      default:
        return (
          <span className="badge-disconnected">
            <WifiOff className="w-3 h-3" />
            DISCONNECTED
          </span>
        );
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-sofc-dark-card border-b border-gray-200 dark:border-sofc-dark-border px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-sofc-text dark:text-white">
            SOFC Fuel Cell Monitoring
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            University Prototype Control System
          </p>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {connectionStatus === 'demo' && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {statusMessage}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button 
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-sofc-dark-bg transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-sofc-dark-bg transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-500" />
          ) : (
            <Sun className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* User menu */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200 dark:border-sofc-dark-border">
          <div className="text-right">
            <p className="text-sm font-medium text-sofc-text dark:text-white">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role || 'Operator'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sofc-primary to-sofc-secondary flex items-center justify-center text-white font-medium text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-sofc-dark-bg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}

