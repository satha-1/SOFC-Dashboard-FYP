import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  List,
  Users,
  Settings,
  Cpu,
  LineChart,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/simulink', label: 'Simulation Analytics', icon: LineChart },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/logs', label: 'Logs', icon: List },
  { path: '/users', label: 'User Activity', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 lg:w-72 bg-white dark:bg-sofc-dark-card border-r border-gray-200 dark:border-sofc-dark-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-sofc-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sofc-primary to-sofc-secondary flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sofc-text dark:text-white text-lg">
              SOFC Monitor
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Fuel Cell Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sofc-primary text-white shadow-md shadow-sofc-primary/30'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-sofc-dark-bg'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-200 dark:border-sofc-dark-border">
        <div className="bg-gradient-to-br from-sofc-primary/10 to-sofc-secondary/10 dark:from-sofc-primary/20 dark:to-sofc-secondary/20 rounded-xl p-4">
          <p className="text-xs font-medium text-sofc-primary dark:text-sofc-secondary mb-1">
            System Status
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All sensors operational
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-600 dark:text-gray-300">
              Arduino Connected
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

