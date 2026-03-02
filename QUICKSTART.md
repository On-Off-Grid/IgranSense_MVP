# 🚀 IgranSense Quick Start Guide

Get IgranSense running in under 5 minutes!

## Prerequisites Check

```bash
python3 --version  # Need 3.10+
node --version     # Need 20+
git --version      # Any version
```

## Installation (3 steps)

### 1. Clone & Setup Backend

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/IgranSense_MVP.git
cd IgranSense_MVP

# Create Python environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows
pip install -r backend/souhail-edge-sim/requirements.txt
```

### 2. Setup Frontend

```bash
cd frontend
npm install
cd ..
```

### 3. Run Both Servers

**Terminal 1 - Backend:**
```bash
cd backend/souhail-edge-sim
source ../../.venv/bin/activate  # Skip if already active
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## ✅ Test It

1. Open: **http://localhost:5173**
2. Login: `farmer@demo.com` / `demo123`
3. Click on a colored field marker to see details!

## 🆘 Quick Fixes

**ImportError?**
```bash
source .venv/bin/activate
pip install -r backend/souhail-edge-sim/requirements.txt
```

**npm errors?**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Port in use?**
```bash
# Linux/Mac: Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Windows: Use Task Manager or
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

## 📖 Full Documentation

See [README.md](README.md) for:
- Detailed setup instructions
- API documentation
- Troubleshooting guide
- Architecture overview
- Development tips

---

**Need help?** Check the [full README](README.md) or open an issue!
