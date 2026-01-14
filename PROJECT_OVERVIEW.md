# SOFC-SCADA Dashboard - Complete Project Overview

## Executive Summary

The SOFC-SCADA Dashboard is a comprehensive real-time monitoring and data visualization web application designed specifically for Solid Oxide Fuel Cell (SOFC) prototype systems. The system provides real-time sensor data acquisition, historical data analysis, efficiency calculations, and integration with MATLAB/Simulink simulation models. Built using modern web technologies, it serves as a complete SCADA (Supervisory Control and Data Acquisition) solution for fuel cell research and development.

## 1. Project Objectives

### Primary Goals
- **Real-time Monitoring**: Capture and display live sensor data from Arduino-based hardware
- **Data Visualization**: Provide comprehensive charts and graphs for temperature, pressure, and efficiency metrics
- **Simulink Integration**: Seamlessly integrate with MATLAB/Simulink simulation models for data streaming
- **Historical Analysis**: Maintain and analyze historical sensor readings with search and filtering capabilities
- **Efficiency Calculations**: Automatically calculate thermal, pressure, and overall system efficiency
- **User Interface**: Deliver an intuitive, responsive, and professional dashboard interface

### Key Features
1. Real-time WebSocket-based data streaming
2. Interactive animated system schematic with flow visualization
3. Pie charts and distribution analysis for parameters
4. PDF report generation with statistical summaries
5. Dark/light theme support
6. Authentication system with role-based access
7. Configurable sensor thresholds and warnings
8. Demo mode for testing without hardware

## 2. System Architecture

### 2.1 Overall Architecture

The system follows a **client-server architecture** with the following components:

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Arduino       │  Serial │   Backend        │  WS/API │   Frontend      │
│   Hardware      │────────▶│   Node.js + TS   │────────▶│   React + TS    │
│   (Sensors)     │         │   Express        │         │   Vite          │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                       ▲
                                       │ HTTP POST
                                       │
                            ┌──────────────────┐
                            │   MATLAB/        │
                            │   Simulink       │
                            └──────────────────┘
