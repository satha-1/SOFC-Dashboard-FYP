# SOFC Fuel Cell Monitoring Dashboard

A professional, real-time monitoring web application for Solid Oxide Fuel Cell (SOFC) prototypes. Built with React, TypeScript, and Node.js.

![SOFC Dashboard](https://img.shields.io/badge/SOFC-Dashboard-4A70A9?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## Features

- 📊 **Real-time Monitoring** - Live data from Arduino sensors via WebSocket
- 🔬 **Simulink Integration** - Stream simulation data from MATLAB/Simulink models
- 📈 **Interactive Charts** - Temperature and pressure trends with Recharts
- 📋 **Data Logging** - Historical readings with search and filtering
- 📄 **PDF Reports** - Generate downloadable reports with statistics
- 🎨 **Dark/Light Theme** - Toggle between themes
- 🔐 **Auth System** - Login/register with role-based access
- ⚙️ **Configurable Thresholds** - Set warning limits for sensors

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS (styling)
- Recharts (charts)
- React Router (navigation)
- React Query (data fetching)
- Lucide Icons

**Backend:**
- Node.js + TypeScript
- Express (HTTP API)
- WebSocket (real-time data)
- SerialPort (Arduino communication)
- Simulink data ingestion (HTTP POST from MATLAB)

## Project Structure

```
sofc-scada-dashboard/
├── backend/
│   ├── src/
│   │   ├── index.ts        # Main server entry point
│   │   ├── serial.ts       # Arduino serial communication
│   │   ├── websocket.ts    # WebSocket server
│   │   ├── storage.ts      # In-memory data storage
│   │   ├── mockData.ts     # Mock SOFC metrics generator
│   │   ├── types.ts        # TypeScript definitions
│   │   └── simulink/       # Simulink data streaming
│   │       ├── simStream.ts # Simulink sample storage & broadcast
│   │       └── types.ts     # Simulink type definitions
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Shared UI components
│   │   ├── context/         # React contexts (Auth, Theme)
│   │   ├── features/        # Feature modules
│   │   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   ├── simulink/   # Simulink visualization
│   │   │   ├── reports/
│   │   │   ├── logs/
│   │   │   ├── users/
│   │   │   ├── settings/
│   │   │   └── auth/
│   │   ├── hooks/           # Custom React hooks
│   │   └── types/           # TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
├── package.json            # Root package with dev scripts
└── README.md
```

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sofc-scada-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   # Or manually:
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Configure environment:**

   Create `backend/.env` file:
   ```env
   # Serial Port Configuration
   SERIAL_PORT=COM8          # Windows: COM8, Linux: /dev/ttyUSB0, Mac: /dev/tty.usbserial
   SERIAL_BAUD=9600          # Must match Arduino Serial.begin() rate

   # Server Configuration
   PORT=3000

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

## Running the Application

### Development Mode

Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them separately:
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

### Production Build

```bash
npm run build
npm run start
```

## Arduino Setup

### Expected JSON Format

The Arduino must send **one JSON line per second** over Serial at 9600 baud:

```json
{"t_water":27.50,"t_air":28.10,"p_air":2.45,"p_water":3.10}
```

Where:
- `t_water` - Water temperature in °C
- `t_air` - Air temperature in °C
- `p_air` - Air pressure sensor voltage (0-5V)
- `p_water` - Water pressure sensor voltage (0-5V)

### Sample Arduino Code

```cpp
#include <ArduinoJson.h>

// Pin definitions
const int WATER_TEMP_PIN = A0;
const int AIR_TEMP_PIN = A1;
const int AIR_PRESSURE_PIN = A2;
const int WATER_PRESSURE_PIN = A3;

void setup() {
  Serial.begin(9600);
}

void loop() {
  // Read sensors
  float t_water = readTemperature(WATER_TEMP_PIN);
  float t_air = readTemperature(AIR_TEMP_PIN);
  float p_air = analogRead(AIR_PRESSURE_PIN) * (5.0 / 1023.0);
  float p_water = analogRead(WATER_PRESSURE_PIN) * (5.0 / 1023.0);

  // Create JSON
  StaticJsonDocument<128> doc;
  doc["t_water"] = t_water;
  doc["t_air"] = t_air;
  doc["p_air"] = p_air;
  doc["p_water"] = p_water;

  // Send JSON line
  serializeJson(doc, Serial);
  Serial.println();

  delay(1000);  // Send every second
}

float readTemperature(int pin) {
  int raw = analogRead(pin);
  float voltage = raw * (5.0 / 1023.0);
  // Convert voltage to temperature (depends on your sensor)
  float temperature = (voltage - 0.5) * 100.0;  // Example for TMP36
  return temperature;
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/readings/latest` | Get the most recent reading |
| GET | `/api/readings/history?limit=100` | Get historical readings |
| GET | `/api/mock-sofc-metrics` | Get mock SOFC performance metrics |
| GET | `/api/mock-iv-curve` | Get mock I-V curve data |
| GET | `/api/status` | Get server and serial connection status |
| GET | `/api/ports` | List available serial ports |
| POST | `/api/settings/serial` | Update serial port configuration |

## WebSocket Messages

Connect to `ws://localhost:3000/ws` to receive real-time data:

```typescript
// Incoming message types:

// New reading
{ "type": "reading", "data": { "ts": "...", "t_water": 27.5, ... } }

// Connection status
{ "type": "status", "level": "info|warning|error", "message": "..." }

// Initial history (on connect)
{ "type": "history", "data": [...] }
```

## Demo Mode

If no Arduino is connected, the app automatically runs in **demo mode**, generating simulated sensor data. This allows you to explore all features without hardware.

## Simulink Data Streaming

The dashboard can receive real-time simulation data from MATLAB/Simulink models.

### Setup

1. **Place your MATLAB script** (`data_extract_YSZ.m`) in your Simulink project directory:
   ```
   C:\Users\saths\OneDrive\Desktop\2025 Projects\sofcfrompy - Copy22_New\sofcfrompy - Copy22
   ```

2. **Update the MATLAB script** to use the correct backend endpoint:
   ```matlab
   %% ---------------- Config ----------------
   url = 'http://localhost:3000/data';   % Backend API port (NOT 5173 which is the frontend)
   options = weboptions('MediaType','application/json');
   throttleDelay = 0.01;
   ```
   
   **IMPORTANT - Port Configuration:** 
   - **Port 5173** = Frontend (React/Vite dev server) - DO NOT use this for POST requests
   - **Port 3000** = Backend (Node/Express API) - **Use this for MATLAB POST requests**
   
   The backend runs on port 3000 by default. If you change it in `backend/.env`, update the MATLAB script accordingly.

3. **Start the backend server:**
   ```bash
   npm run dev:server
   ```

4. **Start the frontend:**
   ```bash
   npm run dev:client
   ```

### Running a Simulation

1. **Start the backend and frontend servers:**
   ```bash
   npm run dev
   ```

2. **Open MATLAB and navigate to your Simulink project directory:**
   ```
   C:\Users\saths\OneDrive\Desktop\2025 Projects\sofcfrompy - Copy22_New\sofcfrompy - Copy22
   ```

3. **Run your Simulink model:**
   ```matlab
   out = sim('sofc_sim');  % or your model name
   ```

4. **Execute the extraction script:**
   ```matlab
   data_extract_YSZ
   ```
   The script will:
   - Extract all `ScopeData*` signals from the simulation output
   - Handle nested bus signals (creates labels like "parentName – childName")
   - Send HTTP POST requests to `http://localhost:3000/data` with each time step
   - Throttle requests at 0.01 seconds between samples

5. **Open the dashboard:**
   - Go to http://localhost:5173/simulink
   - You should see live charts updating as MATLAB sends data
   - The backend will log the first few samples to the console for debugging

### Data Format

The MATLAB script should send JSON payloads like:
```json
{
  "time": 0.5,
  "data": {
    "stackV": 8.5,
    "stackI": 12.3,
    "airFlow": 5.2,
    "fuelFlow": 2.1,
    ...
  }
}
```

Where:
- `time` - Simulation time in seconds (scalar)
- `data` - Object with signal names as keys and numeric values

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/data` | Receive Simulink sample (used by MATLAB) |
| POST | `/api/sim-data` | Alternative endpoint (same as `/data`) |
| GET | `/api/sim/history?limit=1000` | Get historical Simulink samples |
| GET | `/api/sim/latest` | Get most recent Simulink sample |
| GET | `/api/sim/fields` | Get all unique signal names |

### WebSocket Messages

Simulink samples are broadcast via WebSocket:
```typescript
{
  "type": "simulink-sample",
  "payload": {
    "time": 0.5,
    "data": { "stackV": 8.5, ... }
  }
}
```

## Color Palette

The dashboard uses a professional color scheme:

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#EFECE3` | Main background |
| Primary | `#4A70A9` | Buttons, accents |
| Secondary | `#8FABD4` | Charts, highlights |
| Text | `#000000` | Main text |

## Pages

1. **Dashboard** - Live sensor values, charts, and system schematic
2. **Analytics** - Efficiency metrics, temperature distribution, I-V curves
3. **Simulation Analytics** - Real-time Simulink model data visualization
4. **Reports** - Generate PDF reports with statistics
5. **Logs** - Searchable table of all readings with anomaly filtering
6. **User Activity** - Mock user management dashboard
7. **Settings** - Serial port, thresholds, and theme configuration

## License

MIT License - University Prototype Project

---

Built with ❤️ for SOFC research

