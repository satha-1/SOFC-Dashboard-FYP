import { useState, useEffect } from 'react';
import { Users, Shield, Clock, Activity } from 'lucide-react';
import { Card } from '../../components/Card';
import { UserActivityChart } from '../../components/Charts';
import { UserActivity as UserActivityType } from '../../types';

// Mock user data
const mockUsers: UserActivityType[] = [
  {
    id: '1',
    username: 'admin.johnson',
    role: 'Admin',
    lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    sessions: 145,
    lastAction: 'Updated system settings',
  },
  {
    id: '2',
    username: 'sarah.chen',
    role: 'Operator',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    sessions: 89,
    lastAction: 'Generated daily report',
  },
  {
    id: '3',
    username: 'mike.operator',
    role: 'Operator',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    sessions: 67,
    lastAction: 'Viewed analytics dashboard',
  },
  {
    id: '4',
    username: 'emma.wilson',
    role: 'Student',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    sessions: 23,
    lastAction: 'Exported sensor logs',
  },
  {
    id: '5',
    username: 'lab.assistant',
    role: 'Student',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    sessions: 12,
    lastAction: 'Viewed live dashboard',
  },
  {
    id: '6',
    username: 'dr.martinez',
    role: 'Admin',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    sessions: 234,
    lastAction: 'Modified thresholds',
  },
  {
    id: '7',
    username: 'tech.support',
    role: 'Operator',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    sessions: 56,
    lastAction: 'Checked serial connection',
  },
];

// Generate mock hourly activity data
function generateHourlyActivity() {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i);
    data.push({
      hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
      users: Math.floor(Math.random() * 5) + (i < 8 ? 0 : 1),
    });
  }
  return data;
}

export default function UserActivity() {
  const [activityData, setActivityData] = useState(generateHourlyActivity);

  // Refresh activity data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityData(generateHourlyActivity());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadge = (role: 'Admin' | 'Operator' | 'Student') => {
    const styles = {
      Admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Operator: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Student: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
        {role}
      </span>
    );
  };

  const formatLastLogin = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const activeUsers = mockUsers.filter(u => {
    const lastLogin = new Date(u.lastLogin);
    const hourAgo = new Date(Date.now() - 1000 * 60 * 60);
    return lastLogin > hourAgo;
  }).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Total Users</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {mockUsers.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Active Now</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {activeUsers}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Admins</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {mockUsers.filter(u => u.role === 'Admin').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 dark:text-amber-400">Total Sessions</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {mockUsers.reduce((acc, u) => acc + u.sessions, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card title="Active Users (Last 24 Hours)" subtitle="Hourly user activity">
        <div className="chart-container">
          <UserActivityChart data={activityData} />
        </div>
      </Card>

      {/* Users Table */}
      <Card title="User Directory" subtitle="All registered users and their activity">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="rounded-tl-lg">Username</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Sessions</th>
                <th className="rounded-tr-lg">Last Action</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sofc-primary to-sofc-secondary flex items-center justify-center text-white text-sm font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td className="text-gray-500 dark:text-gray-400">
                    {formatLastLogin(user.lastLogin)}
                  </td>
                  <td className="font-mono">{user.sessions}</td>
                  <td className="text-sm text-gray-500 dark:text-gray-400 max-w-48 truncate">
                    {user.lastAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