```

### 2.2 Technology Stack

#### Backend Technologies
- **Runtime**: Node.js with TypeScript
- **Web Framework**: Express.js 4.18.2
- **Real-time Communication**: WebSocket (ws library 8.16.0)
- **Serial Communication**: SerialPort 12.0.0 for Arduino connectivity
- **Development Tools**: TSX for TypeScript execution, TypeScript 5.3.3

#### Frontend Technologies
- **Framework**: React 18.2.0 with TypeScript 5.3.3
- **Build Tool**: Vite 5.0.11 (fast HMR and optimized builds)
- **Routing**: React Router DOM 6.21.1
- **State Management**: React Query (TanStack Query) 5.17.9
- **Styling**: Tailwind CSS 3.4.1 (utility-first CSS framework)
- **Charts**: Recharts 2.10.3 (React charting library)
- **Icons**: Lucide React 0.303.0
- **PDF Generation**: jsPDF 2.5.1 + jsPDF-AutoTable 3.8.1
- **3D Visualization**: Three.js 0.182.0 + React Three Fiber 9.4.2 + Drei 10.7.7

### 2.3 Project Structure

```
SOFC-SCADA-DASHBOARD/
├── backend/                      # Node.js backend server
│   ├── src/
│   │   ├── index.ts             # Main server entry point
│   │   ├── serial.ts            # Arduino serial communication
│   │   ├── websocket.ts         # WebSocket server implementation
│   │   ├── storage.ts           # In-memory data storage
│   │   ├── mockData.ts          # Mock data generation
│   │   ├── types.ts             # TypeScript type definitions
│   │   └── simulink/            # Simulink data handling
│   │       ├── simStream.ts     # Simulink sample storage
│   │       └── types.ts         # Simulink type definitions
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Card.tsx
│   │   │   ├── Charts.tsx       # Chart components
│   │   │   ├── Schematic.tsx    # Basic schematic
│   │   │   ├── Layout.tsx       # Main layout wrapper
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── features/            # Feature modules
│   │   │   ├── dashboard/       # Main dashboard page
│   │   │   ├── analytics/       # Analytics and metrics
│   │   │   ├── schematic/       # Enhanced schematic view
│   │   │   ├── simulink/        # Simulink visualization
│   │   │   ├── reports/         # PDF report generation
│   │   │   ├── logs/            # Data logging and search
│   │   │   ├── users/           # User activity
│   │   │   ├── settings/        # System configuration
│   │   │   └── auth/            # Authentication pages
│   │   ├── context/             # React contexts
│   │   │   ├── AuthContext.tsx  # Authentication state
│   │   │   └── ThemeContext.tsx # Dark/light theme
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useLiveSOFC.ts   # WebSocket data hook
│   │   │   └── useThresholds.ts # Threshold checking
│   │   ├── types/               # TypeScript definitions
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Application entry point
│   ├── package.json
│   └── vite.config.ts
│
└── package.json                  # Root package (dev scripts)
```

## 3. Core Features and Functionality

### 3.1 Real-Time Monitoring

#### Arduino Data Acquisition
- **Communication Protocol**: Serial communication at 9600 baud rate
- **Data Format**: JSON strings sent every second
- **Sensor Parameters**:
  - Water Temperature (t_water): °C
  - Air Temperature (t_air): °C
  - Air Pressure (p_air): 0-5V sensor reading
  - Water Pressure (p_water): 0-5V sensor reading

#### Data Flow
1. Arduino reads sensors and sends JSON via Serial
2. Backend receives and validates data
3. Data is timestamped and stored in memory
4. WebSocket broadcasts to all connected clients
5. Frontend receives and updates UI in real-time

#### Error Handling
- Automatic fallback to demo mode when Arduino disconnected
- Sensor error detection (handles -127°C error values)
- Realistic value interpolation for failed sensors
- Connection status monitoring and alerts

### 3.2 Dashboard Page

The main dashboard provides:

#### Stat Cards
- **Water Temperature**: Real-time reading with trend indicators
- **Air Temperature**: Current value with up/down/stable trends
- **Air Pressure**: Voltage reading display
- **Water Pressure**: Voltage reading display
- Status indicators: Normal, Warning, Critical thresholds

#### Charts
- **Temperature Trends**: Area chart showing water and air temperature over time
- **Pressure Trends**: Line chart displaying pressure variations
- Data window: Last 15 minutes with automatic updates

#### System Schematic
- Interactive prototype schematic showing:
  - Reservoir with animated water level
  - Pump with rotating animation
  - Heat exchanger with shimmer effects
  - SOFC stack with glow effects
  - Flow arrows with particle animations
  - Air line with flow indicators
- Real-time sensor values displayed on components

### 3.3 System Schematic Page (Enhanced)

A dedicated page providing comprehensive system visualization:

#### Enhanced Animated Schematic
- **Reservoir**: Breathing animation with water level shimmer and bubbles
- **Pump**: Rotating icon with multiple rotating rings and glow effect
- **Heat Exchanger**: Shimmer animation with heat wave effects
- **SOFC Stack**: Glow effect with pulsing energy visualization
- **Flow Arrows**: Animated particles showing fluid movement direction
- **Air Line**: Multiple animated flow indicators

#### Pie Charts
- **Temperature Distribution**: Proportional breakdown of water vs air temperature
- **Pressure Distribution**: Proportional breakdown of water vs air pressure
- **System Efficiency**: Visual breakdown of thermal efficiency, pressure efficiency, and losses
- All charts include value cards showing actual readings

#### Efficiency Formulas Section
Four efficiency calculation cards:

1. **Thermal Efficiency** (η_th)
   - Formula: (T_hot - T_cold) / T_hot
   - Description: Measures heat transfer efficiency
   - Real-time calculation with Kelvin conversion

2. **Pressure Efficiency** (η_p)
   - Formula: 1 / (1 + P_air / P_water)
   - Description: Evaluates pressure ratio efficiency
   - Accounts for pressure balance between systems

3. **Overall System Efficiency** (η_overall)
   - Formula: 0.6 × η_th + 0.4 × η_p
   - Description: Weighted combination of efficiencies
   - Represents total system performance

4. **Energy Balance** (η_energy)
   - Formula: E_out / E_in
   - Description: Compares output to input energy
   - Uses specific heat capacities for calculations

### 3.4 Analytics Page

Provides detailed performance analysis:

#### Efficiency Metrics
- Electrical Efficiency: 30-65% typical range
- Thermal Efficiency: 10-30% typical range
- Stack Health: 70-100% percentage indicator
- Fuel Utilization: 70-85% typical range
- Air Excess Ratio (Lambda): 2-4 typical range

#### I-V Curve Analysis
- Current-Voltage characteristics
- Power curve visualization
- Dual Y-axis chart (voltage and power vs current)
- Loss analysis (activation, ohmic, concentration)

#### Temperature Distribution
- Histogram showing temperature range distribution
- Bins: 20-22°C, 22-24°C, 24-26°C, 26-28°C, 28-30°C, 30-32°C, 32-34°C, 34+°C
- Count-based visualization

### 3.5 Simulink Integration

#### MATLAB/Simulink Data Streaming
- **Endpoint**: POST /data (or /api/sim-data)
- **Data Format**: JSON with time and signal data
  ```json
  {
    "time": 0.5,
    "data": {
      "stackV": 8.5,
      "stackI": 12.3,
      "airFlow": 5.2,
      ...
    }
  }
  ```

#### Features
- Real-time data streaming from Simulink models
- Automatic signal name extraction and handling
- Nested bus signal support (creates hierarchical labels)
- Dynamic field discovery
- WebSocket broadcasting to frontend
- Historical data storage and retrieval

#### Visualization
- Line charts for all Simulink signals
- Real-time updates as data arrives
- Signal selection interface
- Time-based x-axis
- Automatic scaling and formatting

### 3.6 Reports Page

PDF report generation with:

#### Report Sections
1. **Executive Summary**: Overview of system status
2. **Sensor Readings**: Current values with timestamps
3. **Historical Trends**: Chart snapshots
4. **Efficiency Metrics**: Calculated performance values
5. **Statistics**: Min, max, average, standard deviation
6. **Anomalies**: Detected threshold violations
7. **Time Range**: Report generation period

#### Features
- Customizable date range selection
- Automatic chart embedding
- Professional PDF formatting
- Downloadable reports
- Statistical analysis included

### 3.7 Logs Page

Comprehensive data logging interface:

#### Features
- **Searchable Table**: Full-text search across all readings
- **Anomaly Filtering**: Filter by threshold violations
- **Sorting**: Sort by any column (timestamp, temperatures, pressures)
- **Pagination**: Efficient handling of large datasets
- **Export**: Data export capabilities
- **Real-time Updates**: New readings appear automatically

#### Table Columns
- Timestamp (ISO format)
- Water Temperature (°C)
- Air Temperature (°C)
- Air Pressure (V)
- Water Pressure (V)
- Status indicators

### 3.8 Settings Page

System configuration interface:

#### Configuration Options
1. **Serial Port Settings**
   - Port selection (COM ports on Windows, /dev/tty* on Linux)
   - Baud rate configuration (default: 9600)
   - Connection test and status
   - Available ports listing

2. **Sensor Thresholds**
   - Water temperature limits (min/max)
   - Air temperature limits (min/max)
   - Pressure thresholds
   - Warning and critical levels

3. **Theme Settings**
   - Dark mode toggle
   - Light mode toggle
   - Automatic theme (system preference)

4. **System Status**
   - Connection status display
   - Demo mode indicator
   - Server health check

### 3.9 Authentication System

#### Features
- **User Registration**: Create new accounts
- **Login System**: Secure authentication
- **Protected Routes**: All dashboard pages require authentication
- **Role-Based Access**: Framework for user roles (extensible)
- **Session Management**: Persistent login state
- **Mock Authentication**: Currently uses localStorage (production-ready for backend integration)

#### Pages
- Login page with email/password
- Registration page with validation
- Protected route wrapper component

## 4. Data Management

### 4.1 Data Storage

#### Backend Storage
- **In-Memory Storage**: Fast access for real-time operations
- **Reading History**: Circular buffer (stores last 500 readings)
- **Simulink Samples**: Dynamic storage with field indexing
- **No Database**: Intentionally lightweight for research prototype

#### Data Structures
```typescript
interface SofcReading {
  ts: string;        // ISO timestamp
  t_water: number;   // Water temperature (°C)
  t_air: number;     // Air temperature (°C)
  p_air: number;     // Air pressure (V)
  p_water: number;   // Water pressure (V)
}

