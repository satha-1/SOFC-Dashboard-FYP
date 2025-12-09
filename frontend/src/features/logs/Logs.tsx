import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/Card';
import { LayoutContext } from '../../components/Layout';
import { useThresholds } from '../../hooks/useThresholds';
import { SofcReading } from '../../types';

const PAGE_SIZE = 20;

export default function Logs() {
  const { history } = useOutletContext<LayoutContext>();
  const { checkReading } = useThresholds();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search logic
  const filteredData = useMemo(() => {
    let data = [...history].reverse(); // Most recent first
    
    // Filter by search query (timestamp)
    if (searchQuery) {
      data = data.filter(r => 
        new Date(r.ts).toLocaleString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter anomalies only
    if (showAnomaliesOnly) {
      data = data.filter(r => {
        const alerts = checkReading(r);
        return Object.values(alerts).some(s => s !== 'normal');
      });
    }
    
    return data;
  }, [history, searchQuery, showAnomaliesOnly, checkReading]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const isAnomaly = (reading: SofcReading) => {
    const alerts = checkReading(reading);
    return Object.values(alerts).some(s => s !== 'normal');
  };

  const getCellClass = (reading: SofcReading, key: 't_water' | 't_air' | 'p_air' | 'p_water') => {
    const alerts = checkReading(reading);
    const status = alerts[key];
    if (status === 'critical') return 'text-red-600 dark:text-red-400 font-semibold';
    if (status === 'warning') return 'text-amber-600 dark:text-amber-400';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by timestamp..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2"
            />
          </div>

          {/* Anomaly filter */}
          <button
            onClick={() => {
              setShowAnomaliesOnly(!showAnomaliesOnly);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAnomaliesOnly
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-gray-100 text-gray-600 dark:bg-sofc-dark-bg dark:text-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            {showAnomaliesOnly ? 'Showing Anomalies' : 'All Readings'}
          </button>

          {/* Stats */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredData.length} of {history.length} readings
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="rounded-tl-lg">Timestamp</th>
                <th>T_Water (°C)</th>
                <th>T_Air (°C)</th>
                <th>P_Air (V)</th>
                <th>P_Water (V)</th>
                <th className="rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    {history.length === 0 
                      ? 'No readings yet. Waiting for data...'
                      : 'No readings match your filters.'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((reading, idx) => (
                  <tr key={`${reading.ts}-${idx}`} className={isAnomaly(reading) ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}>
                    <td className="font-mono text-sm">
                      {new Date(reading.ts).toLocaleString()}
                    </td>
                    <td className={`font-mono ${getCellClass(reading, 't_water')}`}>
                      {reading.t_water.toFixed(2)}
                    </td>
                    <td className={`font-mono ${getCellClass(reading, 't_air')}`}>
                      {reading.t_air.toFixed(2)}
                    </td>
                    <td className={`font-mono ${getCellClass(reading, 'p_air')}`}>
                      {reading.p_air.toFixed(2)}
                    </td>
                    <td className={`font-mono ${getCellClass(reading, 'p_water')}`}>
                      {reading.p_water.toFixed(2)}
                    </td>
                    <td>
                      {isAnomaly(reading) ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3 h-3" />
                          Warning
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 dark:text-green-400">Normal</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-sofc-dark-border">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-sofc-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-sofc-primary text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-sofc-dark-bg'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-sofc-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

