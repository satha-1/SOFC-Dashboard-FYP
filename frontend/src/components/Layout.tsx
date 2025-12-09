import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { useLiveSOFC } from '../hooks/useLiveSOFC';

export default function Layout() {
  const { connectionStatus, statusMessage, latestReading, history } = useLiveSOFC();

  return (
    <div className="min-h-screen flex bg-sofc-bg dark:bg-sofc-dark-bg">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen ml-64 lg:ml-72">
        {/* Header */}
        <Header 
          connectionStatus={connectionStatus} 
          statusMessage={statusMessage} 
        />
        
        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet context={{ connectionStatus, latestReading, history }} />
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

// Type for outlet context
export interface LayoutContext {
  connectionStatus: 'connecting' | 'live' | 'disconnected' | 'demo';
  latestReading: {
    ts: string;
    t_water: number;
    t_air: number;
    p_air: number;
    p_water: number;
  } | null;
  history: Array<{
    ts: string;
    t_water: number;
    t_air: number;
    p_air: number;
    p_water: number;
  }>;
}