interface SimulinkSample {
  time: number;      // Simulation time (s)
  data: Record<string, number | null>;  // Signal values
}
```

### 4.2 Data Flow Architecture

```
Arduino → Serial Port → Backend (validation) → Storage → WebSocket → Frontend
                                                                      ↓
                                                              React State
                                                                    ↓
                                                              UI Update
```

### 4.3 WebSocket Communication

#### Message Types
1. **Reading Message**: New sensor reading
   ```json
   {
     "type": "reading",
     "data": { "ts": "...", "t_water": 27.5, ... }
   }
   ```

2. **Status Message**: Connection status updates
   ```json
   {
     "type": "status",
     "level": "info|warning|error",
     "message": "..."
   }
   ```

3. **History Message**: Initial data batch on connection
   ```json
   {
     "type": "history",
     "data": [...readings]
   }
   ```

4. **Simulink Sample**: Simulink data point
   ```json
   {
     "type": "simulink-sample",
     "payload": { "time": 0.5, "data": {...} }
   }
   ```

## 5. User Interface Design

### 5.1 Design System

#### Color Palette
- **Primary**: #4A70A9 (Blue) - Main actions and accents
- **Secondary**: #8FABD4 (Light Blue) - Highlights and charts
- **Background**: #EFECE3 (Light Beige) - Main background
- **Text**: #000000 (Black) - Primary text
- **Dark Mode**: Custom dark theme with adjusted contrast

#### Typography
- **Sans Serif**: DM Sans (primary font)
- **Monospace**: JetBrains Mono (data values, code)

#### Components
- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Gradient backgrounds, smooth transitions
- **Inputs**: Focus states, validation feedback
- **Charts**: Custom color schemes, responsive sizing

### 5.2 Responsive Design

- **Mobile**: Single column layout, collapsible sidebar
- **Tablet**: Two-column grid, optimized spacing
- **Desktop**: Multi-column layouts, full sidebar
- **Breakpoints**: Tailwind CSS default breakpoints (sm, md, lg, xl)

### 5.3 Animations

Custom CSS animations implemented:
- **Flow Animation**: Moving particles in pipes
- **Rotate Slow**: Slow rotation for pump and rings
- **Glow**: Pulsing glow effect for active components
- **Shimmer**: Heat wave effects
- **Breathe**: Subtle scale animation for reservoir
- **Particle**: Individual particle movement in flows
- **Pulse**: Connection status indicators

## 6. API Endpoints

### 6.1 REST API Endpoints

#### Arduino Data Endpoints
- `GET /api/readings/latest` - Get most recent reading
- `GET /api/readings/history?limit=100` - Get historical readings

#### Mock Data Endpoints
- `GET /api/mock-sofc-metrics` - Get mock SOFC performance metrics
- `GET /api/mock-iv-curve` - Get mock I-V curve data

#### System Endpoints
- `GET /api/status` - Get server and serial connection status
- `GET /api/ports` - List available serial ports
- `POST /api/settings/serial` - Update serial port configuration
- `GET /api/health` - Health check endpoint

#### Simulink Endpoints
- `POST /data` - Receive Simulink sample (primary endpoint)
- `POST /api/sim-data` - Alternative Simulink endpoint
- `GET /api/sim/history?limit=1000` - Get Simulink history
- `GET /api/sim/latest` - Get latest Simulink sample
- `GET /api/sim/fields` - Get all signal names

### 6.2 WebSocket Endpoint

- `ws://localhost:3000/ws` - WebSocket connection for real-time data

