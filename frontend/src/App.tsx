import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import Analytics from './features/analytics/Analytics';
import Reports from './features/reports/Reports';
import Logs from './features/logs/Logs';
import UserActivity from './features/users/UserActivity';
import Settings from './features/settings/Settings';
import SimulinkPage from './features/simulink/SimulinkPage';
import SchematicView from './features/schematic/SchematicView';
import ElectrolyteComparison from './features/electrolyte/ElectrolyteComparison';
import Login from './features/auth/Login';
import Register from './features/auth/Register';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sofc-bg dark:bg-sofc-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sofc-primary border-t-transparent" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="schematic" element={<SchematicView />} />
        <Route path="electrolyte" element={<ElectrolyteComparison />} />
        <Route path="reports" element={<Reports />} />
        <Route path="logs" element={<Logs />} />
        <Route path="users" element={<UserActivity />} />
        <Route path="simulink" element={<SimulinkPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

