import { useState, useEffect } from 'react';
import { Plug, Gauge, Palette, Save, RotateCcw, Check } from 'lucide-react';
import { Card } from '../../components/Card';
import { useTheme } from '../../context/ThemeContext';
import { useThresholds } from '../../hooks/useThresholds';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { thresholds, setThresholds, resetThresholds } = useThresholds();
  
  // Connection settings
  const [serialPort, setSerialPort] = useState('COM8');
  const [baudRate, setBaudRate] = useState(9600);
  const [availablePorts, setAvailablePorts] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');

  // Local threshold state
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [thresholdsSaved, setThresholdsSaved] = useState(false);

  // Fetch available ports on mount
  useEffect(() => {
    fetch('/api/ports')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setAvailablePorts(data.data);
        }
      })
      .catch(console.error);
      
    // Fetch current config
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.serialConfig) {
          setSerialPort(data.data.serialConfig.port);
          setBaudRate(data.data.serialConfig.baudRate);
        }
      })
      .catch(console.error);
  }, []);

  const handleApplyConnection = async () => {
    setIsConnecting(true);
    setConnectionMessage('');
    
    try {
      const response = await fetch('/api/settings/serial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port: serialPort, baudRate }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConnectionMessage(
          data.data.connected 
            ? `Connected to ${serialPort}` 
            : `Failed to connect to ${serialPort}`
        );
      } else {
        setConnectionMessage(data.error || 'Connection failed');
      }
    } catch (err) {
      setConnectionMessage('Failed to apply settings');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleThresholdChange = (key: keyof typeof localThresholds, value: string) => {
    setLocalThresholds(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
    setThresholdsSaved(false);
  };

  const handleSaveThresholds = () => {
    setThresholds(localThresholds);
    setThresholdsSaved(true);
    setTimeout(() => setThresholdsSaved(false), 2000);
  };

  const handleResetThresholds = () => {
    resetThresholds();
    setLocalThresholds({
      maxWaterTemp: 35,
      maxAirTemp: 35,
      minAirPressure: 1.0,
      maxAirPressure: 4.5,
      minWaterPressure: 1.5,
      maxWaterPressure: 4.5,
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Settings */}
      <Card 
        title="Connection Settings" 
        subtitle="Configure Arduino serial port connection"
        action={<Plug className="w-5 h-5 text-sofc-primary" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Serial Port
              </label>
              <select
                value={serialPort}
                onChange={(e) => setSerialPort(e.target.value)}
                className="w-full"
              >
                <option value={serialPort}>{serialPort}</option>
                {availablePorts
                  .filter(p => p !== serialPort)
                  .map(port => (
                    <option key={port} value={port}>{port}</option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select the COM port connected to Arduino
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Baud Rate
              </label>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(parseInt(e.target.value))}
                className="w-full"
              >
                <option value={9600}>9600</option>
                <option value={19200}>19200</option>
                <option value={38400}>38400</option>
                <option value={57600}>57600</option>
                <option value={115200}>115200</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must match Arduino Serial.begin() rate
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleApplyConnection}
              disabled={isConnecting}
              className="btn-primary"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Plug className="w-4 h-4" />
                  Apply & Reconnect
                </>
              )}
            </button>
            {connectionMessage && (
              <span className={`text-sm ${
                connectionMessage.includes('Connected') 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {connectionMessage}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Threshold Settings */}
      <Card 
        title="Threshold Settings" 
        subtitle="Configure warning thresholds for sensor values"
        action={<Gauge className="w-5 h-5 text-sofc-primary" />}
      >
        <div className="space-y-6">
          {/* Temperature Thresholds */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Temperature Limits (°C)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Max Water Temperature
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={localThresholds.maxWaterTemp}
                  onChange={(e) => handleThresholdChange('maxWaterTemp', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Max Air Temperature
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={localThresholds.maxAirTemp}
                  onChange={(e) => handleThresholdChange('maxAirTemp', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Air Pressure Thresholds */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Air Pressure Limits (V)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Minimum
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={localThresholds.minAirPressure}
                  onChange={(e) => handleThresholdChange('minAirPressure', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Maximum
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={localThresholds.maxAirPressure}
                  onChange={(e) => handleThresholdChange('maxAirPressure', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Water Pressure Thresholds */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Water Pressure Limits (V)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Minimum
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={localThresholds.minWaterPressure}
                  onChange={(e) => handleThresholdChange('minWaterPressure', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Maximum
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={localThresholds.maxWaterPressure}
                  onChange={(e) => handleThresholdChange('maxWaterPressure', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button onClick={handleSaveThresholds} className="btn-primary">
              {thresholdsSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Thresholds
                </>
              )}
            </button>
            <button onClick={handleResetThresholds} className="btn-outline">
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
        </div>
      </Card>

      {/* Theme Settings */}
      <Card 
        title="Theme Settings" 
        subtitle="Customize the appearance of the dashboard"
        action={<Palette className="w-5 h-5 text-sofc-primary" />}
      >
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              theme === 'light'
                ? 'border-sofc-primary bg-sofc-primary/5'
                : 'border-gray-200 dark:border-sofc-dark-border hover:border-gray-300'
            }`}
          >
            <div className="w-16 h-12 rounded-lg bg-[#EFECE3] border border-gray-200 flex items-center justify-center">
              <div className="w-8 h-8 rounded bg-[#4A70A9]" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sofc-text dark:text-white">Light Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Default theme</p>
            </div>
            {theme === 'light' && (
              <div className="ml-2 w-5 h-5 rounded-full bg-sofc-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              theme === 'dark'
                ? 'border-sofc-primary bg-sofc-primary/5'
                : 'border-gray-200 dark:border-sofc-dark-border hover:border-gray-300'
            }`}
          >
            <div className="w-16 h-12 rounded-lg bg-[#1a1d23] border border-gray-700 flex items-center justify-center">
              <div className="w-8 h-8 rounded bg-[#4A70A9]" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sofc-text dark:text-white">Dark Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Easier on the eyes</p>
            </div>
            {theme === 'dark' && (
              <div className="ml-2 w-5 h-5 rounded-full bg-sofc-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}