## 7. Development and Deployment

### 7.1 Development Setup

#### Prerequisites
- Node.js 18+ and npm
- TypeScript 5.3+
- Arduino IDE (for hardware)
- MATLAB/Simulink (for simulation integration)

#### Installation
```bash
# Clone repository
git clone <repository-url>
cd SOFC-SCADA-DASHBOARD

# Install all dependencies
npm run install:all

# Or manually:
npm install
cd backend && npm install
cd ../frontend && npm install
```

#### Environment Configuration
Create `backend/.env`:
```env
PORT=3000
SERIAL_PORT=COM8
SERIAL_BAUD=9600
FRONTEND_URL=http://localhost:5173
```

### 7.2 Running the Application

#### Development Mode
```bash
# Run both backend and frontend
npm run dev

# Or separately:
npm run dev:server  # Backend only
npm run dev:client  # Frontend only
```

#### Production Build
```bash
npm run build      # Build both
npm start          # Start production server
```

### 7.3 Development Features
- **Hot Module Replacement (HMR)**: Fast development with Vite
- **TypeScript**: Type safety across entire codebase
- **ESLint**: Code quality and consistency
- **Concurrent Scripts**: Run multiple processes simultaneously

## 8. Testing and Quality Assurance

### 8.1 Demo Mode

