# IgranSense Setup & Testing Guide

This guide will help you set up and test the IgranSense platform locally.

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Python | 3.10 | 3.11+ |
| Node.js | 20.0 | 22+ |
| RAM | 4GB | 8GB |
| Disk | 500MB | 1GB |
| OS | Linux, macOS, Windows (WSL) | Ubuntu 22.04+ |

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/IgranSense.git
cd IgranSense
```

### 2. Set Up Python Environment

```bash
# Create virtual environment
python3 -m venv .venv

# Activate it
source .venv/bin/activate        # Linux/macOS
# .venv\Scripts\activate         # Windows CMD
# .venv\Scripts\Activate.ps1     # Windows PowerShell

# Install dependencies
pip install -r backend/souhail-edge-sim/requirements.txt
```

### 3. Set Up Node.js Frontend

```bash
cd frontend
npm install
cd ..
```

## Running the Application

You need **two terminal windows** running simultaneously.

### Terminal 1: Start the Backend API

```bash
cd backend/souhail-edge-sim
source ../../.venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process
```

### Terminal 2: Start the Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 4. Open the Dashboard

Navigate to **http://localhost:5173** in your browser.

## Testing the Features

### Farm Overview (Map)
- Click on colored circles to navigate to field details
- Hover over markers to see quick status info
- Colors: 🟢 OK | 🟠 Warning | 🔴 Critical

### Field Detail
- View 30-day soil moisture trends
- Temperature time-series chart
- Weekly NDVI bar chart
- Click "← Back" to return to map

### Alerts
- View all active irrigation recommendations
- Sorted by severity (Critical first)

### System Status
- Check Edge MDC connectivity
- View sensor network health

## API Endpoints

The backend exposes these REST endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/fields` | GET | List all fields with current status |
| `/fields/{id}` | GET | Detailed field data with history |
| `/alerts` | GET | Active alerts and recommendations |
| `/system` | GET | MDC and sensor network status |

### Testing API Directly

```bash
# Health check
curl http://127.0.0.1:8000/health

# Get all fields
curl http://127.0.0.1:8000/fields

# Get field detail
curl http://127.0.0.1:8000/fields/field_1
```

## Regenerating Mock Data

To generate fresh 30-day sensor data:

```bash
source .venv/bin/activate
python scripts/generate_mock_data.py
```

This creates:
- `backend/souhail-edge-sim/data/readings.json` (~14,000 readings)
- `backend/souhail-edge-sim/data/ndvi_snapshots.json` (15 weekly snapshots)

**Note:** Restart the API server after regenerating data to load the new files.

## Troubleshooting

### "Module not found" errors
```bash
# Make sure you're in the correct directory
cd backend/souhail-edge-sim

# Verify virtual environment is active
which python  # Should show .venv path
```

### "Port already in use"
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9  # Linux/Mac
# Or use a different port:
uvicorn app.main:app --port 8001
```

### Frontend not connecting to API
- Ensure API is running on port 8000
- Check browser console for CORS errors
- API URL is configured in `frontend/src/api/client.js`

### Node.js version too old
```bash
# Check version
node --version  # Should be 20+

# Upgrade using nvm
nvm install 20
nvm use 20
```

## Development Notes

### File Structure

```
backend/souhail-edge-sim/
├── app/
│   ├── main.py           # FastAPI app & routes
│   ├── models.py         # Pydantic models
│   ├── config.py         # Configuration
│   ├── enums.py          # Status enums
│   └── services/
│       ├── data_loader.py    # JSON data loading
│       ├── rule_engine.py    # Agronomic rules
│       └── system_health.py  # System status
└── data/
    ├── sensors.json      # Sensor definitions
    ├── readings.json     # Time-series data
    ├── ndvi_snapshots.json
    └── rules.json        # Threshold rules
```

### Adding New Sensors

1. Edit `data/sensors.json` to add sensor definition
2. Add readings to `data/readings.json`
3. Restart API server

### Modifying Thresholds

Edit `data/rules.json`:
```json
{
  "soil_moisture_critical": 18,
  "soil_moisture_warning": 25
}
```

## Questions?

See the documentation in `/docs`:
- [Scientific Basis](docs/scientific_basis.md) - Agronomic thresholds
- [TRL Statement](docs/trl_statement.md) - Technology readiness
- [Hardware Spec](docs/hardware_spec.md) - Bill of materials
