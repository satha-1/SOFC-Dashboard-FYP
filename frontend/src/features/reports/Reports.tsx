import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Download, Calendar, ClipboardList } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card } from '../../components/Card';
import { LayoutContext } from '../../components/Layout';
import { ReportFormData, SofcReading } from '../../types';

function calculateStats(readings: SofcReading[]) {
  if (readings.length === 0) {
    return {
      t_water: { min: 0, max: 0, avg: 0 },
      t_air: { min: 0, max: 0, avg: 0 },
      p_air: { min: 0, max: 0, avg: 0 },
      p_water: { min: 0, max: 0, avg: 0 },
    };
  }

  const stats = {
    t_water: { min: Infinity, max: -Infinity, sum: 0 },
    t_air: { min: Infinity, max: -Infinity, sum: 0 },
    p_air: { min: Infinity, max: -Infinity, sum: 0 },
    p_water: { min: Infinity, max: -Infinity, sum: 0 },
  };

  readings.forEach(r => {
    (['t_water', 't_air', 'p_air', 'p_water'] as const).forEach(key => {
      stats[key].min = Math.min(stats[key].min, r[key]);
      stats[key].max = Math.max(stats[key].max, r[key]);
      stats[key].sum += r[key];
    });
  });

  return {
    t_water: { min: stats.t_water.min, max: stats.t_water.max, avg: stats.t_water.sum / readings.length },
    t_air: { min: stats.t_air.min, max: stats.t_air.max, avg: stats.t_air.sum / readings.length },
    p_air: { min: stats.p_air.min, max: stats.p_air.max, avg: stats.p_air.sum / readings.length },
    p_water: { min: stats.p_water.min, max: stats.p_water.max, avg: stats.p_water.sum / readings.length },
  };
}

export default function Reports() {
  const { history } = useOutletContext<LayoutContext>();
  const [formData, setFormData] = useState<ReportFormData>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportType: 'daily',
    notes: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(74, 112, 169); // sofc-primary
      doc.text('SOFC Fuel Cell Monitoring Report', pageWidth / 2, 20, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(12);
      doc.setTextColor(100);
      const reportTypeLabels: Record<string, string> = {
        daily: 'Daily Summary Report',
        experiment: 'Experiment Run Report',
        maintenance: 'Maintenance Check Report',
      };
      doc.text(reportTypeLabels[formData.reportType], pageWidth / 2, 28, { align: 'center' });
      
      // Generation info
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);
      doc.text(`Date Range: ${formData.startDate} to ${formData.endDate}`, 14, 47);
      
      // Summary Statistics
      const recentReadings = history.slice(-20);
      const stats = calculateStats(recentReadings);
      
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Summary Statistics', 14, 60);
      
      autoTable(doc, {
        startY: 65,
        head: [['Parameter', 'Min', 'Max', 'Average']],
        body: [
          ['Water Temperature (°C)', stats.t_water.min.toFixed(2), stats.t_water.max.toFixed(2), stats.t_water.avg.toFixed(2)],
          ['Air Temperature (°C)', stats.t_air.min.toFixed(2), stats.t_air.max.toFixed(2), stats.t_air.avg.toFixed(2)],
          ['Air Pressure (V)', stats.p_air.min.toFixed(2), stats.p_air.max.toFixed(2), stats.p_air.avg.toFixed(2)],
          ['Water Pressure (V)', stats.p_water.min.toFixed(2), stats.p_water.max.toFixed(2), stats.p_water.avg.toFixed(2)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [74, 112, 169] },
      });
      
      // Recent Readings Table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tableEndY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Recent Readings (Last 20 samples)', 14, tableEndY);
      
      autoTable(doc, {
        startY: tableEndY + 5,
        head: [['Timestamp', 'T_Water (°C)', 'T_Air (°C)', 'P_Air (V)', 'P_Water (V)']],
        body: recentReadings.map(r => [
          new Date(r.ts).toLocaleString(),
          r.t_water.toFixed(2),
          r.t_air.toFixed(2),
          r.p_air.toFixed(2),
          r.p_water.toFixed(2),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [74, 112, 169] },
        styles: { fontSize: 8 },
      });
      
      // Mock Performance Indicators
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const secondTableEndY = (doc as any).lastAutoTable.finalY + 15;
      
      if (secondTableEndY < 250) {
        doc.setFontSize(14);
        doc.text('Estimated SOFC Performance', 14, secondTableEndY);
        
        autoTable(doc, {
          startY: secondTableEndY + 5,
          head: [['Metric', 'Value', 'Status']],
          body: [
            ['Electrical Efficiency', `${(35 + Math.random() * 25).toFixed(1)}%`, 'Normal'],
            ['Thermal Efficiency', `${(12 + Math.random() * 16).toFixed(1)}%`, 'Normal'],
            ['Stack Health', `${(75 + Math.random() * 23).toFixed(1)}%`, 'Good'],
            ['Fuel Utilization', `${(70 + Math.random() * 15).toFixed(1)}%`, 'Normal'],
          ],
          theme: 'striped',
          headStyles: { fillColor: [143, 171, 212] },
        });
      }
      
      // Operator Notes
      if (formData.notes) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Operator Notes', 14, 20);
        doc.setFontSize(10);
        const splitNotes = doc.splitTextToSize(formData.notes, pageWidth - 28);
        doc.text(splitNotes, 14, 30);
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `SOFC Fuel Cell Monitoring - University Prototype | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Save
      doc.save(`sofc-report-${formData.reportType}-${formData.startDate}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Generate Report" subtitle="Create a PDF report with sensor data and performance metrics">
        <div className="space-y-6">
          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Report Type
            </label>
            <select
              name="reportType"
              value={formData.reportType}
              onChange={handleInputChange}
              className="w-full md:w-1/2"
            >
              <option value="daily">Daily Summary</option>
              <option value="experiment">Experiment Run</option>
              <option value="maintenance">Maintenance Check</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ClipboardList className="w-4 h-4 inline mr-2" />
              Operator Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter any observations, anomalies, or notes about this session..."
              className="w-full resize-none"
            />
          </div>

          {/* Generate Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="btn-primary"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate PDF Report
                </>
              )}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {history.length} readings available
            </span>
          </div>
        </div>
      </Card>

      {/* Preview Card */}
      <Card title="Report Preview" subtitle="Summary of what will be included in the report">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-sofc-primary/5 dark:bg-sofc-primary/10 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Readings Count</p>
            <p className="text-2xl font-bold text-sofc-primary">{Math.min(20, history.length)}</p>
            <p className="text-xs text-gray-400 mt-1">Most recent samples</p>
          </div>
          <div className="p-4 bg-sofc-secondary/5 dark:bg-sofc-secondary/10 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Report Type</p>
            <p className="text-2xl font-bold text-sofc-secondary capitalize">{formData.reportType}</p>
            <p className="text-xs text-gray-400 mt-1">Selected format</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Statistics</p>
            <p className="text-2xl font-bold text-green-600">4</p>
            <p className="text-xs text-gray-400 mt-1">Parameters tracked</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Performance Metrics</p>
            <p className="text-2xl font-bold text-amber-600">4</p>
            <p className="text-xs text-gray-400 mt-1">Mock indicators</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