The system includes a comprehensive demo mode that:
- Automatically activates when Arduino is disconnected
- Generates realistic sensor readings
- Maintains all functionality for testing
- Allows full feature exploration without hardware

### 8.2 Error Handling

#### Sensor Error Handling
- Detects sensor errors (e.g., -127°C for disconnected sensors)
- Applies realistic value interpolation
- Maintains data continuity for visualization
- Provides visual indicators for error states

#### Connection Handling
- Automatic WebSocket reconnection
- Connection status indicators
- Graceful degradation to demo mode
- Error message display

### 8.3 Data Validation

- Input validation on all API endpoints
- Type checking with TypeScript
- JSON schema validation for Arduino data
- Range checking for sensor values

## 9. Performance Considerations

### 9.1 Optimization Strategies

#### Frontend
- **React Query**: Efficient data caching and updates
- **Memoization**: Prevents unnecessary re-renders
- **Code Splitting**: Lazy loading of routes
- **Vite Build**: Optimized production bundles

#### Backend
- **In-Memory Storage**: Fast access for real-time data
- **Circular Buffer**: Prevents memory overflow (max 500 readings)
- **Efficient WebSocket**: Single connection, broadcast to all clients
- **Non-blocking I/O**: Node.js event loop optimization

### 9.2 Scalability

- Designed for single-operator research use
- Can handle 1000+ readings efficiently
- WebSocket supports multiple concurrent clients
- Simulink data streaming optimized for real-time

## 10. Security Considerations

### 10.1 Current Implementation
- **CORS**: Configured for specific frontend origin
- **Input Validation**: All endpoints validate input
- **Type Safety**: TypeScript prevents type-related errors
- **Error Handling**: Prevents information leakage

### 10.2 Production Recommendations
- Implement proper authentication backend
- Add HTTPS/TLS encryption
- Implement rate limiting
- Add database for persistent storage
- Implement proper session management
- Add API key authentication for external systems

## 11. Future Enhancements

### Potential Improvements
1. **Database Integration**: PostgreSQL or MongoDB for persistent storage
2. **Advanced Analytics**: Machine learning for anomaly detection
3. **Alert System**: Email/SMS notifications for threshold violations
4. **Multi-User Support**: Proper user management with roles
5. **Export Formats**: CSV, Excel export options
6. **Mobile App**: React Native application
7. **Historical Data Visualization**: Long-term trend analysis
8. **Control Features**: Remote control of system parameters
9. **Data Backup**: Automated backup systems
10. **API Documentation**: OpenAPI/Swagger documentation

## 12. Conclusion

The SOFC-SCADA Dashboard represents a comprehensive solution for real-time monitoring and analysis of Solid Oxide Fuel Cell systems. With its modern architecture, intuitive interface, and robust feature set, it successfully bridges the gap between hardware sensors and data visualization. The integration with MATLAB/Simulink demonstrates the system's flexibility in handling diverse data sources, making it a valuable tool for fuel cell research and development.

### Key Achievements
- ✅ Real-time data acquisition and visualization
- ✅ Comprehensive efficiency calculations
- ✅ Professional animated system schematic
- ✅ Simulink integration for simulation data
- ✅ PDF report generation
- ✅ Responsive, modern user interface
- ✅ Demo mode for testing without hardware
- ✅ Robust error handling and validation

### Technical Excellence
- Full TypeScript implementation for type safety
- Modern React patterns and hooks
- Efficient WebSocket communication
- Optimized performance for real-time updates
- Clean, maintainable code structure
- Comprehensive documentation

---

**Project Version**: 1.0.0  
**License**: MIT License - University Prototype Project  
**Built For**: SOFC Research and Development
