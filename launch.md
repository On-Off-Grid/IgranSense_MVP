# Launch Commands

Quick reference for starting/stopping the IgranSense application.

## Start Backend (Terminal 1)

```bash
cd backend/souhail-edge-sim
source ../../.venv/bin/activate  # Linux/macOS
# ..\..\Scripts\activate         # Windows
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

## Stop All Services

```bash
# Linux/macOS:
pkill -f uvicorn; pkill -f "npm run dev"; pkill -f vite; deactivate 2>/dev/null; echo "All processes stopped"

# Windows (PowerShell):
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*python*"} | Stop-Process -Force

# Or simply: Press CTRL+C in each terminal
```

## Alternative: One-line Launch

### Linux/macOS:
```bash
# Start both (requires tmux or separate terminals)
cd backend/souhail-edge-sim && source ../../.venv/bin/activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
cd frontend && npm run dev
```

## Check if Services are Running

```bash
# Check backend (should return "OK")
curl http://localhost:8000/health

# Check frontend (should show process)
lsof -i :5173  # Linux/macOS
netstat -ano | findstr :5173  # Windows
```

## Useful Development Commands

```bash
# Backend: Check logs
cd backend/souhail-edge-sim
uvicorn app.main:app --log-level debug

# Frontend: Build for production
cd frontend
npm run build

# Frontend: Preview production build
npm run preview
```